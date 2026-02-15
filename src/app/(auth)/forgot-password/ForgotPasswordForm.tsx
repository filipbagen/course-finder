'use client'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useState } from 'react'

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      // The url which will be included in the email. This URL needs to be configured in your redirect URLs in the Supabase dashboard
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })
      if (error) throw error
      setSuccess(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      {success ? (
        <Card className="border-border bg-card text-card-foreground shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Kolla din e-post</CardTitle>
            <CardDescription>
              Instruktioner för lösenordsåterställning skickade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Om du registrerade dig med din e-postadress och lösenord kommer du
              att få ett e-postmeddelande för att återställa lösenordet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border bg-card text-card-foreground shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Återställ ditt lösenord</CardTitle>
            <CardDescription>
              Ange din e-postadress så skickar vi en länk för att återställa
              ditt lösenord
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">E-post</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="e-post"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button
                  type="submit"
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                  disabled={isLoading}
                >
                  {isLoading ? 'Skickar...' : 'Skicka återställningslänk'}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Har du redan ett konto?{' '}
                <Link href="/login" className="underline underline-offset-4">
                  Logga in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
