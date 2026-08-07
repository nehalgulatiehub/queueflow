import { PrismaClient } from '@queueflow/database';
import { CreateQueueInput } from '@queueflow/shared';

export class QueueService {
  constructor(private prisma: PrismaClient) {}

  async createQueue(projectId: string, input: CreateQueueInput) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return this.prisma.queue.create({
      data: {
        projectId,
        name: input.name,
        description: input.description,
        maxConcurrency: input.maxConcurrency,
        rateLimitMs: input.rateLimitMs,
        defaultTimeoutMs: input.defaultTimeoutMs,
        defaultMaxRetries: input.defaultMaxRetries,
        defaultBackoffType: input.defaultBackoffType,
      },
    });
  }

  async listQueues(projectId: string) {
    return this.prisma.queue.findMany({
      where: { projectId },
      include: {
        _count: {
          select: { jobs: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getQueueById(projectId: string, queueId: string) {
    const queue = await this.prisma.queue.findFirst({
      where: { id: queueId, projectId },
      include: {
        _count: {
          select: { jobs: true, deadLetterJobs: true },
        },
      },
    });

    if (!queue) {
      throw new Error('Queue not found');
    }

    return queue;
  }

  async updateQueueStatus(projectId: string, queueId: string, status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED') {
    return this.prisma.queue.updateMany({
      where: { id: queueId, projectId },
      data: { status },
    });
  }

  async deleteQueue(projectId: string, queueId: string) {
    return this.prisma.queue.deleteMany({
      where: { id: queueId, projectId },
    });
  }
}
