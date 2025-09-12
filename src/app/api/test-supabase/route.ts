import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Force dynamic rendering to avoid static generation errors with cookies
export const dynamic = 'force-dynamic';

/**
 * GET /api/test-supabase
 * Test endpoint for checking Supabase connectivity
 * This is useful for verifying database connections in various environments
 */
export async function GET(request: Request) {
  try {
    // Create a Supabase client
    const supabase = await createClient();

    // Test the connection with a simple query
    const { data, error } = await supabase
      .from('courses')
      .select('count(*)')
      .limit(1);

    if (error) {
      throw new Error(`Supabase query error: ${error.message}`);
    }

    return NextResponse.json(
      {
        status: 'success',
        message: 'Supabase connection test successful',
        connectionTest: {
          success: true,
          data,
        },
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Error in test-supabase endpoint:', error);

    return NextResponse.json(
      {
        status: 'error',
        message: 'Supabase connection test failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  }
}

/**
 * POST /api/test-supabase
 * Test endpoint for specific Supabase operations
 * Can be used to test custom queries or operations
 */
export async function POST(request: Request) {
  try {
    // Get the operation to test from the request body
    const body = await request.json();
    const { operation, table } = body;

    if (!operation) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Missing operation parameter',
        },
        { status: 400 }
      );
    }

    // Create a Supabase client
    const supabase = await createClient();
    let result;

    // Perform the requested operation
    switch (operation) {
      case 'count':
        const tableToCount = table || 'courses';
        result = await supabase
          .from(tableToCount)
          .select('count(*)', { count: 'exact' });
        break;
      case 'health':
        // This is a simple health check
        result = { data: { healthy: true }, error: null };
        break;
      default:
        return NextResponse.json(
          {
            status: 'error',
            message: `Unsupported operation: ${operation}`,
          },
          { status: 400 }
        );
    }

    if (result.error) {
      throw new Error(`Supabase operation error: ${result.error.message}`);
    }

    return NextResponse.json({
      status: 'success',
      operation,
      result: result.data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in test-supabase POST endpoint:', error);

    return NextResponse.json(
      {
        status: 'error',
        message: 'Supabase operation failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
