import { PrismaClient } from '@queueflow/database';
import { StreamProducer } from '@queueflow/redis-engine';
import { Logger } from '@queueflow/logger';
import cronParser from 'cron-parser';
import { schedulerConfig } from '../config/env.js';

export class CronEvaluator {
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private prisma: PrismaClient,
    private producer: StreamProducer,
    private logger: Logger
  ) {}

  start(): void {
    this.timer = setInterval(async () => {
      await this.evaluateCronJobs();
    }, schedulerConfig.cronIntervalMs);
  }

  async evaluateCronJobs(): Promise<void> {
    try {
      const now = new Date();

      // Query jobs configured with cron expressions
      const cronJobs = await this.prisma.job.findMany({
        where: {
          cronExpression: { not: null },
          status: { in: ['SCHEDULED', 'QUEUED', 'COMPLETED'] },
        },
        take: schedulerConfig.batchSize,
      });

      for (const job of cronJobs) {
        if (!job.cronExpression) continue;

        try {
          const interval = cronParser.parseExpression(job.cronExpression, {
            currentDate: job.scheduledAt || job.createdAt,
          });

          const nextRunDate = interval.next().toDate();

          if (nextRunDate <= now) {
            // Trigger new execution run
            const newJob = await this.prisma.job.create({
              data: {
                queueId: job.queueId,
                projectId: job.projectId,
                name: job.name,
                payload: job.payload || {},
                priority: job.priority,
                status: 'QUEUED',
                cronExpression: job.cronExpression,
                maxRetries: job.maxRetries,
                timeoutMs: job.timeoutMs,
                parentJobId: job.id,
              },
            });

            await this.producer.enqueue(newJob.queueId, newJob.priority, {
              jobId: newJob.id,
              queueId: newJob.queueId,
              projectId: newJob.projectId,
              name: newJob.name,
              payload: JSON.stringify(newJob.payload),
              priority: newJob.priority,
              maxRetries: newJob.maxRetries,
              timeoutMs: newJob.timeoutMs,
              createdAt: newJob.createdAt.toISOString(),
            });

            // Update parent job scheduledAt pointer to next interval
            const followingRunDate = interval.next().toDate();
            await this.prisma.job.update({
              where: { id: job.id },
              data: { scheduledAt: followingRunDate },
            });

            this.logger.info(`Cron trigger spawned job [${newJob.id}] for template [${job.id}]. Next run: ${followingRunDate.toISOString()}`);
          }
        } catch (parserErr: any) {
          this.logger.error(`Invalid cron expression [${job.cronExpression}] on job [${job.id}]`);
        }
      }
    } catch (err: any) {
      this.logger.error(err, 'Error in CronEvaluator cycle');
    }
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
