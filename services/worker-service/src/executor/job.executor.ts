import { PrismaClient } from '@queueflow/database';
import { StreamConsumerGroup, StreamMessage } from '@queueflow/redis-engine';
import { Logger } from '@queueflow/logger';
import { workerConfig } from '../config/env.js';

export class JobExecutor {
  constructor(
    private prisma: PrismaClient,
    private consumerGroup: StreamConsumerGroup,
    private logger: Logger
  ) {}

  async executeJob(message: StreamMessage, groupName: string): Promise<void> {
    const { messageId, streamKey, data } = message;
    const startTime = Date.now();

    this.logger.info(`Starting execution of job [${data.jobId}] from stream [${streamKey}]`);

    // Update job state in Database
    await this.prisma.job.update({
      where: { id: data.jobId },
      data: {
        status: 'RUNNING',
        workerId: workerConfig.workerId,
        startedAt: new Date(),
      },
    });

    await this.logMessage(data.jobId, 'INFO', `Worker ${workerConfig.workerId} started processing job ${data.name}`);

    const abortController = new AbortController();
    const timeoutTimer = setTimeout(() => {
      abortController.abort();
    }, data.timeoutMs);

    try {
      // Sandboxed execution mock handler (or real dynamic module handler)
      await this.runSandboxHandler(data.name, JSON.parse(data.payload), abortController.signal);

      clearTimeout(timeoutTimer);
      const durationMs = Date.now() - startTime;

      // Mark COMPLETED in Database
      await this.prisma.job.update({
        where: { id: data.jobId },
        data: {
          status: 'COMPLETED',
          progress: 100,
          completedAt: new Date(),
          result: { success: true, durationMs },
        },
      });

      await this.logMessage(data.jobId, 'INFO', `Job completed successfully in ${durationMs}ms`);

      // Acknowledge Redis Stream message
      await this.consumerGroup.ack(streamKey, groupName, messageId);

    } catch (err: any) {
      clearTimeout(timeoutTimer);
      const durationMs = Date.now() - startTime;
      const errorMessage = err.name === 'AbortError' ? `Job timed out after ${data.timeoutMs}ms` : err.message;

      this.logger.error(`Job [${data.jobId}] failed: ${errorMessage}`);

      await this.handleFailure(message, groupName, errorMessage, durationMs);
    }
  }

  private async runSandboxHandler(jobName: string, payload: any, signal: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      if (signal.aborted) {
        return reject(new Error('Job aborted prior to execution'));
      }

      const onAbort = () => {
        reject(new Error('Job execution timed out'));
      };

      signal.addEventListener('abort', onAbort);

      // Simulate work duration safely
      const processingTimeMs = 1; // Ultra-fast for benchmark demo
      setTimeout(() => {
        signal.removeEventListener('abort', onAbort);
        if (signal.aborted) return;
        resolve();
      }, processingTimeMs);
    });
  }

  private async handleFailure(
    message: StreamMessage,
    groupName: string,
    errorMessage: string,
    durationMs: number
  ): Promise<void> {
    const { messageId, streamKey, data } = message;

    const job = await this.prisma.job.findUnique({
      where: { id: data.jobId },
      select: { currentRetryCount: true, maxRetries: true, queueId: true },
    });

    if (!job) return;

    const nextRetryNumber = job.currentRetryCount + 1;
    const isRetriable = nextRetryNumber <= job.maxRetries;

    if (isRetriable) {
      // Calculate Exponential Backoff
      const backoffDelayMs = Math.pow(2, nextRetryNumber) * 1000;
      const nextRetryAt = new Date(Date.now() + backoffDelayMs);

      await this.prisma.job.update({
        where: { id: data.jobId },
        data: {
          status: 'RETRYING',
          currentRetryCount: nextRetryNumber,
          scheduledAt: nextRetryAt,
          error: { message: errorMessage, durationMs },
        },
      });

      await this.prisma.retryHistory.create({
        data: {
          jobId: data.jobId,
          retryNumber: nextRetryNumber,
          error: { message: errorMessage },
          attemptDurationMs: durationMs,
          nextRetryAt,
        },
      });

      await this.logMessage(data.jobId, 'WARN', `Job failed. Retry ${nextRetryNumber}/${job.maxRetries} scheduled at ${nextRetryAt.toISOString()}`);
    } else {
      // Max Retries Reached -> Move to Dead Letter Queue (DLQ)
      await this.prisma.job.update({
        where: { id: data.jobId },
        data: {
          status: 'DEAD_LETTER',
          failedAt: new Date(),
          error: { message: errorMessage, durationMs, maxRetriesExhausted: true },
        },
      });

      await this.prisma.deadLetterJob.create({
        data: {
          jobId: data.jobId,
          originalQueueId: job.queueId,
          reason: errorMessage,
          payload: JSON.parse(data.payload),
          stackTrace: errorMessage,
        },
      });

      await this.logMessage(data.jobId, 'ERROR', `Job permanently failed and moved to Dead Letter Queue (DLQ)`);
    }

    // Always issue XACK to remove from Stream so poison pill doesn't block stream
    await this.consumerGroup.ack(streamKey, groupName, messageId);
  }

  private async logMessage(jobId: string, level: 'INFO' | 'WARN' | 'ERROR', message: string): Promise<void> {
    try {
      await this.prisma.jobLog.create({
        data: {
          jobId,
          workerId: workerConfig.workerId,
          level,
          message,
        },
      });
    } catch {}
  }
}
