// Import necessary modules and types
import { PrismaClient } from '@prisma/client';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// PATCH method to update the enrollment semester
export async function PATCH(request: Request) {
  // Get user session
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  // Check if user is logged in
  if (!user) {
    return NextResponse.json({ error: 'No user logged in' }, { status: 401 });
  }

  // Parse request body
  const { courseId, newSemester } = await request.json();

  try {
    // Find the enrollment by courseId and userId
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId: courseId,
      },
    });

    // If no enrollment found, return 404 error
    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Update the enrollment with the new semester
    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { semester: newSemester },
    });

    // Return the updated enrollment
    return NextResponse.json({ updatedEnrollment });
  } catch (error) {
    console.error('Failed to update course semester:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
