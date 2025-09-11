import { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { Toaster } from '@/components/ui/sonner';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/shared/Navbar';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Check authentication
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect('/login');
  }

  // Get user data from database
  let dbUser;
  try {
    dbUser = await prisma.user.findUnique({
      where: { id: data.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        colorScheme: true,
        isPublic: true,
        program: true,
      },
    });

    // If user doesn't exist in database, they may have been deleted
    // Sign them out and redirect to home page
    if (!dbUser) {
      await supabase.auth.signOut();
      redirect('/');
    }
  } catch (error) {
    redirect('/error');
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {children}
      </main>
      <Toaster />
    </>
  );
}
