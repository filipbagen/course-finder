import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/db';

export async function GET(request: NextRequest) {
  // Fetch all courses from the database
  let users = await prisma.user.findMany({
    where: {
      isPublic: true,
    },
  });

  // Return the filtered courses
  return NextResponse.json(users);
}
