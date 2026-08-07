import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import { FastifyReply, FastifyRequest } from 'fastify';
import { env } from '../config/env.js';
import { hashApiKey } from '../utils/api-key.js';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface ApiKeyPayload {
  projectId: string;
  permissions: string[];
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    authenticateApiKey: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: TokenPayload;
    user: TokenPayload;
  }
}

export default fp(async (fastify) => {
  await fastify.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_EXPIRES_IN,
    },
  });

  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized', message: 'Invalid or expired access token' });
    }
  });

  fastify.decorate('authenticateApiKey', async (request: FastifyRequest, reply: FastifyReply) => {
    const apiKeyHeader = request.headers['x-api-key'] as string;
    if (!apiKeyHeader) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Missing X-API-Key header' });
    }

    const keyHash = hashApiKey(apiKeyHeader);
    const keyRecord = await fastify.prisma.apiKey.findUnique({
      where: { keyHash },
      include: { project: true },
    });

    if (!keyRecord || (keyRecord.expiresAt && keyRecord.expiresAt < new Date())) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid or expired API Key' });
    }

    // Update last used asynchronously
    fastify.prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsedAt: new Date() },
    }).catch(() => {});

    request.user = {
      userId: keyRecord.id,
      email: `apikey:${keyRecord.keyPrefix}`,
      role: 'API_KEY',
    };
  });
});
