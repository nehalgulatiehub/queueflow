import { describe, it, expect } from 'vitest';
import { createLogger } from '../logger.js';

describe('Pino Logger Factory', () => {
  it('should initialize a pino logger with given service name', () => {
    const logger = createLogger({
      serviceName: 'test-service',
      level: 'debug',
      isDevelopment: false,
    });

    expect(logger).toBeDefined();
    expect(logger.level).toBe('debug');
  });
});
