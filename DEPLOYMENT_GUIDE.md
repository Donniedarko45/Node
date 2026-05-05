# Nodebase Deployment Guide

## Quick Start

This guide will help you deploy Nodebase to production in under 30 minutes.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (we recommend [Neon](https://neon.tech) or [Supabase](https://supabase.com))
- Domain name (optional but recommended)
- Vercel/Railway/Render account (for hosting)

## Step 1: Database Setup

### Option A: Neon (Recommended)

1. Go to [neon.tech](https://neon.tech) and create an account
2. Create a new project
3. Copy the connection string (looks like: `postgresql://user:pass@host.neon.tech/dbname`)
4. Save it for the next step

### Option B: Supabase

1. Go to [supabase.com](https://supabase.com) and create a project
2. Go to Settings → Database
3. Copy the "Connection string" (URI format)
4. Save it for the next step

### Option C: Self-Hosted PostgreSQL

```bash
# Install PostgreSQL
sudo apt-get install postgresql

# Create database
sudo -u postgres createdb nodebase

# Create user
sudo -u postgres createuser nodebase_user -P

# Grant privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE nodebase TO nodebase_user;"
```

## Step 2: Environment Variables

Create a `.env` file in your project root:

```bash
# Required Variables
DATABASE_URL="postgresql://user:password@host:5432/database"
ENCRYPTION_KEY="generate-with-command-below"
BETTER_AUTH_SECRET="generate-with-command-below"
BETTER_AUTH_URL="https://your-domain.com"
NODE_ENV="production"

# Optional: OAuth Providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Optional: Polar (Payments)
POLAR_ACCESS_TOKEN=""
POLAR_ORGANIZATION_ID=""

# Optional: Sentry (Error Tracking)
SENTRY_DSN=""
```

### Generate Secure Keys

```bash
# Generate ENCRYPTION_KEY (32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate BETTER_AUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Database Migration

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Verify database
npx prisma studio
```

## Step 5: Build Application

```bash
# Build for production
npm run build

# Test the build locally
npm run start
```

Visit `http://localhost:3000` to verify everything works.

## Step 6: Deploy to Vercel (Recommended)

### Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Add environment variables from Step 2
5. Click "Deploy"

### Vercel Configuration

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

## Step 7: Deploy to Railway (Alternative)

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Add environment variables
5. Railway will auto-deploy

### Railway Configuration

Create `railway.json`:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## Step 8: Deploy to Render (Alternative)

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your repository
4. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Environment**: Node
5. Add environment variables
6. Click "Create Web Service"

## Step 9: Configure Domain (Optional)

### Vercel

1. Go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed

### Railway

1. Go to your project settings
2. Click "Settings" → "Domains"
3. Add custom domain
4. Update DNS with CNAME record

### Render

1. Go to your service settings
2. Click "Custom Domains"
3. Add your domain
4. Update DNS records

## Step 10: Post-Deployment Verification

### Health Checks

1. **Homepage**: Visit your domain
2. **Authentication**: Try signing up/logging in
3. **Workflows**: Create a test workflow
4. **Execution**: Run a simple workflow
5. **Credentials**: Add a test credential

### Monitoring

1. Check application logs
2. Monitor error rates
3. Verify database connections
4. Test API endpoints

## Common Issues & Solutions

### Issue: Database Connection Failed

**Solution**: 
- Verify DATABASE_URL is correct
- Check if database allows external connections
- Ensure SSL is enabled if required

```bash
# Test connection
npx prisma db pull
```

### Issue: Build Fails

**Solution**:
- Clear `.next` folder: `rm -rf .next`
- Clear node_modules: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run build`

### Issue: Authentication Not Working

**Solution**:
- Verify BETTER_AUTH_URL matches your domain
- Check BETTER_AUTH_SECRET is set
- Ensure cookies are enabled

### Issue: Workflow Execution Fails

**Solution**:
- Check ENCRYPTION_KEY is set correctly
- Verify credentials are properly encrypted
- Check execution logs in database

## Performance Optimization

### 1. Enable Caching

Add to `next.config.ts`:

```typescript
const nextConfig = {
  // ... existing config
  experimental: {
    optimizeCss: true,
  },
  compress: true,
};
```

### 2. Database Connection Pooling

Already configured in `src/lib/db.ts`:

```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});
```

### 3. Enable CDN

- Vercel: Automatic global CDN
- Railway: Enable CDN in settings
- Render: Use Cloudflare in front

## Security Hardening

### 1. Environment Variables

Never commit `.env` files:

```bash
# Add to .gitignore
.env
.env.local
.env.production
```

### 2. Rate Limiting

Consider adding rate limiting middleware:

```bash
npm install @upstash/ratelimit @upstash/redis
```

### 3. Security Headers

Add to `next.config.ts`:

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

## Monitoring Setup

### Sentry (Error Tracking)

1. Create account at [sentry.io](https://sentry.io)
2. Create new Next.js project
3. Add SENTRY_DSN to environment variables
4. Sentry is already configured in the project

### Vercel Analytics

1. Go to your Vercel project
2. Click "Analytics" tab
3. Enable Web Analytics
4. No code changes needed

## Backup Strategy

### Database Backups

**Neon**: Automatic backups included
**Supabase**: Automatic backups included
**Self-hosted**: Set up cron job

```bash
# Daily backup script
0 2 * * * pg_dump nodebase > /backups/nodebase_$(date +\%Y\%m\%d).sql
```

### Application Backups

- Use Git for code versioning
- Tag releases: `git tag v1.0.0`
- Keep environment variables backed up securely

## Scaling Considerations

### Horizontal Scaling

1. **Stateless Design**: ✅ Already implemented
2. **Database Pooling**: ✅ Already configured
3. **Load Balancer**: Handled by hosting platform

### Vertical Scaling

Upgrade your hosting plan as needed:
- **Vercel**: Pro plan for more resources
- **Railway**: Scale up instance size
- **Render**: Upgrade to higher tier

## Cost Estimation

### Minimal Setup (Hobby)
- **Hosting**: $0-20/month (Vercel Hobby/Railway Hobby)
- **Database**: $0-10/month (Neon Free/Supabase Free)
- **Total**: $0-30/month

### Production Setup
- **Hosting**: $20-100/month (Vercel Pro/Railway Pro)
- **Database**: $20-50/month (Neon Pro/Supabase Pro)
- **Monitoring**: $0-30/month (Sentry)
- **Total**: $40-180/month

### Enterprise Setup
- **Hosting**: $100-500/month
- **Database**: $100-300/month
- **Monitoring**: $50-200/month
- **Total**: $250-1000/month

## Maintenance

### Weekly Tasks
- [ ] Review error logs
- [ ] Check execution success rates
- [ ] Monitor database performance
- [ ] Review user feedback

### Monthly Tasks
- [ ] Update dependencies: `npm update`
- [ ] Review security advisories
- [ ] Backup verification
- [ ] Performance analysis

### Quarterly Tasks
- [ ] Major dependency updates
- [ ] Security audit
- [ ] Disaster recovery drill
- [ ] Capacity planning

## Support & Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Better Auth Docs](https://www.better-auth.com/docs)

### Community
- GitHub Issues
- Discord Server (if available)
- Stack Overflow

### Professional Support
- Email: support@nodebase.com (configure this)
- Priority Support: Available for Pro users

---

## Quick Reference

### Useful Commands

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm run start

# Database
npx prisma studio
npx prisma migrate deploy
npx prisma generate

# Deployment
vercel --prod
railway up
```

### Environment Variables Checklist

- [ ] DATABASE_URL
- [ ] ENCRYPTION_KEY
- [ ] BETTER_AUTH_SECRET
- [ ] BETTER_AUTH_URL
- [ ] NODE_ENV=production

### Post-Deployment Checklist

- [ ] Application accessible
- [ ] Authentication working
- [ ] Database connected
- [ ] Workflows executable
- [ ] Credentials encrypted
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] Domain configured (if applicable)

---

**Congratulations!** 🎉 Your Nodebase instance is now live in production!

For issues or questions, refer to the troubleshooting section or check the logs.
