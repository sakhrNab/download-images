#!/bin/sh

# Start nginx in background
nginx -g "daemon off;" &

# Start Node.js API server
node server.js

