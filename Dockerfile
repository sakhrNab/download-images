FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Bundle app
COPY . .

# Expose port (can be overridden by env)
EXPOSE 3000

# Healthcheck (optional) - use /health for a small, fast probe and allow a start period
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
