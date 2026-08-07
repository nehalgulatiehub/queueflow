import { z } from 'zod';
export declare const createJobSchema: z.ZodObject<{
    name: z.ZodString;
    payload: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    priority: z.ZodDefault<z.ZodEnum<["CRITICAL", "HIGH", "NORMAL", "LOW"]>>;
    delayMs: z.ZodDefault<z.ZodNumber>;
    scheduledAt: z.ZodOptional<z.ZodString>;
    maxRetries: z.ZodOptional<z.ZodNumber>;
    backoffType: z.ZodOptional<z.ZodEnum<["FIXED", "LINEAR", "EXPONENTIAL", "CUSTOM"]>>;
    backoffDelayMs: z.ZodOptional<z.ZodNumber>;
    timeoutMs: z.ZodOptional<z.ZodNumber>;
    idempotencyKey: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    payload: Record<string, any>;
    priority: "CRITICAL" | "HIGH" | "NORMAL" | "LOW";
    delayMs: number;
    tags: string[];
    maxRetries?: number | undefined;
    timeoutMs?: number | undefined;
    scheduledAt?: string | undefined;
    backoffType?: "FIXED" | "LINEAR" | "EXPONENTIAL" | "CUSTOM" | undefined;
    backoffDelayMs?: number | undefined;
    idempotencyKey?: string | undefined;
    metadata?: Record<string, any> | undefined;
}, {
    name: string;
    payload?: Record<string, any> | undefined;
    priority?: "CRITICAL" | "HIGH" | "NORMAL" | "LOW" | undefined;
    maxRetries?: number | undefined;
    timeoutMs?: number | undefined;
    delayMs?: number | undefined;
    scheduledAt?: string | undefined;
    backoffType?: "FIXED" | "LINEAR" | "EXPONENTIAL" | "CUSTOM" | undefined;
    backoffDelayMs?: number | undefined;
    idempotencyKey?: string | undefined;
    tags?: string[] | undefined;
    metadata?: Record<string, any> | undefined;
}>;
export type CreateJobInput = z.infer<typeof createJobSchema>;
//# sourceMappingURL=job.dto.d.ts.map