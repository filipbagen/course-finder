// next
import { redirect } from 'next/navigation';

// components
import { ResetPasswordForm } from './ResetPasswordForm';

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
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { CheckCircle, AlertCircle, Lock } from 'lucide-react';

// supabase
import { createClient } from '@/lib/supabase/server';

interface ResetPasswordPageProps {
  searchParams: Promise<{ error?: string; message?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  // Await searchParams before using it
  const params = await searchParams;

  async function updatePassword(formData: FormData) {
    'use server';

    const supabase = await createClient();
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm_password') as string;

    if (!password || !confirmPassword) {
      throw new Error('Both password fields are required');
    }

    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      console.error('Update password error:', error);
      throw new Error('Could not update password');
    }

    // Redirect to login with success message
    redirect('/login?message=password-updated');
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Create new password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Success Message */}
          {params.message === 'password-updated' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your password has been successfully updated. You can now log in
                with your new password.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {params.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {params.error === 'passwords-dont-match'
                  ? 'Passwords do not match'
                  : params.error === 'password-too-short'
                  ? 'Password must be at least 6 characters long'
                  : 'An error occurred. Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          <ResetPasswordForm action={updatePassword}>
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your new password"
                required
                minLength={6}
              />
              <p className="text-sm text-muted-foreground">
                Password must be at least 6 characters long
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm password</Label>
              <Input
                id="confirm_password"
                name="confirm_password"
                type="password"
                placeholder="Confirm your new password"
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full mt-4">
              <Lock className="h-4 w-4 mr-2" />
              Update Password
            </Button>
          </ResetPasswordForm>
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
