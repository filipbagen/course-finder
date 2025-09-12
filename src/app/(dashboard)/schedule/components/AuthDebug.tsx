'use client';

import React from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient, checkAuthStatus } from '@/lib/supabase/client';

export function AuthDebug() {
  const { user, loading, isAuthenticated, refreshAuth } = useAuth();
  const [supabaseCheck, setSupabaseCheck] = React.useState<any>(null);
  const [sessionCheck, setSessionCheck] = React.useState<any>(null);
  const [checking, setChecking] = React.useState(false);

  async function checkAuthState() {
    setChecking(true);
    try {
      // Direct Supabase check
      const status = await checkAuthStatus();
      setSupabaseCheck(status);

      // API session check
      const response = await fetch('/api/auth/session', {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
        cache: 'no-store',
      });
      const data = await response.json();
      setSessionCheck(data);
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setChecking(false);
    }
  }

  async function resetSession() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      await refreshAuth();
      window.location.reload();
    } catch (error) {
      console.error('Error resetting session:', error);
    }
  }

  return (
    <div className="p-4 my-4 border rounded-md bg-slate-50">
      <h2 className="text-lg font-bold mb-3">Authentication Debug</h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h3 className="font-semibold">Auth Provider State:</h3>
          <ul className="text-sm space-y-1">
            <li>User: {user ? 'Yes' : 'No'}</li>
            <li>Loading: {loading ? 'Yes' : 'No'}</li>
            <li>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</li>
            <li>
              User ID: {user?.id ? user.id.substring(0, 8) + '...' : 'None'}
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold">Debug Actions:</h3>
          <div className="flex space-x-2 mt-2">
            <button
              onClick={checkAuthState}
              disabled={checking}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {checking ? 'Checking...' : 'Check Auth'}
            </button>
            <button
              onClick={refreshAuth}
              className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
            >
              Refresh Auth
            </button>
            <button
              onClick={resetSession}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
            >
              Reset Session
            </button>
          </div>
        </div>
      </div>

      {supabaseCheck && (
        <div className="mb-4">
          <h3 className="font-semibold">Direct Supabase Check:</h3>
          <pre className="text-xs p-2 bg-slate-100 rounded overflow-auto max-h-28">
            {JSON.stringify(supabaseCheck, null, 2)}
          </pre>
        </div>
      )}

      {sessionCheck && (
        <div>
          <h3 className="font-semibold">API Session Check:</h3>
          <pre className="text-xs p-2 bg-slate-100 rounded overflow-auto max-h-28">
            {JSON.stringify(sessionCheck, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
