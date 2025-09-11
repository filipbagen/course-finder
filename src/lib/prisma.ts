import { PrismaClient } from '@prisma/client';

// For debugging database connection issues
if (process.env.NODE_ENV === 'production') {
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('DIRECT_URL exists:', !!process.env.DIRECT_URL);
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma client with connection retry logic
const createPrismaClient = () => {
  const client = new PrismaClient({
    log: ['error'],
    errorFormat: 'pretty',
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  return client;
};

// Export Prisma client with singleton pattern
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Attempt to connect to the database during initialization in production
// This will help identify connection issues immediately
if (process.env.NODE_ENV === 'production') {
  // Function to attempt database connection with retries
  const connectWithRetry = async (retries = 3, delay = 2000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(
          `Attempting database connection (attempt ${attempt}/${retries})...`
        );
        await prisma.$connect();
        console.log('Successfully connected to database');
        return true;
      } catch (error) {
        console.error(`Connection attempt ${attempt} failed:`, error);

        if (attempt === retries) {
          console.error('All connection attempts failed');
          // Provide detailed error information
          if (error instanceof Error) {
            console.error({
              name: error.name,
              message: error.message,
              stack: error.stack,
              code: (error as any).code,
              meta: (error as any).meta,
            });
          }
          return false;
        }

        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    return false;
  };

  // Start the connection process
  connectWithRetry().catch((e) => {
    console.error('Failed to initialize database connection:', e);
  });
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
