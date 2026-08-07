'use client';

import { useDashboardStore } from '../stores/use-dashboard-store';
import { Cpu, Server, HardDrive } from 'lucide-react';

export function WorkerPoolWidget() {
  const { workers } = useDashboardStore();

  return (
    <div className="p-5 rounded-lg bg-[#121215] border border-zinc-800 mb-8">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/80">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-zinc-400" />
            Worker Pool Nodes ({workers.length})
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">Consumer group instances processing Redis Stream partition chunks</p>
        </div>

        <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
          ALL HEALTHY
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {workers.map((w) => (
          <div key={w.id} className="p-4 rounded-md bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition">
            <div className="flex items-center justify-between text-xs font-mono mb-1">
              <span className="font-bold text-zinc-200">{w.id}</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${w.status === 'BUSY' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                {w.status}
              </span>
            </div>
            <div className="text-[11px] font-mono text-zinc-500 mb-3 truncate">
              {w.hostname}
            </div>

            <div className="space-y-2 text-[11px] font-mono text-zinc-400">
              <div>
                <div className="flex justify-between mb-1">
                  <span>CPU Load</span>
                  <span className="text-zinc-200">{w.cpuUsage}%</span>
                </div>
                <div className="w-full h-1 rounded bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded" style={{ width: `${w.cpuUsage}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>Memory</span>
                  <span className="text-zinc-200">{w.memoryUsageMB} MB</span>
                </div>
                <div className="w-full h-1 rounded bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded" style={{ width: `${(w.memoryUsageMB / 512) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
