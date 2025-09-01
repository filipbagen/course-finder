import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch a single course to examine its structure
    const course = await prisma.course.findFirst();

    // Log the raw data for debugging
    console.log(
      'Raw course data:',
      JSON.stringify(course, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    );

    // Transform BigInt to number for JSON serialization
    const transformedCourse = course
      ? {
          ...course,
          credits: Number(course.credits),
          scheduledHours: course.scheduledHours
            ? Number(course.scheduledHours)
            : null,
          selfStudyHours: course.selfStudyHours
            ? Number(course.selfStudyHours)
            : null,
          period: course.period.map((p) => Number(p)),
          block: course.block.map((b) => Number(b)),
          semester: course.semester ? Number(course.semester) : null,
        }
      : null;

    return NextResponse.json({
      success: true,
      rawSemesterType: course ? typeof course.semester : 'unknown',
      rawSemesterValue: course?.semester?.toString() || null,
      data: transformedCourse,
    });
  } catch (error) {
    console.error('Error fetching course for debugging:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch course data',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
