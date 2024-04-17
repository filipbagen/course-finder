// pages/api/search.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/db';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const searchQuery = url.searchParams.get('q') || '';
  const sort = url.searchParams.get('sort') || '';

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

  try {
    const courses = await prisma.courses.findMany({
      where: {
        OR: [
          { courseCode: { contains: searchQuery, mode: 'insensitive' } },
          { courseName: { contains: searchQuery, mode: 'insensitive' } },
        ],
      },
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
