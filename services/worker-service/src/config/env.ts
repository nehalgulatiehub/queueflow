import { loadEnv } from '@queueflow/config';
import os from 'os';
import crypto from 'crypto';

export const env = loadEnv();

export const workerConfig = {
  workerId: process.env.WORKER_ID || crypto.randomUUID(),
  workerName: process.env.WORKER_NAME || `queueflow-worker-${os.hostname()}`,
  hostname: os.hostname(),
  ipAddress: '127.0.0.1',
  maxConcurrency: parseInt(process.env.WORKER_CONCURRENCY || '100', 10),
  heartbeatIntervalMs: 10000, // 10s pulse
  orphanCheckIntervalMs: 15000, // 15s recovery check
  version: '1.0.0',
};
