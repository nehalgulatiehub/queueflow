import { Redis } from 'ioredis';
export interface StreamJobPayload {
    jobId: string;
    queueId: string;
    projectId: string;
    name: string;
    payload: string;
    priority: string;
    maxRetries: number;
    timeoutMs: number;
    createdAt: string;
}
export declare class StreamProducer {
    private redis;
    constructor(redis: Redis);
    /**
     * Pushes a job to a Redis Stream with a specific priority tier
     */
    enqueue(queueId: string, priority: string, data: StreamJobPayload): Promise<string>;
    /**
     * Sets idempotency key guard in Redis (SETNX with EX TTL)
     */
    setIdempotencyKey(projectId: string, idempotencyKey: string, jobId: string, ttlSeconds?: number): Promise<boolean>;
    /**
     * Gets existing jobId for an idempotency key
     */
    getIdempotencyJobId(projectId: string, idempotencyKey: string): Promise<string | null>;
}
//# sourceMappingURL=producer.d.ts.map