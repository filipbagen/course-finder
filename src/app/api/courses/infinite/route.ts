import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Course } from '@/types/types';

export const dynamic = 'force-dynamic';

interface SearchParams {
  cursor?: string;
  limit?: string;
  search?: string;
  campus?: string;
  mainFieldOfStudy?: string;
  semester?: string;
  sortBy?: string;
  sortOrder?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search');
    const campus = searchParams.get('campus');
    const mainFieldOfStudy = searchParams.get('mainFieldOfStudy');
    const semester = searchParams.get('semester');
    const sortBy = searchParams.get('sortBy') || 'code';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Validate limit (max 50 for performance)
    const validLimit = Math.min(Math.max(limit, 1), 50);

    // Build where conditions
    const whereConditions: any = {};

    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (campus) {
      whereConditions.campus = campus;
    }

    if (mainFieldOfStudy) {
      whereConditions.mainFieldOfStudy = {
        has: mainFieldOfStudy,
      };
    }

    if (semester) {
      whereConditions.semester = {
        has: parseInt(semester),
      };
    }

    // Build orderBy
    const orderBy: any = {};
    if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else if (sortBy === 'credits') {
      orderBy.credits = sortOrder;
    } else if (sortBy === 'campus') {
      orderBy.campus = sortOrder;
    } else {
      orderBy.code = sortOrder;
    }

    // Add secondary sort for consistency
    const orderByArray = [orderBy];
    if (sortBy !== 'code') {
      orderByArray.push({ code: 'asc' });
    }
    orderByArray.push({ id: 'asc' }); // Final tie-breaker

    // Build query options
    const queryOptions: any = {
      where: whereConditions,
      orderBy: orderByArray,
      take: validLimit + 1, // Take one extra to check if there's a next page
      select: {
        id: true,
        code: true,
        name: true,
        credits: true,
        mainFieldOfStudy: true,
        advanced: true,
        semester: true,
        period: true,
        block: true,
        campus: true,
        content: true,
        scheduledHours: true,
        selfStudyHours: true,
        exclusions: true,
        offeredFor: true,
        prerequisites: true,
        recommendedPrerequisites: true,
        learningOutcomes: true,
        teachingMethods: true,
      },
    };

    // Add cursor-based pagination
    if (cursor) {
      queryOptions.cursor = {
        id: cursor,
      };
      queryOptions.skip = 1; // Skip the cursor item
    }

    // Execute query
    const courses = await prisma.course.findMany(queryOptions);

    // Check if there are more items
    const hasNextPage = courses.length > validLimit;
    const items = hasNextPage ? courses.slice(0, validLimit) : courses;

    // Get next cursor
    const nextCursor = hasNextPage ? items[items.length - 1]?.id : null;

    // Calculate total count for UI feedback (cached for performance)
    let totalCount = null;
    if (!cursor) {
      // Only count on first request to avoid expensive operations
      try {
        totalCount = await prisma.course.count({
          where: whereConditions,
        });
      } catch (error) {
        console.warn('Failed to get total count:', error);
      }
    }

    return NextResponse.json({
      items: items as Course[],
      nextCursor,
      hasNextPage,
      totalCount,
      count: items.length,
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
