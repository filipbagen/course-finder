import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

// Force dynamic rendering to avoid static generation
export const dynamic = 'force-dynamic';

/**
 * Health check endpoint for database and authentication connections
 * Use this endpoint to diagnose connectivity issues in production
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    services: {},
  };

  try {
    // Database health check
    try {
      const dbStartTime = Date.now();
      // Simple query to check database connectivity
      await prisma.$queryRaw`SELECT 1 as alive`;
      const dbEndTime = Date.now();

      results.services.database = {
        status: 'healthy',
        responseTime: `${dbEndTime - dbStartTime}ms`,
      };
    } catch (error) {
      results.services.database = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : String(error),
      };
    }

    // Supabase health check
    try {
      const supabaseStartTime = Date.now();
      const supabase = await createClient();
      const { data, error } = await supabase.auth.getSession();
      const supabaseEndTime = Date.now();

      results.services.supabase = {
        status: error ? 'unhealthy' : 'healthy',
        responseTime: `${supabaseEndTime - supabaseStartTime}ms`,
        error: error ? error.message : null,
        hasSession: !!data?.session,
      };
    } catch (error) {
      results.services.supabase = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : String(error),
      };
    }

    // Add environment variables check (without exposing sensitive data)
    results.services.config = {
      status: 'info',
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasDirectUrl: !!process.env.DIRECT_URL,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      isVercel: !!process.env.VERCEL,
    };

    const endTime = Date.now();
    results.totalResponseTime = `${endTime - startTime}ms`;

    return NextResponse.json(results, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        error: error instanceof Error ? error.message : String(error),
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  }
}
