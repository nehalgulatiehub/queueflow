import pino, { Logger, LoggerOptions } from 'pino';

export interface LoggerConfig {
  serviceName: string;
  level?: string;
  isDevelopment?: boolean;
}

export function createLogger(config: LoggerConfig): Logger {
  const options: LoggerOptions = {
    name: config.serviceName,
    level: config.level || 'info',
    base: {
      env: process.env.NODE_ENV || 'development',
      service: config.serviceName,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label) => ({ level: label }),
    },
  };

  if (config.isDevelopment ?? process.env.NODE_ENV !== 'production') {
    return pino({
      ...options,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    });
  }

  return pino(options);
}
