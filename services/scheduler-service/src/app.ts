import { prisma } from '@queueflow/database';
import { createRedisClient, StreamProducer } from '@queueflow/redis-engine';
import { createLogger } from '@queueflow/logger';
import { DelayedJobSweeper } from './sweeper/delayed.sweeper.js';
import { RetryDispatcher } from './retry/retry.dispatcher.js';
import { ExpirationCleaner } from './expiration/expiration.cleaner.js';
import { CronEvaluator } from './cron/cron.evaluator.js';
import { env } from './config/env.js';

export class SchedulerApplication {
  private logger = createLogger({
    serviceName: 'scheduler-service',
    level: env.LOG_LEVEL,
    isDevelopment: env.NODE_ENV === 'development',
  });

  private redis = createRedisClient({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    db: env.REDIS_DB,
  });

  private producer = new StreamProducer(this.redis);
  private delayedSweeper = new DelayedJobSweeper(prisma, this.producer, this.logger);
  private retryDispatcher = new RetryDispatcher(prisma, this.producer, this.logger);
  private expirationCleaner = new ExpirationCleaner(prisma, this.logger);
  private cronEvaluator = new CronEvaluator(prisma, this.producer, this.logger);

  async start(): Promise<void> {
    this.logger.info('Bootstrapping Scheduler Daemon...');

    this.delayedSweeper.start();
    this.retryDispatcher.start();
    this.expirationCleaner.start();
    this.cronEvaluator.start();

    this.logger.info('Scheduler Daemon active (Sweeper, Retry Dispatcher, Expiration Cleaner, Cron Evaluator running)');
  }

  async stop(): Promise<void> {
    this.logger.info('Initiating graceful shutdown for Scheduler Daemon...');

    this.delayedSweeper.stop();
    this.retryDispatcher.stop();
    this.expirationCleaner.stop();
    this.cronEvaluator.stop();

    await this.redis.quit();
    await prisma.$disconnect();

    this.logger.info('Scheduler Daemon shutdown complete');
  }
}
