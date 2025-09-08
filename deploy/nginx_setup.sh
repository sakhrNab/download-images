#!/usr/bin/env bash
set -euo pipefail

# Usage: sudo ./nginx_setup.sh download.aiwaverider.com /etc/nginx/sites-available/download.aiwaverider.com
# This script assumes Debian/Ubuntu. It copies the repo's nginx_proxy.conf to the server, enables it,
# creates web root, opens UFW ports, installs certbot, and requests a Let's Encrypt certificate.

DOMAIN=${1:-download.aiwaverider.com}
DEST_CONF=${2:-/etc/nginx/sites-available/${DOMAIN}}
WEBROOT=${3:-/var/www/${DOMAIN}}

echo "Domain: $DOMAIN"
echo "Dest conf: $DEST_CONF"
echo "Webroot: $WEBROOT"

if [ "$EUID" -ne 0 ]; then
  echo "This script must be run as root: sudo $0" >&2
  exit 1
fi

mkdir -p "$WEBROOT"
chown -R $SUDO_USER:$SUDO_USER "$WEBROOT"

echo "Copying nginx config..."
cp ./deploy/nginx_proxy.conf "$DEST_CONF"
ln -sf "$DEST_CONF" /etc/nginx/sites-enabled/

echo "Testing nginx config..."
nginx -t
systemctl reload nginx || true

echo "Opening firewall ports 80/443..."
if command -v ufw >/dev/null 2>&1; then
  ufw allow 80/tcp
  ufw allow 443/tcp
  ufw reload || true
fi

echo "Installing certbot (if missing) and obtaining certificate..."
if ! command -v certbot >/dev/null 2>&1; then
  apt-get update
  apt-get install -y certbot python3-certbot-nginx
fi

# Obtain or renew cert
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m admin@${DOMAIN} || true

echo "Reloading nginx to pick up certificates..."
systemctl reload nginx || true

echo "Done. Verify: curl -I https://$DOMAIN/health"
