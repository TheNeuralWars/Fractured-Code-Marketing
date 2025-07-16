# Vercel Deployment Guide
## Neural Wars Marketing Automation - Complete Deployment Instructions

### Quick Start

1. **One-Click Deploy:**
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/TheNeuralWars/Fractured-Code-Marketing&env=NODE_ENV&envDescription=Required%20environment%20variables)

2. **Manual Setup:**
   - Fork this repository
   - Connect to Vercel
   - Deploy automatically

### Detailed Instructions

#### Repository Preparation

**1. Environment Variables**
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

Required variables:
- `NODE_ENV=production` (for Vercel deployment)

#### Vercel Account Setup

**1. Create Account**
- Visit [vercel.com](https://vercel.com)
- Sign up with GitHub/GitLab/Bitbucket
- Free tier includes:
  - 100 deployments/month
  - 100GB bandwidth
  - Serverless functions

**2. Install Vercel CLI (Optional)**
```bash
npm install -g vercel
vercel login
```

#### Project Deployment

**Method 1: Dashboard Import**

1. **Import Project:**
   - Dashboard → "New Project"
   - "Import Git Repository"
   - Select your fork
   - Click "Import"

2. **Configuration:**
   - **Framework:** Other
   - **Build Command:** `npm run vercel-build`
   - **Output Directory:** (leave empty)
   - **Install Command:** `npm install`
   - **Development Command:** `npm run dev`

3. **Environment Variables:**
   - Add `NODE_ENV=production`
   - Add any custom variables

4. **Deploy:**
   - Click "Deploy"
   - Wait for completion (~2 minutes)

**Method 2: CLI Deployment**

```bash
# In project directory
vercel

# Follow prompts:
# Link to existing project? N
# Project name: neural-wars-marketing
# Directory: ./
# Override settings? N

# Deploy
vercel --prod
```

#### Post-Deployment Verification

**1. Test Endpoints:**
```bash
# Health check
curl https://your-deployment-url.vercel.app/health

# Main application
curl https://your-deployment-url.vercel.app/

# API routes
curl https://your-deployment-url.vercel.app/api/dashboard
```

**2. Application Testing:**
- Visit deployment URL
- Test dashboard functionality
- Verify API responses
- Check static file loading

#### Custom Domain Setup

**1. Add Domain:**
- Project Settings → Domains
- Enter your domain
- Choose configuration type:
  - **Subdomain:** `app.yourdomain.com`
  - **Root domain:** `yourdomain.com`

**2. DNS Configuration:**
- **A Record:** Point to `76.76.19.19`
- **CNAME:** Point to `cname.vercel-dns.com`
- **Or use Vercel nameservers**

**3. SSL Certificate:**
- Automatically provisioned
- No configuration required
- Includes wildcard for subdomains

#### Environment Management

**Development Environment:**
```bash
# Local development
cp .env.example .env
npm install
npm run dev
```

**Staging Environment:**
```bash
# Preview deployments
git push origin feature-branch
# Automatically creates preview URL
```

**Production Environment:**
```bash
# Production deployment
git push origin main
# Automatically deploys to production
```

#### Advanced Configuration

**Performance Optimization:**

1. **Function Timeout:**
   ```json
   // vercel.json
   "functions": {
     "server/app.js": {
       "maxDuration": 30
     }
   }
   ```

2. **Caching Headers:**
   ```javascript
   // In Express routes
   app.get('/static/*', (req, res, next) => {
     res.setHeader('Cache-Control', 'public, max-age=3600');
     next();
   });
   ```

3. **Region Configuration:**
   ```json
   // vercel.json
   "regions": ["iad1", "sfo1"]
   ```

#### Monitoring & Debugging

**1. Function Logs:**
- Vercel Dashboard → Functions
- Real-time log streaming
- Error tracking and alerts

**2. Analytics:**
- Enable Vercel Analytics
- Track performance metrics
- Monitor user behavior

**3. Error Monitoring:**
```javascript
// Add to app.js
app.use((err, req, res, next) => {
  console.error('[VERCEL ERROR]:', err);
  // Log to external service if needed
  res.status(500).json({ error: 'Internal Server Error' });
});
```

#### Troubleshooting

**Common Issues:**

1. **Build Failures:**
   ```bash
   # Check Node version
   node --version  # Should be 18+
   
   # Verify dependencies
   npm audit
   npm install
   ```

2. **Function Timeout:**
   - Optimize slow operations
   - Implement async processing
   - Consider background jobs

3. **Static Files 404:**
   - Verify `public/` directory structure
   - Check Express static configuration
   - Test locally first

4. **Environment Variables:**
   - Set in Vercel dashboard
   - Redeploy after changes
   - Check spelling and values

**Getting Help:**

1. **Documentation:** [vercel.com/docs](https://vercel.com/docs)
2. **Community:** [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
3. **Support:** Available for Pro/Enterprise plans

#### Security Checklist

- [ ] Environment variables configured securely
- [ ] No secrets in source code
- [ ] HTTPS enforced (automatic)
- [ ] CORS properly configured
- [ ] Input validation implemented
- [ ] Dependencies updated regularly

#### Maintenance

**Regular Tasks:**

1. **Dependency Updates:**
   ```bash
   npm audit
   npm update
   ```

2. **Performance Monitoring:**
   - Review function execution times
   - Monitor error rates
   - Check bandwidth usage

3. **Security Updates:**
   - Enable Dependabot alerts
   - Review security advisories
   - Update Node.js version

#### Cost Management

**Free Tier Limits:**
- 100 deployments/month
- 100GB bandwidth
- 100 function executions/day

**Optimization Tips:**
- Implement caching
- Optimize function duration
- Use static files efficiently
- Monitor usage dashboard

---

### Success Criteria

✅ **Deployment Complete When:**
- Application loads at Vercel URL
- All API endpoints respond correctly
- Static files serve properly
- Health check returns 200 OK
- Environment variables work correctly

✅ **Production Ready When:**
- Custom domain configured (if applicable)
- SSL certificate active
- Monitoring and alerts configured
- Documentation updated
- Team access configured