'use client';

import { MetricsCards } from '../components/metrics-cards';
import { ThroughputChart } from '../components/throughput-chart';

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <header className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
            QueueFlow Control Plane
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Enterprise Distributed Job Queue Monitoring & Realtime Telemetry
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Cluster v1.0.0
          </span>
        </div>
      </header>

      <MetricsCards />
      <ThroughputChart />
    </main>
  );
}
