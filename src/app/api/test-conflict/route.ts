import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { transformCourse } from '@/lib/transformers';

export async function GET() {
  try {
    const enrolledCourseCode = 'TNM096';
    const viewedCourseCode = 'TDDC17';

    // 1. Fetch the full data for both courses
    const enrolledCourse = await prisma.course.findUnique({
      where: { code: enrolledCourseCode },
    });

    const viewedCourse = await prisma.course.findUnique({
      where: { code: viewedCourseCode },
    });

    if (!enrolledCourse || !viewedCourse) {
      return NextResponse.json(
        {
          error: 'One or both test courses not found in database.',
          enrolledCourseFound: !!enrolledCourse,
          viewedCourseFound: !!viewedCourse,
        },
        { status: 404 }
      );
    }

    // Use the same transformer as the app
    const transformedEnrolled = transformCourse(enrolledCourse);
    const transformedViewed = transformCourse(viewedCourse);

    if (!transformedEnrolled || !transformedViewed) {
      return NextResponse.json(
        {
          error: 'Failed to transform course data.',
        },
        { status: 500 }
      );
    }

    // 2. Simulate the conflict logic
    let isConflict = false;
    let conflictReason = '';

    // Check if viewed course excludes the enrolled one
    if (
      transformedViewed.exclusions &&
      transformedViewed.exclusions.includes(transformedEnrolled.code)
    ) {
      isConflict = true;
      conflictReason = `Viewed course ${transformedViewed.code} excludes enrolled course ${transformedEnrolled.code}.`;
    }

    // Check if enrolled course excludes the viewed one
    if (
      !isConflict &&
      transformedEnrolled.exclusions &&
      transformedEnrolled.exclusions.includes(transformedViewed.code)
    ) {
      isConflict = true;
      conflictReason = `Enrolled course ${transformedEnrolled.code} excludes viewed course ${transformedViewed.code}.`;
    }

    // 3. Return a detailed report
    return NextResponse.json({
      testDescription:
        'Checking for exclusion conflict between an "enrolled" course and a "viewed" course.',
      enrolledCourseCode,
      viewedCourseCode,
      isConflict,
      conflictReason: isConflict ? conflictReason : 'No conflict found.',
      data: {
        enrolledCourse: {
          code: transformedEnrolled.code,
          name: transformedEnrolled.name,
          exclusions: transformedEnrolled.exclusions,
        },
        viewedCourse: {
          code: transformedViewed.code,
          name: transformedViewed.name,
          exclusions: transformedViewed.exclusions,
        },
      },
    });
  } catch (error) {
    console.error('Conflict test failed:', error);
    return NextResponse.json(
      { error: 'An error occurred during the test.' },
      { status: 500 }
    );
  }
}
