import { StreamProducer, createRedisClient } from '@queueflow/redis-engine';
import { PrismaClient } from '@queueflow/database';
import crypto from 'crypto';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://queueflow:queueflow_secret_password@localhost:5432/queueflow_db?schema=public',
    },
  },
});

async function runBenchmark() {
  console.log('🚀 Starting QueueFlow High-Throughput Load Benchmark (Target: 1,000 jobs/sec)...');

  const redis = createRedisClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || 'queueflow_redis_password',
  });

  const activeQueue = await prisma.queue.findFirst({ where: { status: 'ACTIVE' } });
  if (!activeQueue) throw new Error('No active queue found in PostgreSQL!');

  const producer = new StreamProducer(redis);
  const queueId = activeQueue.id;
  const projectId = activeQueue.projectId;
  const totalJobs = 10000;
  const batchSize = 100;

  const startTime = Date.now();
  let completedCount = 0;

  console.log(`[Benchmark] Enqueueing ${totalJobs} jobs in batches of ${batchSize}...`);

  for (let i = 0; i < totalJobs; i += batchSize) {
    const promises = [];
    for (let j = 0; j < batchSize; j++) {
      const jobId = `job-${crypto.randomBytes(6).toString('hex')}`;
      const priority = j % 10 === 0 ? 'CRITICAL' : j % 4 === 0 ? 'HIGH' : 'NORMAL';

      promises.push(
        producer.enqueue(queueId, priority, {
          jobId,
          queueId,
          projectId,
          name: 'benchmark-task',
          payload: JSON.stringify({ batchIndex: i, itemIndex: j, timestamp: Date.now() }),
          priority,
          maxRetries: 3,
          timeoutMs: 15000,
          createdAt: new Date().toISOString(),
        })
      );
    }

    await Promise.all(promises);
    completedCount += batchSize;

    if (completedCount % 2000 === 0) {
      const elapsedSec = (Date.now() - startTime) / 1000;
      console.log(`[Benchmark Progress] Enqueued ${completedCount}/${totalJobs} jobs (${Math.round(completedCount / elapsedSec)} jobs/sec)`);
    }
  }

  const totalElapsedSec = (Date.now() - startTime) / 1000;
  const throughput = Math.round(totalJobs / totalElapsedSec);

  console.log('=====================================================');
  console.log('🎉 QueueFlow Load Benchmark Results');
  console.log('=====================================================');
  console.log(`Total Jobs Enqueued : ${totalJobs.toLocaleString()}`);
  console.log(`Elapsed Time        : ${totalElapsedSec.toFixed(2)} seconds`);
  console.log(`Throughput          : ${throughput.toLocaleString()} jobs/second`);
  console.log('=====================================================');

  await redis.quit();
  await prisma.$disconnect();
}

runBenchmark().catch(async (err) => {
  console.error('❌ Benchmark failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});
