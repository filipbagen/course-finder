import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: Record<string, unknown>) {
          response.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
          })
        },
      },
    },
  )

  // Refresh session if it exists
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    // If a session exists, the user is logged in
    response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    // Try to refresh the session if it's getting close to expiry
    const expiresAt = session.expires_at
    if (expiresAt) {
      const now = Math.floor(Date.now() / 1000)
      const timeUntilExpiry = expiresAt - now

      // If token expires in less than 15 minutes, refresh it
      if (timeUntilExpiry < 900) {
        await supabase.auth.refreshSession()
      }
    }
  }

  return response
}
