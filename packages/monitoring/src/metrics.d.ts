import { Counter, Gauge, Histogram, Registry } from 'prom-client';
export declare class MetricsCollector {
    registry: Registry;
    jobsCreatedTotal: Counter<string>;
    jobsCompletedTotal: Counter<string>;
    jobsFailedTotal: Counter<string>;
    jobsRetriedTotal: Counter<string>;
    activeWorkersGauge: Gauge<string>;
    queueLengthGauge: Gauge<string>;
    workerCpuUsageGauge: Gauge<string>;
    workerMemoryBytesGauge: Gauge<string>;
    jobExecutionDurationHistogram: Histogram<string>;
    httpRequestDurationHistogram: Histogram<string>;
    constructor(serviceName: string);
    getMetricsContentType(): Promise<string>;
    getMetrics(): Promise<string>;
}
export declare const metricsCollector: MetricsCollector;
//# sourceMappingURL=metrics.d.ts.map