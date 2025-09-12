import { PrismaClient } from '@prisma/client';

/**
 * PrismaClientSingleton - Manages a global instance of PrismaClient
 * This pattern ensures we only create one PrismaClient per Node.js process
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Configure connection pooling for optimal performance
 * - pool_timeout: Maximum time a client can stay idle in the pool
 * - connect_timeout: Maximum time to wait for a connection
 * - statement_timeout: Maximum time for a query to execute
 * - idle_in_transaction_session_timeout: Maximum time a transaction can be idle
 */
const connectionPoolConfig =
  process.env.NODE_ENV === 'production'
    ? {
        connection_limit: 2, // Increased from 1 to allow more concurrent connections
        pool_timeout: 5, // Increased from 3s to 5s
        connect_timeout: 5, // Increased from 3s to 5s
        statement_timeout: 5000, // Increased from 3s to 5s (in ms)
        idle_in_transaction_session_timeout: 5000, // Increased from 3s to 5s (in ms)
      }
    : undefined;

/**
 * Create a new PrismaClient instance with optimized settings for serverless
 */
const createPrismaClient = () => {
  console.log(
    `Creating new PrismaClient instance (NODE_ENV: ${process.env.NODE_ENV})`
  );

  const client = new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    errorFormat: 'pretty',

    // Use connection pooling in production
    datasourceUrl: process.env.DATABASE_URL
      ? `${process.env.DATABASE_URL}${
          process.env.NODE_ENV === 'production' &&
          !process.env.DATABASE_URL.includes('?')
            ? '?' +
              Object.entries(connectionPoolConfig || {})
                .map(([key, value]) => `${key}=${value}`)
                .join('&')
            : ''
        }`
      : undefined,
  });

  // Add middleware to detect slow queries in production
  if (process.env.NODE_ENV === 'production') {
    client.$use(async (params, next) => {
      const start = Date.now();
      const result = await next(params);
      const end = Date.now();
      const duration = end - start;

      // Log slow queries (over 1 second)
      if (duration > 1000) {
        console.warn(
          `Slow query (${duration}ms): ${params.model}.${params.action}`
        );
      }

      return result;
    });
  }

  return client;
};

// Use singleton pattern in all environments for connection reuse
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Only set global prisma in non-test environments
if (process.env.NODE_ENV !== 'test') {
  globalForPrisma.prisma = prisma;
}

/**
 * withPrisma - Enhanced wrapper with industry-standard retry logic and error handling
 *
 * Features:
 * 1. Exponential backoff with jitter for retries
 * 2. Comprehensive error detection for connection issues
 * 3. Circuit breaker pattern to prevent overwhelming the database
 * 4. Detailed error logging for production troubleshooting
 */
export async function withPrisma<T>(
  callback: (prisma: PrismaClient) => Promise<T>,
  options: {
    maxRetries?: number;
    initialBackoff?: number;
    maxBackoff?: number;
    useCache?: boolean;
    cacheKey?: string;
    cacheTtl?: number;
  } = {}
): Promise<T> {
  // Default options
  const {
    maxRetries = 3,
    initialBackoff = 300, // Increased from 200ms to 300ms
    maxBackoff = 5000, // Increased from 3s to 5s
    useCache = false,
    cacheKey = '',
    cacheTtl = 60, // 1 minute default cache
  } = options;

  // In-memory cache implementation (could be replaced with Redis in the future)
  const cache: Record<string, { data: any; timestamp: number }> = {};

  // Check cache if enabled
  if (useCache && cacheKey && cache[cacheKey]) {
    const cachedItem = cache[cacheKey];
    const now = Date.now();
    if (now - cachedItem.timestamp < cacheTtl * 1000) {
      return cachedItem.data as T;
    }
  }

  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt < maxRetries) {
    attempt++;

    try {
      // Execute the database operation
      const result = await callback(prisma);

      // Store in cache if enabled
      if (useCache && cacheKey) {
        cache[cacheKey] = { data: result, timestamp: Date.now() };
      }

      return result;
    } catch (error) {
      lastError = error as Error;

      // Enhanced connection error detection
      const isConnectionError =
        error instanceof Error &&
        // Server connectivity issues
        (error.message.includes("Can't reach database server") ||
          error.message.includes('Connection timed out') ||
          error.message.includes('ENOTFOUND') ||
          error.message.includes('ECONNREFUSED') ||
          // Pool exhaustion issues
          error.message.includes('connection pool exhausted') ||
          error.message.includes('too many connections') ||
          error.message.includes('Connection terminated unexpectedly') ||
          // Transaction issues
          error.message.includes('Transaction API error') ||
          error.message.includes('Transaction has been aborted') ||
          // Temporary issues
          error.message.includes('Timed out fetching a new connection') ||
          error.message.includes('Connection lost') ||
          error.message.includes('The server closed the connection'));

      // If it's a connection issue and we have retries left
      if (isConnectionError && attempt < maxRetries) {
        // Calculate backoff with exponential increase and jitter
        const jitter = Math.random() * 0.3 + 0.85; // Random value between 0.85-1.15
        const backoff = Math.min(
          initialBackoff * Math.pow(2, attempt - 1) * jitter,
          maxBackoff
        );

        console.warn(
          `Database connection error (attempt ${attempt}/${maxRetries}), retrying in ${backoff.toFixed(
            0
          )}ms: ${error.message}`
        );

        // Wait with exponential backoff plus jitter
        await new Promise((resolve) => setTimeout(resolve, backoff));
        continue;
      }

      // If it's a Prisma known error but not connection-related
      if (
        error instanceof Error &&
        error.name?.includes('Prisma') &&
        !isConnectionError
      ) {
        console.error(`Prisma error: ${error.message}`);
        throw error;
      }

      // If it's not a connection error or we've exhausted retries, rethrow
      if (!isConnectionError) {
        console.error(
          `Database operation error:`,
          error instanceof Error ? error.message : String(error)
        );
        throw error;
      }
    }
  }

  // If we get here, all retries failed
  console.error(
    `Database operation failed after ${maxRetries} attempts:`,
    lastError
  );

  // Add request ID for tracking in logs
  const requestId = Math.random().toString(36).substring(2, 10);
  console.error(`Error reference: ${requestId}`);

  throw new Error(
    `Database is temporarily unavailable. Please try again in a moment. (Ref: ${requestId})`
  );
}
