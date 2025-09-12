'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  createClient,
  checkAuthStatus,
  resetSupabaseClient,
  refreshSupabaseSession,
} from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { Session } from '@supabase/supabase-js';

/**
 * A hook for managing authentication state
 * Provides reliable auth state and methods for auth operations
 */
export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Function to check auth status
  const checkAuth = useCallback(
    async (showToast = false, maxAttempts = 2) => {
      try {
        setIsLoading(true);
        setError(null);

        if (showToast) {
          toast.loading('Checking authentication status...');
        }

        // Multiple attempts with exponential backoff
        let authStatus = null;
        let attempt = 0;
        let lastError = null;

        while (attempt < maxAttempts) {
          attempt++;
          try {
            console.log(`Auth check attempt ${attempt}/${maxAttempts}...`);
            authStatus = await checkAuthStatus();
            console.log('Auth: Direct Supabase auth check:', authStatus);
            break; // Success, exit the retry loop
          } catch (err) {
            lastError = err;
            console.error(`Auth check error (attempt ${attempt}):`, err);

            if (attempt < maxAttempts) {
              // Exponential backoff with jitter
              const delay = Math.min(
                500 * Math.pow(1.5, attempt) + Math.random() * 300,
                3000
              );
              console.log(`Retrying auth check in ${delay}ms...`);
              await new Promise((resolve) => setTimeout(resolve, delay));
            }
          }
        }

        // If all attempts failed, throw the last error
        if (!authStatus) {
          console.error(
            `All auth check attempts failed after ${maxAttempts} tries`
          );
          throw (
            lastError || new Error('Auth check failed after multiple attempts')
          );
        }

        if (authStatus.isAuthenticated && authStatus.userId) {
          // Fetch user profile from API with timeout
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch('/api/auth/session', {
              signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
              throw new Error(
                `Failed to fetch user profile: ${response.status}`
              );
            }

            const data = await response.json();

            if (data.user) {
              console.log('Auth: User session loaded successfully');
              setUser(data.user);
              setIsAuthenticated(true);

              if (showToast) {
                toast.success('Authenticated successfully');
              }
            } else {
              console.warn('Auth: User session API returned no user');
              // Fallback to using basic Supabase data
              setUser({
                id: authStatus.userId,
                email: authStatus.email,
                // Add default values for required fields
                name: 'User',
                role: 'user',
              });
              setIsAuthenticated(true);

              // Try to refresh session in background
              refreshSupabaseSession().catch((e) =>
                console.error('Background session refresh failed:', e)
              );
            }
          } catch (profileError) {
            console.error('Auth: Error fetching user profile:', profileError);
            // Fallback to basic user info from Supabase
            setUser({
              id: authStatus.userId,
              email: authStatus.email,
              // Add default values for required fields
              name: 'User',
              role: 'user',
            });
            setIsAuthenticated(true);
            setError('Failed to fetch complete user profile');

            if (showToast) {
              toast.error('Authenticated, but failed to load full profile');
            }
          }
        } else {
          console.warn('Auth: Not authenticated according to Supabase');
          setUser(null);
          setIsAuthenticated(false);

          // Try to refresh the token if needed
          console.log('Auth: Attempting token refresh...');
          refreshSupabaseSession().catch((e) =>
            console.error('Auth token refresh failed:', e)
          );

          if (showToast) {
            toast.error('Not authenticated');
          }
        }
      } catch (e) {
        console.error('Auth: Unexpected error checking auth status:', e);
        setUser(null);
        setIsAuthenticated(false);
        setError(
          e instanceof Error ? e.message : 'Unknown authentication error'
        );

        if (showToast) {
          toast.error('Authentication check failed');
        }
      } finally {
        setIsLoading(false);

        if (showToast) {
          toast.dismiss();
        }
      }
    },
    [] // No dependencies needed here
  );

  // Function to refresh auth
  const refreshAuth = useCallback(
    async (maxAttempts = 3) => {
      try {
        console.log('Auth: Attempting to refresh session');

        // Multiple attempts with exponential backoff
        let attempt = 0;
        let lastError = null;

        while (attempt < maxAttempts) {
          attempt++;
          try {
            console.log(
              `Refreshing Supabase session (attempt ${attempt}/${maxAttempts})...`
            );
            const result = await refreshSupabaseSession();

            if (result.success) {
              console.log('Auth: Session refreshed successfully');
              await checkAuth();
              return true;
            } else {
              lastError = new Error(result.error || 'Session refresh failed');
              console.error(
                `Unexpected error refreshing session (attempt ${attempt}):`,
                lastError
              );

              if (attempt < maxAttempts) {
                // Exponential backoff with jitter
                const delay = Math.min(
                  1000 * Math.pow(1.5, attempt) + Math.random() * 300,
                  5000
                );
                console.log(`Retrying session refresh in ${delay}ms...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
              }
            }
          } catch (err) {
            lastError = err;
            console.error(`Session refresh error (attempt ${attempt}):`, err);

            if (attempt < maxAttempts) {
              // Exponential backoff with jitter
              const delay = Math.min(
                1000 * Math.pow(1.5, attempt) + Math.random() * 300,
                5000
              );
              console.log(`Retrying session refresh in ${delay}ms...`);
              await new Promise((resolve) => setTimeout(resolve, delay));
            }
          }
        }

        // If we get here, all attempts failed
        console.error(
          `All session refresh attempts failed after ${maxAttempts} tries`
        );
        return false;
      } catch (e) {
        console.error('Auth: Error refreshing session:', e);
        return false;
      }
    },
    [checkAuth]
  );

  // Function to reset auth state
  const resetAuth = useCallback(() => {
    resetSupabaseClient();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    setIsLoading(false);
    router.refresh();
  }, [router]);

  // Function to sign out
  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      await supabase.auth.signOut();

      resetAuth();
      toast.success('Signed out successfully');
      router.push('/');
    } catch (e) {
      console.error('Auth: Error signing out:', e);
      toast.error('Error signing out');
    } finally {
      setIsLoading(false);
    }
  }, [resetAuth, router]);

  // Initial auth check
  useEffect(() => {
    checkAuth();

    // Set up listener for auth state changes
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (
        event:
          | 'SIGNED_IN'
          | 'SIGNED_OUT'
          | 'USER_UPDATED'
          | 'USER_DELETED'
          | 'PASSWORD_RECOVERY'
          | 'TOKEN_REFRESHED',
        session: Session | null
      ) => {
        console.log('Auth: Auth state changed:', event);

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          checkAuth();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [checkAuth]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    checkAuth,
    refreshAuth,
    resetAuth,
    signOut,
  };
}
