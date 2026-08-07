import { Redis, RedisOptions } from 'ioredis';

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  maxRetriesPerRequest?: number;
}

export function createRedisClient(config: RedisConfig): Redis {
  const options: RedisOptions = {
    host: config.host,
    port: config.port,
    password: config.password,
    db: config.db || 0,
    maxRetriesPerRequest: config.maxRetriesPerRequest ?? null,
    enableReadyCheck: true,
    retryStrategy(times) {
      const delay = Math.min(times * 100, 3000);
      return delay;
    },
  };

  const redis = new Redis(options);

  redis.on('error', (err) => {
    console.error('❌ Redis Connection Error:', err.message);
  });

  return redis;
}
