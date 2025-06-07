// next
import { Suspense } from 'react';

// components
import { InfiniteCoursesList } from '@/components/course/InfiniteCoursesList';
import { CourseSearchAndFilter } from '@/components/course/CourseSearchAndFilter';

// shadcn
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// supabase
import { createClient } from '@/lib/supabase/server';

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
  const sortBy =
    typeof resolvedSearchParams.sortBy === 'string'
      ? resolvedSearchParams.sortBy
      : undefined;
  const sortOrder =
    typeof resolvedSearchParams.sortOrder === 'string'
      ? resolvedSearchParams.sortOrder
      : undefined;

  const user = await getAuthenticatedUser();
  const isAuthenticated = !!user;

  return (
    <div className="flex flex-col gap-8 mx-auto px-4">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Kurser</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid items-start gap-8">
        {/* Header */}
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
        </div>

        {/* Search and Filter */}
        <CourseSearchAndFilter />

        {/* Infinite Courses List */}
        <InfiniteCoursesList
          isAuthenticated={isAuthenticated}
          search={search}
          campus={campus}
          mainFieldOfStudy={field}
          semester={semester}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      </div>
    </div>
  );
}
