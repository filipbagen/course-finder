import { NextResponse } from 'next/server';
import { getOptionalUser } from '@/lib/auth';

/**
 * This endpoint is for testing conflict scenarios
 * It logs the request and returns a simple response
 */
export async function POST(request: Request) {
  try {
    // Get the authenticated user (if any)
    const user = await getOptionalUser();

    // Get the request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      body = null;
    }

    // Log the request for debugging
    console.log('TEST-CONFLICT endpoint called', {
      userId: user?.id || 'not-authenticated',
      requestBody: body,
      timestamp: new Date().toISOString(),
    });

    // Return a success response
    return NextResponse.json({
      message: 'Test conflict endpoint called successfully',
      authenticated: !!user,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in test-conflict endpoint:', error);

    // Return an error response
    return NextResponse.json(
      {
        error: 'Test conflict endpoint error',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
