import { NextResponse } from 'next/server';

// Force dynamic rendering since we're manipulating cookies
export const dynamic = 'force-dynamic';

/**
 * Test endpoint for cookies
 * Used for debugging authentication and session issues
 */
export async function GET(request: Request) {
  // Get all cookies from the request
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key) acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  // Create a response with some test cookies
  const response = NextResponse.json({
    message: 'Cookie test endpoint',
    existingCookies: cookies,
    timestamp: new Date().toISOString(),
  });

  // Set a test cookie that expires in 1 minute
  response.cookies.set('test-cookie', 'cookie-value', {
    maxAge: 60,
    path: '/',
  });

  return response;
}

/**
 * Test POST endpoint for cookies
 * Allows setting custom cookies for testing
 */
export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json();
    const { cookieName, cookieValue, maxAge = 60 } = body;

    if (!cookieName || !cookieValue) {
      return NextResponse.json(
        { error: 'Missing cookieName or cookieValue' },
        { status: 400 }
      );
    }

    // Create a response
    const response = NextResponse.json({
      message: 'Cookie set successfully',
      cookie: { name: cookieName, value: cookieValue, maxAge },
    });

    // Set the custom cookie
    response.cookies.set(cookieName, cookieValue, {
      maxAge: maxAge,
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
