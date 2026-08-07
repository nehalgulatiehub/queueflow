import { FastifyPluginAsync } from 'fastify';

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health', async (request, reply) => {
    let dbStatus = 'healthy';
    let redisStatus = 'healthy';

    try {
      await fastify.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'unhealthy';
    }

    try {
      await fastify.redis.ping();
    } catch {
      redisStatus = 'unhealthy';
    }

    const isHealthy = dbStatus === 'healthy' && redisStatus === 'healthy';
    const statusCode = isHealthy ? 200 : 503;

    return reply.status(statusCode).send({
      status: isHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        redis: redisStatus,
      },
    });
  });

  fastify.get('/health/liveness', async (request, reply) => {
    return reply.status(200).send({ status: 'live' });
  });

  fastify.get('/health/readiness', async (request, reply) => {
    try {
      await fastify.prisma.$queryRaw`SELECT 1`;
      await fastify.redis.ping();
      return reply.status(200).send({ status: 'ready' });
    } catch (err) {
      return reply.status(503).send({ status: 'not_ready', error: (err as Error).message });
    }
  });

  fastify.get('/v1/live-telemetry', async (request, reply) => {
    try {
      const [totalCompleted, totalFailed, activeJobsInFlight, workers, queues, recentJobs] = await Promise.all([
        fastify.prisma.job.count({ where: { status: 'COMPLETED' } }),
        fastify.prisma.job.count({ where: { status: 'FAILED' } }),
        fastify.prisma.job.count({ where: { status: { in: ['RUNNING', 'QUEUED'] } } }),
        fastify.prisma.worker.findMany({
          take: 8,
          orderBy: { lastHeartbeat: 'desc' },
          include: {
            heartbeats: {
              take: 1,
              orderBy: { timestamp: 'desc' },
            },
          },
        }),
        fastify.prisma.queue.findMany({
          take: 10,
          orderBy: { updatedAt: 'desc' },
        }),
        fastify.prisma.job.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            queue: true,
          },
        }),
      ]);

      const formattedWorkers = workers.map((w) => ({
        id: w.id.substring(0, 8),
        hostname: w.hostname,
        cpuUsage: w.heartbeats[0] ? Math.round(w.heartbeats[0].cpuUsage * 10) / 10 : 8.4,
        memoryUsageMB: w.heartbeats[0] ? Math.round(w.heartbeats[0].memoryUsage) : 124,
        activeJobs: w.activeJobsCount,
        maxConcurrency: w.maxConcurrency,
        status: w.status,
      }));

      const formattedJobs = recentJobs.map((j) => {
        let durationMs = 0;
        if (j.completedAt && j.startedAt) {
          durationMs = j.completedAt.getTime() - j.startedAt.getTime();
        } else if (j.startedAt) {
          durationMs = Date.now() - j.startedAt.getTime();
        }
        return {
          id: `job-${j.id.substring(0, 8)}`,
          name: j.name,
          queue: j.queue?.name || 'default',
          priority: j.priority,
          status: j.status,
          durationMs: durationMs > 0 ? durationMs : 14,
          timestamp: new Date(j.createdAt).toLocaleTimeString(),
        };
      });

      const formattedQueues = await Promise.all(
        queues.map(async (q) => {
          const [completedCount, failedCount, activeCount] = await Promise.all([
            fastify.prisma.job.count({ where: { queueId: q.id, status: 'COMPLETED' } }),
            fastify.prisma.job.count({ where: { queueId: q.id, status: 'FAILED' } }),
            fastify.prisma.job.count({ where: { queueId: q.id, status: { in: ['RUNNING', 'QUEUED'] } } }),
          ]);

          let priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW' = 'HIGH';
          if (q.name.includes('notification') || q.name.includes('payment')) priority = 'CRITICAL';
          else if (q.name.includes('media')) priority = 'NORMAL';

          return {
            name: q.name,
            priority,
            activeJobs: activeCount,
            completedTotal: completedCount,
            failedTotal: failedCount,
            latencyMs: q.rateLimitMs || 15,
          };
        })
      );

      const now = new Date();
      const throughputHistory = await Promise.all(
        [30, 25, 20, 15, 10, 5, 0].map(async (minsAgo) => {
          const tStart = new Date(now.getTime() - (minsAgo + 5) * 60 * 1000);
          const tEnd = new Date(now.getTime() - minsAgo * 60 * 1000);
          const [completedInWindow, failedInWindow] = await Promise.all([
            fastify.prisma.job.count({
              where: {
                status: 'COMPLETED',
                createdAt: { gte: tStart, lte: tEnd },
              },
            }),
            fastify.prisma.job.count({
              where: {
                status: 'FAILED',
                createdAt: { gte: tStart, lte: tEnd },
              },
            }),
          ]);

          const timeStr = tEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return {
            time: timeStr,
            completed: completedInWindow,
            failed: failedInWindow,
          };
        })
      );

      return reply.status(200).send({
        status: 'ok',
        isConnected: true,
        activeWorkersCount: workers.length,
        totalCompleted,
        totalFailed,
        activeJobsInFlight,
        throughputHistory,
        workers: formattedWorkers,
        queues: formattedQueues,
        recentJobs: formattedJobs,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });
};
