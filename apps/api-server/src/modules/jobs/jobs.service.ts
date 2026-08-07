import { PrismaClient } from '@queueflow/database';
import { StreamProducer } from '@queueflow/redis-engine';
import { CreateJobInput } from '@queueflow/shared';

export class JobService {
  constructor(
    private prisma: PrismaClient,
    private producer: StreamProducer
  ) {}

  async createJob(projectId: string, queueId: string, input: CreateJobInput) {
    const queue = await this.prisma.queue.findFirst({
      where: { id: queueId, projectId },
    });

    if (!queue) {
      throw new Error('Queue not found');
    }

    if (queue.status === 'PAUSED') {
      throw new Error('Queue is currently paused');
    }

    // Handle Idempotency Key Guard
    if (input.idempotencyKey) {
      const existingJobId = await this.producer.getIdempotencyJobId(projectId, input.idempotencyKey);
      if (existingJobId) {
        const existingJob = await this.prisma.job.findUnique({
          where: { id: existingJobId },
        });
        if (existingJob) {
          return { job: existingJob, isDuplicate: true };
        }
      }
    }

    const isScheduled = input.delayMs > 0 || input.scheduledAt;
    const scheduledAtDate = input.scheduledAt
      ? new Date(input.scheduledAt)
      : input.delayMs > 0
      ? new Date(Date.now() + input.delayMs)
      : null;

    const initialStatus = isScheduled ? 'SCHEDULED' : 'QUEUED';
    const maxRetries = input.maxRetries ?? queue.defaultMaxRetries;
    const timeoutMs = input.timeoutMs ?? queue.defaultTimeoutMs;

    const job = await this.prisma.job.create({
      data: {
        queueId,
        projectId,
        name: input.name,
        payload: input.payload,
        priority: input.priority,
        status: initialStatus,
        maxRetries,
        timeoutMs,
        delayMs: input.delayMs,
        scheduledAt: scheduledAtDate,
        idempotencyKey: input.idempotencyKey,
        tags: input.tags,
        metadata: input.metadata,
      },
    });

    if (input.idempotencyKey) {
      await this.producer.setIdempotencyKey(projectId, input.idempotencyKey, job.id);
    }

    // Enqueue to Redis Stream if execution is immediate
    if (!isScheduled) {
      await this.producer.enqueue(queueId, input.priority, {
        jobId: job.id,
        queueId,
        projectId,
        name: job.name,
        payload: JSON.stringify(job.payload),
        priority: job.priority,
        maxRetries: job.maxRetries,
        timeoutMs: job.timeoutMs,
        createdAt: job.createdAt.toISOString(),
      });
    }

    return { job, isDuplicate: false };
  }

  async getJobById(projectId: string, jobId: string) {
    const job = await this.prisma.job.findFirst({
      where: { id: jobId, projectId },
      include: {
        logs: { orderBy: { timestamp: 'desc' }, take: 50 },
        retries: { orderBy: { createdAt: 'desc' } },
        worker: { select: { id: true, name: true, hostname: true } },
      },
    });

    if (!job) {
      throw new Error('Job not found');
    }

    return job;
  }

  async listJobs(projectId: string, queueId?: string, status?: string) {
    return this.prisma.job.findMany({
      where: {
        projectId,
        ...(queueId ? { queueId } : {}),
        ...(status ? { status: status as any } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async cancelJob(projectId: string, jobId: string) {
    const job = await this.prisma.job.findFirst({
      where: { id: jobId, projectId },
    });

    if (!job) {
      throw new Error('Job not found');
    }

    if (job.status === 'COMPLETED' || job.status === 'FAILED' || job.status === 'CANCELLED') {
      throw new Error(`Cannot cancel job in ${job.status} state`);
    }

    return this.prisma.job.update({
      where: { id: jobId },
      data: { status: 'CANCELLED' },
    });
  }
}
