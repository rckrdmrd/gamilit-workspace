import React, { useState } from 'react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { MetricsChart } from './MetricsChart';
import { useSystemMetrics } from '../../hooks/useSystemMetrics';
import {
  Activity,
  Database,
  Users,
  TrendingUp,
  AlertCircle,
  Cpu,
  MemoryStick,
  RefreshCw,
} from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  status: 'healthy' | 'warning' | 'critical';
  subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon, status, subtitle }) => {
  const statusColors = {
    healthy: 'text-green-500',
    warning: 'text-yellow-500',
    critical: 'text-red-500',
  };

  const statusBg = {
    healthy: 'bg-green-500/10 border-green-500/30',
    warning: 'bg-yellow-500/10 border-yellow-500/30',
    critical: 'bg-red-500/10 border-red-500/30',
  };

  return (
    <div className={`rounded-lg border p-4 ${statusBg[status]} backdrop-blur-sm`}>
      <div className="mb-2 flex items-start justify-between">
        <div className={statusColors[status]}>{icon}</div>
        <div
          className={`rounded px-2 py-1 text-xs font-bold ${statusColors[status]} border border-current`}
        >
          {status === 'healthy' && 'HEALTHY'}
          {status === 'warning' && 'WARNING'}
          {status === 'critical' && 'CRITICAL'}
        </div>
      </div>
      <div>
        <p className="text-detective-small text-gray-400">{label}</p>
        <p className="mt-1 text-2xl font-bold text-detective-text">{value}</p>
        {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
};

export const SystemPerformanceDashboard: React.FC = () => {
  const { metrics, history, loading, error, refresh } = useSystemMetrics(30000);
  const [autoRefresh, setAutoRefresh] = useState(true);

  if (loading) {
    return (
      <DetectiveCard>
        <div className="flex items-center justify-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-detective-orange border-t-transparent"></div>
        </div>
      </DetectiveCard>
    );
  }

  if (error) {
    return (
      <DetectiveCard>
        <div className="flex items-center justify-center py-12 text-red-500">
          <AlertCircle className="mr-2 h-6 w-6" />
          Error loading metrics: {error}
        </div>
      </DetectiveCard>
    );
  }

  if (!metrics) return null;

  // Calculate status based on thresholds
  const getStatus = (value: number, warningThreshold: number, criticalThreshold: number) => {
    if (value >= criticalThreshold) return 'critical';
    if (value >= warningThreshold) return 'warning';
    return 'healthy';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="h-8 w-8 text-detective-orange" />
          <div>
            <h2 className="text-detective-subtitle">System Performance Dashboard</h2>
            <p className="text-detective-small text-gray-400">
              Real-time monitoring - Updated every 30s
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`rounded-lg px-3 py-2 text-sm ${
              autoRefresh ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-400'
            }`}
          >
            Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={refresh}
            className="rounded-lg bg-detective-orange/20 p-2 text-detective-orange transition-colors hover:bg-detective-orange/30"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="API Response Time (p95)"
          value={`${metrics.apiResponseTime.p95}ms`}
          icon={<TrendingUp className="h-6 w-6" />}
          status={getStatus(metrics.apiResponseTime.p95, 800, 1500)}
          subtitle={`p50: ${metrics.apiResponseTime.p50}ms | p99: ${metrics.apiResponseTime.p99}ms`}
        />
        <MetricCard
          label="Database Queries/sec"
          value={metrics.databaseQueriesPerSec}
          icon={<Database className="h-6 w-6" />}
          status={getStatus(metrics.databaseQueriesPerSec, 800, 1000)}
          subtitle="Current throughput"
        />
        <MetricCard
          label="Active Users"
          value={metrics.activeUsersCount}
          icon={<Users className="h-6 w-6" />}
          status="healthy"
          subtitle="Currently online"
        />
        <MetricCard
          label="Requests/min"
          value={metrics.requestsPerMin}
          icon={<Activity className="h-6 w-6" />}
          status={getStatus(metrics.requestsPerMin, 5000, 8000)}
          subtitle="RPM"
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          label="Error Rate"
          value={`${metrics.errorRate.toFixed(2)}%`}
          icon={<AlertCircle className="h-6 w-6" />}
          status={getStatus(metrics.errorRate, 1, 5)}
          subtitle="Last 5 minutes"
        />
        {metrics.cpuUsage !== undefined && (
          <MetricCard
            label="CPU Usage"
            value={`${metrics.cpuUsage.toFixed(1)}%`}
            icon={<Cpu className="h-6 w-6" />}
            status={getStatus(metrics.cpuUsage, 70, 90)}
            subtitle="System CPU"
          />
        )}
        {metrics.memoryUsage !== undefined && (
          <MetricCard
            label="Memory Usage"
            value={`${metrics.memoryUsage.toFixed(1)}%`}
            icon={<MemoryStick className="h-6 w-6" />}
            status={getStatus(metrics.memoryUsage, 75, 90)}
            subtitle="System RAM"
          />
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DetectiveCard>
          <h3 className="text-detective-subtitle mb-4">API Response Time (Last 60 min)</h3>
          <MetricsChart
            data={history.apiResponseTime}
            label="Response Time (p95)"
            color="#3b82f6"
            threshold={1000}
            unit="ms"
          />
        </DetectiveCard>

        <DetectiveCard>
          <h3 className="text-detective-subtitle mb-4">Error Rate Trend (Last 60 min)</h3>
          <MetricsChart
            data={history.errorRate}
            label="Error Rate"
            color="#ef4444"
            threshold={2}
            unit="%"
          />
        </DetectiveCard>

        <DetectiveCard>
          <h3 className="text-detective-subtitle mb-4">Active Users (Last 60 min)</h3>
          <MetricsChart data={history.activeUsers} label="Active Users" color="#10b981" unit="" />
        </DetectiveCard>

        <DetectiveCard>
          <h3 className="text-detective-subtitle mb-4">Requests/min (Last 60 min)</h3>
          <MetricsChart
            data={history.requestsPerMin}
            label="RPM"
            color="#f97316"
            threshold={6000}
            unit=""
          />
        </DetectiveCard>
      </div>

      {/* Timestamp */}
      <div className="text-detective-small text-center text-gray-500">
        Last updated:{' '}
        {metrics.timestamp ? new Date(metrics.timestamp).toLocaleString('es-ES') : 'N/A'}
      </div>
    </div>
  );
};
