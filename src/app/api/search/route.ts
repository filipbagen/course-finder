// pages/api/search.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const searchQuery = url.searchParams.get('q') || '';
  const sort = url.searchParams.get('sort') || '';
  const locations =
    url.searchParams
      .get('location')
      ?.split(',')
      .filter((l) => l) || [];

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

  let whereClause: Prisma.CoursesWhereInput = {
    OR: [
      { courseCode: { contains: searchQuery, mode: 'insensitive' } },
      { courseName: { contains: searchQuery, mode: 'insensitive' } },
    ],
  };

  // Only add the location filter if there are any locations specified
  if (locations.length > 0) {
    whereClause['location'] = { in: locations };
  }

  try {
    const courses = await prisma.courses.findMany({
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
