import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: 'No user logged in' }, { status: 401 });
  }

  const { courseId, semester } = await request.json();

  // Check if the enrollment already exists
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

  // Create a new enrollment if it doesn't exist
  const enrollment = await prisma.enrollment.create({
    data: {
      id: uuidv4() as string,
      userId: user.id as string,
      courseId: courseId as string,
      semester: semester as number,
    },
  });

  return NextResponse.json({ enrollment });
}

export async function GET(request: Request) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return NextResponse.json(
      {
        error: 'No user logged in',
      },
      { status: 401 }
    );
  }

  // Fetch enrollments with nested course data included and also include the enrollment details
  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId: user.id,
    },
    select: {
      id: true, // Include enrollment ID
      semester: true, // select the semester from the enrollment
      course: true, // Include the full course details
    },
  });

  // Transform the data to include the semester and enrollment ID specified in the enrollment
  const coursesWithEnrollmentData = enrollments.map((enrollment) => ({
    ...enrollment.course,
    semester: enrollment.semester, // Override the semester to the one in the enrollment
    enrollmentId: enrollment.id, // Add the enrollment ID
  }));

  return NextResponse.json({ courses: coursesWithEnrollmentData });
}

export async function PATCH(request: Request) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: 'No user logged in' }, { status: 401 });
  }

  const { enrollmentId, newSemester } = await request.json();

  const updatedEnrollment = await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: {
      semester: newSemester,
    },
  });

  return NextResponse.json({ updatedEnrollment });
}

export async function DELETE(request: Request) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: 'No user logged in' }, { status: 401 });
  }

  try {
    const requestBody = await request.json();
    const { enrollmentId } = requestBody; // Already expecting enrollmentId

    if (!enrollmentId) {
      console.error('Received undefined enrollmentId', requestBody);
      return NextResponse.json(
        { error: 'Invalid enrollmentId' },
        { status: 400 }
      );
    }

    console.log('Deleting enrollment with ID:', enrollmentId);

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
