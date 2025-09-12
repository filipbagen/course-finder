'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  checkAuthStatus,
  resetSupabaseClient,
  refreshSupabaseSession,
} from '@/lib/supabase/client';
import { toast } from 'sonner';

interface AuthStatusProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * A reliable component that checks authentication status
 * before rendering children. This component also helps
 * debug auth state issues.
 */
export function AuthStatus({ children, fallback }: AuthStatusProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Log that we're checking auth status
        console.log('AuthStatus: Checking authentication status...');

        // Check auth status with timeout protection
        const status = await checkAuthStatus();
        console.log('AuthStatus: Result', status);

        // Check if token is about to expire (< 10 minutes remaining)
        const tokenNeedsRefresh =
          status.isAuthenticated && status.expiresAt
            ? Math.floor(Date.now() / 1000) > status.expiresAt - 600
            : false;

        if (tokenNeedsRefresh) {
          console.log(
            'AuthStatus: Token close to expiry, refreshing proactively'
          );
          await refreshSupabaseSession();
        }

        setIsAuthenticated(status.isAuthenticated);

        // If not authenticated but we should be, try to refresh
        if (!status.isAuthenticated) {
          console.log('AuthStatus: Not authenticated, attempting refresh...');

          // Try to refresh the session
          const refreshResult = await refreshSupabaseSession();
          console.log('AuthStatus: Refresh result', refreshResult);

          if (refreshResult.success && refreshResult.session) {
            // If refresh succeeded, update state
            setIsAuthenticated(true);
            // Force a router refresh to update all components
            router.refresh();
          } else {
            // If refresh failed, reset client and try again from scratch
            console.log('AuthStatus: Refresh failed, resetting client...');
            resetSupabaseClient();

            // One final auth check
            const finalCheck = await checkAuthStatus();
            console.log('AuthStatus: Final check result', finalCheck);

            setIsAuthenticated(finalCheck.isAuthenticated);
            if (finalCheck.isAuthenticated) {
              // Force a router refresh if we succeeded on the final check
              router.refresh();
            }
          }
        }
      } catch (err) {
        console.error('AuthStatus: Error checking auth status', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsAuthenticated(false);

        // Try to recover by resetting the client
        try {
          resetSupabaseClient();
        } catch (resetError) {
          console.error('AuthStatus: Failed to reset client', resetError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Set up a periodic check for token expiration (every 5 minutes)
    const intervalId = setInterval(async () => {
      try {
        const status = await checkAuthStatus();
        if (status.isAuthenticated && status.expiresAt) {
          const now = Math.floor(Date.now() / 1000);
          const timeUntilExpiry = status.expiresAt - now;

          // If token expires in less than 10 minutes, refresh it
          if (timeUntilExpiry < 600) {
            console.log(
              `AuthStatus: Token expires in ${timeUntilExpiry}s, refreshing`
            );
            await refreshSupabaseSession();
          }
        }
      } catch (err) {
        console.error('AuthStatus: Error in token check interval', err);
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => {
      clearInterval(intervalId);
    };
  }, [router]);

  // Show a loading state
  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">
        Verifying authentication...
      </div>
    );
  }

  // Show an error state
  if (error) {
    return (
      <div className="text-sm text-red-500">
        Authentication error: {error}
        <button
          className="ml-2 underline"
          onClick={() => {
            resetSupabaseClient();
            router.refresh();
          }}
        >
          Reset
        </button>
      </div>
    );
  }

  // If authenticated, show children
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If not authenticated and we have a fallback, show it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Otherwise show a default message
  return (
    <div className="text-sm text-muted-foreground">
      You need to be logged in to access this content.
      <button
        className="ml-2 underline"
        onClick={() => {
          toast.info('Redirecting to login page...');
          router.push('/login');
        }}
      >
        Log in
      </button>
    </div>
  );
}
