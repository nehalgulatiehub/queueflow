import { WorkerApplication } from './app.js';

async function bootstrap() {
  const app = new WorkerApplication();

  try {
    await app.start();
  } catch (err) {
    console.error('❌ Failed to start Worker Service:', err);
    process.exit(1);
  }

  const shutdownSignals = ['SIGINT', 'SIGTERM'];
  for (const signal of shutdownSignals) {
    process.on(signal, async () => {
      console.log(`Received ${signal}, terminating worker...`);
      await app.stop();
      process.exit(0);
    });
  }
}

bootstrap();
