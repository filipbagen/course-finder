// next
import { redirect } from 'next/navigation';

// components
import { ForgotPasswordForm } from './ForgotPasswordForm';

// shadcn
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail } from 'lucide-react';

// supabase
import { createClient } from '@/lib/supabase/server';

interface ForgotPasswordPageProps {
  searchParams: Promise<{ error?: string; message?: string }>;
}

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  // Await searchParams before using it
  const params = await searchParams;

  async function resetPassword(formData: FormData) {
    'use server';

    const supabase = await createClient();
    const email = formData.get('email') as string;

    if (!email) {
      throw new Error('Email address is required');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    });

    if (error) {
      console.error('Reset password error:', error);
      throw new Error('Could not send reset email');
    }

    // Redirect to a success page or show success message
    redirect('/forgot-password?message=check-email');
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Reset your password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email address and we'll send you a link to reset your
            password
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Success Message */}
          {params.message === 'check-email' && (
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                If an account with that email exists, we've sent you a password
                reset link. Please check your email and click the link to reset
                your password.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {params.error && (
            <Alert variant="destructive">
              <AlertDescription>
                {params.error === 'email-required'
                  ? 'Email address is required'
                  : 'An error occurred. Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          <ForgotPasswordForm action={resetPassword}>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
              />
            </div>
          </ForgotPasswordForm>
          <div className="text-center">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-primary hover:underline"
            >
              ← Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
