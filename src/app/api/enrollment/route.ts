import { PrismaClient } from '@prisma/client';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No user logged in' }, { status: 401 });
    }

    const { courseId, semester } = await request.json();

    if (!courseId || !semester) {
      return NextResponse.json(
        { error: 'CourseId and semester are required' },
        { status: 400 }
      );
    }

    // Check if enrollment already exists for this course and semester
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId: courseId,
        semester: semester,
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Enrollment already exists for this course and semester' },
        { status: 409 }
      );
    }

    // Check if user is enrolled in this course in a different semester
    const existingCourseEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId: courseId,
      },
    });

    if (existingCourseEnrollment) {
      // Update the existing enrollment with the new semester
      const updatedEnrollment = await prisma.enrollment.update({
        where: { id: existingCourseEnrollment.id },
        data: { semester: semester },
      });
      return NextResponse.json({ enrollment: updatedEnrollment });
    }

    // Create new enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        courseId: courseId,
        semester: semester,
      },
    });

    return NextResponse.json({ enrollment });
  } catch (error) {
    console.error('Failed to create enrollment:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No user logged in' }, { status: 401 });
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || user.id;

    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        semester: true,
        course: true,
      },
    });

    const coursesWithEnrollmentData = enrollments.map((enrollment) => ({
      ...enrollment.course,
      semester: enrollment.semester,
      enrollmentId: enrollment.id,
    }));

    return NextResponse.json({ courses: coursesWithEnrollmentData });
  } catch (error) {
    console.error('Failed to fetch enrollments:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No user logged in' }, { status: 401 });
    }

    const { enrollmentId } = await request.json();

    if (!enrollmentId) {
      return NextResponse.json(
        { error: 'Invalid enrollmentId' },
        { status: 400 }
      );
    }

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!existingEnrollment || existingEnrollment.userId !== user.id) {
      return NextResponse.json(
        { error: 'Enrollment not found or access denied' },
        { status: 404 }
      );
    }

    await prisma.enrollment.delete({
      where: { id: enrollmentId },
    });

    return NextResponse.json({ message: 'Enrollment deleted successfully' });
  } catch (error) {
    console.error('Failed to delete enrollment:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No user logged in' }, { status: 401 });
    }

    const { enrollmentId, newSemester } = await request.json();

    if (!enrollmentId || !newSemester) {
      return NextResponse.json(
        { error: 'EnrollmentId and newSemester are required' },
        { status: 400 }
      );
    }

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!existingEnrollment || existingEnrollment.userId !== user.id) {
      return NextResponse.json(
        { error: 'Enrollment not found or access denied' },
        { status: 404 }
      );
    }

    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        semester: newSemester,
      },
    });

    return NextResponse.json({ updatedEnrollment });
  } catch (error) {
    console.error('Failed to update enrollment:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
