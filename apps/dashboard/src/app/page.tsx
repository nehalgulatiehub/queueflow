'use client';

import { Navbar } from '../components/navbar';
import { MetricsCards } from '../components/metrics-cards';
import { ThroughputChart } from '../components/throughput-chart';
import { LiveJobStream } from '../components/live-job-stream';
import { WorkerPoolWidget } from '../components/worker-pool-widget';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top Navigation */}
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pb-16">
        {/* Metric Overview Cards */}
        <MetricsCards />

        {/* Main Grid: Left Chart & Live Jobs Stream (8 cols), Right Worker Widget (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <ThroughputChart />
            <LiveJobStream />
          </div>
          <div className="lg:col-span-4">
            <WorkerPoolWidget />
          </div>
        </div>
      </main>
    </div>
  );
}
