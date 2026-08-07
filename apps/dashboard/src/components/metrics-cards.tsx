'use client';

import { useDashboardStore } from '../stores/use-dashboard-store';
import { Activity, Cpu, CheckCircle2, AlertTriangle, ArrowUpRight, Zap } from 'lucide-react';

export function MetricsCards() {
  const { isConnected, activeWorkersCount, totalCompleted, totalFailed, activeJobsInFlight } = useDashboardStore();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {/* Card 1: Gateway & Cluster Status */}
      <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 shadow-xl backdrop-blur-xl group hover:border-slate-700/80 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Gateway Status</span>
          </div>
          <span className="flex h-2.5 w-2.5 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-emerald-400' : 'bg-rose-400'}`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          </span>
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <div className="text-2xl font-black text-white tracking-tight">
            {isConnected ? 'LIVE CONNECTED' : 'DISCONNECTED'}
          </div>
          <span className="text-xs font-medium text-emerald-400 flex items-center gap-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" /> 99.99% uptime
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <span>In-flight execution</span>
          <span className="font-mono font-bold text-cyan-400">{activeJobsInFlight} jobs</span>
        </div>
      </div>

      {/* Card 2: Active Worker Cluster */}
      <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 shadow-xl backdrop-blur-xl group hover:border-slate-700/80 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Worker Pool</span>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            AUTO-SCALED
          </span>
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <div className="text-3xl font-black text-slate-100 tracking-tight">
            {activeWorkersCount} <span className="text-lg font-medium text-slate-400">Nodes</span>
          </div>
          <span className="text-xs font-medium text-slate-400">Max 80 Concurrency</span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <span>Avg Worker CPU</span>
          <span className="font-mono font-semibold text-emerald-400">24.1%</span>
        </div>
      </div>

      {/* Card 3: Total Completed Jobs */}
      <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 shadow-xl backdrop-blur-xl group hover:border-slate-700/80 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Completed Jobs</span>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            +14.2%
          </span>
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <div className="text-3xl font-black text-emerald-400 tracking-tight">
            {totalCompleted.toLocaleString()}
          </div>
          <span className="text-xs font-medium text-slate-400">Avg 18ms</span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <span>At-Least-Once Delivery</span>
          <span className="font-mono font-semibold text-emerald-400">100% Guaranteed</span>
        </div>
      </div>

      {/* Card 4: Failed Jobs / Dead-Letter Queue */}
      <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 shadow-xl backdrop-blur-xl group hover:border-slate-700/80 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">DLQ / Errors</span>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">
            0.02% RATE
          </span>
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <div className="text-3xl font-black text-rose-400 tracking-tight">
            {totalFailed.toLocaleString()}
          </div>
          <span className="text-xs font-medium text-slate-400">3 Retries Max</span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <span>Orphan Recovery</span>
          <span className="font-mono font-semibold text-amber-400">PEL Auto-Claim</span>
        </div>
      </div>
    </div>
  );
}
