import { Counter, Gauge, Histogram, Registry, collectDefaultMetrics } from 'prom-client';

export class MetricsCollector {
  public registry: Registry;

  // Counters
  public jobsCreatedTotal: Counter<string>;
  public jobsCompletedTotal: Counter<string>;
  public jobsFailedTotal: Counter<string>;
  public jobsRetriedTotal: Counter<string>;

  // Gauges
  public activeWorkersGauge: Gauge<string>;
  public queueLengthGauge: Gauge<string>;
  public workerCpuUsageGauge: Gauge<string>;
  public workerMemoryBytesGauge: Gauge<string>;

  // Histograms
  public jobExecutionDurationHistogram: Histogram<string>;
  public httpRequestDurationHistogram: Histogram<string>;

  constructor(serviceName: string) {
    this.registry = new Registry();
    this.registry.setDefaultLabels({ service: serviceName });

    collectDefaultMetrics({ register: this.registry });

    this.jobsCreatedTotal = new Counter({
      name: 'queueflow_jobs_created_total',
      help: 'Total number of background jobs created',
      labelNames: ['queue_id', 'priority'],
      registers: [this.registry],
    });

    this.jobsCompletedTotal = new Counter({
      name: 'queueflow_jobs_completed_total',
      help: 'Total number of background jobs completed successfully',
      labelNames: ['queue_id', 'worker_id'],
      registers: [this.registry],
    });

    this.jobsFailedTotal = new Counter({
      name: 'queueflow_jobs_failed_total',
      help: 'Total number of background jobs that failed',
      labelNames: ['queue_id', 'worker_id', 'reason'],
      registers: [this.registry],
    });

    this.jobsRetriedTotal = new Counter({
      name: 'queueflow_jobs_retried_total',
      help: 'Total number of background job retry attempts',
      labelNames: ['queue_id', 'attempt'],
      registers: [this.registry],
    });

    this.activeWorkersGauge = new Gauge({
      name: 'queueflow_active_workers_count',
      help: 'Current count of active online worker instances',
      registers: [this.registry],
    });

    this.queueLengthGauge = new Gauge({
      name: 'queueflow_queue_length',
      help: 'Current pending message length in queue',
      labelNames: ['queue_id', 'priority'],
      registers: [this.registry],
    });

    this.workerCpuUsageGauge = new Gauge({
      name: 'queueflow_worker_cpu_usage_ratio',
      help: 'Worker node CPU utilization ratio (0 to 1)',
      labelNames: ['worker_id'],
      registers: [this.registry],
    });

    this.workerMemoryBytesGauge = new Gauge({
      name: 'queueflow_worker_memory_bytes',
      help: 'Worker node RSS memory usage in bytes',
      labelNames: ['worker_id'],
      registers: [this.registry],
    });

    this.jobExecutionDurationHistogram = new Histogram({
      name: 'queueflow_job_execution_duration_seconds',
      help: 'Job processing duration in seconds',
      labelNames: ['queue_id', 'status'],
      buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10, 30],
      registers: [this.registry],
    });

    this.httpRequestDurationHistogram = new Histogram({
      name: 'queueflow_api_request_duration_seconds',
      help: 'HTTP API request duration in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5],
      registers: [this.registry],
    });
  }

  async getMetricsContentType(): Promise<string> {
    return this.registry.contentType;
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}

export const metricsCollector = new MetricsCollector('queueflow-core');
