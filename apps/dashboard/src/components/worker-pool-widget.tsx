'use client';

import { useDashboardStore } from '../stores/use-dashboard-store';
import { Cpu, Server, Activity } from 'lucide-react';

export function WorkerPoolWidget() {
  const { workers, queues } = useDashboardStore();

  return (
    <div className="space-y-6">
      {/* Active Worker Nodes Card */}
      <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 shadow-xl backdrop-blur-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Worker Instances
          </h3>
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            HEALTHY
          </span>
        </div>

        <div className="space-y-3">
          {workers.map((worker) => (
            <div key={worker.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/70 hover:border-slate-700/80 transition">
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="font-bold text-slate-200">{worker.id}</span>
                <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${worker.status === 'BUSY' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                  {worker.status}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mb-2 truncate">
                {worker.hostname}
              </div>
              {/* Progress bars */}
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>CPU</span>
                    <span className="text-cyan-400 font-mono">{worker.cpuUsage}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-cyan-500" style={{ width: `${worker.cpuUsage}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>RAM</span>
                    <span className="text-indigo-400 font-mono">{worker.memoryUsageMB}MB</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${(worker.memoryUsageMB / 512) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Queue Priorities Widget */}
      <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 shadow-xl backdrop-blur-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            Priority Queue Health
          </h3>
          <span className="text-xs font-mono text-slate-400">4 Queues</span>
        </div>

        <div className="space-y-3">
          {queues.map((q) => (
            <div key={q.name} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/70">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-200">{q.name}</span>
                <span className="font-mono text-emerald-400 font-bold">{q.latencyMs}ms avg</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Completed: {q.completedTotal.toLocaleString()}</span>
                <span className="font-mono text-slate-300 font-bold">{q.activeJobs} active</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
