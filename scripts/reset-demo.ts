import { PrismaClient } from '@queueflow/database';
import { createRedisClient } from '@queueflow/redis-engine';

async function resetDemo() {
  console.log('🧹 Resetting QueueFlow demo environment...');

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
    // Clear Redis
    await redis.flushall();
    console.log('✅ Redis Streams & Keys flushed.');

    // Clear Jobs from Postgres
    const deleted = await prisma.job.deleteMany({});
    console.log(`✅ Cleared ${deleted.count} historical jobs from PostgreSQL.`);

    console.log('\n✨ Demo environment is 100% clean and ready for LinkedIn video recording!');
  } catch (err) {
    console.error('❌ Error resetting demo:', err);
  } finally {
    await redis.quit();
    await prisma.$disconnect();
  }
}

resetDemo();
