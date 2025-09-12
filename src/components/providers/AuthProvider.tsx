'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { User } from '@/types/types';
import { createClient, checkAuthStatus } from '@/lib/supabase/client';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  refreshAuth: () => Promise<void>; // Add refresh capability
  isAuthenticated: boolean; // Explicit authentication flag
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  refreshAuth: async () => {},
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<
    Omit<AuthContextType, 'refreshAuth'>
  >({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  });

  // Fetch user data using both the server-side API and direct Supabase check
  const fetchUser = async () => {
    if (typeof window === 'undefined') return; // Skip on server-side

    try {
      console.log('Auth: Fetching user session...');
      setAuthState((prev) => ({ ...prev, loading: true }));

      // 1. First check auth status directly with Supabase
      const authStatus = await checkAuthStatus();
      console.log('Auth: Direct Supabase auth check:', authStatus);

      if (!authStatus.isAuthenticated) {
        console.log('Auth: Not authenticated according to Supabase');

        // Try to refresh the token if we're not authenticated
        try {
          const { refreshSupabaseSession } = await import(
            '@/lib/supabase/client'
          );
          console.log('Auth: Attempting token refresh...');
          const refreshResult = await refreshSupabaseSession();

          if (refreshResult.success && refreshResult.session) {
            console.log(
              'Auth: Session refreshed successfully, rechecking auth'
            );
            // Check auth status again after refresh
            const refreshedStatus = await checkAuthStatus();

            if (!refreshedStatus.isAuthenticated) {
              console.log('Auth: Still not authenticated after token refresh');
              setAuthState({
                user: null,
                loading: false,
                error: null,
                isAuthenticated: false,
              });
              return;
            }

            console.log('Auth: Successfully authenticated after token refresh');
            // Continue to fetch user data from API
          } else {
            console.log(
              'Auth: Token refresh failed, logging out',
              refreshResult
            );
            setAuthState({
              user: null,
              loading: false,
              error: null,
              isAuthenticated: false,
            });
            return;
          }
        } catch (refreshError) {
          console.error('Auth: Error during token refresh:', refreshError);
          setAuthState({
            user: null,
            loading: false,
            error: null,
            isAuthenticated: false,
          });
          return;
        }
      }

      // 2. Then fetch complete user data from our API with retry logic
      let apiAttempts = 0;
      const maxApiAttempts = 2;
      let userData = null;

      while (apiAttempts < maxApiAttempts && !userData) {
        apiAttempts++;
        console.log(
          `Auth: Fetching user data from API (attempt ${apiAttempts}/${maxApiAttempts})`
        );

        try {
          // Add cache-busting timestamp parameter
          const timestamp = Date.now();
          const url = `/api/auth/session?_=${timestamp}`;

          const response = await fetch(url, {
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              Pragma: 'no-cache',
              Expires: '0',
            },
            cache: 'no-store',
          });

          if (!response.ok) {
            console.error(
              `Auth: API error ${response.status}: ${response.statusText}`
            );

            if (apiAttempts < maxApiAttempts) {
              // Wait before retrying
              await new Promise((resolve) => setTimeout(resolve, 1000));
              continue;
            }

            throw new Error(`Failed to fetch session: ${response.statusText}`);
          }

          const data = await response.json();

          if (data && data.user) {
            console.log('Auth: User session loaded successfully from API');
            userData = data.user;
            break;
          } else {
            console.log('Auth: No user data in API response');

            if (apiAttempts < maxApiAttempts) {
              // Try to refresh token before retrying
              const { refreshSupabaseSession } = await import(
                '@/lib/supabase/client'
              );
              await refreshSupabaseSession();
              // Wait before retrying
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }
        } catch (apiError) {
          console.error(`Auth: API error on attempt ${apiAttempts}:`, apiError);

          if (apiAttempts < maxApiAttempts) {
            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, 1000));
          } else {
            throw apiError; // Re-throw if all attempts failed
          }
        }
      }

      if (userData) {
        // Successfully got user data
        setAuthState({
          user: userData,
          loading: false,
          error: null,
          isAuthenticated: true,
        });
      } else {
        console.log('Auth: Failed to get user data after all attempts');
        // If we still don't have user data after all retries, force a token refresh and reset
        try {
          const supabase = createClient();
          await supabase.auth.refreshSession();
        } catch (e) {
          console.error(
            'Auth: Error refreshing session after API failures:',
            e
          );
        }

        setAuthState({
          user: null,
          loading: false,
          error: null,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('Auth: Unexpected error in fetchUser:', error);

      // Try to reset supabase client if there was an error
      try {
        const { resetSupabaseClient } = await import('@/lib/supabase/client');
        resetSupabaseClient();
      } catch (e) {
        console.error('Auth: Failed to reset Supabase client:', e);
      }

      setAuthState({
        user: null,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to load user session',
        isAuthenticated: false,
      });
    }
  };

  // Public function to refresh auth state
  const refreshAuth = async () => {
    setAuthState((prev) => ({ ...prev, loading: true }));
    await fetchUser();
  };

  // Initialize auth
  useEffect(() => {
    const initialize = async () => {
      // Initialize token manager to handle refreshes
      try {
        const { initializeTokenManager } = await import(
          '@/lib/supabase/tokenManager'
        );
        initializeTokenManager();
      } catch (e) {
        console.error('Failed to initialize token manager:', e);
      }

      await fetchUser();

      // Set up Supabase auth listener for real-time updates
      const supabase = createClient();
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(
        async (event: AuthChangeEvent, session: Session | null) => {
          console.log('Auth state change event:', event);

          if (event === 'SIGNED_IN') {
            console.log('User signed in, refreshing auth state');
            await fetchUser();
          } else if (event === 'SIGNED_OUT') {
            console.log('User signed out, clearing auth state');
            setAuthState({
              user: null,
              loading: false,
              error: null,
              isAuthenticated: false,
            });
          } else if (event === 'TOKEN_REFRESHED') {
            console.log('Token refreshed, updating auth state');
            await fetchUser();
          } else if (event === 'USER_UPDATED') {
            console.log('User data updated, refreshing auth state');
            await fetchUser();
          }
        }
      );

      // Clean up listener on unmount
      return () => {
        subscription.unsubscribe();
        // Stop token manager on unmount
        try {
          const { tokenManager } = require('@/lib/supabase/tokenManager');
          tokenManager.stop();
        } catch (e) {
          console.error('Failed to stop token manager:', e);
        }
      };
    };

    initialize();
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
