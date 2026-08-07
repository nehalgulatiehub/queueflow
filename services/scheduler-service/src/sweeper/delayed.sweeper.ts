import { PrismaClient } from '@queueflow/database';
import { StreamProducer } from '@queueflow/redis-engine';
import { Logger } from '@queueflow/logger';
import { schedulerConfig } from '../config/env.js';

export class DelayedJobSweeper {
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private prisma: PrismaClient,
    private producer: StreamProducer,
    private logger: Logger
  ) {}

  start(): void {
    this.timer = setInterval(async () => {
      await this.sweepDueJobs();
    }, schedulerConfig.sweepIntervalMs);
  }

  async sweepDueJobs(): Promise<void> {
    try {
      const now = new Date();

      // Query due scheduled jobs indexed on (scheduledAt, status)
      const dueJobs = await this.prisma.job.findMany({
        where: {
          status: 'SCHEDULED',
          scheduledAt: { lte: now },
        },
        take: schedulerConfig.batchSize,
        orderBy: { scheduledAt: 'asc' },
      });

      if (dueJobs.length === 0) return;

      this.logger.info(`Found ${dueJobs.length} due scheduled jobs to dispatch`);

      for (const job of dueJobs) {
        // Atomic status transition from SCHEDULED to QUEUED
        const updated = await this.prisma.job.updateMany({
          where: {
            id: job.id,
            status: 'SCHEDULED',
          },
          data: { status: 'QUEUED' },
        });

        if (updated.count > 0) {
          // Push job to Redis Stream
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

          this.logger.info(`Dispatched scheduled job [${job.id}] to stream`);
        }
      }
    } catch (err: any) {
      this.logger.error(err, 'Error in DelayedJobSweeper cycle');
    }
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
