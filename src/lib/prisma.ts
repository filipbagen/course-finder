import { PrismaClient } from '@prisma/client';

/**
 * PrismaClientSingleton - Manages a global instance of PrismaClient
 *
 * In serverless environments like Vercel, we need to ensure we're reusing
 * the PrismaClient instance across function invocations to avoid exhausting
 * the database connection limit.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Creates and configures a PrismaClient instance
 * Uses proper connection parameters for production environment
 */
const createPrismaClient = () => {
  console.log(
    `Creating new PrismaClient instance (NODE_ENV: ${process.env.NODE_ENV})`
  );

  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  });

  // Add connection management for Vercel
  if (process.env.NODE_ENV === 'production') {
    // Monitor connection events
    console.log('Configuring PrismaClient for production environment');
  }

  return client;
};

// Use singleton pattern for connection reuse
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Only set global prisma in non-test environments
if (process.env.NODE_ENV !== 'test') {
  globalForPrisma.prisma = prisma;
}

/**
 * Simple memory cache for database operations
 * In a real production app, you'd use Redis or another distributed cache
 */
const cache = new Map<string, { data: any; timestamp: number }>();

/**
 * Clear cache entries by pattern (useful for invalidating related data)
 */
export function clearCache(pattern?: string) {
  if (!pattern) {
    // Clear all cache
    cache.clear();
    return;
  }

  // Clear cache entries that match the pattern
  for (const [key] of cache) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}

/**
 * Clear cache for a specific user (useful after schedule updates)
 */
export function clearUserCache(userId: string) {
  clearCache(`-${userId}`);
}

/**
 * Execute database operations with proper error handling
 */
export async function withPrisma<T>(
  callback: (prisma: PrismaClient) => Promise<T>,
  options: {
    useCache?: boolean;
    cacheKey?: string;
    cacheTtl?: number;
  } = {}
): Promise<T> {
  const { useCache = false, cacheKey = '', cacheTtl = 60 } = options;

  // Check cache if enabled
  if (useCache && cacheKey && cache.has(cacheKey)) {
    const cached = cache.get(cacheKey)!;
    const isExpired = Date.now() - cached.timestamp > cacheTtl * 1000;

    if (!isExpired) {
      return cached.data as T;
    }
  }

  try {
    // Execute the database operation
    const result = await callback(prisma);

    // Store in cache if enabled
    if (useCache && cacheKey) {
      cache.set(cacheKey, { data: result, timestamp: Date.now() });
    }

    return result;
  } catch (error) {
    console.error('Database operation error:', error);
    throw error;
  }
}
