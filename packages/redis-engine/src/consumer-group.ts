import { Redis } from 'ioredis';
import { StreamJobPayload } from './producer.js';

export interface StreamMessage {
  messageId: string;
  streamKey: string;
  data: StreamJobPayload;
}

export class StreamConsumerGroup {
  constructor(private redis: Redis) {}

  /**
   * Ensures consumer group exists on the stream
   */
  async ensureGroup(streamKey: string, groupName: string): Promise<void> {
    try {
      await this.redis.xgroup('CREATE', streamKey, groupName, '$', 'MKSTREAM');
    } catch (err: any) {
      if (!err.message.includes('BUSYGROUP')) {
        throw err;
      }
    }
  }

  /**
   * Reads pending or new messages from streams using XREADGROUP
   */
  async readMessages(
    groupName: string,
    consumerName: string,
    streamKeys: string[],
    count = 10,
    blockMs = 2000
  ): Promise<StreamMessage[]> {
    if (streamKeys.length === 0) return [];

    // Form array of stream keys followed by '>' position pointers
    const positions = streamKeys.map(() => '>');
    
    // xreadgroup('GROUP', groupName, consumerName, 'BLOCK', blockMs, 'COUNT', count, 'STREAMS', ...streamKeys, ...positions)
    const result = await (this.redis as any).xreadgroup(
      'GROUP',
      groupName,
      consumerName,
      'BLOCK',
      blockMs,
      'COUNT',
      count,
      'STREAMS',
      ...streamKeys,
      ...positions
    ) as Array<[string, Array<[string, string[]]>]> | null;

    if (!result) return [];

    const messages: StreamMessage[] = [];

    for (const [streamKey, streamMessages] of result) {
      for (const [messageId, fieldArray] of streamMessages) {
        const dataObj: Record<string, string> = {};
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
  async ack(streamKey: string, groupName: string, messageId: string): Promise<number> {
    return this.redis.xack(streamKey, groupName, messageId);
  }

  /**
   * Reclaims orphaned pending messages using XAUTOCLAIM (idle > minIdleMs)
   */
  async autoClaim(
    streamKey: string,
    groupName: string,
    consumerName: string,
    minIdleMs = 30000,
    count = 10
  ): Promise<StreamMessage[]> {
    // xautoclaim(streamKey, groupName, consumerName, minIdleMs, '0-0', 'COUNT', count)
    const result = await (this.redis as any).xautoclaim(
      streamKey,
      groupName,
      consumerName,
      minIdleMs,
      '0-0',
      'COUNT',
      count
    );

    if (!result || !result[1]) return [];

    const claimedRawMessages = result[1] as Array<[string, string[]]>;
    const messages: StreamMessage[] = [];

    for (const [messageId, fieldArray] of claimedRawMessages) {
      if (!fieldArray || fieldArray.length === 0) continue;
      
      const dataObj: Record<string, string> = {};
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
