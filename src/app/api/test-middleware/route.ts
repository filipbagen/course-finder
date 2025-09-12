import { NextResponse } from 'next/server';

/**
 * GET /api/test-middleware
 * Test endpoint for checking middleware functionality
 * This endpoint returns information about the current request and headers
 * that have been modified by middleware
 */
export async function GET(request: Request) {
  try {
    // Get all headers to examine middleware modifications
    const requestHeaders = request.headers;

    // Extract specific headers that might be set by middleware
    const customHeaders = {
      'x-middleware-processed':
        requestHeaders.get('x-middleware-processed') || 'not-set',
      'x-auth-status': requestHeaders.get('x-auth-status') || 'not-set',
      'x-auth-user-id': requestHeaders.get('x-auth-user-id') || 'not-set',
    };

    // Get URL information
    const url = new URL(request.url);

    return NextResponse.json(
      {
        message: 'Middleware test endpoint',
        url: {
          full: request.url,
          pathname: url.pathname,
          search: url.search,
        },
        middleware: {
          detected: !!requestHeaders.get('x-middleware-processed'),
          customHeaders,
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
    console.error('Error in test-middleware endpoint:', error);

    return NextResponse.json(
      {
        status: 'error',
        message: 'Middleware test failed',
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
