'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateUserProfile(formData: FormData) {
  const supabase = await createClient()

  // Verify authentication
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect('/login')
  }

  const name = formData.get('name') as string
  const program = formData.get('program') as string
  const colorScheme = formData.get('colorScheme') as string
  const isPublic = formData.get('isPublic') === 'on'
  const avatarUrl = formData.get('avatarUrl') as string

  try {
    // Use upsert to create or update user profile
    const _result = await prisma.user.upsert({
      where: { id: user.id },
      update: {
        name,
        program,
        colorScheme,
        isPublic,
        image: avatarUrl || null,
      },
      create: {
        id: user.id,
        email: user.email!,
        name,
        program,
        colorScheme,
        isPublic,
        image: avatarUrl || null,
        updatedAt: new Date(),
      },
    })
  } catch (error) {
    console.error('Error creating/updating profile with Prisma:', error)

    // Check if it's a permissions error
    if (error instanceof Error && error.message.includes('permission denied')) {
      throw new Error('Database permission error - please check RLS policies')
    }

    throw new Error('Failed to update profile')
  }

  // Redirect OUTSIDE of try/catch block
  revalidatePath('/', 'layout')
  redirect('/courses')
}
