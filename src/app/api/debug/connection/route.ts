import { NextRequest, NextResponse } from 'next/server';
import { prisma, withPrisma } from '@/lib/prisma';
import { getOptionalUser } from '@/lib/auth';

/**
 * GET /api/debug/connection
 * Debug endpoint to check database connectivity
 * Tests the database connection and returns useful debugging information
 */
export async function GET(request: NextRequest) {
  try {
    // Optional authentication - doesn't block the request if auth fails
    const user = await getOptionalUser().catch(() => null);
    
    // Start timer for connection test
    const startTime = Date.now();
    
    // Simple query to test database connectivity using our enhanced withPrisma
    const result = await withPrisma(async (prisma) => {
      // First test: simple count query
      const courseCount = await prisma.course.count();
      
      // Second test: retrieve a small amount of data
      const recentReviews = await prisma.review.findMany({
        take: 1,
        orderBy: { createdAt: 'desc' },
        select: { id: true, createdAt: true }
      });
      
      // Third test: raw SQL query to test direct connection
      const rawQueryResult: any[] = await prisma.$queryRaw`SELECT current_timestamp as server_time`;
      
      // Return test results
      return { 
        courseCount,
        hasRecentReviews: recentReviews.length > 0,
        recentReviewTime: recentReviews[0]?.createdAt,
        serverTime: rawQueryResult[0]?.server_time,
        testId: Math.random().toString(36).substring(2, 10)
      };
    }, {
      // No caching for diagnostic endpoint
      useCache: false,
      // More retries for comprehensive testing
      maxRetries: 5,
      initialBackoff: 100
    });
    
    // Calculate query execution time
    const duration = Date.now() - startTime;
    
    // Safely mask sensitive information from database URLs
    const maskDatabaseUrl = (url: string | undefined) => {
      if (!url) return undefined;
      
      try {
        const parsedUrl = new URL(url);
        // Hide password
        if (parsedUrl.password) {
          parsedUrl.password = '********';
        }
        return parsedUrl.toString();
      } catch (e) {
        return 'Invalid URL format';
      }
    };
    
    // Prepare response with database connection information
    const response = {
      success: true,
      connection: {
        status: 'connected',
        queryTime: `${duration}ms`,
        databaseProvider: 'PostgreSQL',
        pooling: process.env.DATABASE_URL?.includes('connection_limit') ? 'enabled' : 'default',
        authenticated: !!user
      },
      database: {
        courseCount: result.courseCount,
        hasRecentReviews: result.hasRecentReviews,
        recentReviewTime: result.recentReviewTime,
        serverTime: result.serverTime
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDirectUrl: !!process.env.DIRECT_URL,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        // Include masked URLs for debugging
        databaseUrlPrefix: process.env.DATABASE_URL ? 
          maskDatabaseUrl(process.env.DATABASE_URL)?.split('?')[0] : undefined,
        directUrlPrefix: process.env.DIRECT_URL ? 
          maskDatabaseUrl(process.env.DIRECT_URL)?.split('?')[0] : undefined,
        usingPooling: process.env.DATABASE_URL?.includes('connection_limit'),
        testId: result.testId,
        timestamp: new Date().toISOString()
      }
    };
    
    return NextResponse.json(response, { 
      status: 200,
      headers: {
        // No caching for diagnostic endpoint
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      details: error instanceof Error ? {
        name: error.name,
        code: (error as any).code,
        meta: (error as any).meta,
      } : undefined,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDirectUrl: !!process.env.DIRECT_URL,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
      },
      timestamp: new Date().toISOString(),
      errorRef: Math.random().toString(36).substring(2, 10)
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  }
}
