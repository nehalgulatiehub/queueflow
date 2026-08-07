import { loadEnv } from '@queueflow/config';

export const env = loadEnv();

export const schedulerConfig = {
  sweepIntervalMs: parseInt(process.env.SCHEDULER_SWEEP_INTERVAL_MS || '2000', 10), // Every 2s
  expirationIntervalMs: parseInt(process.env.SCHEDULER_EXPIRATION_INTERVAL_MS || '10000', 10), // Every 10s
  cronIntervalMs: parseInt(process.env.SCHEDULER_CRON_INTERVAL_MS || '5000', 10), // Every 5s
  batchSize: parseInt(process.env.SCHEDULER_BATCH_SIZE || '100', 10),
};
