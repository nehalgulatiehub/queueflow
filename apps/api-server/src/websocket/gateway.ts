import fp from 'fastify-plugin';
import fastifyWebsocket from '@fastify/websocket';
import { WebSocket } from 'ws';
import { createRedisClient } from '@queueflow/redis-engine';
import { env } from '../config/env.js';

export default fp(async (fastify) => {
  await fastify.register(fastifyWebsocket);

  const subscriberRedis = createRedisClient({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    db: env.REDIS_DB,
  });

  const activeClients = new Set<WebSocket>();

  // Subscribe to Redis Pub/Sub channel
  await subscriberRedis.subscribe('queueflow:events');

  subscriberRedis.on('message', (channel, message) => {
    if (channel === 'queueflow:events') {
      for (const client of activeClients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      }
    }
  });

  fastify.get('/v1/ws', { websocket: true }, (connection, req) => {
    const socket = connection.socket;
    activeClients.add(socket);

    fastify.log.info('Client connected to WebSocket Gateway');

    socket.send(JSON.stringify({
      type: 'connection.established',
      message: 'Connected to QueueFlow Realtime Telemetry Stream',
      timestamp: new Date().toISOString(),
    }));

    socket.on('close', () => {
      activeClients.delete(socket);
      fastify.log.info('Client disconnected from WebSocket Gateway');
    });

    socket.on('error', (err) => {
      fastify.log.error(err, 'WebSocket client error');
      activeClients.delete(socket);
    });
  });
});
