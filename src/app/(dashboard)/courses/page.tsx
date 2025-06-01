// next
import { Suspense } from 'react';
import Link from 'next/link';

// components
import CourseCard from '@/components/course/CourseCard';

// shadcn
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// supabase & prisma
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

// types
import { Course } from '@/types/types';

async function getCourses(
  searchQuery?: string,
  campus?: string,
  mainFieldOfStudy?: string,
  semester?: string
): Promise<Course[]> {
  try {
    const whereConditions: any = {};

    // Add search filter
    if (searchQuery) {
      whereConditions.OR = [
        { name: { contains: searchQuery, mode: 'insensitive' } },
        { code: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }

    // Add campus filter
    if (campus) {
      whereConditions.campus = campus;
    }

    // Add main field of study filter
    if (mainFieldOfStudy) {
      whereConditions.mainFieldOfStudy = {
        has: mainFieldOfStudy,
      };
    }

    // Add semester filter
    if (semester) {
      whereConditions.semester = {
        has: parseInt(semester),
      };
    }

    const courses = await prisma.course.findMany({
      where: whereConditions,
      orderBy: [{ code: 'asc' }, { name: 'asc' }],
      take: 100, // Increased limit for better browsing
    });

    return courses as Course[];
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}

async function getAuthenticatedUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

function CoursesLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg" />
      ))}
    </div>
  );
}

interface CoursesListProps {
  courses: Course[];
  isAuthenticated: boolean;
}

function CoursesList({ courses, isAuthenticated }: CoursesListProps) {
  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Inga kurser hittades
        </h3>
        <p className="text-gray-500">
          Det verkar som att det inte finns några kurser att visa just nu.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          isAuthenticated={isAuthenticated}
        />
      ))}
    </div>
  );
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;

  const search =
    typeof resolvedSearchParams.search === 'string'
      ? resolvedSearchParams.search
      : undefined;
  const campus =
    typeof resolvedSearchParams.campus === 'string'
      ? resolvedSearchParams.campus
      : undefined;
  const field =
    typeof resolvedSearchParams.field === 'string'
      ? resolvedSearchParams.field
      : undefined;
  const semester =
    typeof resolvedSearchParams.semester === 'string'
      ? resolvedSearchParams.semester
      : undefined;

  const [courses, user] = await Promise.all([
    getCourses(search, campus, field, semester),
    getAuthenticatedUser(),
  ]);

  const isAuthenticated = !!user;

  return (
    <div className="flex flex-col gap-8 mx-auto px-4">
      <div className="grid items-start gap-8">
        <div className="flex items-center justify-between px-2">
          <div className="grid gap-1">
            <h1 className="text-3xl font-bold">Utforska kurser</h1>
            <p className="text-muted-foreground">
              Bläddra genom tillgängliga kurser och{' '}
              {isAuthenticated
                ? 'lägg till dem i ditt schema'
                : 'logga in för att lägga till dem i ditt schema'}
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {courses.length} kurser
          </div>
        </div>

        <Suspense fallback={<CoursesLoading />}>
          <CoursesList courses={courses} isAuthenticated={isAuthenticated} />
        </Suspense>
      </div>
    </div>
  );
}
