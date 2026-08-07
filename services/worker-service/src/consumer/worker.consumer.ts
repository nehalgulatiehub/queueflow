import { PrismaClient } from '@queueflow/database';
import { StreamConsumerGroup } from '@queueflow/redis-engine';
import { Logger } from '@queueflow/logger';
import { JobExecutor } from '../executor/job.executor.js';
import { workerConfig } from '../config/env.js';

export class WorkerConsumer {
  private isRunning = false;
  private activeJobsCount = 0;

  constructor(
    private prisma: PrismaClient,
    private consumerGroup: StreamConsumerGroup,
    private executor: JobExecutor,
    private logger: Logger
  ) {}

  getActiveJobsCount(): number {
    return this.activeJobsCount;
  }

  async start(): Promise<void> {
    this.isRunning = true;
    this.logger.info(`Worker consumer loop initiated with concurrency limit [${workerConfig.maxConcurrency}]`);

    const groupName = 'queueflow-workers-group';

    while (this.isRunning) {
      try {
        // Enforce worker process concurrency throttle
        if (this.activeJobsCount >= workerConfig.maxConcurrency) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          continue;
        }

        // Fetch active queues from database
        const activeQueues = await this.prisma.queue.findMany({
          where: { status: 'ACTIVE' },
          select: { id: true },
        });

        if (activeQueues.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }

        // Build priority streams list
        const priorities = ['critical', 'high', 'normal', 'low'];
        const streamKeys: string[] = [];
        for (const queue of activeQueues) {
          for (const p of priorities) {
            const key = `queueflow:queue:${queue.id}:stream:${p}`;
            streamKeys.push(key);
            await this.consumerGroup.ensureGroup(key, groupName);
          }
        }

        const availableSlots = workerConfig.maxConcurrency - this.activeJobsCount;
        const messages = await this.consumerGroup.readMessages(
          groupName,
          workerConfig.workerId,
          streamKeys,
          availableSlots,
          1000 // Block for 1s
        );

        for (const message of messages) {
          this.activeJobsCount++;
          this.executor.executeJob(message, groupName).finally(() => {
            this.activeJobsCount--;
          });
        }
      } catch (err: any) {
        this.logger.error(err, 'Error in worker consumer loop');
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  stop(): void {
    this.isRunning = false;
    this.logger.info('Stopping worker consumer loop...');
  }
}
