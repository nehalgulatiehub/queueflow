import { prisma } from '@queueflow/database';
import { createRedisClient, StreamConsumerGroup } from '@queueflow/redis-engine';
import { createLogger } from '@queueflow/logger';
import { HeartbeatManager } from './heartbeat/heartbeat.manager.js';
import { JobExecutor } from './executor/job.executor.js';
import { OrphanRecoverySweeper } from './recovery/orphan.recovery.js';
import { WorkerConsumer } from './consumer/worker.consumer.js';
import { env, workerConfig } from './config/env.js';

export class WorkerApplication {
  private logger = createLogger({
    serviceName: `worker-service-${workerConfig.workerId}`,
    level: env.LOG_LEVEL,
    isDevelopment: env.NODE_ENV === 'development',
  });

  private redis = createRedisClient({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    db: env.REDIS_DB,
  });

  private consumerGroup = new StreamConsumerGroup(this.redis);
  private heartbeatManager = new HeartbeatManager(prisma, this.redis, this.logger);
  private executor = new JobExecutor(prisma, this.consumerGroup, this.logger);
  private orphanSweeper = new OrphanRecoverySweeper(this.consumerGroup, this.logger);
  private consumer = new WorkerConsumer(prisma, this.consumerGroup, this.executor, this.logger);

  async start(): Promise<void> {
    this.logger.info(`Bootstrapping Worker Node [${workerConfig.workerId}] on host [${workerConfig.hostname}]`);

    // 1. Register worker in database & Redis
    await this.heartbeatManager.register();

    // 2. Start heartbeat telemetry pulse loop
    this.heartbeatManager.startPulse(() => this.consumer.getActiveJobsCount());

    // 3. Start orphan PEL recovery sweeper
    this.orphanSweeper.start('queueflow-workers-group', () => []);

    // 4. Start high-concurrency stream consumer loop
    this.consumer.start().catch((err) => {
      this.logger.error(err, 'Fatal error in consumer execution');
    });

    this.logger.info(`Worker Node [${workerConfig.workerId}] initialized successfully`);
  }

  async stop(): Promise<void> {
    this.logger.info(`Initiating graceful shutdown for Worker Node [${workerConfig.workerId}]...`);
    
    // Stop receiving new stream jobs
    this.consumer.stop();
    this.orphanSweeper.stop();
    await this.heartbeatManager.stop();
    
    await this.redis.quit();
    await prisma.$disconnect();

    this.logger.info(`Worker Node [${workerConfig.workerId}] shutdown complete`);
  }
}
