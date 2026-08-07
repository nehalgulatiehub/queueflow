import { describe, it, expect, vi } from 'vitest';
import { DelayedJobSweeper } from '../sweeper/delayed.sweeper.js';
import { ExpirationCleaner } from '../expiration/expiration.cleaner.js';

describe('Scheduler Service Unit Tests', () => {
  it('should find due scheduled jobs and enqueue them to Redis Streams', async () => {
    const dueJob = {
      id: 'job-scheduled-1',
      queueId: 'q-10',
      projectId: 'p-10',
      name: 'send-digest',
      payload: { userId: 'usr-1' },
      priority: 'NORMAL',
      maxRetries: 3,
      timeoutMs: 30000,
      createdAt: new Date(),
    };

    const fakePrisma = {
      job: {
        findMany: vi.fn().mockResolvedValue([dueJob]),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    } as any;

    const fakeProducer = {
      enqueue: vi.fn().mockResolvedValue('1700000000000-0'),
    } as any;

    const fakeLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    } as any;

    const sweeper = new DelayedJobSweeper(fakePrisma, fakeProducer, fakeLogger);
    await sweeper.sweepDueJobs();

    expect(fakePrisma.job.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'SCHEDULED' }),
      })
    );

    expect(fakeProducer.enqueue).toHaveBeenCalledWith('q-10', 'NORMAL', expect.objectContaining({
      jobId: 'job-scheduled-1',
    }));
  });

  it('should update unexecuted expired jobs to EXPIRED state', async () => {
    const fakePrisma = {
      job: {
        updateMany: vi.fn().mockResolvedValue({ count: 4 }),
      },
    } as any;

    const fakeLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    } as any;

    const cleaner = new ExpirationCleaner(fakePrisma, fakeLogger);
    await cleaner.cleanExpiredJobs();

    expect(fakePrisma.job.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: { in: ['PENDING', 'QUEUED', 'SCHEDULED'] },
        }),
        data: { status: 'EXPIRED' },
      })
    );
  });
});
