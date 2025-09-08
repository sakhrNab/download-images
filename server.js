// Ensure global `File` exists (undici expects it). Node 18+ has Blob but not File.
if (typeof globalThis.File === 'undefined' && typeof globalThis.Blob !== 'undefined') {
  // Minimal File shim compatible with code checking for File
  globalThis.File = class File extends globalThis.Blob {
    constructor(chunks = [], name = '', options = {}) {
      super(chunks, options);
      this.name = String(name || '');
      this.lastModified = options && options.lastModified ? Number(options.lastModified) : Date.now();
    }
  };
}

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const archiver = require('archiver');
const cors = require('cors');
const { URL } = require('url');
const stream = require('stream');

const app = express();
app.use(cors());
// production: limit body size to avoid memory issues
app.use(express.json({ limit: '1mb' }));
app.set('trust proxy', true);

// simple health endpoint for container orchestrators (fast, no JS required)
app.get('/health', (req, res) => res.status(200).send('ok'));
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

function absoluteUrl(base, relative) {
  try {
    return new URL(relative, base).href;
  } catch (e) {
    return null;
  }
}

function gatherImageUrlsFromHtml(base, html) {
  const $ = cheerio.load(html);
  const imgs = [];

  // img tags
  $('img').each((i, el) => {
    const attribs = el.attribs || {};
    // common attributes
    const candidates = [];
    if (attribs.src) candidates.push(attribs.src);
    if (attribs['data-src']) candidates.push(attribs['data-src']);
    if (attribs['data-original']) candidates.push(attribs['data-original']);
    if (attribs['data-lazy']) candidates.push(attribs['data-lazy']);
    if (attribs['data-srcset']) candidates.push(attribs['data-srcset']);
    if (attribs.srcset) candidates.push(attribs.srcset);

    candidates.forEach(c => {
      if (!c) return;
      // srcset can contain multiple urls
      c.split(',').forEach(part => {
        const url = part.trim().split(' ')[0];
        const abs = absoluteUrl(base, url);
        if (abs) imgs.push(abs);
      });
    });
  });

  // meta og:image
  const og = $('meta[property="og:image"]').attr('content');
  if (og) {
    const abs = absoluteUrl(base, og);
    if (abs) imgs.push(abs);
  }

  // inline styles background-image
  $('[style]').each((i, el) => {
    const s = (el.attribs && el.attribs.style) || '';
    const m = /url\(['"]?(https?:[^)"']+?)['"]?\)/gi;
    let mm;
    while ((mm = m.exec(s)) !== null) {
      const abs = absoluteUrl(base, mm[1]);
      if (abs) imgs.push(abs);
    }
  });

  // scan raw html for image urls (jpg|png|webp|jpeg|bmp)
  const re = /https?:\/\/[^\s"'<>]+?\.(?:jpe?g|png|webp|bmp)(?:\?[^\s"'<>]*)?/gi;
  const matches = html.match(re) || [];
  matches.forEach(m => imgs.push(m));

  // dedupe and return
  return Array.from(new Set(imgs));
}

app.post('/api/scan', async (req, res) => {
  const { urls } = req.body;
  if (!urls || !Array.isArray(urls)) return res.status(400).json({ error: 'urls must be an array' });

  const results = {};

  await Promise.all(urls.map(async (site) => {
    try {
      const resp = await axios.get(site, { responseType: 'text', timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0 (compatible)' } });
      const list = gatherImageUrlsFromHtml(site, resp.data);
      results[site] = list;
    } catch (e) {
      results[site] = { error: String(e.message) };
    }
  }));

  res.json(results);
});

app.post('/api/download', async (req, res) => {
  const { urls } = req.body;
  if (!urls || !Array.isArray(urls)) return res.status(400).json({ error: 'urls must be an array' });

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename=images.zip');

  const archive = archiver('zip');
  archive.pipe(res);

  // concurrency helper: run async iterator over items with a concurrency limit
  function forEachLimit(items, limit, iterator) {
    return new Promise((resolve, reject) => {
      if (!items || items.length === 0) return resolve();
      let i = 0;
      let active = 0;
      let finished = 0;
      function next() {
        if (finished >= items.length) return resolve();
        while (active < limit && i < items.length) {
          const idx = i++;
          active += 1;
          Promise.resolve(iterator(items[idx], idx)).catch(() => {}).then(() => {
            active -= 1;
            finished += 1;
            if (finished >= items.length) return resolve();
            next();
          });
        }
      }
      next();
    });
  }

  // process sites in parallel with a small concurrency (e.g., 3 sites at once)
  await forEachLimit(urls, 3, async (site) => {
    // gather images using the richer helper
    let list = [];
    try {
      const resp = await axios.get(site, { responseType: 'text', timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0 (compatible)' } });
      list = gatherImageUrlsFromHtml(site, resp.data);
    } catch (e) {
      console.warn('Site gather failed', site, e && e.message);
      return;
    }

    let idx = 1;
    let appendedCount = 0;

    // fetch images for this site with limited concurrency (e.g., 5 at once)
    await forEachLimit(list, 5, async (imgUrl) => {
      try {
        const urlNoQuery = imgUrl.split('?')[0];
        const ext = (urlNoQuery.split('.').pop() || '').toLowerCase();
        if (ext === 'gif') return;

        // fetch as stream and enforce 10KB min size, with buffering if Content-Length is absent
        const imgStream = await (async function fetchWithMinSize(u, minBytes, referer) {
          try {
            const r = await axios.get(u, { responseType: 'stream', timeout: 20000, maxRedirects: 5, headers: { 'User-Agent': 'Mozilla/5.0 (compatible)', 'Referer': referer } });
            const clen = parseInt(r.headers['content-length'] || '0', 10);
            if (clen > 0 && clen < minBytes) {
              r.data.destroy();
              return null;
            }

            // If content-length not provided, buffer up to minBytes
            if (!clen || clen === 0) {
              const pass = new stream.PassThrough();
              let total = 0;
              const bufs = [];
              let ok = false;

              return await new Promise((resolve, reject) => {
                r.data.on('data', (chunk) => {
                  if (ok) {
                    pass.write(chunk);
                    return;
                  }
                  bufs.push(chunk);
                  total += chunk.length;
                  if (total >= minBytes) {
                    ok = true;
                    // push buffered and then pipe remaining
                    for (const b of bufs) pass.write(b);
                    r.data.pipe(pass);
                    resolve(pass);
                  }
                });
                r.data.on('end', () => {
                  if (!ok) {
                    // too small
                    resolve(null);
                  } else {
                    pass.end();
                  }
                });
                r.data.on('error', (err) => reject(err));
              });
            }

            // content-length ok
            return r.data;
          } catch (e) {
            return null;
          }
        })(imgUrl, 10240, site);

        if (!imgStream) return;

        const urlObj = new URL(imgUrl);
        const pathname = urlObj.pathname;
        let name = pathname.split('/').filter(Boolean).join('_') || `image${idx}`;
        // ensure extension
        if (!name.includes('.')) name += '.' + (ext || 'jpg');
        const filename = `${new URL(site).hostname}/${idx}-${name}`;
        idx += 1;

        archive.append(imgStream, { name: filename });
        appendedCount += 1;
        console.log(`Appended ${filename}`);
      } catch (e) {
        // ignore per-image errors
      }
    });

    console.log(`Site ${site} - appended ${appendedCount} images`);
  });

  archive.on('warning', (err) => console.warn('Archive warning', err));
  archive.on('error', (err) => {
    console.error('Archive error', err);
    try { res.status(500).end(); } catch (e) {}
  });
  archive.on('finish', () => console.log('Archive finalize complete'));

  archive.finalize().catch((e) => console.error('Finalize error', e));
});

app.listen(PORT, () => console.log(`Server listening on http://0.0.0.0:${PORT} (env NODE_ENV=${process.env.NODE_ENV || 'development'})`));
