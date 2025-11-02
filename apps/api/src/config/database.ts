import { PrismaClient, type Prisma } from '@aivo/database';
import { dbLogger } from './logger.js';

/**
 * Database configuration and connection management
 * Provides singleton PrismaClient instance with proper connection pooling,
 * logging, and error handling
 */

// Singleton instance
let prismaInstance: PrismaClient | null = null;

/**
 * Create and configure PrismaClient instance
 */
function createPrismaClient(): PrismaClient {
  const prisma = new PrismaClient({
    errorFormat: 'pretty',
  });

  dbLogger.info('PrismaClient created');

  return prisma;
}

/**
 * Get the singleton PrismaClient instance
 */
export function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = createPrismaClient();
    dbLogger.info('PrismaClient instance created');
  }
  return prismaInstance;
}

/**
 * Initialize database connection
 */
export async function initializeDatabase(): Promise<void> {
  try {
    const prisma = getPrismaClient();
    
    // Test the connection
    await prisma.$connect();
    dbLogger.info('Database connection established');

    // Run health check query
    await prisma.$queryRaw`SELECT 1 as health_check`;
    dbLogger.info('Database health check passed');

  } catch (error) {
    dbLogger.error({ err: error }, 'Failed to initialize database connection');
    throw new Error(`Database initialization failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Gracefully close database connection
 */
export async function closeDatabaseConnection(): Promise<void> {
  if (prismaInstance) {
    try {
      await prismaInstance.$disconnect();
      prismaInstance = null;
      dbLogger.info('Database connection closed');
    } catch (error) {
      dbLogger.error({ err: error }, 'Error closing database connection');
      throw error;
    }
  }
}

/**
 * Database health check
 */
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  latency?: number;
  error?: string;
}> {
  try {
    const start = Date.now();
    const prisma = getPrismaClient();
    
    await prisma.$queryRaw`SELECT 1 as health_check`;
    
    const latency = Date.now() - start;
    
    return {
      status: 'healthy',
      latency,
    };
  } catch (error) {
    dbLogger.error({ err: error }, 'Database health check failed');
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Execute database operation with retry logic
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        dbLogger.error({
          err: lastError,
          attempt,
          maxRetries,
        }, 'Database operation failed after all retries');
        throw lastError;
      }
      
      dbLogger.warn({
        err: lastError,
        attempt,
        maxRetries,
        nextRetryIn: delay,
      }, 'Database operation failed, retrying...');
      
      // Wait before retry with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }
  
  throw lastError || new Error('Unknown error in retry function');
}

/**
 * Transaction wrapper with logging
 */
export async function withTransaction<T>(
  operation: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  const prisma = getPrismaClient();
  const transactionId = crypto.randomUUID();
  
  dbLogger.debug({ transactionId }, 'Starting database transaction');
  
  try {
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Execute the operation with the transaction client
      return await operation(tx as PrismaClient);
    });
    
    dbLogger.debug({ transactionId }, 'Database transaction completed successfully');
    return result;
  } catch (error) {
    dbLogger.error({
      err: error,
      transactionId,
    }, 'Database transaction failed');
    throw error;
  }
}

/**
 * Soft delete utility (for entities that support soft deletion)
 */
export async function softDelete(
  prisma: PrismaClient,
  model: string,
  id: string,
  userId?: string
) {
  const now = new Date();
  
  return await (prisma as any)[model].update({
    where: { id },
    data: {
      deletedAt: now,
      deletedBy: userId,
      updatedAt: now,
    },
  });
}

/**
 * Bulk operation utility with progress logging
 */
export async function bulkOperation<T>(
  items: T[],
  operation: (item: T) => Promise<void>,
  batchSize: number = 100,
  operationName: string = 'bulk operation'
): Promise<void> {
  const total = items.length;
  let processed = 0;
  
  dbLogger.info({
    total,
    batchSize,
    operation: operationName,
  }, `Starting ${operationName}`);
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (item) => {
      try {
        await operation(item);
        processed++;
      } catch (error) {
        dbLogger.error({
          err: error,
          item,
          operation: operationName,
        }, `Failed to process item in ${operationName}`);
        throw error;
      }
    }));
    
    const progress = Math.round((processed / total) * 100);
    dbLogger.info({
      processed,
      total,
      progress,
      operation: operationName,
    }, `${operationName} progress: ${progress}%`);
  }
  
  dbLogger.info({
    processed,
    total,
    operation: operationName,
  }, `${operationName} completed successfully`);
}

// Export the singleton instance getter as default
export default getPrismaClient;