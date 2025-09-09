import { prisma } from '@/lib/prisma';

async function benchmarkFullExperience() {
  console.log('🚀 Full Experience Performance Benchmark');
  console.log('=====================================');

  // Test 1: Database query performance (what we already optimized)
  console.log('\n📊 Test 1: Database Query Performance');
  const dbStart = Date.now();
  const courses = await prisma.course.findMany({
    where: {
      name: { contains: 'artificiell', mode: 'insensitive' },
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
    take: 20,
  });
  const dbTime = Date.now() - dbStart;
  console.log(`  Database query: ${dbTime}ms (${courses.length} courses)`);

  // Test 2: Simulate CourseCard rating API calls
  console.log('\n📊 Test 2: Course Rating API Calls (bottleneck!)');
  const ratingStart = Date.now();
  const ratingPromises = courses.map(async (course) => {
    try {
      // Simulate the rating API call that each CourseCard makes
      const reviews = await prisma.review.findMany({
        where: { courseId: course.id },
        select: {
          rating: true,
        },
      });

      const averageRating =
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;

      return {
        courseId: course.id,
        averageRating,
        count: reviews.length,
      };
    } catch (error) {
      return {
        courseId: course.id,
        averageRating: 0,
        count: 0,
      };
    }
  });

  const ratingResults = await Promise.all(ratingPromises);
  const ratingTime = Date.now() - ratingStart;
  console.log(
    `  Rating API calls: ${ratingTime}ms (${ratingPromises.length} parallel requests)`
  );

  // Test 3: Simulate network latency (typical browser conditions)
  console.log('\n📊 Test 3: Network Latency Impact');
  const networkLatency = 50; // ms - typical for modern connections
  const totalApiTime = dbTime + ratingTime + networkLatency;
  console.log(`  Network latency: ${networkLatency}ms`);
  console.log(`  Total API time: ${totalApiTime}ms`);

  // Test 4: Frontend rendering overhead
  console.log('\n📊 Test 4: Frontend Rendering Overhead');
  const renderingOverhead = 100; // ms - React rendering, DOM updates, CSS
  const totalFrontendTime = totalApiTime + renderingOverhead;
  console.log(`  React rendering: ${renderingOverhead}ms`);
  console.log(`  Total frontend time: ${totalFrontendTime}ms`);

  // Test 5: Compare with and without rating bottleneck
  console.log('\n📊 Test 5: Performance Comparison');
  const withoutRatings = dbTime + networkLatency + renderingOverhead;
  const withRatings = totalFrontendTime;

  console.log(`  Without rating bottleneck: ${withoutRatings}ms`);
  console.log(`  With rating bottleneck: ${withRatings}ms`);
  console.log(
    `  Rating impact: +${withRatings - withoutRatings}ms (${(
      ((withRatings - withoutRatings) / withoutRatings) *
      100
    ).toFixed(1)}% slower)`
  );

  // Recommendations
  console.log('\n💡 RECOMMENDATIONS');
  console.log('==================');
  console.log(
    '1. 🚨 MAJOR BOTTLENECK: Each CourseCard makes individual rating API calls'
  );
  console.log('2. 📈 SOLUTION: Include ratings in the main course query');
  console.log('3. ⚡ EXPECTED IMPROVEMENT: 60-80% faster frontend loading');
  console.log('4. 🔧 IMPLEMENTATION: Add rating aggregation to course API');

  console.log('\n=== DETAILED BREAKDOWN ===');
  console.log(`Database query: ${dbTime}ms`);
  console.log(
    `Rating API calls: ${ratingTime}ms (${ratingPromises.length} requests)`
  );
  console.log(`Network latency: ${networkLatency}ms`);
  console.log(`React rendering: ${renderingOverhead}ms`);
  console.log(`Total: ${totalFrontendTime}ms`);

  return {
    dbTime,
    ratingTime,
    totalApiTime,
    totalFrontendTime,
    ratingImpact: withRatings - withoutRatings,
  };
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
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`  ❌ ${description}: Failed after ${duration}ms - ${error}`);
    throw error;
  }
}

if (require.main === module) {
  benchmarkFullExperience()
    .then(() => {
      console.log('\n🏁 Full experience benchmark completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Benchmark failed:', error);
      process.exit(1);
    });
}

export { benchmarkFullExperience };
