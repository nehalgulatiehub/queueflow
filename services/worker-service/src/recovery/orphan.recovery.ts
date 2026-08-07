import { StreamConsumerGroup } from '@queueflow/redis-engine';
import { Logger } from '@queueflow/logger';
import { workerConfig } from '../config/env.js';

export class OrphanRecoverySweeper {
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private consumerGroup: StreamConsumerGroup,
    private logger: Logger
  ) {}

  start(groupName: string, getActiveStreamKeys: () => string[]): void {
    this.timer = setInterval(async () => {
      const streamKeys = getActiveStreamKeys();
      for (const streamKey of streamKeys) {
        try {
          const reclaimed = await this.consumerGroup.autoClaim(
            streamKey,
            groupName,
            workerConfig.workerId,
            30000, // 30 seconds idle threshold
            10
          );

          if (reclaimed.length > 0) {
            this.logger.warn(`[PEL Recovery] Reclaimed ${reclaimed.length} orphaned messages from stream [${streamKey}]`);
          }
        } catch (err: any) {
          this.logger.error(err, `Error executing XAUTOCLAIM on stream ${streamKey}`);
        }
      }
    }, workerConfig.orphanCheckIntervalMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
