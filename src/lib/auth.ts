import { createClient } from '@/lib/supabase/server'
import { createError } from '@/lib/errors'

/**
 * Authentication utilities for API routes
 */

export interface AuthenticatedUser {
  id: string
  email: string
}

/**
 * Get authenticated user from Supabase
 * Throws error if user is not authenticated
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw createError.unauthorized('Authentication failed')
  }

  if (!user) {
    throw createError.unauthorized('Authentication required')
  }

  return {
    id: user.id,
    email: user.email || '',
  }
}

/**
 * Get optional user (doesn't throw if not authenticated)
 */
export async function getOptionalUser(): Promise<AuthenticatedUser | null> {
  try {
    return await getAuthenticatedUser()
  } catch {
    return null
  }
}
