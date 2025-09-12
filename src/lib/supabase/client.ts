import { createBrowserClient } from '@supabase/ssr';

// Create a singleton instance to reuse across the application
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Initializes or returns the Supabase client with a timeout.
 * This prevents hanging on client creation if there are network issues.
 * Includes retry logic for better reliability.
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

      // Create client with timeout
      const clientCreationPromise = new Promise<
        ReturnType<typeof createBrowserClient>
      >((resolve, reject) => {
        try {
          const client = createBrowserClient(supabaseUrl, supabaseAnonKey);
          resolve(client);
        } catch (e) {
          reject(e);
        }
      });

      // Use a timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error('Supabase client creation timed out')),
          3000
        );
      });

      // Race the client creation against the timeout
      supabaseClient = Promise.race([clientCreationPromise, timeoutPromise]);
    } catch (error) {
      console.error('Error creating Supabase client:', error);
      throw new Error('Failed to initialize Supabase client');
    }
  }

  // If client is a promise (from the race above), resolve it
  if (supabaseClient instanceof Promise) {
    try {
      // Replace the promise with the actual client
      supabaseClient
        .then((client) => {
          supabaseClient = client;
        })
        .catch((error) => {
          console.error('Error resolving Supabase client promise:', error);
          supabaseClient = null; // Reset so we try again next time
          throw error;
        });

      // Return a new instance while the promise is resolving
      return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    } catch (error) {
      console.error('Error in promise resolution fallback:', error);
      // Reset client and create a new one as last resort
      supabaseClient = null;
      return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    }
  }

  return supabaseClient;
}

/**
 * Helper function for reliable auth state checking with error handling and timeout
 * Includes retry logic for better resilience
 */
export async function checkAuthStatus() {
  const MAX_RETRIES = 2;
  let retryCount = 0;
  let lastError = null;

  while (retryCount < MAX_RETRIES) {
    try {
      // Create a promise that will resolve with the auth status
      const authStatusPromise = async () => {
        const supabase = createClient();
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error(
            `Error checking auth status (attempt ${retryCount + 1}):`,
            error
          );
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
      };

      // Create a timeout promise - increase timeout with each retry
      const timeoutMs = 2500 + retryCount * 1000;
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Auth check timed out')), timeoutMs);
      });

      // Race the auth check against the timeout
      const result = (await Promise.race([
        authStatusPromise(),
        timeoutPromise,
      ])) as Awaited<ReturnType<typeof authStatusPromise>>;

      // If we're authenticated, check if the token is close to expiring
      if (result.isAuthenticated && result.expiresAt) {
        const expiresAt = result.expiresAt;
        const now = Math.floor(Date.now() / 1000); // Current time in seconds
        const timeUntilExpiry = expiresAt - now;

        // If token expires in less than 5 minutes, try to refresh it proactively
        if (timeUntilExpiry < 300) {
          console.log(
            `Auth token expires in ${timeUntilExpiry}s, refreshing proactively`
          );
          try {
            const supabase = createClient();
            await supabase.auth.refreshSession();
            console.log('Proactive token refresh successful');
          } catch (refreshError) {
            console.warn('Proactive token refresh failed:', refreshError);
            // Continue anyway with the current token
          }
        }
      }

      return result;
    } catch (error) {
      console.error(`Auth check error (attempt ${retryCount + 1}):`, error);
      lastError = error;

      retryCount++;
      if (retryCount < MAX_RETRIES) {
        // Add exponential backoff with jitter
        const delay =
          500 * Math.pow(1.5, retryCount) * (0.9 + Math.random() * 0.2);
        console.log(`Retrying auth check in ${delay.toFixed(0)}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  // If we get here, all retries failed
  console.error(
    `All auth check attempts failed after ${MAX_RETRIES} tries:`,
    lastError
  );

  // Return a safe default if anything goes wrong
  return {
    isAuthenticated: false,
    userId: null,
    email: null,
    expiresAt: null,
  };
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
 * and multiple retry attempts
 */
export async function refreshSupabaseSession() {
  const MAX_RETRIES = 3;
  let retryCount = 0;
  let lastError = null;

  while (retryCount < MAX_RETRIES) {
    try {
      console.log(
        `Refreshing Supabase session (attempt ${
          retryCount + 1
        }/${MAX_RETRIES})...`
      );
      const supabase = createClient();

      // Create a promise for the refresh
      const refreshPromise = supabase.auth.refreshSession();

      // Create a timeout promise - increase timeout with each retry
      const timeoutMs = 3000 + retryCount * 1000;
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error('Session refresh timed out')),
          timeoutMs
        );
      });

      // Race the refresh against the timeout
      const { data, error } = (await Promise.race([
        refreshPromise,
        timeoutPromise,
      ])) as Awaited<typeof refreshPromise>;

      if (error) {
        console.error(
          `Error refreshing session (attempt ${retryCount + 1}):`,
          error
        );
        lastError = error;

        // For certain errors, we should retry
        if (
          error.message.includes('network') ||
          error.message.includes('timeout') ||
          error.message.includes('fetch') ||
          error.message.includes('CORS')
        ) {
          retryCount++;
          if (retryCount < MAX_RETRIES) {
            // Add exponential backoff with jitter
            const delay = Math.min(
              1000 * Math.pow(1.5, retryCount) * (0.9 + Math.random() * 0.2),
              5000
            );
            console.log(`Retrying session refresh in ${delay.toFixed(0)}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
        }

        return { success: false, error: error.message };
      }

      // Successfully refreshed the session
      console.log('Session refreshed successfully');
      return {
        success: true,
        session: data.session,
        user: data.user,
      };
    } catch (error) {
      console.error(
        `Unexpected error refreshing session (attempt ${retryCount + 1}):`,
        error
      );
      lastError = error;

      retryCount++;
      if (retryCount < MAX_RETRIES) {
        // Add exponential backoff with jitter
        const delay = Math.min(
          1000 * Math.pow(1.5, retryCount) * (0.9 + Math.random() * 0.2),
          5000
        );
        console.log(`Retrying session refresh in ${delay.toFixed(0)}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  // If we get here, all retries failed
  console.error(
    `All session refresh attempts failed after ${MAX_RETRIES} tries`
  );
  return {
    success: false,
    error:
      lastError instanceof Error
        ? lastError.message
        : 'Failed to refresh session after multiple attempts',
  };
}
