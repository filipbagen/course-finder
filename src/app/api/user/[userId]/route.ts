// Import necessary modules and types
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

interface Params {
  userId: string;
}

// GET method to fetch the user data by ID
export async function GET(request: Request, { params }: { params: Params }) {
  const { userId } = params;

  console.log('User ID:', userId); // Debugging line

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    // Find the user by userId
    const userData = await prisma.user.findUnique({
      where: {
        id: userId,
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
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
