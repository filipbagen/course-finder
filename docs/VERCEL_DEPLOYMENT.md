# Vercel Deployment Guide

## Environment Variables Setup

In your Vercel dashboard, go to your project settings and add these environment variables:

### Required Environment Variables:

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

## Troubleshooting Steps:

1. **Check Environment Variables**: Ensure all environment variables are set correctly in Vercel dashboard
2. **Database Connection**: Verify your Supabase database is accessible and not paused
3. **Prisma Client**: The build process now includes `prisma generate` to ensure the client is properly generated
4. **Connection Limits**: The DATABASE_URL includes connection limits suitable for serverless environments

## Alternative DATABASE_URL Format:

If the current format doesn't work, try this alternative:

```
postgresql://postgres.anjvfmqlxaxwtwmnxtvh:hibjij-qoggi2-gAczyd@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?schema=public
```

## Build Command:

The build command is now: `prisma generate && next build`

This ensures Prisma generates the client before building the Next.js application.
