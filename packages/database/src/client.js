import { PrismaClient } from '@prisma/client';
export function createPrismaClient(databaseUrl) {
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
//# sourceMappingURL=client.js.map