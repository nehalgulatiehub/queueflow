import { PrismaClient } from '@queueflow/database';
import { StreamProducer } from '@queueflow/redis-engine';
import { Logger } from '@queueflow/logger';
import { schedulerConfig } from '../config/env.js';

export class RetryDispatcher {
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private prisma: PrismaClient,
    private producer: StreamProducer,
    private logger: Logger
  ) {}

  start(): void {
    this.timer = setInterval(async () => {
      await this.dispatchDueRetries();
    }, schedulerConfig.sweepIntervalMs);
  }

  async dispatchDueRetries(): Promise<void> {
    try {
      const now = new Date();

      const dueRetries = await this.prisma.job.findMany({
        where: {
          status: 'RETRYING',
          scheduledAt: { lte: now },
        },
        take: schedulerConfig.batchSize,
        orderBy: { scheduledAt: 'asc' },
      });

      if (dueRetries.length === 0) return;

      this.logger.info(`Found ${dueRetries.length} due retry jobs to re-enqueue`);

      for (const job of dueRetries) {
        const updated = await this.prisma.job.updateMany({
          where: {
            id: job.id,
            status: 'RETRYING',
          },
          data: { status: 'QUEUED' },
        });

        if (updated.count > 0) {
          await this.producer.enqueue(job.queueId, job.priority, {
            jobId: job.id,
            queueId: job.queueId,
            projectId: job.projectId,
            name: job.name,
            payload: JSON.stringify(job.payload),
            priority: job.priority,
            maxRetries: job.maxRetries,
            timeoutMs: job.timeoutMs,
            createdAt: job.createdAt.toISOString(),
          });

          this.logger.info(`Re-enqueued retry job [${job.id}] (Attempt #${job.currentRetryCount})`);
        }
      }
    } catch (err: any) {
      this.logger.error(err, 'Error in RetryDispatcher cycle');
    }
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
