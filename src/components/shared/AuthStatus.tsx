'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkAuthStatus, refreshSupabaseSession } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface AuthStatusProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * A simplified auth status component that shows children when user is authenticated,
 * or fallback content when not authenticated.
 */
export function AuthStatus({ children, fallback }: AuthStatusProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);

      try {
        // Check auth status
        const status = await checkAuthStatus();
        console.log('AuthStatus: Initial auth check result', status);

        if (!status.isAuthenticated) {
          // If not authenticated, try to refresh the session
          const refreshResult = await refreshSupabaseSession();
          console.log('AuthStatus: Refresh attempt result', refreshResult);

          if (refreshResult.success) {
            // If refresh succeeded, update state
            setIsAuthenticated(true);
            router.refresh();
          } else {
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('AuthStatus: Error checking auth status', err);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Show a loading state
  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">
        Verifying authentication...
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
