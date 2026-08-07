'use client';

import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useDashboardStore } from '../stores/use-dashboard-store';

export function ThroughputChart() {
  const { throughputHistory } = useDashboardStore();
  const [mounted, setMounted] = useState(false);
  const [range, setRange] = useState<'1h' | '6h' | '24h'>('1h');

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="p-5 rounded-lg bg-[#121215] border border-zinc-800 mb-8">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/80">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">Cluster Throughput & Latency Stream</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Real-time telemetry per minute across consumer group workers</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              Completed (jobs/min)
            </span>
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
              Failed / DLQ
            </span>
          </div>

          <div className="flex items-center gap-1 p-0.5 rounded bg-zinc-900 border border-zinc-800 text-xs">
            {(['1h', '6h', '24h'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  range === r ? 'bg-zinc-800 text-zinc-100 font-bold' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={throughputHistory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false} />
              <XAxis dataKey="time" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  borderColor: '#27272a',
                  borderRadius: '0.375rem',
                  fontSize: '12px',
                  color: '#f4f4f5',
                }}
              />
              <Area type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={1.5} fill="#10b981" fillOpacity={0.1} />
              <Area type="monotone" dataKey="failed" stroke="#f43f5e" strokeWidth={1.5} fill="#f43f5e" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-zinc-600 text-xs font-mono">
            Initializing chart stream...
          </div>
        )}
      </div>
    </div>
  );
}
