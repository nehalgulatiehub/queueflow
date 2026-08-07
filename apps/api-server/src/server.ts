import { buildApp } from './app.js';
import { env } from './config/env.js';

async function start() {
  const app = buildApp();

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    app.log.info(`🚀 API Server listening on http://${env.HOST}:${env.PORT}`);
  } catch (err) {
    app.log.error(err, '❌ Failed to start API Server');
    process.exit(1);
  }

  const signals = ['SIGINT', 'SIGTERM'];
  for (const signal of signals) {
    process.on(signal, async () => {
      app.log.info(`Shutting down API Server on ${signal}...`);
      await app.close();
      process.exit(0);
    });
  }
}

start();
