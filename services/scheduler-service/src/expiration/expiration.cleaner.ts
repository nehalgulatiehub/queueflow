import { PrismaClient } from '@queueflow/database';
import { Logger } from '@queueflow/logger';
import { schedulerConfig } from '../config/env.js';

export class ExpirationCleaner {
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private prisma: PrismaClient,
    private logger: Logger
  ) {}

  start(): void {
    this.timer = setInterval(async () => {
      await this.cleanExpiredJobs();
    }, schedulerConfig.expirationIntervalMs);
  }

  async cleanExpiredJobs(): Promise<void> {
    try {
      const now = new Date();

      const result = await this.prisma.job.updateMany({
        where: {
          expiresAt: { lte: now },
          status: { in: ['PENDING', 'QUEUED', 'SCHEDULED'] },
        },
        data: { status: 'EXPIRED' },
      });

      if (result.count > 0) {
        this.logger.warn(`Marked ${result.count} unexecuted jobs as EXPIRED`);
      }
    } catch (err: any) {
      this.logger.error(err, 'Error in ExpirationCleaner cycle');
    }
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
