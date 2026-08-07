import { FastifyPluginAsync } from 'fastify';
import { QueueService } from './queues.service.js';
import { QueueController } from './queues.controller.js';

export const queueRoutes: FastifyPluginAsync = async (fastify) => {
  const queueService = new QueueService(fastify.prisma);
  const controller = new QueueController(queueService);

  fastify.post<{ Params: { projectId: string } }>(
    '/projects/:projectId/queues',
    { preHandler: [fastify.authenticate] },
    (req, reply) => controller.create(req, reply)
  );

  fastify.get<{ Params: { projectId: string } }>(
    '/projects/:projectId/queues',
    { preHandler: [fastify.authenticate] },
    (req, reply) => controller.list(req, reply)
  );

  fastify.get<{ Params: { projectId: string; id: string } }>(
    '/projects/:projectId/queues/:id',
    { preHandler: [fastify.authenticate] },
    (req, reply) => controller.getById(req, reply)
  );

  fastify.post<{ Params: { projectId: string; id: string } }>(
    '/projects/:projectId/queues/:id/pause',
    { preHandler: [fastify.authenticate] },
    (req, reply) => controller.pause(req, reply)
  );

  fastify.post<{ Params: { projectId: string; id: string } }>(
    '/projects/:projectId/queues/:id/resume',
    { preHandler: [fastify.authenticate] },
    (req, reply) => controller.resume(req, reply)
  );

  fastify.delete<{ Params: { projectId: string; id: string } }>(
    '/projects/:projectId/queues/:id',
    { preHandler: [fastify.authenticate] },
    (req, reply) => controller.delete(req, reply)
  );
};
