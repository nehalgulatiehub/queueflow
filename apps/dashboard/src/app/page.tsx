'use client';

import { useState } from 'react';
import { Navbar } from '../components/navbar';
import { MetricsCards } from '../components/metrics-cards';
import { ThroughputChart } from '../components/throughput-chart';
import { QueueListTable } from '../components/queue-list-table';
import { LiveJobStream } from '../components/live-job-stream';
import { WorkerPoolWidget } from '../components/worker-pool-widget';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'queues' | 'jobs' | 'workers'>('overview');

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Metric Overview Strip */}
        <MetricsCards />

        {/* Tab Views */}
        {activeTab === 'overview' && (
          <>
            <ThroughputChart />
            <QueueListTable />
            <LiveJobStream />
            <WorkerPoolWidget />
          </>
        )}

        {activeTab === 'queues' && (
          <>
            <QueueListTable />
            <ThroughputChart />
          </>
        )}

        {activeTab === 'jobs' && (
          <>
            <LiveJobStream />
          </>
        )}

        {activeTab === 'workers' && (
          <>
            <WorkerPoolWidget />
          </>
        )}
      </main>
    </div>
  );
}
