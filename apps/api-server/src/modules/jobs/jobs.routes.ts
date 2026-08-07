import { FastifyPluginAsync } from 'fastify';
import { StreamProducer } from '@queueflow/redis-engine';
import { JobService } from './jobs.service.js';
import { JobController } from './jobs.controller.js';

export const jobRoutes: FastifyPluginAsync = async (fastify) => {
  const producer = new StreamProducer(fastify.redis);
  const jobService = new JobService(fastify.prisma, producer);
  const controller = new JobController(jobService);

  fastify.post<{ Params: { projectId: string; queueId: string } }>(
    '/projects/:projectId/queues/:queueId/jobs',
    { preHandler: [fastify.authenticate] },
    (req, reply) => controller.create(req, reply)
  );

  fastify.get<{
    Params: { projectId: string };
    Querystring: { queueId?: string; status?: string };
  }>(
    '/projects/:projectId/jobs',
    { preHandler: [fastify.authenticate] },
    (req, reply) => controller.list(req, reply)
  );

  fastify.get<{ Params: { projectId: string; id: string } }>(
    '/projects/:projectId/jobs/:id',
    { preHandler: [fastify.authenticate] },
    (req, reply) => controller.getById(req, reply)
  );

  fastify.post<{ Params: { projectId: string; id: string } }>(
    '/projects/:projectId/jobs/:id/cancel',
    { preHandler: [fastify.authenticate] },
    (req, reply) => controller.cancel(req, reply)
  );
};
