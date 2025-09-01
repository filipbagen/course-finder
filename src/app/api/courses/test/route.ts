import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch first 5 courses to verify connection
    const courses = await prisma.course.findMany({
      select: {
        code: true,
        name: true,
      },
      take: 5,
    });

    return NextResponse.json({
      message: 'Successfully connected to course table',
      courses,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
