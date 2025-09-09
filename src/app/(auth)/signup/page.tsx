import { signUp } from '@/app/actions/auth';
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
import { AlertCircle, CheckCircle, UserPlus } from 'lucide-react';

interface SignupPageProps {
  searchParams: Promise<{ error?: string; message?: string }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  // Await searchParams before using it
  const params = await searchParams;

  const supabase = await createClient();

  // Check if user is already authenticated
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Redirect authenticated users to courses page
  if (user && !error) {
    redirect('/courses');
  }

  // Error messages mapping
  const errorMessages = {
    passwords_dont_match: 'Passwords do not match. Please try again.',
    password_too_short: 'Password must be at least 6 characters long.',
    name_required: 'Full name is required to create an account.',
    signup_failed:
      'Account creation failed. Please try again with a different email.',
    unexpected_error: 'An unexpected error occurred. Please try again.',
    email_already_exists:
      'An account with this email already exists. Please sign in instead.',
  };

  const successMessages = {
    check_email:
      'Please check your email and click the confirmation link to activate your account.',
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            Create your account
          </CardTitle>
          <CardDescription className="text-center">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in here
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

          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="Enter your full name"
              />
            </div>

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
                autoComplete="new-password"
                required
                minLength={6}
                placeholder="Enter your password (min. 6 characters)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                placeholder="Confirm your password"
              />
            </div>

            <Button formAction={signUp} type="submit" className="w-full">
              <UserPlus className="h-4 w-4 mr-2" />
              Create Account
            </Button>
          </form>

          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-primary hover:underline"
            >
              ← Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
