# Deployment Guide for Neural Wars Marketing Automation

## Overview
This guide provides step-by-step instructions for deploying the Neural Wars Marketing Automation application to Vercel.app.

## Prerequisites

### 1. Vercel Account
- Create a free account at [vercel.com](https://vercel.com)
- Install Vercel CLI: `npm install -g vercel`

### 2. GitHub Repository Access
- Ensure you have access to the repository: `TheNeuralWars/Fractured-Code-Marketing`
- Repository should be connected to your GitHub account

## Deployment Methods

### Method 1: Automatic Deployment via GitHub (Recommended)

#### Step 1: Connect Repository to Vercel
1. Visit [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import from GitHub: `TheNeuralWars/Fractured-Code-Marketing`
4. Select the repository and click "Import"

#### Step 2: Configure Project Settings
Vercel will automatically detect the Node.js application. Confirm these settings:

- **Framework Preset**: Other
- **Root Directory**: `./` (leave blank)
- **Build Command**: `npm run build` (or leave empty if no build step)
- **Output Directory**: `public` (Vercel will auto-detect)
- **Install Command**: `npm install`

#### Step 3: Environment Variables (Optional)
If your application requires environment variables:
1. Go to Project Settings → Environment Variables
2. Add any required variables:
   - `NODE_ENV=production` (automatically set by Vercel)
   - Add any custom environment variables your app needs

#### Step 4: Deploy
1. Click "Deploy"
2. Vercel will build and deploy your application
3. You'll receive a production URL like: `https://neural-wars-marketing-automation.vercel.app`

### Method 2: CLI Deployment

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login to Vercel
```bash
vercel login
```

#### Step 3: Deploy from Local Repository
```bash
cd /path/to/Fractured-Code-Marketing
vercel
```

Follow the prompts:
- Set up and deploy? `Y`
- Which scope? Select your account
- Link to existing project? `N` (for first deployment)
- What's your project's name? `neural-wars-marketing-automation`
- In which directory? `.` (current directory)

#### Step 4: Production Deployment
```bash
vercel --prod
```

## Configuration Files

### vercel.json
The project includes a `vercel.json` configuration file that handles:
- Node.js runtime configuration
- Static file serving
- API route mapping
- Function timeout settings

### .vercelignore
Optimizes builds by excluding unnecessary files:
- Development dependencies
- Test files
- Logs and temporary files
- Documentation (except README and DEPLOYMENT)

## Post-Deployment Verification

### 1. Test Application Routes
Visit your deployment URL and verify:
- **Homepage**: `https://your-app.vercel.app/`
- **Health Check**: `https://your-app.vercel.app/health`
- **API Endpoints**: `https://your-app.vercel.app/api/dashboard`

### 2. Check Function Logs
1. Go to Vercel Dashboard → Your Project
2. Click on "Functions" tab
3. Monitor for any errors or performance issues

### 3. Performance Monitoring
- Use Vercel Analytics to monitor application performance
- Check Core Web Vitals and loading times
- Monitor API response times

## Custom Domain Setup (Optional)

### Step 1: Add Domain
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS settings as instructed

### Step 2: SSL Certificate
Vercel automatically provides SSL certificates for all domains.

## Environment Variables

### Required Variables
- `NODE_ENV`: Automatically set to "production" by Vercel

### Optional Variables
Add these in Vercel Dashboard → Project Settings → Environment Variables:
- `PORT`: Not needed for Vercel (automatically handled)
- Custom API keys or configuration as needed by your application

## Troubleshooting

### Common Issues

#### Build Failures
1. Check build logs in Vercel Dashboard
2. Ensure all dependencies are in `package.json`
3. Verify Node.js version compatibility

#### Function Timeouts
- Default timeout is 10 seconds (Hobby plan)
- Configured to 30 seconds in `vercel.json`
- Upgrade to Pro plan for longer timeouts if needed

#### Static File Issues
1. Ensure files are in the `public/` directory
2. Check file paths are relative and correct
3. Verify `.vercelignore` isn't excluding needed files

#### API Route Problems
1. Verify routes follow Vercel serverless function format
2. Check API routes are defined correctly in Express app
3. Monitor function logs for errors

### Getting Help
1. Check Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
2. Vercel Community: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
3. Contact support through Vercel Dashboard

## Continuous Deployment

### Automatic Deployments
- Push to `main` branch triggers production deployment
- Push to other branches creates preview deployments
- Pull requests generate preview URLs for testing

### Branch Protection
Consider setting up branch protection rules:
1. Require pull request reviews
2. Require status checks to pass
3. Restrict pushes to main branch

## Performance Optimization

### CDN and Edge Network
Vercel automatically optimizes your application with:
- Global CDN for static assets
- Edge functions for dynamic content
- Automatic image optimization

### Best Practices
1. Minimize bundle size
2. Use proper caching headers
3. Optimize images and assets
4. Monitor Core Web Vitals

## Security Considerations

### HTTPS
- All Vercel deployments use HTTPS by default
- Automatic SSL certificate management

### Environment Variables
- Secure storage of sensitive data
- Environment-specific configurations
- Never commit secrets to repository

## Monitoring and Analytics

### Built-in Analytics
Enable Vercel Analytics:
1. Go to Project Settings → Analytics
2. Enable Web Analytics
3. Monitor Core Web Vitals and user metrics

### Custom Monitoring
Consider integrating:
- Error tracking (Sentry, Bugsnag)
- Performance monitoring (New Relic, DataDog)
- Uptime monitoring (UptimeRobot, Pingdom)

## Maintenance

### Regular Updates
1. Keep dependencies updated
2. Monitor security vulnerabilities
3. Review performance metrics
4. Update documentation as needed

### Backup Strategy
- Code is backed up in GitHub
- Environment variables should be documented
- Database backups if using external databases

## Cost Considerations

### Vercel Pricing
- **Hobby Plan**: Free for personal projects
  - 100GB bandwidth
  - 1000 serverless function invocations/day
  - No team features

- **Pro Plan**: $20/month per user
  - 1TB bandwidth
  - 1M serverless function invocations
  - Team collaboration features
  - Advanced analytics

### Optimization Tips
1. Monitor usage in Vercel Dashboard
2. Optimize function execution time
3. Use caching effectively
4. Consider serverless function alternatives for heavy operations

---

## Quick Reference Commands

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel list

# View function logs
vercel logs [deployment-url]

# Remove deployment
vercel remove [deployment-name]
```

## Support Resources

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Node.js on Vercel**: [vercel.com/docs/functions/serverless-functions/runtimes/node-js](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js)
- **Express.js Guide**: [vercel.com/guides/using-express-with-vercel](https://vercel.com/guides/using-express-with-vercel)
- **GitHub Integration**: [vercel.com/docs/concepts/git/vercel-for-github](https://vercel.com/docs/concepts/git/vercel-for-github)

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Compatibility**: Node.js 18+, Vercel CLI 32+