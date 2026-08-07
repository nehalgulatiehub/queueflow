import { describe, it, expect } from 'vitest';
import { MetricsCollector } from '../metrics.js';

describe('MetricsCollector Unit Tests', () => {
  it('should initialize counters, gauges, histograms and output valid prometheus metrics format', async () => {
    const collector = new MetricsCollector('test-service');

    collector.jobsCreatedTotal.inc({ queue_id: 'q-1', priority: 'HIGH' });
    collector.jobsCompletedTotal.inc({ queue_id: 'q-1', worker_id: 'w-1' });
    collector.activeWorkersGauge.set(15);
    collector.jobExecutionDurationHistogram.observe({ queue_id: 'q-1', status: 'COMPLETED' }, 0.15);

    const metricsText = await collector.getMetrics();

    expect(metricsText).toContain('queueflow_jobs_created_total');
    expect(metricsText).toContain('queue_id="q-1"');
    expect(metricsText).toContain('queueflow_active_workers_count');
    expect(metricsText).toContain('queueflow_job_execution_duration_seconds');
  });
});
