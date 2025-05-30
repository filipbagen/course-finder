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
    console.error('Login error:', error);
    redirect('/login?error=invalid_credentials');
  }

  revalidatePath('/', 'layout');
  redirect('/courses');
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (password !== confirmPassword) {
    redirect('/signup?error=passwords_dont_match');
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    console.error('Supabase auth error:', authError);
    redirect('/signup?error=signup_failed');
  }

  if (authData.user) {
    if (authData.user.email_confirmed_at) {
      revalidatePath('/', 'layout');
      redirect('/onboarding');
    } else {
      redirect('/signup?message=check_email');
    }
  }

  redirect('/signup?error=unexpected_error');
}