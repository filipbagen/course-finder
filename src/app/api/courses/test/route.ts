import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch first 5 courses to verify connection
    const courses = await prisma.course.findMany({
      select: {
        code: true,
        name: true,
        semester: true, // Add semester to the selection
      },
      take: 5,
    });

    // Transform BigInt to number for JSON serialization
    const transformedCourses = courses.map((course) => ({
      ...course,
      semester: Number(course.semester), // Convert semester BigInt to number
    }));

    return NextResponse.json({
      message: 'Successfully connected to course table',
      courses: transformedCourses,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
