#!/bin/bash
# Deploy TMDB-Embed-API to Render
# Usage: ./deploy-embed-api.sh

echo "=== Deploying TMDB-Embed-API to Render ==="

# Check if Render CLI is installed
if ! command -v render &> /dev/null; then
    echo "Render CLI not found. Installing..."
    npm install -g @render/cli
fi

# Login to Render (if not already)
render login

# Create the service
echo "Creating embed-api service..."
render services create \
  --name osamap2-embed-api \
  --type web \
  --runtime node \
  --plan free \
  --repo osoooama/osamap2 \
  --branch main \
  --rootDir embed-api \
  --buildCommand "npm install" \
  --startCommand "node server.js"

echo "=== Deployment complete ==="
echo "Service URL: https://osamap2-embed-api.onrender.com"
