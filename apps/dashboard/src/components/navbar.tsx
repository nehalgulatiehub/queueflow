'use client';

import { Layers, Activity, Search, ShieldCheck, Terminal, Cpu, Database } from 'lucide-react';
import { useDashboardStore } from '../stores/use-dashboard-store';

export function Navbar() {
  const { isConnected } = useDashboardStore();

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-6 py-3.5 mb-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/20 text-white">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white">QueueFlow</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  PRO
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-400 block -mt-0.5">
                Distributed Job Engine
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button className="px-3.5 py-1.5 rounded-lg bg-slate-800/80 text-white font-semibold flex items-center gap-2 shadow-sm">
              <Activity className="w-4 h-4 text-cyan-400" />
              Overview
            </button>
            <button className="px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-500" />
              Queues
            </button>
            <button className="px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition flex items-center gap-2">
              <Cpu className="w-4 h-4 text-slate-500" />
              Workers
            </button>
            <button className="px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-500" />
              Telemetry
            </button>
          </nav>
        </div>

        {/* Right Search & Profile */}
        <div className="flex items-center gap-4">
          {/* Quick Search Bar */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-400 text-xs w-56 hover:border-slate-700 transition cursor-text">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span className="flex-1">Search jobs or queues...</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-400 border border-slate-700">
              ⌘K
            </kbd>
          </div>

          {/* Live WS Status Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800/80">
            <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-xs font-mono font-medium text-slate-300">
              {isConnected ? 'ws://localhost:4000' : 'Disconnected'}
            </span>
          </div>

          {/* Profile Badge */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md border border-indigo-400/30">
              NG
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
