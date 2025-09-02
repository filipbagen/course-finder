import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, infiniteError, badRequest } from '@/lib/errors';
import { CourseSearchSchema, validateQueryParams } from '@/lib/validation';
import type { ApiResponse, InfiniteResponse } from '@/types/api';
import { Course } from '@/types/types';
import { transformCourses } from '@/lib/transformers';

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

export async function GET(
  request: NextRequest
): Promise<NextResponse<InfiniteResponse<Course>>> {
  try {
    const { searchParams } = new URL(request.url);

    console.log(
      'Received search params:',
      Object.fromEntries(searchParams.entries())
    );

    // Validate query parameters
    const params = validateQueryParams(searchParams, CourseSearchSchema);

    console.log('Validated params:', params);

    const cursor = params.cursor;
    const limit = Math.min(Math.max(params.limit || 20, 1), 50);
    const search = params.search;
    const campus = params.campus;
    const mainFieldOfStudy = params.mainFieldOfStudy;
    const semester = params.semester;
    const period = params.period;
    const block = params.block;
    const studyPace = params.studyPace;
    const courseLevel = params.courseLevel;
    const examinations = params.examinations;
    const sortBy = params.sortBy || 'code';
    const sortOrder = params.sortOrder || 'asc';

    // Build where conditions
    const whereConditions: any = {};

    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
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
      try {
        const semesterValues = semester.split(',').map((s) => {
          const parsed = parseInt(s, 10);
          if (isNaN(parsed)) {
            throw new Error(`Invalid semester value: ${s}`);
          }
          return BigInt(parsed);
        });

        if (semesterValues.length > 1) {
          whereConditions.semester = {
            hasSome: semesterValues,
          };
        } else {
          whereConditions.semester = {
            has: semesterValues[0],
          };
        }
      } catch (error) {
        console.error('Error parsing semester values:', error);
        throw new Error(`Invalid semester parameter: ${semester}`);
      }
    }

    if (period) {
      try {
        const periodValues = period.split(',').map((p) => {
          const parsed = parseInt(p, 10);
          if (isNaN(parsed)) {
            throw new Error(`Invalid period value: ${p}`);
          }
          return BigInt(parsed);
        });

        if (periodValues.length > 1) {
          whereConditions.period = {
            hasSome: periodValues,
          };
        } else {
          whereConditions.period = {
            has: periodValues[0],
          };
        }
      } catch (error) {
        console.error('Error parsing period values:', error);
        throw new Error(`Invalid period parameter: ${period}`);
      }
    }

    if (block) {
      try {
        const blockValues = block.split(',').map((b) => {
          const parsed = parseInt(b, 10);
          if (isNaN(parsed)) {
            throw new Error(`Invalid block value: ${b}`);
          }
          return BigInt(parsed);
        });

        if (blockValues.length > 1) {
          whereConditions.block = {
            hasSome: blockValues,
          };
        } else {
          whereConditions.block = {
            has: blockValues[0],
          };
        }
      } catch (error) {
        console.error('Error parsing block values:', error);
        throw new Error(`Invalid block parameter: ${block}`);
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

    if (examinations) {
      const examinationValues = examinations.split(',');
      whereConditions.OR = whereConditions.OR || [];

      examinationValues.forEach((examValue) => {
        whereConditions.OR.push({
          examination: {
            array_contains: [
              {
                gradingScale: { contains: examValue, mode: 'insensitive' },
              },
            ],
          },
        });
      });
    }

    if (studyPace) {
      const paceValues = studyPace.split(',');
      if (paceValues.includes('Helfart') && paceValues.includes('Halvfart')) {
        // Both paces selected, no filter needed
      } else if (paceValues.includes('Helfart')) {
        // Full-time: course runs in only one period
        // We create a JSON query to check the length of the period array
        whereConditions.OR = whereConditions.OR || [];
        whereConditions.OR.push({
          OR: [
            // Either it only has period 1
            { period: { equals: [BigInt(1)] } },
            // Or it only has period 2
            { period: { equals: [BigInt(2)] } },
          ],
        });
      } else if (paceValues.includes('Halvfart')) {
        // Half-time: course runs in two periods (period array contains both 1 and 2)
        whereConditions.AND = whereConditions.AND || [];

        // It must have exactly two periods, containing both 1 and 2
        whereConditions.AND.push({
          AND: [{ period: { has: BigInt(1) } }, { period: { has: BigInt(2) } }],
        });
      }
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
      take: limit + 1, // Take one extra to check if there's a next page
      select: {
        id: true,
        code: true,
        name: true,
        credits: true,
        mainFieldOfStudy: true,
        advanced: true,
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
        courseType: true,
        examiner: true,
        examination: true,
        programInfo: true,
        semester: true, // Add semester field to select
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
    console.log(
      'Query options:',
      JSON.stringify(
        queryOptions,
        (key, value) => (typeof value === 'bigint' ? value.toString() : value),
        2
      )
    );

    const courses = await prisma.course.findMany(queryOptions);

    // Transform data with our utility function
    const transformedCourses = transformCourses(courses);

    // Check if there are more items
    const hasNextPage = transformedCourses.length > limit;
    const items = hasNextPage
      ? transformedCourses.slice(0, limit)
      : transformedCourses;

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
      success: true,
      data: items as unknown as Course[],
      nextCursor,
      hasNextPage,
      totalCount,
      count: items.length,
    } as InfiniteResponse<Course>);
  } catch (error) {
    console.error('Error fetching courses:', error);

    // Include more detailed error information
    let errorMessage = 'Failed to fetch courses';
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('Error stack:', error.stack);
    }

    // Return a more informative error response
    return infiniteError(errorMessage);
  }
}
