import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { UserSearchComponent } from '@/components/students/UserSearchComponent';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Users } from 'lucide-react';

// Import the type we need
interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  program: string | null;
  image: string | null;
  _count: {
    enrollment: number;
    review: number;
  };
}

import { programs } from '@/lib/programs';

async function getUsers(
  searchQuery?: string,
  programFilter?: string,
  sortBy?: string
) {
  try {
    const whereConditions: any = {
      isPublic: true,
    };

    // Add search filter
    if (searchQuery) {
      whereConditions.OR = [
        { name: { contains: searchQuery, mode: 'insensitive' } },
        { program: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }

    // Add program filter
    if (programFilter && programFilter !== 'all') {
      whereConditions.program = programFilter;
    }

    // Determine sort order
    let orderBy: any = { name: 'asc' }; // Default sort
    if (sortBy === 'reviews') {
      orderBy = { Review: { _count: 'desc' } };
    } else if (sortBy === 'enrollments') {
      orderBy = { Enrollment: { _count: 'desc' } };
    }

    const users = await prisma.user.findMany({
      where: whereConditions,
      select: {
        id: true,
        name: true,
        email: true,
        program: true,
        image: true,
        _count: {
          select: {
            enrollment: true,
            review: true,
          },
        },
      },
      orderBy,
      take: 50, // Limit results for performance
    });

    // The schema has been updated to make name required, so we can safely assert the type
    return users.map((user) => ({
      ...user,
      name: user.name!, // Type assertion - we know name is non-null
      _count: {
        enrollment: user._count.enrollment,
        review: user._count.review,
      },
    })) as UserSearchResult[];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

async function getAvailablePrograms() {
  // Return the static list of all available programs
  return Promise.resolve(programs);
}

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; program?: string; sort?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user exists in database
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) {
    console.error('User not found in database, signing out');
    await supabase.auth.signOut();
    redirect('/');
  }

  const params = await searchParams;
  const searchQuery = params.search;
  const programFilter = params.program;
  const sortBy = params.sort;

  const [users, availablePrograms] = await Promise.all([
    getUsers(searchQuery, programFilter, sortBy),
    getAvailablePrograms(),
  ]);

  return (
    <div className="flex flex-col gap-8 mx-auto">
      <div className="grid items-start gap-8">
        {/* Header */}
        <div className="flex items-center justify-between px-2">
          <div className="grid gap-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Hitta studenter
            </h1>
            <p className="text-muted-foreground">
              Utforska andra studenters profiler, se vilka kurser de läser och
              låt dig inspireras av deras studieplanering.
            </p>
          </div>
        </div>

        {/* Search and Results */}
        <Suspense
          fallback={
            <div className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            </div>
          }
        >
          <UserSearchComponent
            initialUsers={users}
            initialQuery={searchQuery}
            availablePrograms={availablePrograms}
            initialProgramFilter={programFilter}
            initialSortBy={sortBy}
          />
        </Suspense>
      </div>
    </div>
  );
}
