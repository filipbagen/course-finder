import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { transformCourse } from '@/lib/transformers';
import { randomUUID } from 'crypto';

// Force dynamic rendering to avoid static generation errors with cookies
export const dynamic = 'force-dynamic';

/**
 * PUT /api/schedule/course
 * Update course semester in schedule
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const body = await request.json();
    const { courseId, semester } = body;

    if (!courseId || !semester) {
      return NextResponse.json(
        { success: false, error: 'courseId and semester are required' },
        { status: 400 }
      );
    }

    console.log('API: Updating course semester:', {
      courseId,
      semester,
      userId: user.id,
    });

    // Find the enrollment to update
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId: courseId,
      },
      include: {
        course: true,
      },
    });

    if (!enrollment) {
      console.error('Enrollment not found for course:', courseId);
      return NextResponse.json(
        { success: false, error: 'Enrollment not found for this course' },
        { status: 404 }
      );
    }

    // Check if enrollment already exists in the target semester
    const existingInTargetSemester = await prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId: courseId,
        semester: semester,
        id: { not: enrollment.id },
      },
    });

    if (existingInTargetSemester) {
      console.error('Already enrolled in course for target semester:', {
        courseId,
        semester,
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Already enrolled in this course for this semester',
        },
        { status: 409 }
      );
    }

    // Update the enrollment semester
    const updatedEnrollment = await prisma.enrollment.update({
      where: {
        id: enrollment.id,
      },
      data: {
        semester: semester,
      },
      include: {
        course: true,
      },
    });

    // Transform the course for the response
    const transformedCourse = transformCourse(updatedEnrollment.course);

    const response = {
      success: true,
      course: {
        ...transformedCourse,
        enrollment: {
          id: updatedEnrollment.id,
          semester: updatedEnrollment.semester,
          userId: updatedEnrollment.userId,
          courseId: updatedEnrollment.courseId,
          period:
            transformedCourse && Array.isArray(transformedCourse.period)
              ? transformedCourse.period[0]
              : 1,
        },
      },
    };

    console.log('Course semester updated successfully:', {
      courseId,
      newSemester: semester,
    });

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    console.error('Error updating course semester:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update course semester',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/schedule/course
 * Add course to schedule
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const body = await request.json();
    const { courseId, semester } = body;

    if (!courseId || !semester) {
      return NextResponse.json(
        { success: false, error: 'courseId and semester are required' },
        { status: 400 }
      );
    }

    console.log('API: Adding course to schedule:', {
      courseId,
      semester,
      userId: user.id,
    });

    // Check if enrollment already exists
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId,
        semester,
      },
    });

    if (existingEnrollment) {
      console.error('Already enrolled in course for semester:', {
        courseId,
        semester,
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Already enrolled in this course for this semester',
        },
        { status: 409 }
      );
    }

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      console.error('Course not found:', courseId);
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    // Create new enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        id: randomUUID(),
        userId: user.id,
        courseId,
        semester,
      },
      include: {
        course: true,
      },
    });

    // Transform the course for the response
    const transformedCourse = transformCourse(enrollment.course);

    const response = {
      success: true,
      course: {
        ...transformedCourse,
        enrollment: {
          id: enrollment.id,
          semester: enrollment.semester,
          userId: enrollment.userId,
          courseId: enrollment.courseId,
          period:
            transformedCourse && Array.isArray(transformedCourse.period)
              ? transformedCourse.period[0]
              : 1,
        },
      },
    };

    console.log('Course added to schedule successfully:', {
      courseId,
      semester,
    });

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    console.error('Error adding course to schedule:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add course to schedule',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
