'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    // Keep error logging for debugging but use a more concise message
    console.error('Login error');
    redirect('/login?error=invalid_credentials');
  }

  revalidatePath('/', 'layout');
  redirect('/courses');
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (password !== confirmPassword) {
    redirect('/signup?error=passwords_dont_match');
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name, // Store name in auth metadata
      },
    },
  });

  if (authError) {
    // Keep error logging for debugging but use a more concise message
    console.error('Signup error');
    redirect('/signup?error=signup_failed');
  }

  if (authData.user) {
    if (authData.user.email_confirmed_at) {
      revalidatePath('/', 'layout');
      redirect(`/onboarding?name=${encodeURIComponent(name)}`);
    } else {
      redirect('/signup?message=check_email');
    }
  }

  redirect('/signup?error=unexpected_error');
}
