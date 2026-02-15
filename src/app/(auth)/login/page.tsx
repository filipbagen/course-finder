export const dynamic = 'force-dynamic'

import { signIn } from '@/app/actions/auth'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle } from 'lucide-react'

interface LoginPageProps {
  searchParams: Promise<{ error?: string; message?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient()
  const params = await searchParams

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (user && !error) {
    redirect('/courses')
  }

  // Error messages mapping
  const errorMessages = {
    invalid_credentials: 'Ogiltig e-post eller lösenord. Försök igen.',
    signup_failed: 'Kontoskapande misslyckades. Försök igen.',
    unexpected_error: 'Ett oväntat fel inträffade. Försök igen.',
  }

  const successMessages = {
    account_created: 'Konto skapat! Vänligen logga in.',
    password_updated: 'Lösenord uppdaterat! Vänligen logga in.',
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border bg-card text-card-foreground shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl">
            Logga in på ditt konto
          </CardTitle>
          <CardDescription className="text-center">
            Har du inget konto?{' '}
            <Link
              href="/signup"
              className="font-medium text-primary hover:underline"
            >
              Skapa ett här
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

          <form action={signIn} className="space-y-4">
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
                autoComplete="current-password"
                required
                placeholder="Ange ditt lösenord"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 text-white hover:bg-blue-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
            >
              Logga in
            </Button>
          </form>

          <div className="space-y-2 text-center">
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground hover:text-primary hover:underline"
            >
              Glömt ditt lösenord?
            </Link>
            <div>
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-primary hover:underline"
              >
                ← Tillbaka till startsidan
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
