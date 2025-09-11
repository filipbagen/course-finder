# Vercel Deployment Guide - Database Connection Fix

## 🚨 Critical: Environment Variables Setup

### Step 1: Go to Vercel Dashboard
1. Open your Vercel project
2. Go to **Settings** → **Environment Variables**

### Step 2: Add These Environment Variables

**IMPORTANT**: Make sure to set these for **Production**, **Preview**, and **Development** environments.

#### Required Environment Variables:

1. **DATABASE_URL**
   ```
   postgres://postgres.anjvfmqlxaxwtwmnxtvh:hibjij-qoggi2-gAczyd@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1
   ```

2. **DIRECT_URL**
   ```
   postgres://postgres.anjvfmqlxaxwtwmnxtvh:hibjij-qoggi2-gAczyd@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
   ```

3. **NEXT_PUBLIC_SUPABASE_URL**
   ```
   https://anjvfmqlxaxwtwmnxtvh.supabase.co
   ```

4. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuanZmbXFseGF4d3R3bW54dHZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI4MTc0ODIsImV4cCI6MjAyODM5MzQ4Mn0.iYHD7RqRvaHN7loJmun3-VDIgIHmFIqG7AUWrAeo_OY
   ```

5. **SUPABASE_SERVICE_ROLE_KEY**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuanZmbXFseGF4d3R3bW54dHZoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxMjgxNzQ4MiwiZXhwIjoyMDI4MzkzNDgyfQ.RKyQUsmNDFLa2KXlS6pT4PIu1TfK45GccjkfcaIOWVs
   ```

6. **PRODUCTION_URL**
   ```
   https://www.coursefinder.se
   ```

## 🔧 Alternative DATABASE_URL Formats

If the above doesn't work, try these alternatives:

### Option A: Without connection pooling
```
postgresql://postgres.anjvfmqlxaxwtwmnxtvh:hibjij-qoggi2-gAczyd@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

### Option B: With schema specification
```
postgresql://postgres.anjvfmqlxaxwtwmnxtvh:hibjij-qoggi2-gAczyd@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?schema=public
```

### Option C: Direct connection (if pooler fails)
```
postgres://postgres.anjvfmqlxaxwtwmnxtvh:hibjij-qoggi2-gAczyd@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

## 🚀 Deployment Steps

### Step 1: Commit Changes
```bash
git add .
git commit -m "Fix database connection for Vercel deployment"
git push origin main
```

### Step 2: Set Environment Variables in Vercel
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all the environment variables listed above
3. **Important**: Set them for Production, Preview, and Development environments
4. Click "Save" for each variable

### Step 3: Redeploy
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click "Redeploy" on the latest deployment
3. Or push a new commit to trigger automatic deployment

## 🔍 Troubleshooting

### Check Environment Variables
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify all variables are set correctly
3. Make sure they're set for the correct environments (Production/Preview/Development)

### Check Supabase Database
1. Go to your Supabase dashboard
2. Make sure your database is not paused
3. Check if there are any connection limits or issues

### Test Locally First
```bash
# Test if your local environment works
npm run dev
# Try accessing a course with reviews
```

### Check Vercel Logs
1. Go to Vercel Dashboard → Your Project → Functions
2. Check the logs for any API routes
3. Look for database connection errors

## 🐛 Common Issues

### Issue: "Can't reach database server"
**Solution**: Check that DATABASE_URL is set correctly in Vercel

### Issue: "Prisma client not found"
**Solution**: The build process now includes `prisma generate`

### Issue: "Connection timeout"
**Solution**: Try the alternative DATABASE_URL formats above

### Issue: "Environment variables not found"
**Solution**: Make sure to set them for all environments (Production/Preview/Development)

## 📞 Support

If you're still having issues:

1. Check the Vercel deployment logs for specific error messages
2. Verify your Supabase database is active and accessible
3. Try the alternative DATABASE_URL formats
4. Make sure all environment variables are properly set in Vercel

## ✅ Verification

After deployment, test these endpoints:
- `/api/courses/[courseId]/reviews` - Should return reviews without database errors
- `/api/courses/review` - Should allow posting reviews
- Any page that loads course data

The application should now work properly on Vercel with full database connectivity.
