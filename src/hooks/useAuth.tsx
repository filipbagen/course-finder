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
    async (showToast = false) => {
      try {
        setIsLoading(true);
        setError(null);

        if (showToast) {
          toast.loading('Checking authentication status...');
        }

        console.log('Auth: Fetching user session...');
        const authStatus = await checkAuthStatus();
        console.log('Auth: Direct Supabase auth check:', authStatus);

        if (authStatus.isAuthenticated && authStatus.userId) {
          // Fetch user profile from API
          try {
            const response = await fetch('/api/auth/session');

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
              // Try to refresh session
              await refreshAuth();
            }
          } catch (profileError) {
            console.error('Auth: Error fetching user profile:', profileError);
            // Even if profile fetch fails, we know user is authenticated
            setIsAuthenticated(true);
            setError('Failed to fetch user profile');

            if (showToast) {
              toast.error('Authenticated, but failed to load profile');
            }
          }
        } else {
          console.warn('Auth: Not authenticated');
          setUser(null);
          setIsAuthenticated(false);

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
    [router]
  );

  // Function to refresh auth
  const refreshAuth = useCallback(async () => {
    try {
      console.log('Auth: Attempting to refresh session');
      const result = await refreshSupabaseSession();

      if (result.success) {
        console.log('Auth: Session refreshed successfully');
        await checkAuth();
        return true;
      } else {
        console.warn('Auth: Session refresh failed:', result.error);
        return false;
      }
    } catch (e) {
      console.error('Auth: Error refreshing session:', e);
      return false;
    }
  }, [checkAuth]);

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
