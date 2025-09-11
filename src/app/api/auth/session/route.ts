import { NextRequest, NextResponse } from 'next/server';
import { getOptionalUser } from '@/lib/auth';
import { withPrisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getOptionalUser();

    if (!authUser) {
      return NextResponse.json({
        user: null,
      });
    }

    // Create a reference ID for tracking this request in logs
    const requestId = uuidv4().substring(0, 8);

    // Get user details from database using our robust withPrisma wrapper
    const result = await withPrisma(async (prisma) => {
      const user = await prisma.user.findUnique({
        where: { id: authUser.id },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          program: true,
          colorScheme: true,
          isPublic: true,
        },
      });

      return { user };
    });

    // Add cache control headers to prevent stale session data
    const response = NextResponse.json({
      user: result.user,
    });

    response.headers.set(
      'Cache-Control',
      'no-cache, no-store, must-revalidate'
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}
