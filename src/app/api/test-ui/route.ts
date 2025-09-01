import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch a course to use for UI testing
    const course = await prisma.course.findFirst({
      select: {
        id: true,
        code: true,
        name: true,
        credits: true,
        campus: true,
        mainFieldOfStudy: true,
        advanced: true,
        courseType: true,
        period: true,
        block: true,
        scheduledHours: true,
        selfStudyHours: true,
        semester: true,
        offeredFor: true,
      },
    });

    if (!course) {
      return NextResponse.json({ error: 'No courses found' }, { status: 404 });
    }

    // Transform BigInt to number for JSON serialization
    const transformedCourse = {
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
      semester: Number(course.semester), // Convert semester BigInt to number
    };

    return NextResponse.json({
      success: true,
      course: transformedCourse,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}
