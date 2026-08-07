import { Logger } from 'pino';
export interface LoggerConfig {
    serviceName: string;
    level?: string;
    isDevelopment?: boolean;
}
export declare function createLogger(config: LoggerConfig): Logger;
//# sourceMappingURL=logger.d.ts.map