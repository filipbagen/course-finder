import { useState, useEffect } from 'react';
import { User } from '@/types/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/session');

        if (!response.ok) {
          throw new Error('Failed to fetch session');
        }

        const data = await response.json();

        if (data && data.user) {
          setAuthState({
            user: data.user,
            loading: false,
            error: null,
          });
        } else {
          setAuthState({
            user: null,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Error fetching auth session:', error);
        setAuthState({
          user: null,
          loading: false,
          error: 'Failed to load user session',
        });
      }
    };

    fetchUser();
  }, []);

  return authState;
}
