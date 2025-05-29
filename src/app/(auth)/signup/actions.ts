'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  // Validate passwords match
  if (password !== confirmPassword) {
    console.error('Passwords do not match');
    redirect('/signup?error=passwords_dont_match');
  }

  // Validate password length
  if (password.length < 6) {
    console.error('Password too short');
    redirect('/signup?error=password_too_short');
  }

  console.log('Attempting signup for:', email);

  // First, create the auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    console.error('Signup error:', authError);
    redirect('/signup?error=signup_failed');
  }

  // Check if user was created and is confirmed
  if (authData.user) {
    console.log('User created, attempting to insert into User table...');

    // Create basic user record - we'll complete it in onboarding
    const { error: userError } = await supabase.from('User').insert([
      {
        id: authData.user.id,
        email: authData.user.email,
        colorScheme: 'theme-blue', // Default
        isPublic: true, // Default
        name: null, // Will be set in onboarding
        program: null, // Will be set in onboarding
        image: null, // Will be set in onboarding
      },
    ]);

    if (userError) {
      console.error('Error creating user profile:', userError);
    } else {
      console.log('User profile created successfully');
    }

    // Check if user is immediately confirmed (development mode)
    if (authData.user.email_confirmed_at) {
      console.log('User confirmed, redirecting to onboarding');
      revalidatePath('/', 'layout');
      redirect('/onboarding');
    } else {
      console.log('User needs email confirmation');
      redirect('/signup?message=check_email');
    }
  }

  revalidatePath('/', 'layout');
  redirect('/signup?error=unexpected_error');
}
