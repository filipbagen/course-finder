// next
import { redirect } from 'next/navigation';

// components
import { ResetPasswordForm } from '@/components/shared/ResetPasswordForm';

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

// supabase
import { createClient } from '@/lib/supabase/server';

export default async function ResetPasswordPage() {
  async function updatePassword(formData: FormData) {
    'use server';

    const supabase = await createClient();
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm_password') as string;

    if (!password || !confirmPassword) {
      throw new Error('Båda lösenordsfälten krävs');
    }

    if (password !== confirmPassword) {
      throw new Error('Lösenorden matchar inte');
    }

    if (password.length < 6) {
      throw new Error('Lösenordet måste vara minst 6 tecken långt');
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      console.error('Update password error:', error);
      throw new Error('Kunde inte uppdatera lösenord');
    }

    // Redirect to login or dashboard
    redirect('/login?message=password-updated');
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Skapa nytt lösenord</CardTitle>
          <CardDescription>Ange ditt nya lösenord nedan</CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm action={updatePassword}>
            <div className="space-y-2">
              <Label htmlFor="password">Nytt lösenord</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Ange ditt nya lösenord"
                required
                minLength={6}
              />
              <p className="text-sm text-muted-foreground">
                Lösenordet måste vara minst 6 tecken långt
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm_password">Bekräfta lösenord</Label>
              <Input
                id="confirm_password"
                name="confirm_password"
                type="password"
                placeholder="Bekräfta ditt nya lösenord"
                required
                minLength={6}
              />
            </div>
          </ResetPasswordForm>
        </CardContent>
      </Card>
    </div>
  );
}
