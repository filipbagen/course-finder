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
      enrollmentId: uuidv4(),
      userId: user.id,
      courseId: courseId,
      semester: semester.toString(),
    },
  });
  return NextResponse.json({ enrollment });
}

// export async function GET(request: Request) {
//   const { getUser } = getKindeServerSession();
//   const user = await getUser();

//   if (!user) {
//     return NextResponse.json({ error: 'No user logged in' }, { status: 401 });
//   }

//   // Fetch enrollments with nested course data included
//   const enrollments = await prisma.enrollment.findMany({
//     where: {
//       userId: user.id,
//     },
//     include: {
//       course: true, // Include the course details directly in the query
//     },
//   });

//   // As the course details are already included, just map them out
//   const courses = enrollments.map((enrollment) => enrollment.course);

//   return NextResponse.json({ courses });
// }

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
