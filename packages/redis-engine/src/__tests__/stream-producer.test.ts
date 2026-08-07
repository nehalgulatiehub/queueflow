import { describe, it, expect, vi } from 'vitest';
import { StreamProducer } from '../producer.js';

describe('StreamProducer Unit Tests', () => {
  it('should format stream fields correctly and invoke redis.xadd', async () => {
    const fakeRedis = {
      xadd: vi.fn().mockResolvedValue('1700000000000-0'),
      set: vi.fn().mockResolvedValue('OK'),
      get: vi.fn().mockResolvedValue('job-123'),
    } as any;

    const producer = new StreamProducer(fakeRedis);

    const messageId = await producer.enqueue('q-1', 'HIGH', {
      jobId: 'job-123',
      queueId: 'q-1',
      projectId: 'proj-1',
      name: 'send-email',
      payload: JSON.stringify({ email: 'user@stripe.com' }),
      priority: 'HIGH',
      maxRetries: 3,
      timeoutMs: 30000,
      createdAt: new Date().toISOString(),
    });

    expect(messageId).toBe('1700000000000-0');
    expect(fakeRedis.xadd).toHaveBeenCalledWith(
      'queueflow:queue:q-1:stream:high',
      '*',
      'jobId', 'job-123',
      'queueId', 'q-1',
      'projectId', 'proj-1',
      'name', 'send-email',
      'payload', '{"email":"user@stripe.com"}',
      'priority', 'HIGH',
      'maxRetries', '3',
      'timeoutMs', '30000',
      'createdAt', expect.any(String)
    );
  });

  it('should handle idempotency key setting and lookup', async () => {
    const fakeRedis = {
      set: vi.fn().mockResolvedValue('OK'),
      get: vi.fn().mockResolvedValue('job-999'),
    } as any;

    const producer = new StreamProducer(fakeRedis);

    const isSet = await producer.setIdempotencyKey('proj-1', 'idem-123', 'job-999');
    expect(isSet).toBe(true);
    expect(fakeRedis.set).toHaveBeenCalledWith(
      'queueflow:idempotency:proj-1:idem-123',
      'job-999',
      'EX',
      86400,
      'NX'
    );

    const existingId = await producer.getIdempotencyJobId('proj-1', 'idem-123');
    expect(existingId).toBe('job-999');
  });
});
