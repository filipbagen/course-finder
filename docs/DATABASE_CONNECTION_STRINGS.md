# Database Connection String Formats

This file provides multiple alternative connection string formats for connecting to the Supabase PostgreSQL database.
If you're experiencing connection issues, try one of these formats.

## Connection String Format A (Standard with Connection Pooling)

```
postgres://postgres.anjvfmqlxaxwtwmnxtvh:hibjij-qoggi2-gAczyd@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1
```

## Connection String Format B (Alternative PostgreSQL Protocol)

```
postgresql://postgres.anjvfmqlxaxwtwmnxtvh:hibjij-qoggi2-gAczyd@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

## Connection String Format C (With Schema Specification)

```
postgresql://postgres.anjvfmqlxaxwtwmnxtvh:hibjij-qoggi2-gAczyd@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?schema=public
```

## Connection String Format D (Direct Connection without Pooling)

```
postgres://postgres.anjvfmqlxaxwtwmnxtvh:hibjij-qoggi2-gAczyd@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

## Connection String Format E (With SSL Mode)

```
postgres://postgres.anjvfmqlxaxwtwmnxtvh:hibjij-qoggi2-gAczyd@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require
```

## Important Notes

1. Always use both `DATABASE_URL` and `DIRECT_URL` environment variables
2. After changing connection strings, redeploy your application
3. Check Vercel logs for any connection errors
4. Visit the debug endpoint at `/api/debug/connection` to test connectivity
