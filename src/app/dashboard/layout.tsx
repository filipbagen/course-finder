import { ReactNode } from 'react';
import { createServerSupabaseClient } from '../../../lib/supabase';
import prisma from '../../../lib/db';
import { Toaster } from '@/components/ui/sonner';
import { redirect } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import ClientNavbar from '../components/ClientNavbar';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Prevent caching
  noStore();
  
  // Check authentication
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();
  
  if (error || !data.user) {
    console.log('Dashboard layout: No authenticated user, redirecting to home');
    redirect('/');
  }
  
  // Ensure user exists in database
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: data.user.id },
    });
    
    if (!dbUser) {
      console.log('Creating missing user record in database');
      await prisma.user.create({
        data: {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || data.user.user_metadata?.full_name || '',
          image: data.user.user_metadata?.avatar_url,
        },
      });
    }
  } catch (error) {
    console.error('Error checking/creating user:', error);
    // Continue anyway - the auth callback should normally create the user
  }
  
  return (
    <>
      <ClientNavbar user={data.user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {children}
      </main>
      <Toaster />
    </>
  );
}
