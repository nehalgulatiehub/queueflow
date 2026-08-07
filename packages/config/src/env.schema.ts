import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default('0.0.0.0'),
  
  // Database Configuration
  DATABASE_URL: z.string().url().default('postgresql://queueflow:queueflow_secret_password@localhost:5432/queueflow_db?schema=public'),
  
  // Redis Configuration
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().default('queueflow_redis_password'),
  REDIS_DB: z.coerce.number().default(0),
  
  // Security & Authentication
  JWT_SECRET: z.string().min(32).default('queueflow_super_secret_jwt_key_32bytes_min_length'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('30d'),
  
  // Observability & Telemetry
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  OTEL_SERVICE_NAME: z.string().default('queueflow-service'),
  PROMETHEUS_METRICS_ENABLED: z.coerce.boolean().default(true),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variable configuration:', result.error.format());
    throw new Error('Environment configuration validation failed.');
  }
  return result.data;
}
