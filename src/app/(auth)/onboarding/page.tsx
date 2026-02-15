export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OnboardingForm from './onboarding-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { GraduationCap } from 'lucide-react'

interface OnboardingPageProps {
  searchParams: Promise<{ name?: string }>
}

export default async function OnboardingPage({
  searchParams,
}: OnboardingPageProps) {
  const supabase = await createClient()
  const params = await searchParams
  const { name } = params

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  // Redirect unauthenticated users
  if (!user || error) {
    redirect('/login')
  }

  // Check if user has already completed onboarding
  const { data: userData } = await supabase
    .from('User')
    .select('name, program')
    .eq('id', user.id)
    .single()

  // If user already has name and program, redirect to courses
  if (userData?.name && userData?.program) {
    redirect('/courses')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl border-border bg-card text-card-foreground shadow-lg">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <GraduationCap className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl">
            Välkommen till Course Finder!
          </CardTitle>
          <CardDescription className="text-lg">
            Låt oss konfigurera din profil för att komma igång
          </CardDescription>
        </CardHeader>

        <CardContent>
          <OnboardingForm
            userId={user.id}
            userEmail={user.email!}
            initialName={name || ''}
          />
        </CardContent>
      </Card>
    </div>
  )
}
