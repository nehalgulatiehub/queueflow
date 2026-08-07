import { z } from 'zod';
export declare const createQueueSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    maxConcurrency: z.ZodDefault<z.ZodNumber>;
    rateLimitMs: z.ZodDefault<z.ZodNumber>;
    defaultTimeoutMs: z.ZodDefault<z.ZodNumber>;
    defaultMaxRetries: z.ZodDefault<z.ZodNumber>;
    defaultBackoffType: z.ZodDefault<z.ZodEnum<["FIXED", "LINEAR", "EXPONENTIAL", "CUSTOM"]>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    maxConcurrency: number;
    rateLimitMs: number;
    defaultTimeoutMs: number;
    defaultMaxRetries: number;
    defaultBackoffType: "FIXED" | "LINEAR" | "EXPONENTIAL" | "CUSTOM";
    description?: string | undefined;
}, {
    name: string;
    description?: string | undefined;
    maxConcurrency?: number | undefined;
    rateLimitMs?: number | undefined;
    defaultTimeoutMs?: number | undefined;
    defaultMaxRetries?: number | undefined;
    defaultBackoffType?: "FIXED" | "LINEAR" | "EXPONENTIAL" | "CUSTOM" | undefined;
}>;
export declare const updateQueueStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["ACTIVE", "PAUSED", "ARCHIVED"]>;
}, "strip", z.ZodTypeAny, {
    status: "ACTIVE" | "PAUSED" | "ARCHIVED";
}, {
    status: "ACTIVE" | "PAUSED" | "ARCHIVED";
}>;
export type CreateQueueInput = z.infer<typeof createQueueSchema>;
export type UpdateQueueStatusInput = z.infer<typeof updateQueueStatusSchema>;
//# sourceMappingURL=queue.dto.d.ts.map