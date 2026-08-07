'use client';

import { useDashboardStore } from '../stores/use-dashboard-store';
import { Database, Play, Pause, RefreshCw, MoreVertical, ShieldAlert } from 'lucide-react';

export function QueueListTable() {
  const { queues } = useDashboardStore();

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'HIGH':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'NORMAL':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  return (
    <div className="p-5 rounded-lg bg-[#121215] border border-zinc-800 mb-8">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/80">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <Database className="w-4 h-4 text-zinc-400" />
            Active Priority Queues
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">Isolated Redis Stream sub-streams with concurrency controls</p>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-2.5 py-1 text-xs rounded bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700 transition">
            + New Queue
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="text-zinc-500 font-medium uppercase tracking-wider text-[11px] border-b border-zinc-800/60">
              <th className="pb-2 px-3">Queue Name</th>
              <th className="pb-2 px-3">Priority Tier</th>
              <th className="pb-2 px-3">In-Flight / Active</th>
              <th className="pb-2 px-3">Processed Total</th>
              <th className="pb-2 px-3">Failed / DLQ</th>
              <th className="pb-2 px-3">Avg Latency</th>
              <th className="pb-2 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40 text-zinc-300">
            {queues.map((q) => (
              <tr key={q.name} className="hover:bg-zinc-900/50 transition-colors">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-mono font-semibold text-zinc-200">{q.name}</span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${getPriorityStyle(q.priority)}`}>
                    {q.priority}
                  </span>
                </td>
                <td className="py-3 px-3 font-mono">
                  <span className="text-zinc-200 font-bold">{q.activeJobs}</span>
                  <span className="text-zinc-500 text-[11px]"> jobs</span>
                </td>
                <td className="py-3 px-3 font-mono text-zinc-300">{q.completedTotal.toLocaleString()}</td>
                <td className="py-3 px-3 font-mono">
                  <span className={q.failedTotal > 0 ? 'text-rose-400 font-bold' : 'text-zinc-500'}>
                    {q.failedTotal}
                  </span>
                </td>
                <td className="py-3 px-3 font-mono text-emerald-400">{q.latencyMs}ms</td>
                <td className="py-3 px-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-[11px] transition">
                      Pause
                    </button>
                    <button className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
