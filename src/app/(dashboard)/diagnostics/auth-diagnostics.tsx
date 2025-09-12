'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@/lib/supabase/client';
import { refreshSupabaseSession } from '@/lib/supabase/client';
import { tokenManager } from '@/lib/supabase/tokenManager';

export default function AuthDiagnostics() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<any>(null);
  const [serverCheck, setServerCheck] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Check client-side auth status
  const checkClientAuth = async () => {
    setLoading(true);

    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const { data: userData } = await supabase.auth.getUser();

      // Calculate expiry time
      let expiresIn = null;
      let expiresInMinutes = null;

      if (sessionData?.session?.expires_at) {
        const now = Math.floor(Date.now() / 1000);
        expiresIn = sessionData.session.expires_at - now;
        expiresInMinutes = Math.floor(expiresIn / 60);
      }

      setStatus({
        authenticated: !!sessionData?.session,
        user: userData?.user,
        session: sessionData?.session,
        expiresIn,
        expiresInMinutes,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error checking client auth:', error);
      setStatus({
        error: error instanceof Error ? error.message : 'Unknown error',
        lastUpdated: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  // Check server-side auth status
  const checkServerAuth = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/auth/health');
      const data = await response.json();

      setServerCheck({
        ...data,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error checking server auth:', error);
      setServerCheck({
        error: error instanceof Error ? error.message : 'Unknown error',
        lastUpdated: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  // Refresh session
  const refreshSession = async () => {
    setRefreshing(true);

    try {
      console.log('Refreshing session...');
      const result = await refreshSupabaseSession();

      if (result.success) {
        console.log('Session refresh successful');
      } else {
        console.error('Session refresh failed:', result.error);
      }

      // Re-check auth status
      await checkClientAuth();
      await checkServerAuth();

      return result.success;
    } catch (error) {
      console.error('Unexpected error in refreshSession:', error);
      return false;
    } finally {
      setRefreshing(false);
    }
  };

  // Force token manager refresh
  const forceTokenManagerRefresh = async () => {
    setRefreshing(true);

    try {
      await tokenManager.forceRefresh();

      // Re-check auth status
      await checkClientAuth();
      await checkServerAuth();
    } catch (error) {
      console.error('Error forcing token refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    checkClientAuth();
    checkServerAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Diagnostics</CardTitle>
          <CardDescription>
            Check the status of your authentication
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading ? (
            <div>Loading authentication status...</div>
          ) : (
            <>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Client-side Auth Status</h3>
                <div className="rounded-md bg-muted p-4">
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(status, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Server-side Auth Status</h3>
                <div className="rounded-md bg-muted p-4">
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(serverCheck, null, 2)}
                  </pre>
                </div>
              </div>

              {status?.authenticated ? (
                <Alert>
                  <AlertDescription>
                    You are authenticated! Token expires in{' '}
                    {status.expiresInMinutes} minutes.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertDescription>
                    You are not authenticated.{' '}
                    {status?.error ? `Error: ${status.error}` : ''}
                  </AlertDescription>
                </Alert>
              )}

              {serverCheck?.status === 'authenticated' ? (
                <Alert>
                  <AlertDescription>
                    Server confirms you are authenticated!
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertDescription>
                    Server reports you are not authenticated.{' '}
                    {serverCheck?.error ? `Error: ${serverCheck.error}` : ''}
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4 sm:flex-row">
          <Button
            onClick={() => {
              checkClientAuth();
              checkServerAuth();
            }}
          >
            Refresh Status
          </Button>

          <Button
            variant="outline"
            onClick={refreshSession}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Session'}
          </Button>

          <Button
            variant="outline"
            onClick={forceTokenManagerRefresh}
            disabled={refreshing}
          >
            Force Token Refresh
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
