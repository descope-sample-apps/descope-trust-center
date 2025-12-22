# Migration Changes & Deployment Guide

## Overview

This document outlines the migration changes from the original Bun-based Descope Trust Center to the current Next.js 16 implementation and provides comprehensive deployment guidance.

## Migration Summary

### Technology Stack Changes

| Component | Previous Stack | Current Stack | Migration Status |
|-----------|----------------|---------------|------------------|
| **Runtime** | Bun v1.3.5+ | Node.js (via Next.js) | ✅ Complete |
| **Framework** | Custom React setup | Next.js 16 with App Router | ✅ Complete |
| **Build Tool** | Bun build | Next.js build system | ✅ Complete |
| **Routing** | React Router DOM v7.11.0 | Next.js App Router | ✅ Complete |
| **Styling** | Tailwind CSS v4 | Tailwind CSS v4 | ✅ Complete |
| **Package Manager** | Bun | Bun (maintained) | ✅ Complete |

### Architecture Improvements

#### 1. Next.js App Router Migration
- **Previous**: Custom React routing with React Router DOM
- **Current**: Next.js 16 App Router with file-based routing
- **Benefits**: 
  - Built-in SEO optimizations
  - Automatic code splitting
  - Server-side rendering capabilities
  - Improved performance

#### 2. Component Structure Refactoring
- **Previous**: Large monolithic components (340+ line home-page.tsx)
- **Current**: Modular component architecture with focused components
- **Improvements**:
  - Separated UI components in `/app/components/ui/`
  - Extracted business logic to dedicated components
  - Improved maintainability and reusability

#### 3. API Integration
- **Previous**: Static data within components
- **Current**: Next.js API routes in `/app/api/`
- **New Endpoints**:
  - `/api/contact` - Contact form handling
  - `/api/documents` - Document management
  - `/api/security` - Security information
  - `/api/hello` - Health check endpoint

#### 4. SEO & Performance Optimizations
- **Previous**: Basic meta tags
- **Current**: Comprehensive SEO implementation
- **Enhancements**:
  - Dynamic metadata generation
  - Open Graph and Twitter cards
  - Structured data for search engines
  - Image optimization with Next.js Image component
  - Security headers implementation

### File Structure Changes

#### Before Migration
```
src/
├── components/
│   ├── ui/
│   ├── contact-form.tsx
│   ├── document-library.tsx
│   ├── layout.tsx
│   ├── security-overview.tsx
│   ├── subprocessors-table.tsx
│   └── home-page.tsx (340+ lines)
├── lib/
│   └── utils.ts
├── pages/
│   └── home-page.tsx
└── router/
    └── index.tsx
```

#### After Migration
```
app/
├── api/
│   ├── contact/
│   ├── documents/
│   ├── hello/
│   └── security/
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── compliance-grid.tsx
│   │   ├── faq-section.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   └── textarea.tsx
│   ├── api-tester.tsx
│   ├── contact-form.tsx
│   ├── document-library.tsx
│   ├── security-overview.tsx
│   └── subprocessors-table.tsx
├── lib/
│   └── utils.ts
├── types/
│   └── global.d.ts
├── globals.css
├── layout.tsx
├── page.tsx
├── robots.ts
└── sitemap.ts
```

## Configuration Changes

### Next.js Configuration
The `next.config.js` file includes:

- **Security Headers**: CSP, XSS protection, frame options
- **Image Optimization**: WebP and AVIF format support
- **Performance**: Package optimization and compression
- **SEO**: Powered-by header removal and trailing slash configuration

### Environment Variables
- **Previous**: `BUN_PUBLIC_*` variables
- **Current**: `NEXT_PUBLIC_*` variables (Next.js standard)
- **Migration**: All environment variables automatically mapped

### Build Scripts
Updated `package.json` scripts:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build", 
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "build:analyze": "ANALYZE=true next build",
    "build:production": "next build && next export"
  }
}
```

## Deployment Guide

### Prerequisites

1. **Node.js Environment**: Node.js 18+ (Next.js requirement)
2. **Package Manager**: Bun (recommended) or npm/yarn
3. **Environment Variables**: Configure all required variables
4. **Domain**: Custom domain (optional)

### Environment Setup

#### 1. Install Dependencies
```bash
# Using Bun (recommended)
bun install

# Or using npm
npm install
```

#### 2. Environment Variables
Create `.env.local` file:
```bash
# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://api.your-domain.com

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Security Headers (optional)
NEXT_PUBLIC_SECURITY_POLICY=your-security-policy
```

#### 3. Build Application
```bash
# Development build
bun run build

# Production build with analysis
bun run build:production
```

### Deployment Options

#### Option 1: Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   bun install -g vercel
   
   # Deploy
   vercel --prod
   ```

2. **Automatic Deployment**
   - Connect GitHub repository to Vercel
   - Configure environment variables in Vercel dashboard
   - Automatic deployments on push to main branch

3. **Vercel Configuration**
   ```json
   // vercel.json
   {
     "buildCommand": "bun run build",
     "outputDirectory": ".next",
     "installCommand": "bun install",
     "framework": "nextjs"
   }
   ```

#### Option 2: Docker Deployment

1. **Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS base
   
   # Install dependencies only when needed
   FROM base AS deps
   WORKDIR /app
   
   # Install Bun
   RUN curl -fsSL https://bun.sh/install | bash
   ENV PATH="/root/.bun/bin:${PATH}"
   
   # Install dependencies
   COPY package.json bun.lock* ./
   RUN bun install --frozen-lockfile
   
   # Rebuild the source code only when needed
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   
   # Install Bun and build
   RUN curl -fsSL https://bun.sh/install | bash
   ENV PATH="/root/.bun/bin:${PATH}"
   RUN bun run build
   
   # Production image, copy all the files and run next
   FROM base AS runner
   WORKDIR /app
   
   ENV NODE_ENV production
   
   COPY --from=builder /app/public ./public
   COPY --from=builder /app/.next/standalone ./
   COPY --from=builder /app/.next/static ./.next/static
   
   EXPOSE 3000
   
   ENV PORT 3000
   CMD ["node", "server.js"]
   ```

2. **Docker Compose**
   ```yaml
   version: '3.8'
   
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
         - NEXT_PUBLIC_APP_URL=https://your-domain.com
       restart: unless-stopped
   ```

3. **Deploy with Docker**
   ```bash
   # Build and run
   docker-compose up -d
   
   # View logs
   docker-compose logs -f
   ```

#### Option 3: Traditional VPS/Server

1. **Server Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 for process management
   sudo npm install -g pm2
   
   # Install Nginx for reverse proxy
   sudo apt install nginx -y
   ```

2. **Application Deployment**
   ```bash
   # Clone repository
   git clone https://github.com/your-org/descope-trust-center.git
   cd descope-trust-center
   
   # Install dependencies
   bun install
   
   # Build application
   bun run build
   
   # Start with PM2
   pm2 start npm --name "trust-center" -- start
   pm2 startup
   pm2 save
   ```

3. **Nginx Configuration**
   ```nginx
   # /etc/nginx/sites-available/trust-center
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
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
   
   # Enable site
   sudo ln -s /etc/nginx/sites-available/trust-center /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### CI/CD Pipeline

#### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
          
      - name: Install dependencies
        run: bun install
        
      - name: Run tests
        run: bun test
        
      - name: Build application
        run: bun run build
        
      - name: Deploy to Vercel
        if: github.ref == 'refs/heads/main'
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### Monitoring & Maintenance

#### 1. Health Checks
```bash
# Application health endpoint
curl https://your-domain.com/api/hello

# Expected response
{"message": "Hello from Descope Trust Center API"}
```

#### 2. Performance Monitoring
- **Core Web Vitals**: Monitor LCP, FID, CLS
- **Uptime Monitoring**: Use services like UptimeRobot
- **Error Tracking**: Implement Sentry or similar

#### 3. Security Monitoring
- **Dependency Updates**: Regular security updates
- **SSL Certificate**: Automatic renewal
- **Security Headers**: Verify implementation

### Rollback Procedures

#### 1. Vercel Rollback
```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel promote [deployment-url]
```

#### 2. Git Rollback
```bash
# Reset to previous commit
git reset --hard [commit-hash]
git push --force-with-lease
```

#### 3. Database Rollback (if applicable)
```bash
# Restore from backup
# Implementation depends on your database
```

## Migration Validation

### Pre-Deployment Checklist
- [ ] All environment variables configured
- [ ] Build process completes successfully
- [ ] All API endpoints functional
- [ ] SEO metadata properly configured
- [ ] Security headers implemented
- [ ] Performance optimizations active
- [ ] Error handling tested
- [ ] Mobile responsiveness verified

### Post-Deployment Verification
- [ ] Homepage loads correctly
- [ ] All navigation links work
- [ ] Contact form submissions work
- [ ] Document downloads functional
- [ ] FAQ section displays properly
- [ ] Security headers present
- [ ] SSL certificate active
- [ ] Core Web Vitals within acceptable ranges

## Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Clear cache
rm -rf .next
bun run build

# Check Node.js version
node --version  # Should be 18+
```

#### 2. Environment Variable Issues
```bash
# Verify variables are set
echo $NEXT_PUBLIC_APP_URL

# Check Next.js build logs for missing variables
```

#### 3. API Route Issues
```bash
# Test API endpoints locally
curl http://localhost:3000/api/hello

# Check server logs for errors
```

#### 4. Performance Issues
```bash
# Analyze bundle size
bun run build:analyze

# Check Core Web Vitals
# Use PageSpeed Insights or Lighthouse
```

## Support & Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Bun Documentation](https://bun.sh/docs)

### Monitoring Tools
- [Vercel Analytics](https://vercel.com/analytics)
- [Google Search Console](https://search.google.com/search-console)
- [GTmetrix](https://gtmetrix.com)

### Security Resources
- [OWASP Security Checklist](https://owasp.org/)
- [SSL Labs Test](https://www.ssllabs.com/ssltest/)

---

**Migration Completed**: December 2024  
**Last Updated**: December 22, 2024  
**Version**: 1.0.0

For questions or support, contact the development team or create an issue in the repository.