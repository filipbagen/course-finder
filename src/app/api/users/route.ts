import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { infiniteError } from '@/lib/errors';

interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  program: string | null;
  image: string | null;
  _count: {
    enrollment: number;
    review: number;
  };
}

interface UserSearchResponse {
  success: boolean;
  data: UserSearchResult[];
  count: number;
}

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest
): Promise<NextResponse<UserSearchResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const program = searchParams.get('program') || '';
    const sortBy = searchParams.get('sortBy') || 'name';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    // Build where conditions
    const whereConditions: any = {
      isPublic: true,
    };

    // Add search filter
    if (search.trim()) {
      whereConditions.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { program: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    // Add program filter
    if (program && program !== 'all') {
      whereConditions.program = program;
    }

    // Determine sort order
    let orderBy: any = { name: 'asc' }; // Default sort
    if (sortBy === 'reviews') {
      orderBy = { Review: { _count: 'desc' } };
    } else if (sortBy === 'enrollments') {
      orderBy = { Enrollment: { _count: 'desc' } };
    }

    const users = await prisma.user.findMany({
      where: whereConditions,
      select: {
        id: true,
        name: true,
        email: true,
        program: true,
        image: true,
        _count: {
          select: {
            enrollment: true,
            review: true,
          },
        },
      },
      orderBy,
      take: limit,
    });

    // Transform data to ensure name is non-null
    const transformedUsers: UserSearchResult[] = users.map((user) => ({
      ...user,
      name: user.name!, // Type assertion - we know name is non-null
      _count: {
        enrollment: user._count.enrollment,
        review: user._count.review,
      },
    }));

    const result: UserSearchResponse = {
      success: true,
      data: transformedUsers,
      count: transformedUsers.length,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching users:', error);
    let errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return infiniteError(errorMessage);
  }
}
