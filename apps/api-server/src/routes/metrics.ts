import { FastifyPluginAsync } from 'fastify';
import { metricsCollector } from '@queueflow/monitoring';

export const metricsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/metrics', async (request, reply) => {
    const contentType = await metricsCollector.getMetricsContentType();
    const metrics = await metricsCollector.getMetrics();

    return reply
      .header('Content-Type', contentType)
      .send(metrics);
  });
};
