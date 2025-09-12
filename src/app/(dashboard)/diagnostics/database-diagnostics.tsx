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

export default function DatabaseDiagnostics() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<any>(null);

  const checkDatabaseHealth = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/health/database');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error checking database health:', error);
      setStatus({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkDatabaseHealth();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Diagnostics</CardTitle>
        <CardDescription>
          Check the status of your database connection
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          <div>Loading database status...</div>
        ) : (
          <>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Database Status</h3>
              <div className="rounded-md bg-muted p-4">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(status, null, 2)}
                </pre>
              </div>
            </div>

            {status?.status === 'healthy' ? (
              <Alert>
                <AlertDescription>
                  Database connection is healthy! Response time:{' '}
                  {status.responseTime}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertDescription>
                  Database connection error: {status?.error || 'Unknown error'}
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>

      <CardFooter>
        <Button onClick={checkDatabaseHealth} disabled={loading}>
          {loading ? 'Checking...' : 'Check Database Connection'}
        </Button>
      </CardFooter>
    </Card>
  );
}
