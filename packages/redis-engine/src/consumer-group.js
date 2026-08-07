export class StreamConsumerGroup {
    redis;
    constructor(redis) {
        this.redis = redis;
    }
    /**
     * Ensures consumer group exists on the stream
     */
    async ensureGroup(streamKey, groupName) {
        try {
            await this.redis.xgroup('CREATE', streamKey, groupName, '$', 'MKSTREAM');
        }
        catch (err) {
            if (!err.message.includes('BUSYGROUP')) {
                throw err;
            }
        }
    }
    /**
     * Reads pending or new messages from streams using XREADGROUP
     */
    async readMessages(groupName, consumerName, streamKeys, count = 10, blockMs = 2000) {
        if (streamKeys.length === 0)
            return [];
        // Form array of stream keys followed by '>' position pointers
        const positions = streamKeys.map(() => '>');
        // xreadgroup('GROUP', groupName, consumerName, 'BLOCK', blockMs, 'COUNT', count, 'STREAMS', ...streamKeys, ...positions)
        const result = await this.redis.xreadgroup('GROUP', groupName, consumerName, 'BLOCK', blockMs, 'COUNT', count, 'STREAMS', ...streamKeys, ...positions);
        if (!result)
            return [];
        const messages = [];
        for (const [streamKey, streamMessages] of result) {
            for (const [messageId, fieldArray] of streamMessages) {
                const dataObj = {};
                for (let i = 0; i < fieldArray.length; i += 2) {
                    dataObj[fieldArray[i]] = fieldArray[i + 1];
                }
                messages.push({
                    messageId,
                    streamKey,
                    data: {
                        jobId: dataObj.jobId,
                        queueId: dataObj.queueId,
                        projectId: dataObj.projectId,
                        name: dataObj.name,
                        payload: dataObj.payload,
                        priority: dataObj.priority,
                        maxRetries: parseInt(dataObj.maxRetries || '3', 10),
                        timeoutMs: parseInt(dataObj.timeoutMs || '30000', 10),
                        createdAt: dataObj.createdAt,
                    },
                });
            }
        }
        return messages;
    }
    /**
     * Acknowledges message completion in Redis Stream
     */
    async ack(streamKey, groupName, messageId) {
        return this.redis.xack(streamKey, groupName, messageId);
    }
    /**
     * Reclaims orphaned pending messages using XAUTOCLAIM (idle > minIdleMs)
     */
    async autoClaim(streamKey, groupName, consumerName, minIdleMs = 30000, count = 10) {
        // xautoclaim(streamKey, groupName, consumerName, minIdleMs, '0-0', 'COUNT', count)
        const result = await this.redis.xautoclaim(streamKey, groupName, consumerName, minIdleMs, '0-0', 'COUNT', count);
        if (!result || !result[1])
            return [];
        const claimedRawMessages = result[1];
        const messages = [];
        for (const [messageId, fieldArray] of claimedRawMessages) {
            if (!fieldArray || fieldArray.length === 0)
                continue;
            const dataObj = {};
            for (let i = 0; i < fieldArray.length; i += 2) {
                dataObj[fieldArray[i]] = fieldArray[i + 1];
            }
            messages.push({
                messageId,
                streamKey,
                data: {
                    jobId: dataObj.jobId,
                    queueId: dataObj.queueId,
                    projectId: dataObj.projectId,
                    name: dataObj.name,
                    payload: dataObj.payload,
                    priority: dataObj.priority,
                    maxRetries: parseInt(dataObj.maxRetries || '3', 10),
                    timeoutMs: parseInt(dataObj.timeoutMs || '30000', 10),
                    createdAt: dataObj.createdAt,
                },
            });
        }
        return messages;
    }
}
//# sourceMappingURL=consumer-group.js.map