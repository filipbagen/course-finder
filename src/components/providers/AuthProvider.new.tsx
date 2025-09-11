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

      // 1. First check auth status directly with Supabase
      const authStatus = await checkAuthStatus();
      console.log('Auth: Direct Supabase auth check:', authStatus);

      if (!authStatus.isAuthenticated) {
        setAuthState({
          user: null,
          loading: false,
          error: null,
          isAuthenticated: false,
        });
        return;
      }

      // 2. Then fetch complete user data from our API
      const response = await fetch('/api/auth/session', {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch session: ${response.statusText}`);
      }

      const data = await response.json();

      if (data && data.user) {
        console.log('Auth: User session loaded successfully');
        setAuthState({
          user: data.user,
          loading: false,
          error: null,
          isAuthenticated: true,
        });
      } else {
        console.log('Auth: No user session found in API response');
        // If Supabase says we're logged in but API doesn't return user,
        // we have a data sync issue - try to refresh token
        const supabase = createClient();
        await supabase.auth.refreshSession();

        setAuthState({
          user: null,
          loading: false,
          error: null,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('Error fetching auth session:', error);

      setAuthState({
        user: null,
        loading: false,
        error: 'Failed to load user session',
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
      await fetchUser();

      // Set up Supabase auth listener for real-time updates
      const supabase = createClient();
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(
        async (event: AuthChangeEvent, _session: Session | null) => {
          console.log('Auth state change event:', event);
          await fetchUser();
        }
      );

      // Clean up listener on unmount
      return () => {
        subscription.unsubscribe();
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
