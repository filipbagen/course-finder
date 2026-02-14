export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ScheduleClient from '@/features/schedule/schedule-client';
import { prisma } from '@/lib/prisma';

export default async function SchedulePage() {
  // Use server-side authentication like in students/[id]/page.tsx
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  // If no user is found, redirect to login
  if (!currentUser) {
    redirect('/login');
  }

  // Check if current user exists in database
  const dbUser = await prisma.user.findUnique({
    where: { id: currentUser.id },
  });

  if (!dbUser) {
    console.error('Current user not found in database, signing out');
    await supabase.auth.signOut();
    redirect('/');
  }

  // Pass user data to the client component
  return <ScheduleClient serverUser={dbUser} />;
}
