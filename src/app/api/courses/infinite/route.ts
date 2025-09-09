import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { infiniteError } from '@/lib/errors';
import { CourseSearchSchema, validateQueryParams } from '@/lib/validation';
import type { InfiniteResponse } from '@/types/api';
import { Course, TriState } from '@/types/types';
import { transformCourses } from '@/lib/transformers';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest
): Promise<NextResponse<InfiniteResponse<Course>>> {
  try {
    const { searchParams } = new URL(request.url);
    const params = validateQueryParams(searchParams, CourseSearchSchema);

    const {
      cursor,
      limit: rawLimit,
      search,
      campus,
      mainFieldOfStudy,
      semester,
      period,
      block,
      studyPace,
      courseLevel,
      examinations,
      sortBy = 'code',
      sortOrder = 'asc',
    } = params;

    const limit = Math.min(Math.max(rawLimit || 20, 1), 50);

    // Build where conditions
    const whereConditions: any = {};

    if (search) {
      // Optimize search by using more efficient patterns
      const searchTerm = search.trim();
      if (searchTerm.length > 0) {
        whereConditions.OR = [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { code: { contains: searchTerm, mode: 'insensitive' } },
        ];
      }
    }

    if (campus) {
      const campusValues = campus.split('|');
      whereConditions.campus =
        campusValues.length > 1 ? { in: campusValues } : campus;
    }

    if (mainFieldOfStudy) {
      const fieldValues = mainFieldOfStudy.split(',');
      whereConditions.mainFieldOfStudy =
        fieldValues.length > 1
          ? { hasSome: fieldValues }
          : { has: mainFieldOfStudy };
    }

    if (semester) {
      const semesterValues = semester
        .split(',')
        .map((s) => BigInt(parseInt(s, 10)));
      whereConditions.semester =
        semesterValues.length > 1
          ? { hasSome: semesterValues }
          : { has: semesterValues[0] };
    }

    if (period) {
      const periodValues = period
        .split(',')
        .map((p) => BigInt(parseInt(p, 10)));
      whereConditions.period =
        periodValues.length > 1
          ? { hasSome: periodValues }
          : { has: periodValues[0] };
    }

    if (block) {
      const blockValues = block.split(',').map((b) => BigInt(parseInt(b, 10)));
      whereConditions.block =
        blockValues.length > 1
          ? { hasSome: blockValues }
          : { has: blockValues[0] };
    }

    if (courseLevel) {
      const levelValues = courseLevel.split(',');
      if (
        levelValues.includes('Grundnivå') &&
        !levelValues.includes('Avancerad nivå')
      ) {
        whereConditions.advanced = false;
      } else if (
        !levelValues.includes('Grundnivå') &&
        levelValues.includes('Avancerad nivå')
      ) {
        whereConditions.advanced = true;
      }
    }

    // --- Examination Filter Logic ---
    const examinationMap: Record<string, string[]> = {
      Inlämningsuppgift: ['UPG'],
      'Skriftlig tentamen': ['TEN', 'TENA'],
      Projektarbete: ['PRA', 'PROJ'],
      Laborationsarbete: ['LAB', 'LABA'],
      'Digital tentamen': ['DIT'],
      'Muntlig examination': ['MUN'],
      Kontrollskrivning: ['KTR'],
      Basgruppsarbete: ['BAS'],
      Hemtentamen: ['HEM'],
      Övrigt: ['DAK', 'MOM', 'ANN'],
      Seminarium: ['SEM'],
      Datorexamination: ['DAT'],
    };

    let includeExaminationCodes: string[] = [];
    let excludeExaminationCodes: string[] = [];

    if (examinations) {
      try {
        const examinationState = JSON.parse(examinations) as Record<
          string,
          TriState
        >;
        for (const [key, value] of Object.entries(examinationState)) {
          const codes = examinationMap[key] || [key];
          if (value === 'checked') {
            includeExaminationCodes.push(...codes);
          } else if (value === 'indeterminate') {
            excludeExaminationCodes.push(...codes);
          }
        }
      } catch (e) {
        console.error('Failed to parse examinations filter:', e);
      }
    }

    if (studyPace) {
      const paceValues = studyPace.split(',');
      if (paceValues.includes('Helfart') && !paceValues.includes('Halvfart')) {
        whereConditions.OR = [
          { period: { equals: [BigInt(1)] } },
          { period: { equals: [BigInt(2)] } },
        ];
      } else if (
        !paceValues.includes('Helfart') &&
        paceValues.includes('Halvfart')
      ) {
        whereConditions.AND = [
          { period: { has: BigInt(1) } },
          { period: { has: BigInt(2) } },
        ];
      }
    }

    // Build orderBy
    const orderBy: any = { [sortBy]: sortOrder };
    const orderByArray = [orderBy];
    if (sortBy !== 'code') {
      orderByArray.push({ code: 'asc' });
    }
    orderByArray.push({ id: 'asc' }); // Final tie-breaker

    // Build query options with pagination from the start for better performance
    const queryOptions: any = {
      where: whereConditions,
      orderBy: orderByArray,
      take: limit + 1, // Take one extra to check if there's a next page
      skip: cursor ? 1 : 0, // Skip the cursor item if provided
      cursor: cursor ? { id: cursor } : undefined,
      select: {
        id: true,
        code: true,
        name: true,
        credits: true,
        campus: true,
        mainFieldOfStudy: true,
        advanced: true,
        period: true,
        block: true,
        semester: true,
        courseType: true,
        offeredFor: true,
        // Only include these minimal fields needed for the course cards
        // Detailed data will be loaded on demand:
        // - learningOutcomes
        // - content
        // - teachingMethods
        // - prerequisites
        // - recommendedPrerequisites
        // - examination
        // - examiner
        // - exclusions
        // - scheduledHours
        // - selfStudyHours
        // - programInfo
      },
    };

    const courses = await prisma.course.findMany(queryOptions);

    // Transform data
    let filteredCourses = transformCourses(courses) as unknown as Course[];

    // Check if there's a next page
    const hasNextPage = filteredCourses.length > limit;
    const items = hasNextPage
      ? filteredCourses.slice(0, limit)
      : filteredCourses;
    const nextCursor = hasNextPage ? items[items.length - 1]?.id : null;

    // Get total count for this query (only when no cursor for performance)
    let totalCount = null;
    if (!cursor) {
      const countQuery = await prisma.course.count({
        where: whereConditions,
      });
      totalCount = countQuery;
    }

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
    let errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return infiniteError(errorMessage);
  }
}
