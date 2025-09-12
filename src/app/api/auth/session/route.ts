import { NextRequest, NextResponse } from 'next/server';
import { getOptionalUser } from '@/lib/auth';
import { withPrisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

// Force dynamic rendering to avoid static generation errors with cookies
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Create a reference ID for tracking this request in logs
  const requestId = uuidv4().substring(0, 8);
  console.log(`[${requestId}] Auth session request started`);

  try {
    // Get authenticated user
    const authUser = await getOptionalUser();

    if (!authUser) {
      console.log(`[${requestId}] No authenticated user found`);
      const response = NextResponse.json({
        user: null,
        requestId,
      });

      // Add cache control headers
      response.headers.set(
        'Cache-Control',
        'no-cache, no-store, must-revalidate'
      );
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');

      return response;
    }

    console.log(
      `[${requestId}] User authenticated, fetching profile: ${authUser.id.substring(
        0,
        6
      )}...`
    );

    // Get user details from database
    const result = await withPrisma(async (prisma) => {
      // Minimal select to improve performance
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

    console.log(`[${requestId}] User profile fetched successfully`);

    // Add cache control headers to prevent stale session data
    const response = NextResponse.json({
      user: result.user,
      requestId,
    });

    response.headers.set(
      'Cache-Control',
      'no-cache, no-store, must-revalidate'
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error(`[${requestId}] Error fetching session:`, error);

    // Create a user-friendly response
    const response = NextResponse.json(
      {
        error: 'Failed to fetch session',
        requestId,
        // Include additional debug info only in development
        details:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      { status: 500 }
    );

    // Add cache control headers
    response.headers.set(
      'Cache-Control',
      'no-cache, no-store, must-revalidate'
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  }
}
