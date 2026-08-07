'use client';

import { useDashboardStore } from '../stores/use-dashboard-store';
import { CheckCircle2, Clock, AlertTriangle, RefreshCw, Layers } from 'lucide-react';

export function LiveJobStream() {
  const { recentJobs } = useDashboardStore();

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'HIGH':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'NORMAL':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'PROCESSING':
        return <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />;
      case 'FAILED':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      default:
        return <Clock className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 shadow-xl backdrop-blur-xl p-5 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Live Job Execution Stream
          </h2>
          <p className="text-xs text-slate-400">
            Real-time payload status across Redis Stream consumer groups
          </p>
        </div>
        <span className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
          Stream: queueflow:stream
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-3">Job ID</th>
              <th className="py-3 px-3">Handler / Event Name</th>
              <th className="py-3 px-3">Queue Target</th>
              <th className="py-3 px-3">Priority</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Latency</th>
              <th className="py-3 px-3 text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-slate-300 font-mono text-xs">
            {recentJobs.map((job) => (
              <tr key={job.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-3 font-bold text-slate-200">{job.id}</td>
                <td className="py-3 px-3 font-sans font-medium text-white">{job.name}</td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                    {job.queue}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${getPriorityBadge(job.priority)}`}>
                    {job.priority}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5 font-sans font-medium text-xs">
                    {getStatusIcon(job.status)}
                    <span className={job.status === 'COMPLETED' ? 'text-emerald-400' : job.status === 'FAILED' ? 'text-rose-400' : 'text-cyan-400'}>
                      {job.status}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-3 text-slate-400">{job.durationMs}ms</td>
                <td className="py-3 px-3 text-right text-slate-400 font-sans">{job.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
