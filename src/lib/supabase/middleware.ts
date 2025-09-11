import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  // Create a simple response without touching the request
  const response = NextResponse.next();

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    // Handle auth callback for password reset
    if (
      request.nextUrl.pathname === '/' &&
      request.nextUrl.searchParams.has('code')
    ) {
      // Exchange the code for a session
      const code = request.nextUrl.searchParams.get('code');
      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);

        if (!exchangeError) {
          // Successfully exchanged code, redirect to update-password page
          const resetUrl = new URL('/auth/update-password', request.url);
          return NextResponse.redirect(resetUrl);
        }
      }
    }

    return response;
  } catch (e) {
    // If anything fails, just continue without breaking the app
    console.error('Error in middleware:', e);
    return response;
  }
}
