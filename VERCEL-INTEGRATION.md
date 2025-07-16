# Vercel Integration Guide for Neural Wars Marketing App

## Quick Setup Steps

### 1. Fork & Deploy
1. Fork this repository to your GitHub account
2. Visit [vercel.com](https://vercel.com) and sign up/login
3. Click "New Project" and import your forked repository
4. Deploy with default settings

### 2. Configuration
Vercel will automatically detect:
- **Framework**: Node.js (Express)
- **Build Command**: `npm run build` (optional)
- **Output Directory**: `public` (for static assets)
- **Install Command**: `npm install`

### 3. Environment Variables (Optional)
In Vercel Dashboard → Project Settings → Environment Variables:
```
NODE_ENV=production
```

### 4. Custom Domain (Optional)
- Go to Project Settings → Domains
- Add your custom domain
- Update DNS settings as instructed

## File Structure for Vercel

```
project/
├── vercel.json           # Vercel configuration
├── .vercelignore        # Build optimization
├── server/app.js        # Main serverless function
├── public/              # Static assets (auto-served)
└── api/                 # Additional API routes (optional)
```

## Vercel Features Used

### Serverless Functions
- Express app automatically converted to serverless functions
- 30-second timeout configured in `vercel.json`
- Automatic scaling based on traffic

### Static Asset Serving
- All files in `public/` served via CDN
- Automatic compression and optimization
- Global edge network distribution

### Automatic Deployments
- Push to `main` branch → Production deployment
- Push to other branches → Preview deployments
- Pull requests → Preview URLs for testing

### Built-in Features
- Automatic HTTPS/SSL certificates
- Custom domain support
- Real-time deployment logs
- Performance analytics
- Edge caching

## Performance Optimizations

### Cold Start Reduction
- Express app optimized for fast initialization
- Minimal dependencies in serverless functions
- Static assets served from CDN (no function calls)

### Caching Strategy
- Static assets: Long-term caching
- API responses: No caching (real-time data)
- HTML files: Short-term caching

### Bundle Size
- Only production dependencies included
- Development files excluded via `.vercelignore`
- Optimal function packaging

## Monitoring & Analytics

### Built-in Monitoring
- Function execution times
- Error rates and logs
- Bandwidth usage
- Request counts

### Custom Analytics
Access via Vercel Dashboard:
- Core Web Vitals
- Page load times
- Geographic distribution
- Traffic sources

## Troubleshooting

### Common Issues

#### Build Failures
- Check Node.js version compatibility (18+)
- Verify all dependencies in `package.json`
- Review build logs in Vercel Dashboard

#### Function Timeouts
- Default: 10 seconds (Hobby), 30 seconds (configured)
- Optimize API response times
- Consider Pro plan for longer timeouts

#### Static File Issues
- Ensure files are in `public/` directory
- Check file paths in HTML/CSS
- Verify `.vercelignore` settings

### Support Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Node.js Runtime Guide](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js)
- [Express.js on Vercel](https://vercel.com/guides/using-express-with-vercel)

## Security Considerations

### Automatic Security
- HTTPS everywhere (automatic SSL)
- DDoS protection at edge
- Security headers via Helmet.js

### Environment Variables
- Secure storage in Vercel Dashboard
- Never commit secrets to repository
- Environment-specific configurations

### CORS Configuration
- Configured for cross-origin requests
- Proper security headers applied
- Content Security Policy enabled

## Cost Optimization

### Hobby Plan (Free)
- 100GB bandwidth/month
- 100 function executions/day
- Unlimited static requests

### Pro Plan ($20/month)
- 1TB bandwidth/month
- 1M function executions/month
- Team collaboration features
- Advanced analytics

### Optimization Tips
- Use static assets for non-dynamic content
- Implement caching where appropriate
- Monitor usage in dashboard
- Optimize function execution time

---

This integration provides a production-ready deployment platform with minimal configuration required.