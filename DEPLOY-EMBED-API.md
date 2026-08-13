# Deploy TMDB-Embed-API to Render

## Option 1: Manual Deployment (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repo: `osoooama/osamap2`
4. Configure:
   - **Name**: `osamap2-embed-api`
   - **Root Directory**: `embed-api`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free
5. Click **Create Web Service**

## Option 2: Render CLI

```bash
# Install Render CLI
npm install -g @render/cli

# Login
render login

# Deploy
cd embed-api
render services create --name osamap2-embed-api --type web --runtime node --plan free
```

## Option 3: Render API

```bash
# Set your Render API key
export RENDER_API_KEY="your-api-key-here"

# Create service
curl -X POST https://api.render.com/v1/services \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "osamap2-embed-api",
    "type": "web",
    "runtime": "node",
    "plan": "free",
    "repo": "https://github.com/osoooama/osamap2",
    "branch": "main",
    "rootDir": "embed-api",
    "buildCommand": "npm install",
    "startCommand": "node server.js"
  }'
```

## After Deployment

1. Set environment variable `TMDB_EMBED_API_URL` in your backend:
   ```
   https://osamap2-embed-api.onrender.com
   ```

2. Test the endpoint:
   ```
   GET https://osamap2-embed-api.onrender.com/api/streams/movie/550
   ```

3. Update `backend/.env`:
   ```
   TMDB_EMBED_API_URL=https://osamap2-embed-api.onrender.com
   ```
