import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export function createPrismaClient(databaseUrl?: string): PrismaClient {
  const dbUrl = databaseUrl || process.env.DATABASE_URL || 'postgresql://queueflow:queueflow_secret_password@localhost:5432/queueflow_db?schema=public';
  const client = globalThis.prismaGlobal ?? new PrismaClient({
    datasources: { db: { url: dbUrl } },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  if (process.env.NODE_ENV !== 'production') {
    globalThis.prismaGlobal = client;
  }

  return client;
}

export const prisma = createPrismaClient();
