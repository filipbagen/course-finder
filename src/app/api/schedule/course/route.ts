
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

// Type for enrollment with course included
type EnrollmentWithCourse = Prisma.EnrollmentGetPayload<{
  include: {
    course: {
      include: {
        examinations: true;
      };
    };
  };
}>;

/**
 * PUT /api/schedule/course
 * Update course placement in schedule
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, semester } = body;

    if (!courseId || !semester) {
      return NextResponse.json(
        { error: 'Missing required fields: courseId, semester' },
        { status: 400 }
      );
    }

    // Find the enrollment to update
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId: courseId,
      },
      include: {
        course: {
          include: {
            examinations: true,
          },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Update the enrollment
    const updatedEnrollment = await prisma.enrollment.update({
      where: {
        id: enrollment.id,
      },
      data: {
        semester,
      },
      include: {
        course: {
          include: {
            examinations: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: updatedEnrollment.course.id,
      code: updatedEnrollment.course.code,
      name: updatedEnrollment.course.name,
      content: updatedEnrollment.course.content,
      credits: updatedEnrollment.course.credits,
      scheduledHours: updatedEnrollment.course.scheduledHours,
      selfStudyHours: updatedEnrollment.course.selfStudyHours,
      mainFieldOfStudy: updatedEnrollment.course.mainFieldOfStudy,
      advanced: updatedEnrollment.course.advanced,
      semester: updatedEnrollment.course.semester,
      period: updatedEnrollment.course.period,
      block: updatedEnrollment.course.block,
      campus: updatedEnrollment.course.campus,
      exclusions: updatedEnrollment.course.exclusions,
      offeredFor: updatedEnrollment.course.offeredFor,
      prerequisites: updatedEnrollment.course.prerequisites,
      recommendedPrerequisites: updatedEnrollment.course.recommendedPrerequisites,
      learningOutcomes: updatedEnrollment.course.learningOutcomes,
      teachingMethods: updatedEnrollment.course.teachingMethods,
      examinations: updatedEnrollment.course.examinations,
      enrollment: {
        id: updatedEnrollment.id,
        semester: updatedEnrollment.semester,
        period: 1, // Default since not in schema
        status: 'enrolled', // Default since not in schema
        grade: null, // Not in schema
        enrolledAt: new Date(), // Default since not in schema
      },
    });
  } catch (error) {
    console.error('Error updating course schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, semester } = body;

    if (!courseId || !semester) {
      return NextResponse.json(
        { error: 'Missing required fields: courseId, semester' },
        { status: 400 }
      );
    }

    // Check if enrollment already exists
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId,
        semester,
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Already enrolled in this course for this semester' },
        { status: 400 }
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
        course: {
          include: {
            examinations: true,
          },
        },
      },
    }) as EnrollmentWithCourse;

    return NextResponse.json({
      id: enrollment.course.id,
      code: enrollment.course.code,
      name: enrollment.course.name,
      content: enrollment.course.content,
      credits: enrollment.course.credits,
      scheduledHours: enrollment.course.scheduledHours,
      selfStudyHours: enrollment.course.selfStudyHours,
      mainFieldOfStudy: enrollment.course.mainFieldOfStudy,
      advanced: enrollment.course.advanced,
      semester: enrollment.course.semester,
      period: enrollment.course.period,
      block: enrollment.course.block,
      campus: enrollment.course.campus,
      exclusions: enrollment.course.exclusions,
      offeredFor: enrollment.course.offeredFor,
      prerequisites: enrollment.course.prerequisites,
      recommendedPrerequisites: enrollment.course.recommendedPrerequisites,
      learningOutcomes: enrollment.course.learningOutcomes,
      teachingMethods: enrollment.course.teachingMethods,
      examinations: enrollment.course.examinations,
      enrollment: {
        id: enrollment.id,
        semester: enrollment.semester,
        period: 1, // Default since not in schema
        status: 'enrolled', // Default since not in schema
        grade: null, // Not in schema
        enrolledAt: new Date(), // Default since not in schema
      },
    });
  } catch (error) {
    console.error('Error adding course to schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
