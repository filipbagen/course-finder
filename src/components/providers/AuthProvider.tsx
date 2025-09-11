'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { User } from '@/types/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthContextType>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const fetchUser = async () => {
      if (!mounted) return;

      try {
        const response = await fetch('/api/auth/session', {
          // Add cache-busting to prevent browser caching issues
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
          // Add timestamp to query to prevent caching
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch session: ${response.statusText}`);
        }

        const data = await response.json();

        if (!mounted) return;

        if (data && data.user) {
          console.log('Auth: User session loaded successfully');
          setAuthState({
            user: data.user,
            loading: false,
            error: null,
          });
        } else {
          console.log('Auth: No user session found');
          setAuthState({
            user: null,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Error fetching auth session:', error);

        if (!mounted) return;

        // Retry logic with exponential backoff
        if (retryCount < maxRetries) {
          retryCount++;
          const delay = Math.min(1000 * 2 ** retryCount, 10000);
          console.log(
            `Auth: Retrying session fetch (${retryCount}/${maxRetries}) in ${delay}ms`
          );

          setTimeout(fetchUser, delay);
          return;
        }

        setAuthState({
          user: null,
          loading: false,
          error: 'Failed to load user session',
        });
      }
    };

    fetchUser();

    // Clean up function to prevent state updates on unmounted component
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
  );
};
