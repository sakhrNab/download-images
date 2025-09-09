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
const puppeteer = require('puppeteer');
const puppeteerExtra = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');

const app = express();
app.use(cors());
// production: limit body size to avoid memory issues
app.use(express.json({ limit: '1mb' }));
app.set('trust proxy', true);

// simple health endpoint for container orchestrators (fast, no JS required)
app.get('/health', (req, res) => res.status(200).send('ok'));
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

// Advanced Thunderbit Scraper - No OpenAI needed!

// Advanced Thunderbit-Style Scraper
class AdvancedThunderbitScraper {
  constructor() {
    this.browser = null;
    this.page = null;
    this.setupPuppeteerExtra();
  }

  setupPuppeteerExtra() {
    // Add stealth plugin to avoid detection
    puppeteerExtra.use(StealthPlugin());
    
    // Add adblocker to improve performance
    puppeteerExtra.use(AdblockerPlugin({ blockTrackers: true }));
    
    console.log('🛡️ Advanced anti-detection plugins loaded');
  }

  async initialize() {
    if (!this.browser) {
      console.log('🚀 Initializing Advanced Thunderbit Scraper...');
      
      // Configure Puppeteer for Docker environment
      const launchOptions = {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-blink-features=AutomationControlled',
          '--disable-features=VizDisplayCompositor',
          '--disable-web-security',
          '--disable-features=TranslateUI',
          '--disable-ipc-flooding-protection',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding'
        ],
        ignoreDefaultArgs: ['--enable-automation'],
      };

      // Use system Chrome if available (for Docker)
      if (process.env.PUPPETEER_EXECUTABLE_PATH) {
        launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
        console.log('🔧 Using system Chrome:', process.env.PUPPETEER_EXECUTABLE_PATH);
      }

      this.browser = await puppeteerExtra.launch({
        ...launchOptions,
        ignoreHTTPSErrors: true
      });
    }
    return this.browser;
  }

  async scrapeWithAdvancedThunderbit(url) {
    try {
      console.log(`\n🎯 Advanced Thunderbit Scraper analyzing: ${url}`);
      
      await this.initialize();
      this.page = await this.browser.newPage();
      
      // Advanced browser configuration
      await this.setupAdvancedBrowser();
      
      // Human-like behavior simulation
      await this.simulateHumanBehavior();
      
      // Advanced request interception
      await this.setupRequestInterception();

      // Navigate to the page
      console.log('📱 Loading page...');
      await this.page.goto(url, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });

      // Wait for initial content to load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Debug: Check what's on the page
      const pageTitle = await this.page.title();
      const pageUrl = await this.page.url();
      console.log(`📄 Page loaded: ${pageTitle} at ${pageUrl}`);
      
      // Debug: Count elements
      const elementCounts = await this.page.evaluate(() => {
        return {
          imgElements: document.querySelectorAll('img').length,
          allElements: document.querySelectorAll('*').length,
          bodyText: document.body.textContent.substring(0, 200)
        };
      });
      console.log(`📊 Page elements: ${JSON.stringify(elementCounts)}`);

      // Step 1: Advanced human-like scrolling
      console.log('🔄 Human-like scrolling and interaction...');
      await this.humanLikeScroll();
      
      // Step 2: Wait for images to load
      console.log('⏳ Waiting for images to load...');
      await this.waitForImages();

      // Step 2: Extract visible images using visual AI
      console.log('👁️ Extracting visible images...');
      const visibleImages = await this.extractVisibleImages();
      console.log(`👁️ Visible images found: ${visibleImages.length}`);

      // Step 3: Extract images from various sources
      console.log('🔍 Extracting from multiple sources...');
      const allImages = await this.extractAllImageSources();
      console.log(`🔍 All images found: ${allImages.length}`);

      // Step 4: Combine and deduplicate
      const combinedImages = [...visibleImages, ...allImages];
      const uniqueImages = [...new Set(combinedImages)];

      console.log(`✅ Visual AI found ${uniqueImages.length} unique images`);
      console.log(`📊 Breakdown: ${visibleImages.length} visible + ${allImages.length} all sources = ${uniqueImages.length} unique`);
      
      await this.page.close();
      return uniqueImages;

    } catch (error) {
      console.error('Visual AI Scraper error:', error.message);
      if (this.page) await this.page.close();
      return [];
    }
  }

  async triggerLazyLoading() {
    try {
      // Scroll down slowly to trigger lazy loading
      await this.page.evaluate(async () => {
        await new Promise((resolve) => {
          let totalHeight = 0;
          const distance = 100;
          const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;

            if (totalHeight >= scrollHeight) {
              clearInterval(timer);
              resolve();
            }
          }, 100);
        });
      });

      // Hover over image containers to trigger hover effects
      await this.page.evaluate(() => {
        const imageContainers = document.querySelectorAll('[class*="image"], [class*="img"], [class*="photo"], [class*="picture"]');
        imageContainers.forEach(container => {
          const event = new MouseEvent('mouseover', {
            view: window,
            bubbles: true,
            cancelable: true
          });
          container.dispatchEvent(event);
        });
      });

      // Wait for any animations or transitions
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.log('Lazy loading trigger failed:', error.message);
    }
  }

  async extractVisibleImages() {
    try {
      return await this.page.evaluate(() => {
        const images = [];
        console.log('🔍 Starting visible image extraction...');
        
        // Get all img elements that are visible
        const imgElements = document.querySelectorAll('img');
        console.log(`Found ${imgElements.length} img elements`);
        
        imgElements.forEach((img, index) => {
          const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
          console.log(`Img ${index}: src=${src}, width=${img.offsetWidth}, height=${img.offsetHeight}`);
          
          if (src && (src.startsWith('http') || src.startsWith('//'))) {
            // Convert protocol-relative URLs
            let finalSrc = src;
            if (src.startsWith('//')) {
              finalSrc = 'https:' + src;
            }
            
            images.push({
              url: finalSrc,
              width: img.offsetWidth,
              height: img.offsetHeight,
              alt: img.alt || '',
              source: 'visible-img'
            });
            console.log(`Added visible image: ${finalSrc}`);
          }
        });

        // Get background images from visible elements
        const allElements = document.querySelectorAll('*');
        console.log(`Checking ${allElements.length} elements for background images`);
        
        allElements.forEach((el, index) => {
          if (el.offsetWidth > 50 && el.offsetHeight > 50) {
            const style = window.getComputedStyle(el);
            const bgImage = style.backgroundImage;
            if (bgImage && bgImage !== 'none') {
              const urlMatch = bgImage.match(/url\(['"]?([^'")]+)['"]?\)/);
              if (urlMatch && urlMatch[1]) {
                let url = urlMatch[1];
                if (url.startsWith('//')) {
                  url = 'https:' + url;
                }
                if (url.startsWith('http')) {
                  images.push({
                    url: url,
                    width: el.offsetWidth,
                    height: el.offsetHeight,
                    alt: el.getAttribute('alt') || '',
                    source: 'background-image'
                  });
                  console.log(`Added background image: ${url}`);
                }
              }
            }
          }
        });

        console.log(`Total visible images found: ${images.length}`);
        return images;
      });
    } catch (error) {
      console.log('Visible image extraction failed:', error.message);
      return [];
    }
  }

  async extractAllImageSources() {
    try {
      return await this.page.evaluate(() => {
        const images = [];
        
        // Extract from img tags (all, not just visible)
        const imgElements = document.querySelectorAll('img');
        imgElements.forEach(img => {
          const sources = [
            img.src,
            img.getAttribute('data-src'),
            img.getAttribute('data-lazy-src'),
            img.getAttribute('data-original'),
            img.getAttribute('data-srcset')?.split(' ')[0],
            img.getAttribute('data-lazy'),
            img.getAttribute('data-image')
          ].filter(Boolean);
          
          sources.forEach(src => {
            if (src.startsWith('http') || src.startsWith('//')) {
              // Convert protocol-relative URLs
              if (src.startsWith('//')) {
                src = 'https:' + src;
              }
              images.push({
                url: src,
                source: 'img-tag'
              });
            }
          });
        });

        // Extract from JavaScript variables and data attributes
        const scripts = document.querySelectorAll('script');
        scripts.forEach(script => {
          const content = script.textContent || script.innerHTML;
          // Look for various image URL patterns
          const patterns = [
            /https?:\/\/[^\s"'<>]+?\.(?:jpe?g|png|webp|bmp|gif)(?:\?[^\s"'<>]*)?/gi,
            /\/\/[^\s"'<>]+?\.(?:jpe?g|png|webp|bmp|gif)(?:\?[^\s"'<>]*)?/gi,
            /alicdn\.com[^\s"'<>]*\.(?:jpe?g|png|webp|bmp|gif)/gi
          ];
          
          patterns.forEach(pattern => {
            const urlMatches = content.match(pattern);
            if (urlMatches) {
              urlMatches.forEach(url => {
                if (url.startsWith('//')) {
                  url = 'https:' + url;
                }
                if (url.startsWith('http')) {
                  images.push({
                    url: url,
                    source: 'javascript'
                  });
                }
              });
            }
          });
        });

        // Extract from data attributes
        const dataElements = document.querySelectorAll('[data-src], [data-lazy], [data-image], [data-original]');
        dataElements.forEach(el => {
          const attrs = ['data-src', 'data-lazy', 'data-image', 'data-original'];
          attrs.forEach(attr => {
            const value = el.getAttribute(attr);
            if (value && (value.startsWith('http') || value.startsWith('//'))) {
              if (value.startsWith('//')) {
                value = 'https:' + value;
              }
              images.push({
                url: value,
                source: 'data-attribute'
              });
            }
          });
        });

        // Extract from CSS background images
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
          const style = window.getComputedStyle(el);
          const bgImage = style.backgroundImage;
          if (bgImage && bgImage !== 'none') {
            const urlMatch = bgImage.match(/url\(['"]?([^'")]+)['"]?\)/);
            if (urlMatch && urlMatch[1]) {
              let url = urlMatch[1];
              if (url.startsWith('//')) {
                url = 'https:' + url;
              }
              if (url.startsWith('http')) {
                images.push({
                  url: url,
                  source: 'css-background'
                });
              }
            }
          }
        });

        return images;
      });
    } catch (error) {
      console.log('All image sources extraction failed:', error.message);
      return [];
    }
  }

  async setupAdvancedBrowser() {
    // Set realistic viewport
    await this.page.setViewport({ 
      width: 1920, 
      height: 1080,
      deviceScaleFactor: 1,
      hasTouch: false,
      isLandscape: true,
      isMobile: false
    });
    
    // Set realistic user agent
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Set additional headers
    await this.page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0'
    });
    
    // Override navigator properties
    await this.page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });
      
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });
      
      Object.defineProperty(navigator, 'permissions', {
        get: () => ({
          query: () => Promise.resolve({ state: 'granted' }),
        }),
      });
    });
  }

  async simulateHumanBehavior() {
    // Random mouse movements
    await this.page.mouse.move(100, 100);
    await this.randomDelay(100, 300);
    await this.page.mouse.move(200, 200);
    await this.randomDelay(100, 300);
    await this.page.mouse.move(300, 300);
  }

  async setupRequestInterception() {
    await this.page.setRequestInterception(true);
    this.page.on('request', (req) => {
      const resourceType = req.resourceType();
      const url = req.url();
      
      try {
        // Block unnecessary resources
        if (['stylesheet', 'font', 'media', 'manifest'].includes(resourceType)) {
          req.abort();
        } else if (url.includes('google-analytics') || 
                   url.includes('googletagmanager') || 
                   url.includes('facebook.com/tr') ||
                   url.includes('doubleclick.net')) {
          req.abort();
        } else {
          req.continue();
        }
      } catch (error) {
        // Request already handled, ignore
        console.log('Request already handled, ignoring:', error.message);
      }
    });
  }

  async randomDelay(min = 100, max = 500) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  async humanLikeScroll() {
    const scrollHeight = await this.page.evaluate(() => document.body.scrollHeight);
    let currentPosition = 0;
    const viewportHeight = 1080;
    
    while (currentPosition < scrollHeight) {
      // Random scroll distance
      const scrollDistance = Math.floor(Math.random() * 300) + 100;
      currentPosition += scrollDistance;
      
      await this.page.evaluate((pos) => {
        window.scrollTo(0, pos);
      }, currentPosition);
      
      // Random pause
      await this.randomDelay(200, 800);
      
      // Random mouse movement
      await this.page.mouse.move(
        Math.floor(Math.random() * 1920),
        Math.floor(Math.random() * 1080)
      );
    }
  }

  async waitForImages() {
    // Wait for images to load
    await this.page.waitForFunction(() => {
      const images = document.querySelectorAll('img');
      return Array.from(images).every(img => img.complete);
    }, { timeout: 10000 }).catch(() => {
      console.log('Some images may not have loaded completely');
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

// Global scraper instance
const advancedScraper = new AdvancedThunderbitScraper();

// Advanced Thunderbit Scraper handles all image extraction - no AI needed!

// Advanced Thunderbit Scraper handles all image extraction - no AI needed!

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

  // Additional patterns for Chinese e-commerce sites
  // Look for data-src, data-lazy-src, and other common lazy loading attributes
  $('[data-src]').each((i, el) => {
    const src = $(el).attr('data-src');
    if (src && src.match(/\.(jpe?g|png|webp|bmp)/i)) {
      const abs = absoluteUrl(base, src);
      if (abs) imgs.push(abs);
    }
  });

  $('[data-lazy-src]').each((i, el) => {
    const src = $(el).attr('data-lazy-src');
    if (src && src.match(/\.(jpe?g|png|webp|bmp)/i)) {
      const abs = absoluteUrl(base, src);
      if (abs) imgs.push(abs);
    }
  });

  // Look for JSON data that might contain image URLs
  const jsonMatches = html.match(/"https?:\/\/[^"]*\.(?:jpe?g|png|webp|bmp)[^"]*"/gi) || [];
  jsonMatches.forEach(match => {
    const url = match.replace(/"/g, '');
    const abs = absoluteUrl(base, url);
    if (abs) imgs.push(abs);
  });

  // dedupe and return
  return Array.from(new Set(imgs));
}

app.post('/api/scan', async (req, res) => {
  const { urls, method = 'advanced' } = req.body;
  if (!urls || !Array.isArray(urls)) return res.status(400).json({ error: 'urls must be an array' });
  
  console.log(`\n🎯 Using ${method} method for scanning`);

  const results = {};

  await Promise.all(urls.map(async (site) => {
    try {
      // Enhanced headers for better compatibility
      const headers = {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
        'X-Requested-With': 'XMLHttpRequest'
      };

      const resp = await axios.get(site, { 
        responseType: 'text', 
        timeout: 20000, 
        headers,
        maxRedirects: 10,
        validateStatus: function (status) {
          return status >= 200 && status < 400;
        }
      });
      
      // Debug logging for problematic sites
      if (site.includes('taobao.com') || site.includes('tmall.com')) {
        console.log(`\n=== DEBUG: ${site} ===`);
        console.log(`Status: ${resp.status}`);
        console.log(`Content length: ${resp.data.length}`);
        console.log(`Contains skeleton: ${resp.data.includes('SkeletonBlock')}`);
        console.log(`Contains img tags: ${(resp.data.match(/<img/gi) || []).length}`);
        console.log(`Contains data-src: ${(resp.data.match(/data-src/gi) || []).length}`);
        console.log(`First 500 chars: ${resp.data.substring(0, 500)}...`);
      }
      
      let images = [];
      
      if (method === 'advanced') {
        // Use Advanced Thunderbit Scraper
        console.log(`🎯 Using Advanced Thunderbit Scraper for: ${site}`);
        images = await advancedScraper.scrapeWithAdvancedThunderbit(site);
        console.log(`👁️ Advanced Thunderbit found ${images.length} images`);
      } else {
        // Use traditional method
        console.log(`🔍 Using traditional method for: ${site}`);
        images = gatherImageUrlsFromHtml(site, resp.data);
        console.log(`📊 Traditional method found ${images.length} images`);
      }
      
      // Keep the full image objects as they contain useful metadata
      results[site] = images;
    } catch (e) {
      results[site] = { error: String(e.message) };
    }
  }));

  res.json(results);
});

app.post('/api/download', async (req, res) => {
  const { urls, selectedImages, minSizeKB = 0 } = req.body;
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

  // If selectedImages is true, download the provided URLs directly
  if (selectedImages && urls.length > 0) {
    console.log(`📥 Downloading ${urls.length} selected images directly`);
    
    let idx = 1;
    let appendedCount = 0;

    await forEachLimit(urls, 3, async (imgUrl) => {
      try {
        console.log(`🔍 Downloading image ${idx}: ${imgUrl}`);
        
        const imgStream = await axios.get(imgUrl, { 
          responseType: 'stream', 
          timeout: 20000, 
          maxRedirects: 5, 
          headers: { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'image',
            'Sec-Fetch-Mode': 'no-cors',
            'Sec-Fetch-Site': 'cross-site',
            'Cache-Control': 'no-cache',
            'Referer': 'https://detail.tmall.com/'
          } 
        });

        // Get file extension from URL or default to jpg
        const urlParts = imgUrl.split('.');
        const extension = urlParts.length > 1 ? urlParts[urlParts.length - 1].split('?')[0] : 'jpg';
        const filename = `selected_image_${idx}.${extension}`;
        const currentIdx = idx;
        idx += 1;

        archive.append(imgStream.data, { name: filename });
        appendedCount += 1;
        console.log(`✅ Appended selected image ${currentIdx}: ${filename}`);
      } catch (e) {
        console.log(`❌ Selected image ${idx} download failed: ${e.message}`);
        idx += 1; // Still increment to avoid filename conflicts
      }
    });

    console.log(`Selected images - appended ${appendedCount} images`);
  } else {
    // process sites in parallel with a small concurrency (e.g., 3 sites at once)
    await forEachLimit(urls, 3, async (site) => {
    // gather images using the richer helper
    let list = [];
    try {
      const headers = {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
        'X-Requested-With': 'XMLHttpRequest'
      };

      const resp = await axios.get(site, { 
        responseType: 'text', 
        timeout: 20000, 
        headers,
        maxRedirects: 10,
        validateStatus: function (status) {
          return status >= 200 && status < 400;
        }
      });
      
      // Use Visual AI Scraper for JavaScript-heavy sites
      let visualImages = [];
      let traditionalImages = [];
      
      // Step 1: Try traditional method first
      console.log(`🔍 Trying traditional method for download: ${site}`);
      const traditionalUrls = gatherImageUrlsFromHtml(site, resp.data);
      console.log(`📊 Traditional method found ${traditionalUrls.length} images for download`);
      
      // Convert traditional URLs to image objects
      traditionalImages = traditionalUrls.map(url => ({ url, source: 'traditional' }));
      
      // Step 2: Check if we need Advanced Thunderbit Scraper as fallback
      const needsAdvancedScraping = traditionalImages.length === 0 || 
                                   resp.data.includes('javascript') || 
                                   resp.data.includes('React') || 
                                   resp.data.includes('Vue') || 
                                   resp.data.includes('Angular') ||
                                   site.includes('taobao') || 
                                   site.includes('tmall');
      
      if (needsAdvancedScraping && traditionalImages.length === 0) {
        console.log(`🎯 Traditional method found no images, using Advanced Thunderbit Scraper for download: ${site}`);
        visualImages = await advancedScraper.scrapeWithAdvancedThunderbit(site);
        console.log(`👁️ Advanced Thunderbit found ${visualImages.length} images for download`);
      } else {
        // Use traditional results
        visualImages = traditionalImages;
        console.log(`✅ Using traditional method results for download: ${visualImages.length} images`);
      }
      
      // Combine results and convert to simple array for download
      const combinedImages = [...visualImages, ...traditionalImages];
      list = [...new Set(combinedImages.map(img => img.url))];
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
        })(imgUrl, minSizeKB * 1024, site);

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
  }

  archive.on('warning', (err) => console.warn('Archive warning', err));
  archive.on('error', (err) => {
    console.error('Archive error', err);
    try { res.status(500).end(); } catch (e) {}
  });
  archive.on('finish', () => console.log('Archive finalize complete'));

  archive.finalize().catch((e) => console.error('Finalize error', e));
});

app.listen(PORT, () => console.log(`Server listening on http://0.0.0.0:${PORT} (env NODE_ENV=${process.env.NODE_ENV || 'development'})`));

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await advancedScraper.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await advancedScraper.close();
  process.exit(0);
});
