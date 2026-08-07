'use client';

import { useDashboardStore } from '../stores/use-dashboard-store';

export function MetricsCards() {
  const { isConnected, activeWorkers, totalCompleted, totalFailed } = useDashboardStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-400">Gateway Status</span>
          <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
        </div>
        <div className="mt-2 text-2xl font-bold text-slate-100">
          {isConnected ? 'LIVE' : 'DISCONNECTED'}
        </div>
      </div>

      <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-lg">
        <span className="text-sm font-medium text-slate-400">Active Workers</span>
        <div className="mt-2 text-3xl font-bold text-slate-100">{activeWorkers} Nodes</div>
      </div>

      <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-lg">
        <span className="text-sm font-medium text-slate-400">Completed Jobs</span>
        <div className="mt-2 text-3xl font-bold text-emerald-400">{totalCompleted.toLocaleString()}</div>
      </div>

      <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-lg">
        <span className="text-sm font-medium text-slate-400">Failed / DLQ</span>
        <div className="mt-2 text-3xl font-bold text-rose-400">{totalFailed.toLocaleString()}</div>
      </div>
    </div>
  );
}
