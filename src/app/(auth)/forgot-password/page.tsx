// next
import { redirect } from 'next/navigation';

// components
import { ForgotPasswordForm } from '@/components/shared/ForgotPasswordForm';

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

// supabase
import { createClient } from '@/lib/supabase/server';

export default async function ForgotPasswordPage() {
  async function resetPassword(formData: FormData) {
    'use server';

    const supabase = await createClient();
    const email = formData.get('email') as string;

    if (!email) {
      throw new Error('E-postadress krävs');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    });

    if (error) {
      console.error('Reset password error:', error);
      throw new Error('Kunde inte skicka återställningsmail');
    }

    // Redirect to a success page or show success message
    redirect('/auth/forgot-password/sent');
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Återställ lösenord</CardTitle>
          <CardDescription>
            Ange din e-postadress så skickar vi en länk för att återställa ditt
            lösenord
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm action={resetPassword}>
            <div className="space-y-2">
              <Label htmlFor="email">E-postadress</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="din@email.se"
                required
              />
            </div>
          </ForgotPasswordForm>
          <div className="mt-4 text-center">
            <Link href="/login">
              <Button variant="link" className="text-sm">
                Tillbaka till inloggning
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
