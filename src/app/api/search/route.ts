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
          { courseCode: { contains: searchQuery, mode: 'insensitive' } },
          { courseName: { contains: searchQuery, mode: 'insensitive' } },
        ],
      },
    ],
  };

  // Adjust whereClause construction for complex fields like 'semester'
  Object.entries(filters).forEach(([key, values]) => {
    if (
      values &&
      values.length > 0 &&
      ['semester', 'period', 'block'].includes(key)
    ) {
      // Create a condition for each value to check if it's part of the comma-separated string
      whereClause.AND.push({
        OR: values.map((value) => ({
          [key]: {
            contains: value,
            mode: 'insensitive',
          },
        })),
      });
    } else if (values && values.length > 0) {
      (whereClause as any)[key] = { in: values };
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
