// Re-export database client and utilities
export * from './client';
export * from './repositories';
export * from './migrations';

// Common database operations
export const DATABASE_CONFIG = {
  connectionPoolSize: 10,
  queryTimeout: 30000,
  logLevel: process.env.NODE_ENV === 'development' ? 'info' : 'error',
  enableMetrics: true,
} as const;

// Database health check
export async function healthCheck(): Promise<{
  status: 'healthy' | 'unhealthy';
  timestamp: Date;
  version?: string;
  error?: string;
}> {
  try {
    // This will be implemented when Prisma client is available
    return {
      status: 'healthy',
      timestamp: new Date(),
      version: '1.0.0',
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}