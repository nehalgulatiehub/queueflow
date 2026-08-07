'use client';

import { useState } from 'react';
import { Layers, Activity, Database, Cpu, Search, Terminal, GitBranch, Bell, Settings } from 'lucide-react';
import { useDashboardStore } from '../stores/use-dashboard-store';

interface NavbarProps {
  activeTab: 'overview' | 'queues' | 'jobs' | 'workers';
  setActiveTab: (tab: 'overview' | 'queues' | 'jobs' | 'workers') => void;
}

export function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const { isConnected } = useDashboardStore();

  return (
    <header className="border-b border-zinc-800/80 bg-[#09090b] sticky top-0 z-50">
      {/* Top utility bar */}
      <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
        {/* Left: Logo & Breadcrumbs */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-7 h-7 rounded-md bg-zinc-100 flex items-center justify-center text-zinc-950 font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm text-zinc-100 tracking-tight">QueueFlow</span>
          </div>

          <span className="text-zinc-700">/</span>

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="font-medium text-zinc-300">production</span>
            <span className="text-zinc-700">/</span>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono">
              us-east-cluster-01
            </span>
          </div>
        </div>

        {/* Right: Search, Status, Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Filter */}
          <div className="relative hidden md:flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-3 text-zinc-500" />
            <input
              type="text"
              placeholder="Search queues, jobs, workers... (⌘K)"
              className="pl-8 pr-3 py-1.5 text-xs bg-zinc-900/90 border border-zinc-800 rounded-md text-zinc-200 placeholder-zinc-500 w-64 focus:outline-none focus:border-zinc-700 font-sans"
            />
          </div>

          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="font-mono text-zinc-300 text-[11px]">
              {isConnected ? 'Connected: ws://localhost:4000' : 'Reconnecting...'}
            </span>
          </div>

          {/* User Profile */}
          <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-medium text-zinc-300">
            NG
          </div>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="max-w-[1400px] mx-auto px-6 flex items-center gap-6 text-xs font-medium border-t border-zinc-800/40">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-zinc-100 text-zinc-100 font-semibold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('queues')}
          className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'queues'
              ? 'border-zinc-100 text-zinc-100 font-semibold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          Queues (4)
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'jobs'
              ? 'border-zinc-100 text-zinc-100 font-semibold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          Jobs Stream & DLQ
        </button>
        <button
          onClick={() => setActiveTab('workers')}
          className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'workers'
              ? 'border-zinc-100 text-zinc-100 font-semibold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          Worker Nodes (8)
        </button>
      </div>
    </header>
  );
}
