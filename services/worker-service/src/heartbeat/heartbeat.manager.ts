import { PrismaClient } from '@queueflow/database';
import { Redis } from '@queueflow/redis-engine';
import { Logger } from '@queueflow/logger';
import os from 'os';
import { workerConfig } from '../config/env.js';

export class HeartbeatManager {
  private intervalTimer: NodeJS.Timeout | null = null;
  private activeJobsCount = 0;

  constructor(
    private prisma: PrismaClient,
    private redis: Redis,
    private logger: Logger
  ) {}

  async register(): Promise<void> {
    await this.prisma.worker.upsert({
      where: { id: workerConfig.workerId },
      update: {
        status: 'ONLINE',
        lastHeartbeat: new Date(),
        maxConcurrency: workerConfig.maxConcurrency,
      },
      create: {
        id: workerConfig.workerId,
        name: workerConfig.workerName,
        hostname: workerConfig.hostname,
        ipAddress: workerConfig.ipAddress,
        status: 'ONLINE',
        maxConcurrency: workerConfig.maxConcurrency,
        version: workerConfig.version,
        lastHeartbeat: new Date(),
      },
    });

    this.logger.info(`Registered worker [${workerConfig.workerId}] successfully`);
  }

  startPulse(getActiveJobsCount: () => number): void {
    this.intervalTimer = setInterval(async () => {
      this.activeJobsCount = getActiveJobsCount();
      await this.sendPulse();
    }, workerConfig.heartbeatIntervalMs);
  }

  async sendPulse(): Promise<void> {
    try {
      const memoryUsageMB = process.memoryUsage().rss / (1024 * 1024);
      const cpus = os.cpus();
      const cpuLoad = cpus.length > 0 ? os.loadavg()[0] / cpus.length : 0;

      // Update worker table
      await this.prisma.worker.update({
        where: { id: workerConfig.workerId },
        data: {
          lastHeartbeat: new Date(),
          activeJobsCount: this.activeJobsCount,
          status: 'ONLINE',
        },
      });

      // Insert heartbeat telemetry sample
      await this.prisma.workerHeartbeat.create({
        data: {
          workerId: workerConfig.workerId,
          cpuUsage: Math.min(100, Math.max(0, cpuLoad * 100)),
          memoryUsage: memoryUsageMB,
          activeJobs: this.activeJobsCount,
        },
      });

      // Update Redis heartbeat key with 30s TTL
      const redisKey = `queueflow:worker:${workerConfig.workerId}:heartbeat`;
      await this.redis.set(redisKey, JSON.stringify({
        workerId: workerConfig.workerId,
        activeJobs: this.activeJobsCount,
        timestamp: new Date().toISOString(),
      }), 'EX', 30);

    } catch (err: any) {
      this.logger.error(err, 'Failed to send worker heartbeat pulse');
    }
  }

  async stop(): Promise<void> {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }

    try {
      await this.prisma.worker.update({
        where: { id: workerConfig.workerId },
        data: {
          status: 'OFFLINE',
          terminatedAt: new Date(),
        },
      });
      await this.redis.del(`queueflow:worker:${workerConfig.workerId}:heartbeat`);
      this.logger.info(`Worker [${workerConfig.workerId}] set to OFFLINE`);
    } catch (err: any) {
      this.logger.error(err, 'Failed to set worker OFFLINE status');
    }
  }
}
