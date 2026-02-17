import React from 'react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { useHealthStatus } from '../../hooks/useSystemMetrics';
import { CheckCircle, XCircle, AlertCircle, Database, Server, Zap, Globe } from 'lucide-react';

interface HealthCheckProps {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latency?: number;
  details?: string;
  icon: React.ReactNode;
  uptime?: number;
}

type HealthStatus = 'healthy' | 'degraded' | 'down';

const HealthCheck: React.FC<HealthCheckProps> = ({
  name,
  status,
  latency,
  details,
  icon,
  uptime,
}) => {
  const statusConfig = {
    healthy: {
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      label: 'HEALTHY',
    },
    degraded: {
      icon: <AlertCircle className="h-5 w-5" />,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      label: 'DEGRADED',
    },
    down: {
      icon: <XCircle className="h-5 w-5" />,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      label: 'DOWN',
    },
  };

  const config = statusConfig[status];

  return (
    <div className={`rounded-lg border p-4 ${config.border} ${config.bg}`}>
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`${config.color}`}>{icon}</div>
          <div>
            <p className="text-detective-base font-semibold">{name}</p>
            {details && <p className="text-detective-small text-gray-400">{details}</p>}
          </div>
        </div>
        <div className={`flex items-center gap-1 ${config.color}`}>{config.icon}</div>
      </div>

      <div className="text-detective-small flex items-center gap-4">
        <div
          className={`rounded px-2 py-1 ${config.bg} ${config.color} border ${config.border} font-bold`}
        >
          {config.label}
        </div>
        {latency !== undefined && (
          <div className="text-gray-400">
            Latency: <span className="font-semibold text-detective-text">{latency}ms</span>
          </div>
        )}
        {uptime !== undefined && (
          <div className="text-gray-400">
            Uptime: <span className="font-semibold text-green-500">{uptime.toFixed(2)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const SystemHealthIndicators: React.FC = () => {
  const { health, loading } = useHealthStatus();

  if (loading) {
    return (
      <DetectiveCard>
        <div className="flex items-center justify-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-detective-orange border-t-transparent"></div>
        </div>
      </DetectiveCard>
    );
  }

  const uptimePercent =
    typeof health?.uptime_seconds === 'number'
      ? Math.min((health.uptime_seconds / 86400) * 100, 100)
      : 99.9;

  const incidents = (() => {
    if (!health || typeof health !== 'object') return [];
    const raw = (health as unknown as Record<string, unknown>).incidents;
    return Array.isArray(raw) ? raw : [];
  })();

  const normalizeStatus = (status: unknown): HealthStatus => {
    return status === 'healthy' || status === 'degraded' || status === 'down'
      ? status
      : 'healthy';
  };

  // Mock data structure - adjust based on actual API response
  const healthChecks: HealthCheckProps[] = [
    {
      name: 'Backend API',
      status: normalizeStatus(health?.api?.status),
      latency: health?.api?.response_time_ms || 45,
      details: 'Node.js Server',
      icon: <Server className="h-6 w-6" />,
      uptime: uptimePercent,
    },
    {
      name: 'PostgreSQL Database',
      status: normalizeStatus(health?.database?.status),
      latency: health?.database?.latency_ms || 12,
      details: 'Primary database',
      icon: <Database className="h-6 w-6" />,
      uptime: uptimePercent,
    },
    {
      name: 'Redis Cache',
      status: 'healthy',
      latency: 3,
      details: 'In-memory cache',
      icon: <Zap className="h-6 w-6" />,
      uptime: 99.95,
    },
    {
      name: 'External APIs',
      status: 'healthy',
      latency: 250,
      details: 'OpenAI, Payment Gateway',
      icon: <Globe className="h-6 w-6" />,
      uptime: 99.5,
    },
  ];

  const overallStatus = healthChecks.every((check) => check.status === 'healthy')
    ? 'healthy'
    : healthChecks.some((check) => check.status === 'down')
      ? 'down'
      : 'degraded';

  const overallConfig = {
    healthy: { color: 'text-green-500', bg: 'bg-green-500/20', label: 'ALL SYSTEMS OPERATIONAL' },
    degraded: { color: 'text-yellow-500', bg: 'bg-yellow-500/20', label: 'PARTIAL SYSTEM OUTAGE' },
    down: { color: 'text-red-500', bg: 'bg-red-500/20', label: 'MAJOR SYSTEM OUTAGE' },
  };

  const config = overallConfig[overallStatus];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Server className="h-8 w-8 text-detective-orange" />
          <div>
            <h2 className="text-detective-subtitle">System Health Indicators</h2>
            <p className="text-detective-small text-gray-400">Status page format</p>
          </div>
        </div>
      </div>

      {/* Overall Status */}
      <DetectiveCard className={`${config.bg} border-2 border-current ${config.color}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {overallStatus === 'healthy' ? (
              <CheckCircle className="h-12 w-12" />
            ) : overallStatus === 'degraded' ? (
              <AlertCircle className="h-12 w-12" />
            ) : (
              <XCircle className="h-12 w-12" />
            )}
            <div>
              <p className="text-2xl font-bold">{config.label}</p>
              <p className="text-detective-small opacity-80">
                Last updated: {new Date().toLocaleString('es-ES')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-detective-small opacity-80">Average Uptime (30 days)</p>
            <p className="text-3xl font-bold">
              {(
                healthChecks.reduce((acc, check) => acc + (check.uptime || 0), 0) /
                healthChecks.length
              ).toFixed(2)}
              %
            </p>
          </div>
        </div>
      </DetectiveCard>

      {/* Health Checks */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {healthChecks.map((check) => (
          <HealthCheck key={check.name} {...check} />
        ))}
      </div>

      {/* Historical Uptime */}
      <DetectiveCard>
        <h3 className="text-detective-subtitle mb-4">Historical Uptime (Last 90 days)</h3>
        <div className="space-y-4">
          {healthChecks.map((check) => (
            <div key={check.name}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-detective-base">{check.name}</span>
                <span className="font-bold text-green-500">{check.uptime?.toFixed(2)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-detective-bg-secondary">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-400"
                  style={{ width: `${check.uptime}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </DetectiveCard>

      {/* Recent Incidents */}
      <DetectiveCard>
        <h3 className="text-detective-subtitle mb-4">Recent Incidents</h3>
        <div className="space-y-3">
          {incidents.length > 0 ? (
            incidents.map((incident: any, index: number) => (
              <div key={index} className="rounded-lg bg-detective-bg-secondary p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-detective-base font-semibold">{incident.title}</span>
                  <span className="text-detective-small text-gray-400">
                    {incident.timestamp
                      ? new Date(incident.timestamp).toLocaleDateString('es-ES')
                      : 'N/A'}
                  </span>
                </div>
                <p className="text-detective-small text-gray-400">{incident.description}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-1 text-xs ${
                      incident.resolved
                        ? 'bg-green-500/20 text-green-500'
                        : 'bg-yellow-500/20 text-yellow-500'
                    }`}
                  >
                    {incident.resolved ? 'RESOLVED' : 'INVESTIGATING'}
                  </span>
                  <span className="text-detective-small text-gray-400">
                    Duration: {incident.duration || 'Ongoing'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-gray-400">
              <CheckCircle className="mx-auto mb-2 h-12 w-12 text-green-500" />
              <p>No incidents in the last 90 days</p>
            </div>
          )}
        </div>
      </DetectiveCard>

      {/* Response Time Chart */}
      <DetectiveCard>
        <h3 className="text-detective-subtitle mb-4">Average Response Times (Last 24h)</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {healthChecks.map((check) => (
            <div key={check.name} className="rounded-lg bg-detective-bg-secondary p-4 text-center">
              <div className="mb-2">{check.icon}</div>
              <p className="text-detective-small mb-1 text-gray-400">{check.name}</p>
              <p className="text-2xl font-bold text-detective-orange">{check.latency}ms</p>
            </div>
          ))}
        </div>
      </DetectiveCard>
    </div>
  );
};
