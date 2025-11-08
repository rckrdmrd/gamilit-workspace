import React, { useState } from 'react';
import { GamifiedHeader } from '@shared/components/layout/GamifiedHeader';
import { SystemPerformanceDashboard } from '../components/monitoring/SystemPerformanceDashboard';
import { UserActivityMonitor } from '../components/monitoring/UserActivityMonitor';
import { ErrorTrackingPanel } from '../components/monitoring/ErrorTrackingPanel';
import { SystemHealthIndicators } from '../components/monitoring/SystemHealthIndicators';

const SystemMonitoring: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'performance' | 'activity' | 'errors' | 'health'>('performance');

  const tabs = [
    { id: 'performance' as const, label: 'Performance Dashboard', component: SystemPerformanceDashboard },
    { id: 'activity' as const, label: 'User Activity', component: UserActivityMonitor },
    { id: 'errors' as const, label: 'Error Tracking', component: ErrorTrackingPanel },
    { id: 'health' as const, label: 'System Health', component: SystemHealthIndicators },
  ];

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component || SystemPerformanceDashboard;

  return (
    <div className="min-h-screen bg-gradient-to-br from-detective-bg to-detective-bg-secondary">
      <GamifiedHeader user={{ email: 'admin@glit.com' }} />

      <main className="detective-container py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-detective-title mb-2">System Monitoring</h1>
          <p className="text-detective-base text-gray-400">Real-time system performance and monitoring</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-detective-orange text-white'
                  : 'bg-detective-bg-secondary text-gray-400 hover:bg-detective-bg-secondary/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <ActiveComponent />
      </main>
    </div>
  );
};

export default SystemMonitoring;
