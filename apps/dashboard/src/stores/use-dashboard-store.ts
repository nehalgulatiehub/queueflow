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
  currentThroughput: number;
  throughputHistory: ThroughputSample[];
  recentJobs: TelemetryJob[];
  workers: WorkerNode[];
  queues: QueueSummary[];

  setIsConnected: (connected: boolean) => void;
  addJob: (job: TelemetryJob) => void;
  updateMetrics: (sample: ThroughputSample) => void;
  setWorkers: (workers: WorkerNode[]) => void;
  fetchLiveTelemetry: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  isConnected: false,
  activeWorkersCount: 0,
  totalCompleted: 0,
  totalFailed: 0,
  activeJobsInFlight: 0,
  currentThroughput: 0,
  throughputHistory: [],
  recentJobs: [],
  workers: [],
  queues: [],

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
  fetchLiveTelemetry: async () => {
    try {
      const res = await fetch('http://localhost:4000/v1/live-telemetry').catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        set((state) => {
          const throughput = Math.max(0, Math.floor((data.totalCompleted - state.totalCompleted) / 2));
          return {
            isConnected: true,
            activeWorkersCount: data.activeWorkersCount,
            totalCompleted: data.totalCompleted,
            totalFailed: data.totalFailed,
            activeJobsInFlight: data.activeJobsInFlight,
            currentThroughput: state.totalCompleted === 0 ? 0 : throughput,
            throughputHistory: data.throughputHistory || state.throughputHistory,
            workers: data.workers,
            queues: data.queues,
            recentJobs: data.recentJobs,
          };
        });
      }
    } catch {
      // Keep existing state silently when server is offline
    }
  },
}));
