import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { UserSearchComponent } from '@/components/students/UserSearchComponent';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Users } from 'lucide-react';

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
  searchParams: Promise<{ search?: string; program?: string; sort?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
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
    <div className="flex flex-col gap-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Studenter</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Hitta studenter
            </h1>
            <p className="text-muted-foreground">
              Utforska andra studenters profiler, se vilka kurser de läser och
              låt dig inspireras av deras studieplanering.
            </p>
          </div>
        </div>
      </div>

      <Separator />

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
  );
}
