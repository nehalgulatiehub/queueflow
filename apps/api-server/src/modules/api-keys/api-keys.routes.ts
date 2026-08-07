import { FastifyPluginAsync } from 'fastify';
import { ApiKeyService } from './api-keys.service.js';
import { ApiKeyController } from './api-keys.controller.js';

export const apiKeyRoutes: FastifyPluginAsync = async (fastify) => {
  const apiKeyService = new ApiKeyService(fastify.prisma);
  const controller = new ApiKeyController(apiKeyService);

  fastify.post<{ Params: { projectId: string } }>(
    '/projects/:projectId/api-keys',
    { preHandler: [fastify.authenticate] },
    (req, reply) => controller.create(req, reply)
  );

  fastify.get<{ Params: { projectId: string } }>(
    '/projects/:projectId/api-keys',
    { preHandler: [fastify.authenticate] },
    (req, reply) => controller.list(req, reply)
  );

  fastify.delete<{ Params: { projectId: string; id: string } }>(
    '/projects/:projectId/api-keys/:id',
    { preHandler: [fastify.authenticate] },
    (req, reply) => controller.revoke(req, reply)
  );
};
