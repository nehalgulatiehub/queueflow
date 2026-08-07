'use client';

import { useDashboardStore } from '../stores/use-dashboard-store';
import { Terminal, CheckCircle2, Clock, AlertTriangle, RefreshCw } from 'lucide-react';

export function LiveJobStream() {
  const { recentJobs } = useDashboardStore();

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'HIGH':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'NORMAL':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'PROCESSING':
        return <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />;
      case 'FAILED':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="p-5 rounded-lg bg-[#121215] border border-zinc-800 mb-8">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/80">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-zinc-400" />
            Recent Executions & Telemetry Log
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">Stream: <span className="font-mono text-zinc-400">queueflow:stream</span></p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-[11px]">
            Auto-refresh: 1s
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="text-zinc-500 font-medium uppercase tracking-wider text-[11px] border-b border-zinc-800/60 font-sans">
              <th className="pb-2 px-3">Job ID</th>
              <th className="pb-2 px-3">Handler Function</th>
              <th className="pb-2 px-3">Queue</th>
              <th className="pb-2 px-3">Priority</th>
              <th className="pb-2 px-3">Status</th>
              <th className="pb-2 px-3">Duration</th>
              <th className="pb-2 px-3 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40 text-zinc-300">
            {recentJobs.map((job) => (
              <tr key={job.id} className="hover:bg-zinc-900/50 transition-colors">
                <td className="py-2.5 px-3 font-bold text-zinc-200">{job.id}</td>
                <td className="py-2.5 px-3 text-zinc-300 font-sans font-medium">{job.name}</td>
                <td className="py-2.5 px-3 text-zinc-400">{job.queue}</td>
                <td className="py-2.5 px-3">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getPriorityBadge(job.priority)}`}>
                    {job.priority}
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-1.5 font-sans font-medium">
                    {getStatusIcon(job.status)}
                    <span className={job.status === 'COMPLETED' ? 'text-emerald-400' : job.status === 'FAILED' ? 'text-rose-400' : 'text-blue-400'}>
                      {job.status}
                    </span>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-zinc-400">{job.durationMs}ms</td>
                <td className="py-2.5 px-3 text-right text-zinc-500 font-sans">{job.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
