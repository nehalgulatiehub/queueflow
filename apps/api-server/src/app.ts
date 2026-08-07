import Fastify, { FastifyInstance } from 'fastify';
import { createLogger } from '@queueflow/logger';
import corsPlugin from './plugins/cors.js';
import helmetPlugin from './plugins/helmet.js';
import prismaPlugin from './plugins/prisma.js';
import redisPlugin from './plugins/redis.js';
import authPlugin from './plugins/auth.js';
import websocketGateway from './websocket/gateway.js';
import { healthRoutes } from './routes/health.js';
import { metricsRoutes } from './routes/metrics.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { apiKeyRoutes } from './modules/api-keys/api-keys.routes.js';
import { queueRoutes } from './modules/queues/queues.routes.js';
import { jobRoutes } from './modules/jobs/jobs.routes.js';
import { env } from './config/env.js';

export function buildApp(): FastifyInstance {
  const logger = createLogger({
    serviceName: 'api-server',
    level: env.LOG_LEVEL,
    isDevelopment: env.NODE_ENV === 'development',
  });

  const app = Fastify({
    logger,
    disableRequestLogging: false,
  });

  // Register Core Plugins
  app.register(corsPlugin);
  app.register(helmetPlugin);
  app.register(prismaPlugin);
  app.register(redisPlugin);
  app.register(authPlugin);
  app.register(websocketGateway);

  // Register Routes
  app.register(healthRoutes);
  app.register(metricsRoutes);
  app.register(authRoutes, { prefix: '/v1' });
  app.register(apiKeyRoutes, { prefix: '/v1' });
  app.register(queueRoutes, { prefix: '/v1' });
  app.register(jobRoutes, { prefix: '/v1' });

  return app;
}
