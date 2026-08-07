import { create } from 'zustand';

export interface TelemetryLog {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}

export interface ThroughputSample {
  time: string;
  completed: number;
  failed: number;
}

interface DashboardState {
  isConnected: boolean;
  activeWorkers: number;
  totalCompleted: number;
  totalFailed: number;
  throughputHistory: ThroughputSample[];
  logs: TelemetryLog[];

  setIsConnected: (connected: boolean) => void;
  addLog: (log: TelemetryLog) => void;
  updateMetrics: (sample: ThroughputSample) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  isConnected: false,
  activeWorkers: 12,
  totalCompleted: 14250,
  totalFailed: 23,
  throughputHistory: [
    { time: '10:00', completed: 120, failed: 2 },
    { time: '10:05', completed: 240, failed: 1 },
    { time: '10:10', completed: 310, failed: 4 },
    { time: '10:15', completed: 480, failed: 0 },
    { time: '10:20', completed: 620, failed: 3 },
  ],
  logs: [],

  setIsConnected: (connected) => set({ isConnected: connected }),
  addLog: (log) => set((state) => ({ logs: [log, ...state.logs].slice(0, 50) })),
  updateMetrics: (sample) =>
    set((state) => ({
      throughputHistory: [...state.throughputHistory.slice(1), sample],
    })),
}));
