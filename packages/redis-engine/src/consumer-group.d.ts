import { Redis } from 'ioredis';
import { StreamJobPayload } from './producer.js';
export interface StreamMessage {
    messageId: string;
    streamKey: string;
    data: StreamJobPayload;
}
export declare class StreamConsumerGroup {
    private redis;
    constructor(redis: Redis);
    /**
     * Ensures consumer group exists on the stream
     */
    ensureGroup(streamKey: string, groupName: string): Promise<void>;
    /**
     * Reads pending or new messages from streams using XREADGROUP
     */
    readMessages(groupName: string, consumerName: string, streamKeys: string[], count?: number, blockMs?: number): Promise<StreamMessage[]>;
    /**
     * Acknowledges message completion in Redis Stream
     */
    ack(streamKey: string, groupName: string, messageId: string): Promise<number>;
    /**
     * Reclaims orphaned pending messages using XAUTOCLAIM (idle > minIdleMs)
     */
    autoClaim(streamKey: string, groupName: string, consumerName: string, minIdleMs?: number, count?: number): Promise<StreamMessage[]>;
}
//# sourceMappingURL=consumer-group.d.ts.map