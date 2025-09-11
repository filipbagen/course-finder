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
    passwords_dont_match: 'Lösenorden matchar inte. Försök igen.',
    password_too_short: 'Lösenordet måste vara minst 6 tecken långt.',
    name_required: 'Fullständigt namn krävs för att skapa ett konto.',
    signup_failed:
      'Kontoskapande misslyckades. Försök igen med en annan e-postadress.',
    unexpected_error: 'Ett oväntat fel inträffade. Försök igen.',
    email_already_exists:
      'Ett konto med denna e-postadress finns redan. Logga in istället.',
  };

  const successMessages = {
    check_email:
      'Vänligen kontrollera din e-post och klicka på bekräftelselänken för att aktivera ditt konto.',
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            Skapa ditt konto
          </CardTitle>
          <CardDescription className="text-center">
            Har du redan ett konto?{' '}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Logga in här
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
                  'Ett fel inträffade. Försök igen.'}
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
              <Label htmlFor="name">Fullständigt namn</Label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="Ange ditt fullständiga namn"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-postadress</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Ange din e-postadress"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Lösenord</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                placeholder="Ange ditt lösenord (minst 6 tecken)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Bekräfta lösenord</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                placeholder="Bekräfta ditt lösenord"
              />
            </div>

            <Button formAction={signUp} type="submit" className="w-full">
              <UserPlus className="h-4 w-4 mr-2" />
              Skapa konto
            </Button>
          </form>

          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-primary hover:underline"
            >
              ← Tillbaka till startsidan
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
