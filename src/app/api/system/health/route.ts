import { NextResponse } from 'next/server';
import { withPrisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

/**
 * Health check endpoint to verify system components
 * This can be used to diagnose issues with the database or auth
 */
export async function GET() {
  const startTime = Date.now();
  const results: Record<string, any> = {
    status: 'checking',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    components: {},
  };

  try {
    // Check database connection
    results.components.database = await checkDatabase();

    // Check Supabase connection
    results.components.supabase = await checkSupabase();

    // Calculate response time
    const responseTime = Date.now() - startTime;
    results.responseTime = `${responseTime}ms`;

    // Overall status
    results.status = Object.values(results.components).every(
      (component: any) => component.status === 'ok'
    )
      ? 'healthy'
      : 'degraded';

    return NextResponse.json(results, {
      status: results.status === 'healthy' ? 200 : 207,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        error: error instanceof Error ? error.message : String(error),
        responseTime: `${responseTime}ms`,
        components: results.components,
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  }
}

/**
 * Check database connection health
 */
async function checkDatabase() {
  const dbStartTime = Date.now();

  try {
    // Run a simple query to verify database connection
    const result = await withPrisma(
      async (prisma) => {
        // Try to run a simple query to check connection
        await prisma.$queryRaw`SELECT 1 AS health_check`;
        return { connected: true };
      },
      { maxRetries: 0 }
    ); // No retries for health check

    const responseTime = Date.now() - dbStartTime;

    return {
      status: 'ok',
      responseTime: `${responseTime}ms`,
      connected: result.connected,
    };
  } catch (error) {
    const responseTime = Date.now() - dbStartTime;

    return {
      status: 'error',
      responseTime: `${responseTime}ms`,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Check Supabase connection health
 */
async function checkSupabase() {
  const authStartTime = Date.now();

  try {
    // Check if we can connect to Supabase
    const supabase = await createClient();

    // Run a simple health check query
    const { data, error } = await supabase
      .from('health_check')
      .select('*')
      .limit(1)
      .maybeSingle();

    const responseTime = Date.now() - authStartTime;

    if (error && error.code !== 'PGRST116') {
      // PGRST116 just means the table doesn't exist, which is fine for this test
      return {
        status: 'error',
        responseTime: `${responseTime}ms`,
        error: error.message,
      };
    }

    return {
      status: 'ok',
      responseTime: `${responseTime}ms`,
      connectionEstablished: true,
    };
  } catch (error) {
    const responseTime = Date.now() - authStartTime;

    return {
      status: 'error',
      responseTime: `${responseTime}ms`,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
