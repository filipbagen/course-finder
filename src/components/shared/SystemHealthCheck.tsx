'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Database,
  Server,
} from 'lucide-react';

/**
 * A component that checks if the system is healthy
 * Useful for debugging issues with the database or auth
 */
export function SystemHealthCheck() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);

    try {
      // Try the new health check endpoint first
      try {
        const response = await fetch('/api/health/connection');

        if (response.ok) {
          const data = await response.json();

          // Transform to the expected format
          const transformedData = {
            status: Object.values(data.services).every(
              (service: any) => service.status === 'healthy'
            )
              ? 'healthy'
              : 'degraded',
            responseTime: data.totalResponseTime || 'unknown',
            timestamp: data.timestamp,
            environment: data.environment,
            components: {
              database: {
                status:
                  data.services.database?.status === 'healthy'
                    ? 'healthy'
                    : 'unhealthy',
                responseTime: data.services.database?.responseTime || 'unknown',
                ...data.services.database,
              },
              supabase: {
                status:
                  data.services.supabase?.status === 'healthy'
                    ? 'healthy'
                    : 'unhealthy',
                responseTime: data.services.supabase?.responseTime || 'unknown',
                ...data.services.supabase,
              },
            },
          };

          setHealth(transformedData);
          return;
        }
      } catch (e) {
        console.warn(
          'New health check endpoint failed, falling back to old endpoint',
          e
        );
      }

      // Fall back to old endpoint
      const response = await fetch('/api/system/health');

      if (!response.ok) {
        throw new Error(`Health check failed with status: ${response.status}`);
      }

      const data = await response.json();
      setHealth(data);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Failed to check system health'
      );
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">System Health</h2>
        <Button
          size="sm"
          variant="outline"
          onClick={checkHealth}
          disabled={loading}
        >
          {loading ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {health && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Status</span>
            <HealthStatus status={health.status} />
          </div>

          <div className="text-xs text-muted-foreground">
            Response Time: {health.responseTime}
          </div>

          <h3 className="font-medium text-sm mt-4">Components</h3>

          {health.components.database && (
            <ComponentHealth
              name="Database"
              icon={<Database className="h-4 w-4" />}
              status={health.components.database.status}
              responseTime={health.components.database.responseTime}
              details={health.components.database}
            />
          )}

          {health.components.supabase && (
            <ComponentHealth
              name="Supabase Auth"
              icon={<Server className="h-4 w-4" />}
              status={health.components.supabase.status}
              responseTime={health.components.supabase.responseTime}
              details={health.components.supabase}
            />
          )}

          <div className="text-xs text-muted-foreground mt-2">
            Environment: {health.environment}
          </div>
          <div className="text-xs text-muted-foreground">
            Checked at: {new Date(health.timestamp).toLocaleString()}
          </div>
        </div>
      )}

      {!health && !error && (
        <div className="py-4 text-center text-muted-foreground">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
          Checking system health...
        </div>
      )}
    </div>
  );
}

function HealthStatus({ status }: { status: string }) {
  if (status === 'healthy' || status === 'ok') {
    return (
      <span className="flex items-center text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-medium">
        <CheckCircle className="h-3 w-3 mr-1" />
        Healthy
      </span>
    );
  }

  if (status === 'degraded') {
    return (
      <span className="flex items-center text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded text-xs font-medium">
        <AlertCircle className="h-3 w-3 mr-1" />
        Degraded
      </span>
    );
  }

  return (
    <span className="flex items-center text-red-600 bg-red-50 px-2 py-0.5 rounded text-xs font-medium">
      <XCircle className="h-3 w-3 mr-1" />
      Unhealthy
    </span>
  );
}

function ComponentHealth({
  name,
  icon,
  status,
  responseTime,
  details,
}: {
  name: string;
  icon: React.ReactNode;
  status: string;
  responseTime: string;
  details: any;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border rounded p-2 text-sm">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          {icon}
          {name}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{responseTime}</span>
          <HealthStatus status={status} />
        </div>
      </div>

      {expanded && (
        <div className="mt-2 text-xs border-t pt-2 text-muted-foreground">
          <pre className="overflow-auto max-h-24">
            {JSON.stringify(details, null, 2)}
          </pre>
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        className="w-full mt-1 h-6 text-xs"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 'Hide Details' : 'Show Details'}
      </Button>
    </div>
  );
}
