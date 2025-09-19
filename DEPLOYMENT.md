# 🚀 Deployment Guide - Aarogya Setu AI Health Guide

This guide covers multiple deployment options for running the project on different platforms.

## 📋 Pre-deployment Checklist

- [ ] All API keys configured in environment variables
- [ ] Project builds successfully (`npm run build`)
- [ ] Environment variables match target platform requirements
- [ ] Dependencies are up to date

## 🌐 Cloud Deployment Options

### 1. Vercel (Recommended)

**Automatic Deployment:**
1. Fork the repository to your GitHub account
2. Visit [vercel.com](https://vercel.com) and sign in
3. Click "New Project" and import your repository
4. Add environment variables in Vercel dashboard
5. Deploy!

**Manual Deployment:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel
```

**Environment Variables in Vercel:**
- Go to Project Settings → Environment Variables
- Add all variables from your `.env` file

### 2. Netlify

**From Git:**
1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in site settings

**Manual Deploy:**
```bash
# Build the project
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### 3. Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase
firebase init hosting

# Build and deploy
npm run build
firebase deploy
```

### 4. GitHub Pages

```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts:
# "deploy": "npm run build && gh-pages -d dist"

# Deploy
npm run deploy
```

## 🐳 Docker Deployment

### Build and Run Locally

```bash
# Build Docker image
npm run docker:build

# Run container
npm run docker:run
```

### Using Docker Compose

```bash
# Start services
npm run docker:up

# Stop services
npm run docker:down
```

### Production Docker Setup

```bash
# Build for production
docker build -t arogya-setu-prod .

# Run with environment variables
docker run -d \
  --name arogya-setu \
  -p 80:8080 \
  -e VITE_GEMINI_API_KEY="your-key" \
  -e VITE_SUPABASE_URL="your-url" \
  arogya-setu-prod
```

## ☁️ VPS/Server Deployment

### Using PM2 (Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Build the project
npm run build

# Start with PM2
pm2 start "npm run start" --name arogya-setu

# Save PM2 configuration
pm2 save
pm2 startup
```

### Using Nginx (Reverse Proxy)

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Environment Variables for Production

### Required Variables

```env
# Supabase (Required)
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-publishable-key"
VITE_SUPABASE_URL="https://your-project.supabase.co"

# Gemini AI (Recommended)
VITE_GEMINI_API_KEY="your-gemini-key"
VITE_GEMINI_MODEL="gemini-1.5-flash"

# App Configuration
VITE_APP_NAME="Aarogya Setu AI Health Guide"
VITE_APP_VERSION="1.0.0"
```

### Platform-Specific Setup

**Vercel:**
- Add in Project Settings → Environment Variables
- Available in all environments

**Netlify:**
- Add in Site Settings → Environment Variables
- Use same variable names

**Railway:**
- Add in Variables tab
- Automatically injected at build time

**Heroku:**
- Add via CLI: `heroku config:set VITE_GEMINI_API_KEY="your-key"`
- Or use dashboard

## 🔒 Security Best Practices

### API Key Management

1. **Never commit API keys to git**
2. **Use different keys for different environments**
3. **Regularly rotate API keys**
4. **Monitor API usage and set up alerts**

### Environment Security

```bash
# Add to .gitignore
.env
.env.local
.env.production

# Use secrets in CI/CD
# GitHub Actions example:
env:
  VITE_GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
```

## 📊 Monitoring & Analytics

### Health Checks

Add to your deployment:

```javascript
// Add to main.tsx or app entry point
if (import.meta.env.PROD) {
  // Health check endpoint
  window.addEventListener('load', () => {
    console.log('Aarogya Setu loaded successfully');
  });
}
```

### Error Tracking

Consider integrating:
- Sentry for error tracking
- Google Analytics for usage analytics
- LogRocket for session replay

## 🚨 Troubleshooting Deployment

### Common Issues

**Build Fails:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Environment Variables Not Loading:**
- Check variable names (must start with `VITE_`)
- Verify in platform settings
- Restart application after changes

**API Calls Failing:**
- Check CORS settings
- Verify API keys are valid
- Check network connectivity

**Performance Issues:**
- Enable compression
- Use CDN for static assets
- Optimize images and bundles

### Getting Help

1. Check deployment logs
2. Verify environment variables
3. Test locally first
4. Check platform-specific documentation

## 📱 Mobile Deployment

### Progressive Web App (PWA)

The app is PWA-ready. To enable:

1. Add to `index.html`:
```html
<link rel="manifest" href="/manifest.json">
```

2. Configure service worker for offline functionality

3. Test on mobile devices

### App Store Deployment

Consider using:
- **Capacitor** for native mobile apps
- **Cordova** for hybrid apps
- **React Native** for full native experience

---

## 🎉 Deployment Complete!

After successful deployment:

1. ✅ Test all features
2. ✅ Verify API connections
3. ✅ Check mobile responsiveness
4. ✅ Monitor performance
5. ✅ Set up backups

**Your health platform is now live and helping people! 🚀**
