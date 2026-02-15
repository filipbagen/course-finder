import { PrismaClient } from '@prisma/client'

/**
 * PrismaClientSingleton - Manages a global instance of PrismaClient
 *
 * In serverless environments like Vercel, we need to ensure we're reusing
 * the PrismaClient instance across function invocations to avoid exhausting
 * the database connection limit.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

// Use singleton pattern for connection reuse
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Only set global prisma in non-test environments
if (process.env.NODE_ENV !== 'test') {
  globalForPrisma.prisma = prisma
}

/**
 * Execute a database operation with consistent error logging.
 *
 * NOTE: The optional `_options` parameter is kept for backward compatibility
 * but is ignored. In-memory caching was removed because it is ineffective in
 * serverless environments (each cold start creates a new instance).
 * If you need caching, use Next.js fetch-level caching or an external store.
 */
export async function withPrisma<T>(
  callback: (prisma: PrismaClient) => Promise<T>,
  _options?: {
    useCache?: boolean
    cacheKey?: string
    cacheTtl?: number
  },
): Promise<T> {
  try {
    return await callback(prisma)
  } catch (error) {
    console.error('Database operation error:', error)
    throw error
  }
}

/**
 * @deprecated No-op. In-memory cache was removed because it is
 * ineffective in Vercel's serverless environment. Kept for backward
 * compatibility with callers that haven't been updated yet.
 */
export function clearCache(_pattern?: string) {}

/**
 * @deprecated No-op. See `clearCache`.
 */
export function clearUserCache(_userId: string) {}
