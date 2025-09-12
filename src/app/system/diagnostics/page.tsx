import { Metadata } from 'next';
import { SystemHealthCheck } from '@/components/shared/SystemHealthCheck';
import { AuthStatus } from '@/components/shared/AuthStatus';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'System Diagnostics - Course Finder',
  description: 'Test and debug system components',
};

export default function DiagnosticsPage() {
  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">System Diagnostics</h1>

      <div className="grid gap-6">
        <SystemHealthCheck />

        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
            <CardDescription>
              Check your current authentication state
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthStatus>
              <div className="p-3 border rounded bg-green-50 text-green-700">
                ✓ You are currently authenticated
              </div>
            </AuthStatus>
          </CardContent>
        </Card>

        <Tabs defaultValue="enrollment">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="enrollment">Enrollment Tests</TabsTrigger>
            <TabsTrigger value="database">Database Tests</TabsTrigger>
            <TabsTrigger value="auth">Auth Tests</TabsTrigger>
          </TabsList>

          <TabsContent value="enrollment">
            <Card>
              <CardHeader>
                <CardTitle>Enrollment API Tests</CardTitle>
                <CardDescription>
                  Test enrollment endpoints to diagnose issues
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <TestButton
                  name="Standard Enrollment API"
                  url="/api/enrollment"
                  method="GET"
                />

                <TestButton
                  name="Simplified Enrollment API"
                  url="/api/enrollment/simplified"
                  method="GET"
                />

                <TestButton
                  name="Test Conflict API"
                  url="/api/test-conflict"
                  method="POST"
                  body={{}}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link href="/courses" className="text-sm underline">
                  Browse Courses
                </Link>
                <Link
                  href="/(dashboard)/schedule"
                  className="text-sm underline"
                >
                  View Schedule
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="database">
            <Card>
              <CardHeader>
                <CardTitle>Database Connection Tests</CardTitle>
                <CardDescription>
                  Test database connectivity and performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <TestButton
                  name="Simple Query Test"
                  url="/api/system/health"
                  method="GET"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="auth">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Tests</CardTitle>
                <CardDescription>Test authentication endpoints</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <TestButton
                  name="Session Check"
                  url="/api/auth/session"
                  method="GET"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function TestButton({
  name,
  url,
  method,
  body,
}: {
  name: string;
  url: string;
  method: 'GET' | 'POST';
  body?: any;
}) {
  return (
    <div className="border rounded p-3">
      <h3 className="font-medium mb-2">{name}</h3>
      <div className="flex gap-2 items-center mb-2">
        <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded text-xs font-mono">
          {method}
        </span>
        <span className="text-sm font-mono truncate">{url}</span>
      </div>
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Open a new window with the API response
            const win = window.open('', '_blank');
            if (!win) return;

            win.document.write('Loading...');

            // Make the API call
            fetch(url, {
              method,
              headers: {
                'Content-Type': 'application/json',
              },
              body: method === 'POST' ? JSON.stringify(body) : undefined,
            })
              .then((response) => {
                return response.json().then((data) => ({
                  status: response.status,
                  statusText: response.statusText,
                  headers: Object.fromEntries(response.headers.entries()),
                  data,
                }));
              })
              .then((result) => {
                // Format and display the response
                win.document.open();
                win.document.write(`
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <title>API Response: ${url}</title>
                    <style>
                      body { font-family: system-ui, sans-serif; padding: 2rem; line-height: 1.5; }
                      pre { background: #f1f5f9; padding: 1rem; border-radius: 0.5rem; overflow: auto; }
                      .status { font-weight: bold; margin-bottom: 1rem; }
                      .success { color: green; }
                      .error { color: red; }
                    </style>
                  </head>
                  <body>
                    <h1>API Response</h1>
                    <div>
                      <strong>URL:</strong> ${method} ${url}
                    </div>
                    <div>
                      <strong>Time:</strong> ${new Date().toLocaleString()}
                    </div>
                    <div class="status ${
                      result.status < 400 ? 'success' : 'error'
                    }">
                      Status: ${result.status} ${result.statusText}
                    </div>
                    
                    <h2>Headers</h2>
                    <pre>${JSON.stringify(result.headers, null, 2)}</pre>
                    
                    <h2>Response Body</h2>
                    <pre>${JSON.stringify(result.data, null, 2)}</pre>
                  </body>
                  </html>
                `);
                win.document.close();
              })
              .catch((err) => {
                win.document.open();
                win.document.write(`
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <title>API Error: ${url}</title>
                    <style>
                      body { font-family: system-ui, sans-serif; padding: 2rem; line-height: 1.5; }
                      .error { color: red; font-weight: bold; }
                    </style>
                  </head>
                  <body>
                    <h1>API Request Failed</h1>
                    <div>
                      <strong>URL:</strong> ${method} ${url}
                    </div>
                    <div>
                      <strong>Time:</strong> ${new Date().toLocaleString()}
                    </div>
                    <div class="error">
                      Error: ${err.message}
                    </div>
                  </body>
                  </html>
                `);
                win.document.close();
              });
          }}
        >
          Test
        </Button>
      </div>
    </div>
  );
}
