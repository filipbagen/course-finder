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
      whereConditions.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
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

    // Build query options to fetch all courses matching the base filters
    const queryOptions: any = {
      where: whereConditions,
      orderBy: orderByArray,
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
        examination: true,
        semester: true,
      },
    };

    const allCourses = await prisma.course.findMany(queryOptions);

    // Transform data and apply post-query examination filtering if needed
    let filteredCourses = transformCourses(allCourses) as unknown as Course[];

    if (
      includeExaminationCodes.length > 0 ||
      excludeExaminationCodes.length > 0
    ) {
      filteredCourses = filteredCourses.filter((course) => {
        if (!course.examination || course.examination.length === 0) {
          return includeExaminationCodes.length === 0; // Keep if no include filters, otherwise false
        }

        const courseExamCodes = course.examination.map((exam: any) =>
          exam?.code ? String(exam.code).toUpperCase() : ''
        );

        // Exclusion logic: course must not have any of the excluded exam codes
        if (excludeExaminationCodes.length > 0) {
          const hasExcludedExam = courseExamCodes.some((courseCode) =>
            excludeExaminationCodes.some((excludedCode) =>
              courseCode.startsWith(excludedCode.toUpperCase())
            )
          );
          if (hasExcludedExam) {
            return false; // Exclude this course
          }
        }

        // Inclusion logic: course must have at least one of the included exam codes
        if (includeExaminationCodes.length > 0) {
          const hasIncludedExam = courseExamCodes.some((courseCode) =>
            includeExaminationCodes.some((includedCode) =>
              courseCode.startsWith(includedCode.toUpperCase())
            )
          );
          if (!hasIncludedExam) {
            return false; // Exclude this course as it's missing a required exam
          }
        }

        return true; // Pass if it meets all conditions
      });
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
    let errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return infiniteError(errorMessage);
  }
}
