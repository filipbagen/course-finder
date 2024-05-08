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

  // Your logic to create a new enrollment goes here
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
      semester: true, // select the semester from the enrollment
      course: true, // Include the full course details
    },
  });

  // Transform the data to include the semester specified in the enrollment
  const coursesWithEnrollmentSemester = enrollments.map((enrollment) => ({
    ...enrollment.course,
    semester: enrollment.semester, // Override the semester to the one in the enrollment
  }));

  return NextResponse.json({ courses: coursesWithEnrollmentSemester });
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
