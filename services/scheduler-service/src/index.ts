import { SchedulerApplication } from './app.js';

async function bootstrap() {
  const app = new SchedulerApplication();

  try {
    await app.start();
  } catch (err) {
    console.error('❌ Failed to start Scheduler Service:', err);
    process.exit(1);
  }

  const shutdownSignals = ['SIGINT', 'SIGTERM'];
  for (const signal of shutdownSignals) {
    process.on(signal, async () => {
      console.log(`Received ${signal}, terminating scheduler...`);
      await app.stop();
      process.exit(0);
    });
  }
}

bootstrap();
