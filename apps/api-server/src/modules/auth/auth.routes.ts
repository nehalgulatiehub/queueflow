import { FastifyPluginAsync } from 'fastify';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  const authService = new AuthService(fastify.prisma);
  const authController = new AuthController(authService);

  fastify.post('/auth/register', (req, reply) => authController.register(req, reply));
  fastify.post('/auth/login', (req, reply) => authController.login(req, reply));
  
  fastify.get(
    '/auth/me',
    { preHandler: [fastify.authenticate] },
    (req, reply) => authController.getMe(req, reply)
  );
};
