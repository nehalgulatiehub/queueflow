import { PrismaClient } from '@queueflow/database';
import { createRedisClient } from '@queueflow/redis-engine';

async function resetDemo() {
  console.log('Resetting QueueFlow cluster environment...');

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'postgresql://queueflow:queueflow_secret_password@localhost:5432/queueflow_db?schema=public',
      },
    },
  });

  const redis = createRedisClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || 'queueflow_redis_password',
  });

  try {
    await redis.flushall();
    console.log('Redis Streams & Keys flushed.');

    const deleted = await prisma.job.deleteMany({});
    console.log(`Cleared ${deleted.count} historical jobs from PostgreSQL.`);

    console.log('Cluster environment successfully reset.');
  } catch (err) {
    console.error('Error resetting cluster:', err);
  } finally {
    await redis.quit();
    await prisma.$disconnect();
  }
}

resetDemo();
