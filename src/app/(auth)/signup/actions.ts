'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  // Validate name is provided
  if (!name || name.trim() === '') {
    redirect('/signup?error=name_required');
  }

  // Validate passwords match
  if (password !== confirmPassword) {
    redirect('/signup?error=passwords_dont_match');
  }

  console.log('Creating auth user with Supabase...');

  // Create auth user with Supabase
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
      },
    },
  });

  if (authError) {
    console.error('Supabase auth error:', authError);
    redirect('/signup?error=signup_failed');
  }

  if (authData.user) {
    console.log('Auth user created successfully');

    // Store the name in a session for onboarding
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: authData.session?.access_token || '',
      refresh_token: authData.session?.refresh_token || '',
    });

    if (sessionError) {
      console.error('Session error:', sessionError);
    }

    if (authData.user.email_confirmed_at) {
      revalidatePath('/', 'layout');
      redirect(`/onboarding?name=${encodeURIComponent(name)}`);
    } else {
      redirect('/signup?message=check_email');
    }
  }

  redirect('/signup?error=unexpected_error');
}
