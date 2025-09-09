import { signIn } from '@/app/actions/auth';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface LoginPageProps {
  searchParams: Promise<{ error?: string; message?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient();
  const params = await searchParams;

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (user && !error) {
    redirect('/courses');
  }

  // Error messages mapping
  const errorMessages = {
    invalid_credentials: 'Invalid email or password. Please try again.',
    signup_failed: 'Account creation failed. Please try again.',
    unexpected_error: 'An unexpected error occurred. Please try again.',
  };

  const successMessages = {
    account_created: 'Account created successfully! Please sign in.',
    password_updated: 'Password updated successfully! Please sign in.',
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            Sign in to your account
          </CardTitle>
          <CardDescription className="text-center">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="font-medium text-primary hover:underline"
            >
              Create one here
            </Link>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error Message */}
          {params.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {errorMessages[params.error as keyof typeof errorMessages] ||
                  'An error occurred. Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {params.message && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {successMessages[
                  params.message as keyof typeof successMessages
                ] || params.message}
              </AlertDescription>
            </Alert>
          )}

          <form action={signIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Enter your password"
              />
            </div>

            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>

          <div className="text-center space-y-2">
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground hover:text-primary hover:underline"
            >
              Forgot your password?
            </Link>
            <div>
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-primary hover:underline"
              >
                ← Back to home
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
