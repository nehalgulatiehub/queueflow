import { describe, it, expect } from 'vitest';
import { envSchema } from '../env.schema.js';

describe('Environment Schema Validation', () => {
  it('should parse valid environment variables with defaults', () => {
    const parsed = envSchema.parse({
      NODE_ENV: 'development',
      PORT: '4000',
    });

    expect(parsed.PORT).toBe(4000);
    expect(parsed.NODE_ENV).toBe('development');
    expect(parsed.REDIS_HOST).toBe('localhost');
  });

  it('should throw validation error on invalid PORT or database URL', () => {
    expect(() =>
      envSchema.parse({
        DATABASE_URL: 'invalid-url',
      })
    ).toThrow();
  });
});
