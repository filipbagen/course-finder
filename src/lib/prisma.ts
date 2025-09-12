import { PrismaClient } from '@prisma/client';

/**
 * PrismaClientSingleton - Manages a global instance of PrismaClient
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Configure connection for optimal performance
 */
const connectionConfig =
  process.env.NODE_ENV === 'production'
    ? {
        connection_limit: 2,
        pool_timeout: 30,
        connect_timeout: 60,
      }
    : undefined;

/**
 * Create a new PrismaClient instance
 */
const createPrismaClient = () => {
  console.log(
    `Creating new PrismaClient instance (NODE_ENV: ${process.env.NODE_ENV})`
  );

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  });
};

// Use singleton pattern for connection reuse
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Only set global prisma in non-test environments
if (process.env.NODE_ENV !== 'test') {
  globalForPrisma.prisma = prisma;
}

/**
 * Handle database operations with retries
 */
export async function withPrisma<T>(
  callback: (prisma: PrismaClient) => Promise<T>,
  options: {
    maxRetries?: number;
  } = {}
): Promise<T> {
  const { maxRetries = 3 } = options;
  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt < maxRetries) {
    attempt++;

    try {
      return await callback(prisma);
    } catch (error) {
      lastError = error as Error;

      // Check if it's a connection error
      const isConnectionError =
        error instanceof Error &&
        (error.message.includes("Can't reach database server") ||
          error.message.includes('Connection timed out') ||
          error.message.includes('too many connections') ||
          error.message.includes('Connection terminated'));

      if (isConnectionError && attempt < maxRetries) {
        // Wait before retrying
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
