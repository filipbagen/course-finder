import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOptionalUser } from '@/lib/auth';

/**
 * GET /api/test-login
 * Test endpoint for checking login status
 * This is useful for verifying authentication functionality
 */
export async function GET(request: Request) {
  try {
    // Get the authenticated user if any
    const user = await getOptionalUser();

    return NextResponse.json(
      {
        authenticated: !!user,
        user: user
          ? {
              id: user.id,
              email: user.email,
            }
          : null,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error) {
    console.error('Error in test-login endpoint:', error);

    return NextResponse.json(
      {
        authenticated: false,
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
 * POST /api/test-login
 * Provides information about the login attempt without actually logging in
 * Useful for debugging authentication issues
 */
export async function POST(request: Request) {
  try {
    // Extract login credentials from request
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        {
          error: 'Email is required',
          success: false,
        },
        { status: 400 }
      );
    }

    // Mask the email for privacy in logs
    const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1***$3');

    // Log the login attempt for debugging
    console.log(`Login attempt with email: ${maskedEmail}`);

    // Return a successful response without actually logging in
    return NextResponse.json({
      message:
        'This is a test login endpoint that validates the request format',
      success: true,
      email: maskedEmail,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in test-login endpoint:', error);

    return NextResponse.json(
      {
        error: 'Invalid request format',
        success: false,
      },
      { status: 400 }
    );
  }
}
