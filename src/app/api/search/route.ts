// src/pages/api/courses.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/db';
import { Prisma, Courses } from '@prisma/client';

// Define the type for filter values as an optional array of strings.
type FilterValues = string[] | undefined;

// Filters interface mapping each key to its respective filter values.
interface Filters {
  [key: string]: FilterValues;
}

// Sort options type defining how sorting parameters should be structured.
interface SortOptions {
  [key: string]: Prisma.SortOrder;
}

// Asynchronously fetch courses from the database with optional search and filters.
const fetchCourses = async (
  searchQuery: string,
  sortOptions: SortOptions,
  filters: Filters
): Promise<Courses[]> => {
  // Initial fetch with possible sort orders.
  let courses = await prisma.courses.findMany({
    include: { examinations: true },
    orderBy: sortOptions,
  });

  // Filter courses based on the search query.
  if (searchQuery) {
    courses = courses.filter(
      (course) =>
        course.name.toLowerCase().includes(searchQuery) ||
        course.code.toLowerCase().includes(searchQuery)
    );
  }

  // Apply additional filters.
  return applyFilters(courses, filters);
};

// Apply filters to the course list based on the filter criteria.
const applyFilters = (courses: Courses[], filters: Filters): Courses[] => {
  // Iterate over each filter type and apply them to the course list.
  Object.entries(filters).forEach(([key, values]) => {
    if (values && values.length > 0) {
      courses = courses.filter((course) => {
        const courseValue = course[key as keyof Courses];
        // Handle array and non-array types appropriately.
        if (Array.isArray(courseValue)) {
          return values.some((value) =>
            (courseValue as Array<string | number>).includes(
              Number(value) || value
            )
          );
        }
        return values.includes(String(courseValue));
      });
    }
  });
  return courses;
};

// Determine sort options based on the provided sort parameter.
const getSortOptions = (sort: string): SortOptions => {
  switch (sort) {
    case 'courseCode':
      return { code: 'asc' };
    case 'courseCodeReversed':
      return { code: 'desc' };
    case 'courseName':
      return { name: 'asc' };
    case 'courseNameReverse':
      return { name: 'desc' };
    default:
      return {};
  }
};

// Main API route handler to process GET requests.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  // Retrieve search and sort parameters from the URL.
  const searchQuery = (url.searchParams.get('q') || '').toLowerCase();
  const sort = url.searchParams.get('sort') || '';

  // Build the filters object from URL parameters.
  const filters: Filters = {
    semester: url.searchParams.get('semester')?.split(',').filter(Boolean),
    period: url.searchParams.get('period')?.split(',').filter(Boolean),
    block: url.searchParams.get('block')?.split(',').filter(Boolean),
    studyPace: url.searchParams.get('studyPace')?.split(',').filter(Boolean),
    courseLevel: url.searchParams
      .get('courseLevel')
      ?.split(',')
      .filter(Boolean),
    mainFieldOfStudy: url.searchParams
      .get('mainFieldOfStudy')
      ?.split(',')
      .filter(Boolean),
    examinations: url.searchParams
      .get('examinations')
      ?.split(',')
      .filter(Boolean),
    campus: url.searchParams.get('campus')?.split(',').filter(Boolean),
  };

  // Determine the sorting options from the 'sort' parameter.
  const sortOptions = getSortOptions(sort);

  try {
    // Fetch and return filtered courses.
    const courses = await fetchCourses(searchQuery, sortOptions, filters);
    return NextResponse.json(courses);
  } catch (error) {
    console.error('Failed to fetch courses:', error);
    // Return an error response if the fetch fails.
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
