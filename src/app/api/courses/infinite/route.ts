import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
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

    let hasExaminationFilter = false;
    let examinationCodes: string[] = [];

    if (examinations) {
      hasExaminationFilter = true;
      const examinationValues = examinations.split(',');

      examinationValues.forEach((examValue) => {
        // Map the user-friendly examination names to the actual examination codes
        switch (examValue) {
          case 'Inlämningsuppgift':
            examinationCodes.push('UPG');
            break;
          case 'Skriftlig tentamen':
            examinationCodes.push('TEN');
            examinationCodes.push('TENA');
            break;
          case 'Projektarbete':
            examinationCodes.push('PRA');
            examinationCodes.push('PROJ');
            break;
          case 'Laborationsarbete':
            examinationCodes.push('LAB');
            examinationCodes.push('LABA');
            break;
          case 'Digital tentamen':
            examinationCodes.push('DIT');
            break;
          case 'Muntlig examination':
            examinationCodes.push('MUN');
            break;
          case 'Kontrollskrivning':
            examinationCodes.push('KTR');
            break;
          case 'Basgruppsarbete':
            examinationCodes.push('BAS');
            break;
          case 'Hemtentamen':
            examinationCodes.push('HEM');
            break;
          case 'Övrigt':
            examinationCodes.push('DAK');
            examinationCodes.push('MOM');
            examinationCodes.push('ANN');
            break;
          case 'Seminarium':
            examinationCodes.push('SEM');
            break;
          case 'Datorexamination':
            examinationCodes.push('DAT');
            break;
          default:
            examinationCodes.push(examValue); // Fallback to using the value as-is
        }
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

    // Build query options to fetch all courses matching the base filters
    const queryOptions: any = {
      where: whereConditions,
      orderBy: orderByArray,
      // No limit or cursor here; we fetch all and paginate in memory
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
        semester: true,
      },
    };

    console.log(
      'Fetching all courses with options:',
      JSON.stringify(
        queryOptions,
        (key, value) => (typeof value === 'bigint' ? value.toString() : value),
        2
      )
    );

    const allCourses = await prisma.course.findMany(queryOptions);

    // Transform data with our utility function
    let filteredCourses = transformCourses(allCourses) as unknown as Course[];

    // Apply post-query examination filtering if needed
    if (hasExaminationFilter && examinationCodes.length > 0) {
      console.log(
        'Applying in-memory examination filtering with codes:',
        examinationCodes
      );
      filteredCourses = filteredCourses.filter((course) => {
        if (
          !course.examination ||
          !Array.isArray(course.examination) ||
          course.examination.length === 0
        ) {
          return false;
        }

        for (const exam of course.examination) {
          if (!exam || typeof exam !== 'object') continue;

          const examObj = exam as { code?: string };
          const examCode = examObj.code ? String(examObj.code) : '';

          if (!examCode) continue;

          for (const searchCode of examinationCodes) {
            if (examCode.toUpperCase().startsWith(searchCode.toUpperCase())) {
              return true;
            }
          }
        }

        return false;
      });
      console.log(
        `Found ${filteredCourses.length} courses after examination filtering.`
      );
    }

    // Now, apply pagination to the fully filtered and sorted list
    const totalCount = filteredCourses.length;
    let paginatedCourses = filteredCourses;

    if (cursor) {
      const cursorIndex = paginatedCourses.findIndex((c) => c.id === cursor);
      if (cursorIndex !== -1) {
        paginatedCourses = paginatedCourses.slice(cursorIndex + 1);
      }
    }

    const items = paginatedCourses.slice(0, limit);
    const hasNextPage = paginatedCourses.length > limit;
    const nextCursor = hasNextPage ? items[items.length - 1]?.id : null;

    return NextResponse.json({
      success: true,
      data: items,
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
