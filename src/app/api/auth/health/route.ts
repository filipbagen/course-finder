import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

/**
 * Authentication health check endpoint
 * This route helps debug authentication issues
 */
export async function GET(request: NextRequest) {
  try {
    // Get supabase client for server-side auth check
    const supabase = await createClient();

    // Check session
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    // Get cookies for diagnostic purposes
    const allCookies = await cookies();
    const cookieCount = allCookies.getAll().length;
    const authCookies = allCookies
      .getAll()
      .filter(
        (c) =>
          c.name.includes('supabase') ||
          c.name.includes('auth') ||
          c.name.includes('session')
      );

    if (sessionError) {
      return NextResponse.json(
        {
          status: 'error',
          error: sessionError.message,
          cookies: {
            count: cookieCount,
            authCookies: authCookies.map((c) => ({ name: c.name })),
          },
        },
        { status: 500 }
      );
    }

    // Check for active session
    if (!sessionData.session) {
      return NextResponse.json({
        status: 'unauthenticated',
        message: 'No active session found',
        cookies: {
          count: cookieCount,
          authCookies: authCookies.map((c) => ({ name: c.name })),
        },
      });
    }

    // Get user data
    const { data: userData } = await supabase.auth.getUser();

    // Calculate token expiration info
    const expiresAt = sessionData.session.expires_at;
    const now = Math.floor(Date.now() / 1000);
    const expiresInSeconds = expiresAt ? expiresAt - now : null;

    // Return health status
    return NextResponse.json({
      status: 'authenticated',
      user: {
        id: userData.user?.id,
        email: userData.user?.email,
        emailConfirmed: userData.user?.email_confirmed_at ? true : false,
      },
      session: {
        expiresAt: sessionData.session.expires_at,
        expiresIn: expiresInSeconds,
        expiresInMinutes: expiresInSeconds
          ? Math.floor(expiresInSeconds / 60)
          : null,
        provider: sessionData.session.provider_token
          ? sessionData.session.provider_token
          : 'email',
      },
      cookies: {
        count: cookieCount,
        authCookies: authCookies.map((c) => ({ name: c.name })),
      },
    });
  } catch (error) {
    console.error('Auth health check error:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
