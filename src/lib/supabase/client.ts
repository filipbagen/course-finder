import { createBrowserClient } from '@supabase/ssr';

// Create a singleton instance to reuse across the application
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return supabaseClient;
}

// Helper function for reliable auth state checking with error handling
export async function checkAuthStatus() {
  try {
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
  } catch (error) {
    console.error('Unexpected error checking auth status:', error);
    return { isAuthenticated: false, userId: null, email: null };
  }
}
