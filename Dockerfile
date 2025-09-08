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

# Healthcheck (optional)
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
