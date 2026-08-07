import { z } from 'zod';

export const createQueueSchema = z.object({
  name: z.string().min(2, 'Queue name is required'),
  description: z.string().optional(),
  maxConcurrency: z.number().int().positive().default(10),
  rateLimitMs: z.number().int().min(0).default(0),
  defaultTimeoutMs: z.number().int().positive().default(30000),
  defaultMaxRetries: z.number().int().min(0).default(3),
  defaultBackoffType: z.enum(['FIXED', 'LINEAR', 'EXPONENTIAL', 'CUSTOM']).default('EXPONENTIAL'),
});

export const updateQueueStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED']),
});

export type CreateQueueInput = z.infer<typeof createQueueSchema>;
export type UpdateQueueStatusInput = z.infer<typeof updateQueueStatusSchema>;
