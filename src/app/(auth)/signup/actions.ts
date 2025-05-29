'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  // Validate passwords match
  if (password !== confirmPassword) {
    redirect('/signup?error=passwords_dont_match')
  }

  console.log('Creating auth user with Supabase...')

  // Create auth user with Supabase
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) {
    console.error('Supabase auth error:', authError)
    redirect('/signup?error=signup_failed')
  }

  if (authData.user) {
    console.log('Auth user created successfully')
    
    // Don't create database user here - do it in onboarding
    // This way we create the full profile in one step
    
    if (authData.user.email_confirmed_at) {
      revalidatePath('/', 'layout')
      redirect('/onboarding')
    } else {
      redirect('/signup?message=check_email')
    }
  }

  redirect('/signup?error=unexpected_error')
}