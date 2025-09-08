# Fetch Images & Zip

Simple Node.js app that scans web pages for <img> tags and downloads them into a zip. Filters: skip images smaller than 10KB and skip .gif files.

Quick start (Windows PowerShell):

1. Install dependencies

```powershell
npm install
```

2. Start server

```powershell
npm start
```

3. Open http://localhost:3000 in your browser, paste one URL per line, click "Scan for images" to preview images, then "Download ZIP" to get a zip file.

Notes:
- The server makes outgoing HTTP requests to the provided sites. Some sites may block requests or require headers/cookies; this simple app doesn't handle authentication.
- Large crawls may be slow; this is designed as a minimal demo.

Production / Coolify deployment
1) Build a Docker image locally to validate:

```powershell
cd E:\FetchImages
docker build -t fetch-images:latest .
```

2) Run locally with Docker to smoke test:

## Running with Docker Compose + Traefik (production on your server)

This repo includes a ready-to-run `docker-compose.yml` that uses Traefik as a reverse proxy and TLS provider (Let's Encrypt). It will build your existing `Dockerfile` and obtain certificates for `download.aiwaverider.com`.

Steps:

1. On your server, install Docker and Docker Compose.
2. Edit `.env` and replace `LETSENCRYPT_EMAIL` with your real email address.
3. Ensure DNS A record for `download.aiwaverider.com` points to your server public IP.
4. Open ports 80 and 443 in your firewall.
5. Start the stack in the repo root:

```powershell
docker compose up -d --build
```

6. Monitor Traefik logs while the certificate is requested:

```powershell
docker compose logs -f traefik
```

Notes:
- Traefik stores Let's Encrypt data in the `traefik_letsencrypt` volume. Back it up if you migrate.
- If you prefer Coolify's managed TLS/proxy, you don't need this compose stack; instead deploy the Dockerfile in Coolify and add the domain there.

```powershell
docker run --rm -p 3000:3000 --name fetch-test fetch-images:latest
```

3) Deploy to Coolify:
 - Create a new app in Coolify and choose Dockerfile (or connect your Git repo).
 - Set environment variables if needed (PORT default 3000). Coolify will build the image from the Dockerfile.
 - Add a domain in Coolify: `download.aiwaverider.com` and configure automatic LetsEncrypt certificate.

4) DNS: point an A record for `download.aiwaverider.com` to your server IP (or the IP provided by Coolify). Example:

	download.aiwaverider.com A 203.0.113.45

5) After Coolify finishes build and deployment, your app should be reachable at https://download.aiwaverider.com.

Security & notes for production
- Consider rate-limiting requests, adding authentication, and logging to avoid abuse.
- Respect remote site robots/terms — scraping may be disallowed by some sites.
- For heavy usage, consider background jobs (queue) and storage for temporary zips rather than streaming directly.

