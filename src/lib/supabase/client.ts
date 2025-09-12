import { createBrowserClient } from '@supabase/ssr';

// Create a singleton instance to reuse across the application
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Initializes or returns the Supabase client.
 * Uses a singleton pattern to avoid creating multiple clients.
 */
export function createClient() {
  if (!supabaseClient) {
    try {
      console.log('Creating new Supabase browser client');

      // Validate environment variables
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Missing Supabase environment variables');
        throw new Error('Supabase configuration is missing');
      }

      // Create the client directly - simpler is better
      supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
      console.error('Error creating Supabase client:', error);
      throw new Error('Failed to initialize Supabase client');
    }
  }

  return supabaseClient;
}

/**
 * Helper function for reliable auth state checking
 */
export async function checkAuthStatus() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error checking auth status:', error);
      throw error;
    }

    return data?.session
      ? {
          isAuthenticated: true,
          userId: data.session.user.id,
          email: data.session.user.email,
          expiresAt: data.session.expires_at,
        }
      : {
          isAuthenticated: false,
          userId: null,
          email: null,
          expiresAt: null,
        };
  } catch (error) {
    console.error('Error in checkAuthStatus:', error);
    return {
      isAuthenticated: false,
      userId: null,
      email: null,
      expiresAt: null,
    };
  }
}

/**
 * Helper to reset the Supabase client - useful when auth state is inconsistent
 */
export function resetSupabaseClient() {
  supabaseClient = null;
  console.log('Supabase client has been reset');
}

/**
 * Helper function to refresh the auth session
 */
export async function refreshSupabaseSession() {
  try {
    console.log('Refreshing Supabase session...');
    const supabase = createClient();
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      console.error('Error refreshing session:', error);
      return { success: false, error: error.message };
    }

    console.log('Session refreshed successfully');
    return {
      success: true,
      session: data.session,
      user: data.user,
    };
  } catch (error) {
    console.error('Unexpected error refreshing session:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Unknown error refreshing session',
    };
  }
}
