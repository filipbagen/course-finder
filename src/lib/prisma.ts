import { PrismaClient } from '@prisma/client';

/**
 * PrismaClientSingleton - Manages a global instance of PrismaClient
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Detect Vercel production environment
const isVercelProduction =
  process.env.NODE_ENV === 'production' && process.env.VERCEL === '1';

/**
 * Configure connection for optimal performance based on environment
 * Vercel has specific requirements for connection pooling
 */
const createPrismaClient = () => {
  console.log(
    `Creating new PrismaClient instance (NODE_ENV: ${process.env.NODE_ENV}, Vercel: ${process.env.VERCEL})`
  );

  // Set datasourceUrl with query params for Vercel production environment
  const datasourceUrl = isVercelProduction
    ? `${process.env.DIRECT_URL}?connection_limit=1&pool_timeout=20&connect_timeout=20`
    : undefined;

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    errorFormat: 'pretty',
    datasourceUrl,
  });
};

// Use singleton pattern for connection reuse
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Only set global prisma in non-test environments
if (process.env.NODE_ENV !== 'test') {
  globalForPrisma.prisma = prisma;
}

/**
 * Handle database operations with retries and improved error handling
 */
export async function withPrisma<T>(
  callback: (prisma: PrismaClient) => Promise<T>,
  options: {
    maxRetries?: number;
    useCache?: boolean;
    cacheKey?: string;
    cacheTtl?: number;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    useCache = false,
    cacheKey = '',
    cacheTtl = 60,
  } = options;
  let lastError: Error | null = null;
  let attempt = 0;

  // Simple cache implementation - in production you'd use a proper cache like Redis
  const cacheMap = new Map<string, { data: any; timestamp: number }>();

  // Check cache if enabled
  if (useCache && cacheKey && cacheMap.has(cacheKey)) {
    const cached = cacheMap.get(cacheKey)!;
    const isExpired = Date.now() - cached.timestamp > cacheTtl * 1000;

    if (!isExpired) {
      console.log(`Cache hit for key: ${cacheKey}`);
      return cached.data as T;
    }
    console.log(`Cache expired for key: ${cacheKey}`);
  }

  while (attempt < maxRetries) {
    attempt++;
    console.log(`Database operation attempt ${attempt}/${maxRetries}`);

    try {
      // Add timeout to prevent hanging operations
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error('Database operation timed out')),
          10000
        );
      });

      const resultPromise = callback(prisma);

      // Race against timeout
      const result = await Promise.race([resultPromise, timeoutPromise]);

      // Store in cache if enabled
      if (useCache && cacheKey) {
        cacheMap.set(cacheKey, { data: result, timestamp: Date.now() });
      }

      return result;
    } catch (error) {
      lastError = error as Error;
      console.error(
        `Database operation error (attempt ${attempt}/${maxRetries}):`,
        error
      );

      // Check if it's a connection error
      const isConnectionError =
        error instanceof Error &&
        (error.message.includes("Can't reach database server") ||
          error.message.includes('Connection timed out') ||
          error.message.includes('too many connections') ||
          error.message.includes('Connection terminated') ||
          error.message.includes('database operation timed out') ||
          error.message.includes('connection pool') ||
          error.message.includes('Database operation timed out'));

      if (isConnectionError && attempt < maxRetries) {
        // Wait before retrying with exponential backoff
        const delay = Math.min(1000 * Math.pow(1.5, attempt), 5000);
        console.warn(`Database connection error, retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw error;
    }
  }

  throw lastError || new Error('Database operation failed after retries');
}
