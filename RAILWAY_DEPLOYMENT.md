# Railway Deployment Guide

## Quick Deploy to Railway

### Option 1: Deploy from GitHub (Recommended)

1. **Go to Railway**: Visit [railway.app](https://railway.app)

2. **Sign up/Login**: Use your GitHub account

3. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository: `elpresidentey/HNGTwigTicketnaster`

4. **Configure**:
   - Railway will auto-detect PHP
   - No additional configuration needed (we've added railway.json)

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes for build
   - Your app will be live at: `https://your-app.up.railway.app`

### Option 2: Deploy with Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

### Environment Variables (Optional)

If you need to add environment variables:
1. Go to your project in Railway dashboard
2. Click on "Variables" tab
3. Add your variables (e.g., DATABASE_URL, API_KEYS)

### Custom Domain (Optional)

1. Go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed

## What's Included

- ✅ PHP 8.2 runtime
- ✅ Composer dependencies
- ✅ Auto-restart on failure
- ✅ HTTPS enabled by default
- ✅ Free tier available

## Troubleshooting

### Build Fails
- Check composer.json is valid
- Ensure all dependencies are compatible with PHP 8.2

### App Won't Start
- Check Railway logs in dashboard
- Verify public/index.php exists
- Ensure .htaccess is configured correctly

### 404 Errors
- Make sure your routes are defined in src/Router.php
- Check that public directory is set as document root

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
