import { z } from 'zod';

export const createJobSchema = z.object({
  name: z.string().min(1, 'Job name is required'),
  payload: z.record(z.any()).default({}),
  priority: z.enum(['CRITICAL', 'HIGH', 'NORMAL', 'LOW']).default('NORMAL'),
  delayMs: z.number().int().min(0).default(0),
  scheduledAt: z.string().datetime().optional(),
  maxRetries: z.number().int().min(0).optional(),
  backoffType: z.enum(['FIXED', 'LINEAR', 'EXPONENTIAL', 'CUSTOM']).optional(),
  backoffDelayMs: z.number().int().min(0).optional(),
  timeoutMs: z.number().int().positive().optional(),
  idempotencyKey: z.string().optional(),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.any()).optional(),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
