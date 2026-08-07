import { Redis } from 'ioredis';
export interface RedisConfig {
    host: string;
    port: number;
    password?: string;
    db?: number;
    maxRetriesPerRequest?: number;
}
export declare function createRedisClient(config: RedisConfig): Redis;
//# sourceMappingURL=client.d.ts.map