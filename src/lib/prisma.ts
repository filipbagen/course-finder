import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma client optimized for serverless environments
const createPrismaClient = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
    datasourceUrl: process.env.DATABASE_URL,
  });

  return client;
};

// Use singleton pattern for development, fresh client for production
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Enhanced withPrisma wrapper with better error handling for serverless
export async function withPrisma<T>(
  callback: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  let lastError: Error | null = null;

  // Try up to 3 times with exponential backoff
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result = await callback(prisma);
      return result;
    } catch (error) {
      lastError = error as Error;

      // Check if it's a connection-related error
      const isConnectionError = error instanceof Error && (
        error.message.includes("Can't reach database server") ||
        error.message.includes("Connection timed out") ||
        error.message.includes("ENOTFOUND") ||
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("connection pool exhausted") ||
        error.message.includes("too many connections")
      );

      if (isConnectionError && attempt < 3) {
        console.warn(`Database operation failed (attempt ${attempt}), retrying in ${attempt * 1000}ms...`);
        // Wait with exponential backoff
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        continue;
      }

      // If it's not a connection error or we've exhausted retries, throw
      if (!isConnectionError) {
        throw error;
      }
    }
  }

  // If we get here, all retries failed
  console.error('Database operation failed after 3 attempts:', lastError);
  throw new Error('Database is temporarily unavailable. Please try again in a moment.');
}
