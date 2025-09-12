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

    // Add timeout handling for session check
    const sessionPromise = supabase.auth.getSession();
    const sessionTimeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Session check timed out')), 5000);
    });

    // Race against timeout
    const { data: sessionData, error: sessionError } = (await Promise.race([
      sessionPromise,
      sessionTimeoutPromise.then(() => {
        throw new Error('Server-side session check timed out');
      }),
    ])) as Awaited<typeof sessionPromise>;

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

    // Add cookie details without exposing values
    const authCookieDetails = authCookies.map((c) => ({
      name: c.name,
      exists: true,
      hasValue: !!c.value,
      valueLength: c.value ? c.value.length : 0,
    }));

    if (sessionError) {
      return NextResponse.json(
        {
          status: 'error',
          error: sessionError.message,
          cookies: {
            count: cookieCount,
            authCookies: authCookieDetails,
          },
          timestamp: new Date().toISOString(),
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
          authCookies: authCookieDetails,
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Get user data with timeout
    const userPromise = supabase.auth.getUser();
    const userTimeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('User check timed out')), 5000);
    });

    // Race against timeout
    const { data: userData } = (await Promise.race([
      userPromise,
      userTimeoutPromise.then(() => {
        console.warn(
          'User data check timed out, proceeding with session data only'
        );
        return { data: { user: sessionData.session?.user } };
      }),
    ])) as Awaited<typeof userPromise>;

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
        authCookies: authCookieDetails,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Auth health check error:', error);

    // Try to get cookies even if the main operation failed
    let cookieInfo = null;
    try {
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

      cookieInfo = {
        count: cookieCount,
        authCookies: authCookies.map((c) => ({
          name: c.name,
          exists: true,
          hasValue: !!c.value,
          valueLength: c.value ? c.value.length : 0,
        })),
      };
    } catch (cookieError) {
      cookieInfo = { error: 'Failed to retrieve cookies' };
    }

    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        cookies: cookieInfo,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
