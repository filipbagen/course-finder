// File: app/api/courses/[userId]/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/app/lib/db';
import { NextRequest } from 'next/server';

type Params = {
  userId: string;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  const { userId } = params;

  if (!userId) {
    return NextResponse.json(
      {
        error: 'User ID not provided',
      },
      { status: 400 }
    );
  }

  try {
    // Fetch enrollments with nested course data included and also include the enrollment details
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: userId,
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
  } catch (error) {
    return NextResponse.json(
      {
        error: 'An error occurred while fetching enrollments',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
