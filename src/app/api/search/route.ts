import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const searchQuery = (url.searchParams.get('q') || '').toLowerCase(); // Normalize the search query
  const sort = url.searchParams.get('sort') || '';

  type FilterKeys = keyof Prisma.CoursesWhereInput;
  type FilterValues = string[] | undefined;

  interface Filters {
    [key: string]: FilterValues;
  }

  // Retrieve filters from query parameters
  const filters = {
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

  // Set sorting options based on the query parameter
  let sortOptions = {};
  switch (sort) {
    case 'courseCode':
      sortOptions = { code: 'asc' };
      break;
    case 'courseCodeReversed':
      sortOptions = { code: 'desc' };
      break;
    case 'courseName':
      sortOptions = { name: 'asc' };
      break;
    case 'courseNameReverse':
      sortOptions = { name: 'desc' };
      break;
    default:
      sortOptions = {}; // Default case can be handled as no sorting or some default sorting
  }

  // Fetch all courses from the database
  let courses = await prisma.courses.findMany({
    include: {
      examinations: true,
    },
    orderBy: sortOptions,
  });

  // Apply the search query filter if there is a search query
  if (searchQuery) {
    courses = courses.filter(
      (course) =>
        course.name.toLowerCase().includes(searchQuery) ||
        course.code.toLowerCase().includes(searchQuery)
    );
  }

  // Apply the filters
  Object.entries(filters).forEach(([key, values]) => {
    if (values && values.length > 0) {
      if (['semester', 'period', 'block'].includes(key)) {
        courses = courses.filter((course) => {
          const courseValues = course[key as keyof typeof course] as number[];
          return courseValues.some((courseValue) =>
            values.map(Number).includes(courseValue)
          );
        });
      } else if (key === 'examinations' || key === 'mainFieldOfStudy') {
        courses = courses.filter(
          (course) =>
            Array.isArray(course[key]) &&
            course[key].some((value) => values.includes(String(value)))
        );
      } 
      else if (key === 'courseLevel') {
        const advancedOptions = values.map(
          (value) => value === 'Avancerad nivå'
        );
        // Filter courses that match any of the selected advanced levels
        courses = courses.filter((course) =>
          advancedOptions.includes(course.advanced)
        );
      } else if (key === 'campus') {
        courses = courses.filter((course) => String(course[key]) === values[0]);
      } else if (key === 'studyPace') {
        courses = courses.filter((course) =>
          values[0] === 'Helfart'
            ? course.period.length === 1
            : course.period.length >= 2
        );
      } else {
        courses = courses.filter((course) => {
          const courseValue = String(course[key as keyof typeof course]);
          return values.includes(courseValue);
        });
      }
    }
  });

  // Return the filtered courses
  return NextResponse.json(courses);
}
