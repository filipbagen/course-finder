/**
 * Performance benchmarking script for course search functionality
 * Run with: npx tsx src/scripts/benchmark-search.ts
 */

import { prisma } from '@/lib/prisma';

async function benchmarkSearch() {
  console.log('🚀 Starting Course Search Performance Benchmark\n');

  try {
    await prisma.$connect();
    console.log('✅ Connected to database\n');

    // Test 1: Basic search performance
    console.log('📊 Test 1: Basic search performance');
    await benchmarkQuery('Search for "artificial"', () =>
      prisma.course.findMany({
        where: {
          OR: [
            { name: { contains: 'artificial', mode: 'insensitive' } },
            { code: { contains: 'artificial', mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          code: true,
          name: true,
          campus: true,
          mainFieldOfStudy: true,
          period: true,
          block: true,
          semester: true,
        },
        take: 20,
      })
    );

    // Test 2: Empty search performance
    console.log('📊 Test 2: Empty search performance');
    await benchmarkQuery('Search for non-existent term', () =>
      prisma.course.findMany({
        where: {
          OR: [
            {
              name: { contains: 'nonexistentcourse12345', mode: 'insensitive' },
            },
            {
              code: { contains: 'nonexistentcourse12345', mode: 'insensitive' },
            },
          ],
        },
        select: {
          id: true,
          code: true,
          name: true,
          campus: true,
          mainFieldOfStudy: true,
          period: true,
          block: true,
          semester: true,
        },
        take: 20,
      })
    );

    // Test 3: Prefix search performance
    console.log('📊 Test 3: Prefix search performance');
    await benchmarkQuery('Prefix search for "art"', () =>
      prisma.course.findMany({
        where: {
          OR: [
            { name: { startsWith: 'art', mode: 'insensitive' } },
            { code: { startsWith: 'art', mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          code: true,
          name: true,
          campus: true,
          mainFieldOfStudy: true,
          period: true,
          block: true,
          semester: true,
        },
        take: 20,
      })
    );

    // Test 4: Filtered search performance
    console.log('📊 Test 4: Filtered search performance');
    await benchmarkQuery('Search with filters', () =>
      prisma.course.findMany({
        where: {
          AND: [
            {
              OR: [
                { name: { contains: 'artificial', mode: 'insensitive' } },
                { code: { contains: 'artificial', mode: 'insensitive' } },
              ],
            },
            { campus: 'Stockholm' },
            { advanced: false },
          ],
        },
        select: {
          id: true,
          code: true,
          name: true,
          campus: true,
          mainFieldOfStudy: true,
          period: true,
          block: true,
          semester: true,
        },
        take: 20,
      })
    );

    // Test 5: Heavy vs Light query comparison
    console.log('📊 Test 5: Heavy vs Light query comparison');

    // Heavy query (old way)
    const heavyStart = Date.now();
    const heavyResult = await prisma.course.findMany({
      where: {
        name: { contains: 'artificial', mode: 'insensitive' },
      },
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
        learningOutcomes: true, // Heavy field
        content: true, // Heavy field
        teachingMethods: true, // Heavy field
        prerequisites: true, // Heavy field
        examination: true, // Heavy field
        programInfo: true, // Heavy field
      },
      take: 10,
    });
    const heavyTime = Date.now() - heavyStart;

    // Light query (new way)
    const lightStart = Date.now();
    const lightResult = await prisma.course.findMany({
      where: {
        name: { contains: 'artificial', mode: 'insensitive' },
      },
      select: {
        id: true,
        code: true,
        name: true,
        campus: true,
        mainFieldOfStudy: true,
        period: true,
        block: true,
        semester: true,
        advanced: true,
        courseType: true,
        offeredFor: true,
        credits: true,
      },
      take: 10,
    });
    const lightTime = Date.now() - lightStart;

    console.log(
      `  Heavy query (all fields): ${heavyTime}ms (${heavyResult.length} results)`
    );
    console.log(
      `  Light query (minimal fields): ${lightTime}ms (${lightResult.length} results)`
    );
    console.log(
      `  Performance improvement: ${(
        ((heavyTime - lightTime) / heavyTime) *
        100
      ).toFixed(1)}% faster`
    );

    // Test 6: Count total courses
    console.log('📊 Test 6: Database statistics');
    const totalCount = await prisma.course.count();
    console.log(`  Total courses in database: ${totalCount}`);

    const coursesWithArtificial = await prisma.course.count({
      where: {
        OR: [
          { name: { contains: 'artificial', mode: 'insensitive' } },
          { code: { contains: 'artificial', mode: 'insensitive' } },
        ],
      },
    });
    console.log(`  Courses matching "artificial": ${coursesWithArtificial}`);
  } catch (error) {
    console.error('❌ Benchmark failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function benchmarkQuery(
  description: string,
  queryFn: () => Promise<any>
) {
  const startTime = Date.now();
  try {
    const result = await queryFn();
    const duration = Date.now() - startTime;
    console.log(`  ${description}: ${duration}ms (${result.length} results)`);

    // Performance expectations
    if (duration > 500) {
      console.log(`  ⚠️  Warning: Query took longer than 500ms`);
    } else if (duration > 200) {
      console.log(`  📈 Acceptable: Query took ${duration}ms`);
    } else {
      console.log(`  ✅ Excellent: Query took ${duration}ms`);
    }

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`  ❌ ${description}: Failed after ${duration}ms - ${error}`);
    throw error;
  }
}

// Run the benchmark
if (require.main === module) {
  benchmarkSearch()
    .then(() => {
      console.log('\n🏁 Benchmark completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Benchmark failed:', error);
      process.exit(1);
    });
}

export { benchmarkSearch };
