import { create } from 'zustand';

export interface TelemetryJob {
  id: string;
  name: string;
  queue: string;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  status: 'COMPLETED' | 'PROCESSING' | 'FAILED' | 'RETRYING';
  durationMs: number;
  timestamp: string;
}

export interface WorkerNode {
  id: string;
  hostname: string;
  cpuUsage: number;
  memoryUsageMB: number;
  activeJobs: number;
  maxConcurrency: number;
  status: 'ONLINE' | 'BUSY' | 'IDLE';
}

export interface QueueSummary {
  name: string;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  activeJobs: number;
  completedTotal: number;
  failedTotal: number;
  latencyMs: number;
}

export interface ThroughputSample {
  time: string;
  completed: number;
  failed: number;
}

interface DashboardState {
  isConnected: boolean;
  activeWorkersCount: number;
  totalCompleted: number;
  totalFailed: number;
  activeJobsInFlight: number;
  throughputHistory: ThroughputSample[];
  recentJobs: TelemetryJob[];
  workers: WorkerNode[];
  queues: QueueSummary[];

  setIsConnected: (connected: boolean) => void;
  addJob: (job: TelemetryJob) => void;
  updateMetrics: (sample: ThroughputSample) => void;
  setWorkers: (workers: WorkerNode[]) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  isConnected: true,
  activeWorkersCount: 8,
  totalCompleted: 142580,
  totalFailed: 42,
  activeJobsInFlight: 14,
  throughputHistory: [
    { time: '10:00', completed: 840, failed: 2 },
    { time: '10:05', completed: 1120, failed: 5 },
    { time: '10:10', completed: 1450, failed: 1 },
    { time: '10:15', completed: 1890, failed: 3 },
    { time: '10:20', completed: 2310, failed: 0 },
    { time: '10:25', completed: 2840, failed: 2 },
    { time: '10:30', completed: 3120, failed: 4 },
  ],
  recentJobs: [
    {
      id: 'job-9f821a04',
      name: 'send-welcome-email',
      queue: 'user-notifications',
      priority: 'CRITICAL',
      status: 'COMPLETED',
      durationMs: 14,
      timestamp: 'Just now',
    },
    {
      id: 'job-7b310e9c',
      name: 'generate-monthly-invoice-pdf',
      queue: 'billing-engine',
      priority: 'HIGH',
      status: 'PROCESSING',
      durationMs: 182,
      timestamp: '2s ago',
    },
    {
      id: 'job-4a199d8b',
      name: 'sync-stripe-webhooks',
      queue: 'payment-sync',
      priority: 'CRITICAL',
      status: 'COMPLETED',
      durationMs: 8,
      timestamp: '5s ago',
    },
    {
      id: 'job-2c8411e3',
      name: 'resize-avatar-asset',
      queue: 'media-processor',
      priority: 'NORMAL',
      status: 'COMPLETED',
      durationMs: 45,
      timestamp: '8s ago',
    },
    {
      id: 'job-1d5420f9',
      name: 'purge-expired-sessions',
      queue: 'maintenance-cron',
      priority: 'LOW',
      status: 'COMPLETED',
      durationMs: 120,
      timestamp: '12s ago',
    },
    {
      id: 'job-0e9812a1',
      name: 'dispatch-push-notification',
      queue: 'user-notifications',
      priority: 'HIGH',
      status: 'FAILED',
      durationMs: 5000,
      timestamp: '15s ago',
    },
  ],
  workers: [
    {
      id: 'worker-us-east-01',
      hostname: 'ip-10-0-1-42.ec2.internal',
      cpuUsage: 24.5,
      memoryUsageMB: 184,
      activeJobs: 4,
      maxConcurrency: 10,
      status: 'ONLINE',
    },
    {
      id: 'worker-us-east-02',
      hostname: 'ip-10-0-1-89.ec2.internal',
      cpuUsage: 41.2,
      memoryUsageMB: 210,
      activeJobs: 7,
      maxConcurrency: 10,
      status: 'BUSY',
    },
    {
      id: 'worker-eu-west-01',
      hostname: 'ip-10-0-2-15.ec2.internal',
      cpuUsage: 12.8,
      memoryUsageMB: 142,
      activeJobs: 2,
      maxConcurrency: 10,
      status: 'ONLINE',
    },
    {
      id: 'worker-ap-south-01',
      hostname: 'ip-10-0-3-77.ec2.internal',
      cpuUsage: 18.0,
      memoryUsageMB: 165,
      activeJobs: 1,
      maxConcurrency: 10,
      status: 'IDLE',
    },
  ],
  queues: [
    {
      name: 'user-notifications',
      priority: 'CRITICAL',
      activeJobs: 5,
      completedTotal: 68420,
      failedTotal: 12,
      latencyMs: 12,
    },
    {
      name: 'billing-engine',
      priority: 'HIGH',
      activeJobs: 4,
      completedTotal: 34110,
      failedTotal: 8,
      latencyMs: 45,
    },
    {
      name: 'payment-sync',
      priority: 'CRITICAL',
      activeJobs: 3,
      completedTotal: 29400,
      failedTotal: 4,
      latencyMs: 8,
    },
    {
      name: 'media-processor',
      priority: 'NORMAL',
      activeJobs: 2,
      completedTotal: 10650,
      failedTotal: 18,
      latencyMs: 140,
    },
  ],

  setIsConnected: (connected) => set({ isConnected: connected }),
  addJob: (job) =>
    set((state) => ({
      recentJobs: [job, ...state.recentJobs].slice(0, 10),
      totalCompleted: job.status === 'COMPLETED' ? state.totalCompleted + 1 : state.totalCompleted,
      totalFailed: job.status === 'FAILED' ? state.totalFailed + 1 : state.totalFailed,
    })),
  updateMetrics: (sample) =>
    set((state) => ({
      throughputHistory: [...state.throughputHistory.slice(1), sample],
    })),
  setWorkers: (workers) => set({ workers }),
}));
