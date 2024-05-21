// Import necessary modules and types
import { PrismaClient } from '@prisma/client';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET method to fetch the user data
export async function GET() {
  // Get user session
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  console.log('User session:', user); // Debugging line

  // Check if user is logged in
  if (!user) {
    return NextResponse.json({ error: 'No user logged in' }, { status: 401 });
  }

  try {
    // Find the user by userId
    const userData = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        Enrollment: true, // Include related data if necessary
      },
    });

    // If no user found, return 404 error
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return the user data
    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
