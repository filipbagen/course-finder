// /app/onboarding/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateUserProfile(formData: FormData) {
  const supabase = await createClient();

  const userId = formData.get('userId') as string;
  const name = formData.get('name') as string;
  const program = formData.get('program') as string;
  const colorScheme = formData.get('colorScheme') as string;
  const isPublic = formData.get('isPublic') === 'on';
  const avatarUrl = formData.get('avatarUrl') as string;

  console.log('Updating user profile:', {
    userId,
    name,
    program,
    colorScheme,
    isPublic,
    avatarUrl,
  });

  const { error } = await supabase
    .from('User')
    .update({
      name,
      program,
      colorScheme,
      isPublic,
      image: avatarUrl || null, // Store the avatar URL in the image field
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update profile');
  }

  console.log('Profile updated successfully');
  revalidatePath('/', 'layout');
  redirect('/private');
}
