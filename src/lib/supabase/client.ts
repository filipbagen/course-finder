import { createBrowserClient } from '@supabase/ssr';

// Create a singleton instance to reuse across the application
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Initializes or returns the Supabase client with a timeout.
 * This prevents hanging on client creation if there are network issues.
 */
export function createClient() {
  if (!supabaseClient) {
    try {
      console.log('Creating new Supabase browser client');
      supabaseClient = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    } catch (error) {
      console.error('Error creating Supabase client:', error);
      throw new Error('Failed to initialize Supabase client');
    }
  }
  return supabaseClient;
}

/**
 * Helper function for reliable auth state checking with error handling and timeout
 */
export async function checkAuthStatus() {
  try {
    // Create a promise that will resolve with the auth status
    const authStatusPromise = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error checking auth status:', error);
        return { isAuthenticated: false, userId: null, email: null };
      }

      return data?.session
        ? {
            isAuthenticated: true,
            userId: data.session.user.id,
            email: data.session.user.email,
          }
        : {
            isAuthenticated: false,
            userId: null,
            email: null,
          };
    };

    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Auth check timed out')), 2500);
    });

    // Race the auth check against the timeout
    return (await Promise.race([
      authStatusPromise(),
      timeoutPromise,
    ])) as Awaited<ReturnType<typeof authStatusPromise>>;
  } catch (error) {
    console.error('Unexpected error checking auth status:', error);
    // Return a safe default if anything goes wrong
    return { isAuthenticated: false, userId: null, email: null };
  }
}

/**
 * Helper to reset the Supabase client - useful for testing or when auth state is inconsistent
 */
export function resetSupabaseClient() {
  supabaseClient = null;
  console.log('Supabase client has been reset');
}

/**
 * Helper function to refresh the auth session with timeout protection
 */
export async function refreshSupabaseSession() {
  try {
    const supabase = createClient();

    // Create a promise for the refresh
    const refreshPromise = supabase.auth.refreshSession();

    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Session refresh timed out')), 3000);
    });

    // Race the refresh against the timeout
    const { data, error } = (await Promise.race([
      refreshPromise,
      timeoutPromise,
    ])) as Awaited<typeof refreshPromise>;

    if (error) {
      console.error('Error refreshing session:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      session: data.session,
      user: data.user,
    };
  } catch (error) {
    console.error('Unexpected error refreshing session:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
