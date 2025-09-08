This folder contains ready-to-paste deployment artifacts for `download.aiwaverider.com`.

Options
1) Static site (serve files from /var/www/download)
   - Use `nginx_static.conf`.

2) Reverse-proxy to local Node app
   - Use `nginx_proxy.conf`.

Quick steps (Ubuntu/Debian)

# 1. Copy nginx config
sudo mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled
sudo cp deploy/nginx_proxy.conf /etc/nginx/sites-available/download.aiwaverider.com
sudo ln -s /etc/nginx/sites-available/download.aiwaverider.com /etc/nginx/sites-enabled/

# 2. Create web root if serving static
sudo mkdir -p /var/www/download
sudo chown -R $USER:$USER /var/www/download

# 3. Open firewall ports
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload

# 4. Test Nginx and reload
sudo nginx -t
sudo systemctl reload nginx

# 5. Obtain TLS certificate with Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d download.aiwaverider.com

# 6. Verify
curl -I https://download.aiwaverider.com/health

Notes
- If you deploy through Coolify, add the domain in Coolify's app settings and let Coolify manage TLS automatically.
- For automatic renewal, certbot adds a cron job or systemd timer; verify with `sudo systemctl status certbot.timer`.

Troubleshooting
- If certbot fails, ensure ports 80 and 443 are reachable from the internet.
- Check nginx logs: /var/log/nginx/error.log and /var/log/nginx/access.log
- For Coolify: use the Coolify UI logs and domain settings.
