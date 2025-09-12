import { Metadata } from 'next';
import { SystemHealthCheck } from '@/components/shared/SystemHealthCheck';
import { AuthStatus } from '@/components/shared/AuthStatus';
import { TestButton } from '@/components/shared/TestButton';
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

// Force dynamic rendering to avoid static generation errors with cookies
export const dynamic = 'force-dynamic';

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
