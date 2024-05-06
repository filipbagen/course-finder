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

  type ExtendedCoursesWhereInput = Prisma.CoursesWhereInput & {
    AND: Prisma.CoursesWhereInput[];
  };

  let whereClause: ExtendedCoursesWhereInput = {
    AND: [
      {
        OR: [
          { code: { contains: searchQuery, mode: 'insensitive' } },
          { name: { contains: searchQuery, mode: 'insensitive' } },
        ],
      },
    ],
  };

  // Adjust whereClause construction for complex fields like 'semester'
  Object.entries(filters).forEach(([key, values]) => {
    if (values && values.length > 0) {
      if (['semester', 'period', 'block'].includes(key)) {
        whereClause.AND.push({
          [key]: {
            hasSome: values.map(Number), // Assuming the values are numbers and need conversion from string
          },
        });
      } else if (key === 'examinations' || key === 'mainFieldOfStudy') {
        whereClause.AND.push({
          [key]: {
            hasSome: values, // Assuming the values are strings
          },
        });
      } else {
        (whereClause as any)[key] = { in: values };
      }
    }
  });

  try {
    const courses = await prisma.courses.findMany({
      include: {
        examinations: true,
      },
      where: whereClause,
      orderBy: sortOptions,
    });
    return NextResponse.json(courses);
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch courses' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
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
