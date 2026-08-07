import { describe, it, expect, vi } from 'vitest';
import { JobExecutor } from '../executor/job.executor.js';

describe('JobExecutor Unit Tests', () => {
  it('should process job, update database status, and send XACK to Redis Stream', async () => {
    const fakePrisma = {
      job: {
        update: vi.fn().mockResolvedValue({}),
        findUnique: vi.fn().mockResolvedValue({ currentRetryCount: 0, maxRetries: 3, queueId: 'q-1' }),
      },
      jobLog: {
        create: vi.fn().mockResolvedValue({}),
      },
    } as any;

    const fakeConsumerGroup = {
      ack: vi.fn().mockResolvedValue(1),
    } as any;

    const fakeLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    } as any;

    const executor = new JobExecutor(fakePrisma, fakeConsumerGroup, fakeLogger);

    const testMessage = {
      messageId: '1700000000000-0',
      streamKey: 'queueflow:queue:q-1:stream:high',
      data: {
        jobId: 'job-555',
        queueId: 'q-1',
        projectId: 'proj-1',
        name: 'resize-image',
        payload: JSON.stringify({ imageId: 'img-100' }),
        priority: 'HIGH',
        maxRetries: 3,
        timeoutMs: 5000,
        createdAt: new Date().toISOString(),
      },
    };

    await executor.executeJob(testMessage, 'queueflow-workers-group');

    // Verify status was set to RUNNING and COMPLETED
    expect(fakePrisma.job.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'job-555' },
        data: expect.objectContaining({ status: 'RUNNING' }),
      })
    );

    expect(fakePrisma.job.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'job-555' },
        data: expect.objectContaining({ status: 'COMPLETED', progress: 100 }),
      })
    );

    // Verify Redis Stream message was acknowledged
    expect(fakeConsumerGroup.ack).toHaveBeenCalledWith(
      'queueflow:queue:q-1:stream:high',
      'queueflow-workers-group',
      '1700000000000-0'
    );
  });
});
