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
  period?: string;
  block?: string;
  studyPace?: string;
  courseLevel?: string;
  examinations?: string;
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
    const period = searchParams.get('period');
    const block = searchParams.get('block');
    const studyPace = searchParams.get('studyPace');
    const courseLevel = searchParams.get('courseLevel');
    const examinations = searchParams.get('examinations');
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
      const campusValues = campus.split(',');
      if (campusValues.length > 1) {
        whereConditions.campus = { in: campusValues };
      } else {
        whereConditions.campus = campus;
      }
    }

    if (mainFieldOfStudy) {
      const fieldValues = mainFieldOfStudy.split(',');
      if (fieldValues.length > 1) {
        whereConditions.mainFieldOfStudy = {
          hasSome: fieldValues,
        };
      } else {
        whereConditions.mainFieldOfStudy = {
          has: mainFieldOfStudy,
        };
      }
    }

    if (semester) {
      const semesterValues = semester.split(',').map((s) => parseInt(s));
      if (semesterValues.length > 1) {
        whereConditions.semester = {
          hasSome: semesterValues,
        };
      } else {
        whereConditions.semester = {
          has: semesterValues[0],
        };
      }
    }

    if (period) {
      const periodValues = period.split(',').map((p) => parseInt(p));
      if (periodValues.length > 1) {
        whereConditions.period = {
          hasSome: periodValues,
        };
      } else {
        whereConditions.period = {
          has: periodValues[0],
        };
      }
    }

    if (block) {
      const blockValues = block.split(',').map((b) => parseInt(b));
      if (blockValues.length > 1) {
        whereConditions.block = {
          hasSome: blockValues,
        };
      } else {
        whereConditions.block = {
          has: blockValues[0],
        };
      }
    }

    if (courseLevel) {
      const levelValues = courseLevel.split(',');
      if (
        levelValues.includes('Grundnivå') &&
        levelValues.includes('Avancerad nivå')
      ) {
        // Both levels selected, no filter needed
      } else if (levelValues.includes('Grundnivå')) {
        whereConditions.advanced = false;
      } else if (levelValues.includes('Avancerad nivå')) {
        whereConditions.advanced = true;
      }
    }

    if (studyPace) {
      const paceValues = studyPace.split(',');
      if (paceValues.includes('Helfart') && paceValues.includes('Halvfart')) {
        // Both paces selected, no filter needed
      } else if (paceValues.includes('Helfart')) {
        // Full-time: period length = 1 and credits > 6, or period length = 2 and credits > 6
        whereConditions.OR = whereConditions.OR || [];
        whereConditions.OR.push({
          AND: [{ period: { isEmpty: false } }, { credits: { gt: 6 } }],
        });
      } else if (paceValues.includes('Halvfart')) {
        // Half-time: period length = 2 and credits = 6
        whereConditions.AND = whereConditions.AND || [];
        whereConditions.AND.push({
          period: { hasEvery: [1, 2] },
          credits: 6,
        });
      }
    }

    // Note: examinations filter would require a join with examinations table
    // For now, we'll skip this as it's more complex and may not be in current schema

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
