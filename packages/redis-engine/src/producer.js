export class StreamProducer {
    redis;
    constructor(redis) {
        this.redis = redis;
    }
    /**
     * Pushes a job to a Redis Stream with a specific priority tier
     */
    async enqueue(queueId, priority, data) {
        const streamKey = `queueflow:queue:${queueId}:stream:${priority.toLowerCase()}`;
        // Flatten object into string key-value pairs for XADD
        const fields = [
            'jobId', data.jobId,
            'queueId', data.queueId,
            'projectId', data.projectId,
            'name', data.name,
            'payload', data.payload,
            'priority', data.priority,
            'maxRetries', String(data.maxRetries),
            'timeoutMs', String(data.timeoutMs),
            'createdAt', data.createdAt,
        ];
        const messageId = await this.redis.xadd(streamKey, '*', ...fields);
        if (!messageId) {
            throw new Error(`Failed to push job ${data.jobId} to stream ${streamKey}`);
        }
        return messageId;
    }
    /**
     * Sets idempotency key guard in Redis (SETNX with EX TTL)
     */
    async setIdempotencyKey(projectId, idempotencyKey, jobId, ttlSeconds = 86400) {
        const key = `queueflow:idempotency:${projectId}:${idempotencyKey}`;
        const result = await this.redis.set(key, jobId, 'EX', ttlSeconds, 'NX');
        return result === 'OK';
    }
    /**
     * Gets existing jobId for an idempotency key
     */
    async getIdempotencyJobId(projectId, idempotencyKey) {
        const key = `queueflow:idempotency:${projectId}:${idempotencyKey}`;
        return this.redis.get(key);
    }
}
//# sourceMappingURL=producer.js.map