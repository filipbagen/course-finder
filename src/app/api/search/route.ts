import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const searchQuery = url.searchParams.get('q') || '';
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
    location: url.searchParams.get('location')?.split(',').filter(Boolean),
  };

  let sortOptions = {};
  switch (sort) {
    case 'courseCode':
      sortOptions = { courseCode: 'asc' };
      break;
    case 'courseCodeReversed':
      sortOptions = { courseCode: 'desc' };
      break;
    case 'courseName':
      sortOptions = { courseName: 'asc' };
      break;
    case 'courseNameReverse':
      sortOptions = { courseName: 'desc' };
      break;
  }

  // Fetch all courses from the database
  let courses = await prisma.courses.findMany({
    include: {
      examinations: true,
    },
    orderBy: sortOptions,
  });

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
      } else if (key === 'courseLevel') {
        const advancedOptions = values.map(
          (value) => value === 'Avancerad nivå'
        );
        // Filter courses that match any of the selected advanced levels
        courses = courses.filter((course) =>
          advancedOptions.includes(course.advanced)
        );
      } else if (key === 'location') {
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

// import { NextRequest, NextResponse } from 'next/server';
// import prisma from '@/app/lib/db';

// export async function GET(request: NextRequest) {
//   const url = new URL(request.url);
//   const searchQuery = url.searchParams.get('q') || '';
//   const semester = url.searchParams.get('semester');
//   const period = url.searchParams.get('period');
//   const block = url.searchParams.get('block');
//   const location = url.searchParams.get('location');

//   // Prepare filters based on provided query parameters
//   const filters: any = {
//     OR: [
//       { code: { contains: searchQuery, mode: 'insensitive' } },
//       { name: { contains: searchQuery, mode: 'insensitive' } },
//     ],
//   };

//   // Add filtering conditions dynamically based on the presence of query parameters
//   if (semester) filters.semester = { in: semester.split(',').map(Number) };
//   if (period) filters.period = { in: period.split(',').map(Number) };
//   if (block) filters.block = { in: block.split(',').map(Number) };
//   if (location) filters.location = { equals: location };

//   try {
//     const courses = await prisma.courses.findMany({
//       where: filters,
//     });
//     return NextResponse.json(courses);
//   } catch (error) {
//     return new NextResponse(
//       JSON.stringify({ error: 'Failed to fetch courses' }),
//       {
//         status: 500,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       }
//     );
//   }
// }

// BASIC
// /api/search/route.ts
// Assuming this is an Edge function based on your usage of `NextRequest` and `NextResponse`
// import { NextRequest, NextResponse } from 'next/server';
// import { Prisma, PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// export async function GET(request: NextRequest) {
//   try {
//     const courses = await prisma.courses.findMany({
//       where: {
//         semester: {
//           has: 7 || 9,
//         },
//         period: {
//           has: 1 && 2,
//         },
//         block: {
//           has: 1,
//         },
//       },
//     });
//     return new NextResponse(JSON.stringify(courses), {
//       status: 200,
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });
//   } catch (error) {
//     console.error('Error fetching courses:', error);
//     return new NextResponse(
//       JSON.stringify({ error: 'Failed to fetch courses' }),
//       {
//         status: 500,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       }
//     );
//   }
// }
