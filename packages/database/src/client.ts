import { PrismaClient, type Prisma } from '@prisma/client';

// Global database connection
declare global {
  var __prisma: PrismaClient | undefined;
}

// Database client with connection pooling and optimization
export const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// Database connection test
export async function testConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Multi-tenant query helpers
export function withTenant<T>(tenantId: string, query: (prisma: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  // Add row-level security context
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Set tenant context for RLS
    await tx.$executeRaw`SET app.current_tenant_id = ${tenantId}`;
    return query(tx);
  });
}

// Soft delete helper
export async function softDelete(model: any, id: string): Promise<any> {
  return model.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
}

// Bulk operations with batching
export async function bulkCreate<T>(
  model: any,
  data: T[],
  batchSize: number = 1000
): Promise<any[]> {
  const results = [];
  
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const result = await model.createMany({
      data: batch,
      skipDuplicates: true,
    });
    results.push(result);
  }
  
  return results;
}

export { PrismaClient, Prisma } from '@prisma/client';
export type { 
  User, 
  Tenant,
  District,
  School,
  Classroom,
  Assessment,
  AssessmentQuestion,
  AssessmentAttempt,
  IEP,
  IEPGoal,
  IEPService,
  AIModel,
  PersonalAIModel,
  AIConversation,
  Subscription,
  SubscriptionPlan,
} from '@prisma/client';