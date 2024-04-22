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

export async function GET(request: Request) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: 'No user logged in' }, { status: 401 });
  }

  const courses = await prisma.enrollment.findMany({
    where: {
      userId: user.id,
    },
  });

  return NextResponse.json({ courses });
}
