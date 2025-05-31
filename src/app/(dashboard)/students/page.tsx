import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { UserSearchComponent } from '@/components/students/UserSearchComponent';
import { Skeleton } from '@/components/ui/skeleton';

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
      orderBy = { reviews: { _count: 'desc' } };
    } else if (sortBy === 'enrollments') {
      orderBy = { enrollments: { _count: 'desc' } };
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
            enrollments: true,
            reviews: true,
          },
        },
      },
      orderBy,
      take: 50, // Limit results for performance
    });

    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

async function getAvailablePrograms() {
  try {
    const programs = await prisma.user.findMany({
      where: {
        isPublic: true,
        program: {
          not: null,
        },
      },
      select: {
        program: true,
      },
      distinct: ['program'],
      orderBy: {
        program: 'asc',
      },
    });

    return programs
      .map((p) => p.program)
      .filter((program): program is string => program !== null);
  } catch (error) {
    console.error('Error fetching programs:', error);
    return [];
  }
}

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: { search?: string; program?: string; sort?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const searchQuery = searchParams.search;
  const programFilter = searchParams.program;
  const sortBy = searchParams.sort;

  const [users, availablePrograms] = await Promise.all([
    getUsers(searchQuery, programFilter, sortBy),
    getAvailablePrograms(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Hitta studenter
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Utforska andra studenters profiler, se vilka kurser de läser och
              låt dig inspireras av deras studieplanering.
            </p>
          </div>

          {/* Search and Results */}
          <Suspense
            fallback={
              <div className="space-y-6">
                <Skeleton className="h-12 w-full max-w-md mx-auto" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-48 w-full rounded-xl" />
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
    </div>
  );
}
