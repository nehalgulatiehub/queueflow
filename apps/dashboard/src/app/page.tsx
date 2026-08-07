'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '../components/navbar';
import { MetricsCards } from '../components/metrics-cards';
import { ThroughputChart } from '../components/throughput-chart';
import { QueueListTable } from '../components/queue-list-table';
import { LiveJobStream } from '../components/live-job-stream';
import { WorkerPoolWidget } from '../components/worker-pool-widget';
import { useDashboardStore } from '../stores/use-dashboard-store';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'queues' | 'jobs' | 'workers'>('overview');
  const { fetchLiveTelemetry, setIsConnected } = useDashboardStore();

  useEffect(() => {
    setMounted(true);
    fetchLiveTelemetry();
    const interval = setInterval(fetchLiveTelemetry, 2000);

    // WebSocket Realtime connection
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket('ws://localhost:4000/v1/ws');
      ws.onopen = () => setIsConnected(true);
      ws.onclose = () => setIsConnected(false);
      ws.onerror = () => setIsConnected(false);
    } catch {
      setIsConnected(false);
    }

    return () => {
      clearInterval(interval);
      if (ws) ws.close();
    };
  }, [fetchLiveTelemetry, setIsConnected]);

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
