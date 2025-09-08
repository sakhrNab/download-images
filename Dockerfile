# Multi-stage build for production
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Production stage with nginx
FROM nginx:alpine

# Install Node.js and dependencies for the API
RUN apk add --no-cache nodejs npm

# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy server code
COPY server.js ./

# Remove default nginx configuration
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy static files
COPY public/ /usr/share/nginx/html/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Create a simple health check script
RUN echo '#!/bin/sh\nwget --quiet --tries=1 --spider http://localhost:80/health || exit 1' > /healthcheck.sh && \
    chmod +x /healthcheck.sh

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD /healthcheck.sh

# Start both services
CMD ["/start.sh"]
