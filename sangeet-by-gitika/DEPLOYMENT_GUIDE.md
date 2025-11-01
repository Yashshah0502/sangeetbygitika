# Deployment Guide - SanGeet by Gitika

## Pre-Deployment Checklist

### ✅ Codebase Cleanup (Completed)
- [x] Removed debug console.log statements
- [x] Kept console.error for production error tracking
- [x] Consistent "SanGeet by Gitika" branding throughout
- [x] SEO metadata properly configured
- [x] No test routes or dummy data (Analytics uses simulated data with clear notice)
- [x] Service role key only used server-side (API routes)

## Environment Variables Setup

### Required Environment Variables

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Your Supabase project URL
   - Safe to expose on frontend
   - Get from: Supabase Dashboard → Settings → API

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Supabase anonymous key
   - Safe to expose on frontend (RLS policies protect data)
   - Get from: Supabase Dashboard → Settings → API

3. **SUPABASE_SERVICE_ROLE_KEY**
   - ⚠️ **CRITICAL: NEVER expose on frontend**
   - Only used in API routes (server-side)
   - Get from: Supabase Dashboard → Settings → API → service_role key
   - Has full database access - keep secret!

4. **JWT_SECRET**
   - Secret key for admin authentication tokens
   - Generate: `openssl rand -hex 32`
   - Keep consistent across deployments

### Setting Up Environment Variables

#### For Vercel:
```bash
# Using Vercel CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add JWT_SECRET

# Or via Vercel Dashboard:
# Settings → Environment Variables → Add each variable
```

#### For Netlify:
```bash
# Via Netlify Dashboard:
# Site settings → Environment variables → Add variable
```

#### For other platforms:
Copy `.env.example` to `.env.production` and fill in values (DO NOT commit to git)

## Deployment Steps

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables** (via Vercel Dashboard)
   - Go to your project → Settings → Environment Variables
   - Add all 4 required variables
   - Redeploy after adding variables

### Option 2: Netlify

1. **Install Netlify CLI**
   ```bash
   npm i -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod
   ```

4. **Set Environment Variables** (via Netlify Dashboard)
   - Site settings → Environment variables
   - Add all 4 required variables

### Option 3: Self-Hosted

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set environment variables**
   ```bash
   # Create .env.production (DO NOT commit)
   cp .env.example .env.production
   # Edit .env.production with production values
   ```

3. **Start production server**
   ```bash
   npm start
   ```

## Post-Deployment Configuration

### 1. Update Supabase CORS Settings
```bash
# Update cors.json if needed for your domain
{
  "allowedOrigins": ["https://yourdomain.com"],
  "allowedHeaders": ["authorization", "content-type"]
}
```

### 2. Verify Admin Access
- Navigate to `yourdomain.com/admin/login`
- Login with admin credentials
- Test admin functionality

### 3. SEO Configuration
- Update Google Search Console verification code in [layout.tsx:79](src/app/layout.tsx#L79)
- Submit sitemap: `yourdomain.com/sitemap.xml`
- Test meta tags using: https://metatags.io

### 4. Analytics Setup (Optional)
The analytics dashboard currently shows simulated data. To implement real tracking:
1. Add a `views` column to the `products` table in Supabase
2. Implement view tracking in product pages
3. Update analytics queries to fetch real data

## Security Checklist

- [x] `.env.local` in `.gitignore`
- [x] `.env.production` in `.gitignore`
- [x] Service role key only in server-side code
- [x] Client-side code uses anon key only
- [x] Row Level Security (RLS) enabled on Supabase tables
- [ ] Enable HTTPS on production domain
- [ ] Set up CORS properly in Supabase
- [ ] Rotate JWT_SECRET periodically

## Domain Configuration

### Custom Domain Setup

1. **Vercel:**
   - Dashboard → Domains → Add domain
   - Follow DNS configuration instructions

2. **Update Environment:**
   - Update `metadataBase` in [layout.tsx:41](src/app/layout.tsx#L41)
   - Update sitemap URL in [sitemap.ts:5](src/app/sitemap.ts#L5)
   - Update StructuredData URLs in [StructuredData.tsx](src/app/components/StructuredData.tsx)

## Monitoring & Maintenance

### Error Tracking
- All API errors logged with `console.error` (preserved for production)
- Monitor Vercel/Netlify logs for issues

### Database Backups
- Supabase automatically backs up your database
- Consider exporting critical data periodically

### Performance Monitoring
- Use Vercel Analytics or Google Analytics
- Monitor Core Web Vitals

## Troubleshooting

### Build Fails
- Check all environment variables are set
- Run `npm run build` locally to test

### Admin Login Not Working
- Verify JWT_SECRET is set
- Check SUPABASE_SERVICE_ROLE_KEY is correct
- Ensure admin exists in database

### Images Not Loading
- Check Supabase Storage bucket permissions
- Verify CORS settings in Supabase

## Support

For issues or questions:
- Check Next.js docs: https://nextjs.org/docs
- Check Supabase docs: https://supabase.com/docs
- Review error logs in deployment platform

---

**Last Updated:** 2025-11-01
**Version:** 1.0.0
