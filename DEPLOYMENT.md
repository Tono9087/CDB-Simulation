# 🚀 Deployment Guide - Vercel

Complete guide for deploying your phishing simulation to Vercel.

---

## Pre-Deployment Checklist

### ✅ Before You Deploy

- [ ] MongoDB Atlas cluster is set up and running
- [ ] Database user created with read/write permissions
- [ ] IP whitelist configured (0.0.0.0/0 for public access)
- [ ] Connection string tested locally
- [ ] All environment variables documented
- [ ] Local testing completed successfully
- [ ] Dashboard password changed from default (recommended)
- [ ] Code pushed to Git repository (for GitHub integration)

---

## Method 1: Vercel CLI Deployment (Recommended)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

Choose your login method (GitHub, GitLab, Bitbucket, or Email).

### Step 3: Deploy

From your project directory:

```bash
vercel
```

Follow the prompts:

```
? Set up and deploy "~/CDB-Simulation"? [Y/n] Y
? Which scope do you want to deploy to? <Your Username>
? Link to existing project? [y/N] N
? What's your project's name? ciberseguridad-demo
? In which directory is your code located? ./
```

Vercel will:
1. Build your project
2. Deploy serverless functions
3. Provide you with a preview URL

### Step 4: Set Environment Variables

```bash
# Add MongoDB URI
vercel env add MONGODB_URI

# When prompted, paste your connection string:
mongodb+srv://apex-user:password@cluster0.xxxxx.mongodb.net/apex-db

# Select: Production, Preview, Development (space to select, enter to confirm)

# Add dashboard password
vercel env add DASHBOARD_PASSWORD

# When prompted, enter:
admin2024
```

### Step 5: Deploy to Production

```bash
vercel --prod
```

Your site will be live at: `https://your-project.vercel.app`

---

## Method 2: GitHub Integration

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Phishing simulation project"

# Add remote
git remote add origin https://github.com/yourusername/your-repo.git

# Push to GitHub
git push -u origin main
```

### Step 2: Connect Vercel to GitHub

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Project"
3. Select "Import Git Repository"
4. Choose your GitHub repository
5. Click "Import"

### Step 3: Configure Project

Vercel will automatically detect:
- ✅ Framework: Vite
- ✅ Build Command: `npm run build`
- ✅ Output Directory: `dist`

**Do not change these settings.**

### Step 4: Add Environment Variables

Before deploying, click "Environment Variables":

Add these variables:

| Name | Value | Environment |
|------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://...` | Production, Preview, Development |
| `DASHBOARD_PASSWORD` | `admin2024` | Production, Preview, Development |

### Step 5: Deploy

Click "Deploy" and wait for the build to complete.

---

## Post-Deployment Configuration

### 1. Custom Domain (Optional)

To use a custom domain:

1. Go to Project Settings → Domains
2. Add your domain: `phishing-demo.yourdomain.com`
3. Follow DNS configuration instructions
4. Wait for DNS propagation (can take up to 48 hours)

### 2. Enable HTTPS

Vercel automatically provides SSL certificates. Ensure:

1. Go to Project Settings → General
2. Verify "Force HTTPS" is enabled

### 3. Configure CORS (If Needed)

If you experience CORS issues, add `vercel.json` configuration:

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,DELETE,OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type" }
      ]
    }
  ]
}
```

---

## Vercel Dashboard Guide

### Access Your Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project

### Key Sections

#### **Deployments**
- View all deployments (production and preview)
- Access deployment logs
- Rollback to previous versions

#### **Logs**
- Real-time function logs
- Error tracking
- Request monitoring

#### **Settings**

**Environment Variables:**
- Add/edit/delete variables
- Different values for production/preview/development

**Domains:**
- Manage custom domains
- Configure DNS

**Git:**
- Change connected repository
- Configure branch settings

**Functions:**
- View function details
- Check execution times
- Monitor usage

---

## Monitoring & Maintenance

### Check Deployment Status

```bash
# List all deployments
vercel ls

# Get deployment details
vercel inspect <deployment-url>

# View logs
vercel logs <deployment-url>
```

### View Function Logs

1. Go to Vercel Dashboard → Your Project → Logs
2. Filter by:
   - Function name (e.g., `api/capture.js`)
   - Time range
   - Status code

### Monitor Usage

1. Go to Settings → Usage
2. Check:
   - Bandwidth usage
   - Function execution time
   - Build minutes

**Free tier limits:**
- Bandwidth: 100 GB/month
- Function execution: 100 GB-hours/month
- Builds: 6,000 minutes/month

---

## Environment-Specific Configuration

### Production Environment

For production (your main deployment):

```bash
vercel env add MONGODB_URI production
vercel env add DASHBOARD_PASSWORD production
```

Use strong passwords and production MongoDB cluster.

### Preview Environment

For pull request previews:

```bash
vercel env add MONGODB_URI preview
```

Can use same database or separate preview database.

### Development Environment

For local development with Vercel:

```bash
vercel env pull
```

This downloads environment variables to `.env.local`.

---

## Updating Your Deployment

### Method 1: Git Push (Automatic)

If using GitHub integration:

```bash
git add .
git commit -m "Update phishing simulation"
git push
```

Vercel automatically deploys on push.

### Method 2: Manual Deploy

```bash
vercel --prod
```

---

## Rollback Deployment

If something goes wrong:

### Via CLI

```bash
# List deployments
vercel ls

# Promote a previous deployment to production
vercel promote <deployment-url>
```

### Via Dashboard

1. Go to Deployments
2. Find the working deployment
3. Click "..." → "Promote to Production"

---

## Performance Optimization

### Enable Edge Network

Vercel automatically uses edge caching. Verify:

1. Go to Settings → General
2. Check "Edge Network" is enabled

### Optimize Function Cold Starts

In `vercel.json`:

```json
{
  "functions": {
    "api/**/*.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

### Enable Caching Headers

Add to `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## Security Best Practices

### 1. Secure Environment Variables

- ✅ Never commit `.env` files
- ✅ Use strong database passwords
- ✅ Rotate passwords regularly
- ✅ Use different values for preview/production

### 2. Rate Limiting

Already implemented in `api/capture.js`:
- 10 requests per hour per IP
- In-memory storage (resets on cold start)

For better rate limiting, consider:
- Vercel Edge Config
- External rate limiting service (Redis)

### 3. Database Security

- ✅ Enable MongoDB authentication
- ✅ Use least-privilege database users
- ✅ Whitelist only necessary IPs
- ✅ Enable MongoDB encryption at rest

### 4. Function Security

- ✅ Validate all inputs
- ✅ Hash sensitive data
- ✅ Implement proper error handling
- ✅ Don't expose stack traces

---

## Troubleshooting Deployment Issues

### Build Fails

**Error:** "Command failed: npm run build"

**Solutions:**
1. Check local build works: `npm run build`
2. Verify all dependencies in `package.json`
3. Check Node.js version compatibility
4. Review build logs in Vercel dashboard

### Function Timeout

**Error:** "Function execution timeout"

**Solutions:**
1. Increase timeout in `vercel.json`:
   ```json
   {
     "functions": {
       "api/**/*.js": {
         "maxDuration": 30
       }
     }
   }
   ```
2. Optimize database queries
3. Add indexes to MongoDB collections

### MongoDB Connection Fails

**Error:** "MongoNetworkError"

**Solutions:**
1. Verify MongoDB URI is correct
2. Check IP whitelist includes Vercel IPs
3. Use connection pooling
4. Implement connection retry logic

### Environment Variables Not Working

**Solutions:**
1. Verify variables are set in Vercel dashboard
2. Check spelling matches code exactly
3. Redeploy after adding variables
4. For local testing, use `vercel env pull`

### 404 on API Routes

**Solutions:**
1. Verify `vercel.json` routing configuration
2. Check function files are in `api/` directory
3. Ensure functions export default handler
4. Review function logs for errors

---

## Monitoring & Alerts

### Set Up Alerts

1. Go to Settings → Notifications
2. Enable:
   - Deployment failed
   - Domain configuration changed
   - SSL certificate issues

### Integration with Monitoring Tools

Consider integrating:
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Datadog**: Performance monitoring

---

## Cost Optimization

### Stay Within Free Tier

**Free tier includes:**
- 100 GB bandwidth/month
- 100 GB-hours function execution/month
- Unlimited projects

**Tips to stay free:**
1. Use image optimization
2. Implement caching
3. Optimize bundle size
4. Clean up old deployments

### Monitor Usage

Check usage at: Settings → Usage

Set up billing alerts before hitting limits.

---

## Backup & Recovery

### Database Backups

MongoDB Atlas provides automatic backups (M10+).

For M0 (free tier):
1. Use `mongodump` regularly
2. Export data via dashboard CSV
3. Keep backups of MongoDB connection strings

### Code Backups

- ✅ Use Git for version control
- ✅ Push to GitHub regularly
- ✅ Tag production releases
- ✅ Keep local copies

### Deployment Backups

Vercel keeps deployment history.

To download a deployment:
```bash
vercel inspect <deployment-url>
```

---

## Production Checklist

Before going live with presentations:

- [ ] Test all features in production
- [ ] Verify MongoDB connection works
- [ ] Test form submission end-to-end
- [ ] Verify educational alerts appear
- [ ] Test dashboard access
- [ ] Verify CSV export works
- [ ] Check all charts render correctly
- [ ] Test on mobile devices
- [ ] Verify clear database function works
- [ ] Review logs for any errors
- [ ] Set up monitoring alerts
- [ ] Prepare rollback plan
- [ ] Document custom domain (if used)
- [ ] Brief team on how to access logs

---

## Quick Reference Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# List deployments
vercel ls

# View logs
vercel logs <deployment-url>

# Add environment variable
vercel env add <NAME>

# Remove environment variable
vercel env rm <NAME>

# Pull environment variables
vercel env pull

# Inspect deployment
vercel inspect <deployment-url>

# Promote deployment to production
vercel promote <deployment-url>

# Remove deployment
vercel rm <deployment-url>
```

---

## Support Resources

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Community Forum**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **Status Page**: [vercel-status.com](https://vercel-status.com)

---

## 🎉 Deployment Complete!

Your phishing simulation is now live and ready for educational demonstrations!

**Production URL**: `https://your-project.vercel.app`

**Next Steps:**
1. Test all functionality
2. Share URL with your team
3. Prepare presentation materials
4. Set up monitoring
5. Schedule data cleanup after presentations

**Remember:**
- This is for educational purposes only
- Always disclose the simulation nature
- Delete data after demonstrations
- Use responsibly and ethically

Good luck with your project! 🚀
