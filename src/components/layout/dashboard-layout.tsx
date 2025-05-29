import { ReactNode } from 'react'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import { Toaster } from '@/components/ui/sonner'
import { redirect } from 'next/navigation'
import ClientNavbar from '@/components/shared/ClientNavbar'

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  // Check authentication
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    console.log('Dashboard layout: No authenticated user, redirecting to login')
    redirect('/login')
  }

  // Get user data from database
  let dbUser
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
    })

    // If user doesn't exist in database, redirect to onboarding
    if (!dbUser) {
      console.log('User not found in database, redirecting to onboarding')
      redirect('/onboarding')
    }
  } catch (error) {
    console.error('Error fetching user from database:', error)
    redirect('/error')
  }

  return (
    <>
      <ClientNavbar user={data.user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {children}
      </main>
      <Toaster />
    </>
  )
}