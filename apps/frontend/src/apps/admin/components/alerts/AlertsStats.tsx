/**
 * AlertsStats Component
 *
 * Displays statistics cards for system alerts including:
 * - Open alerts
 * - Acknowledged alerts
 * - Resolved alerts
 * - Average resolution time
 *
 * @component
 */

import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { AlertTriangle, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import type { AlertsStats as AlertsStatsType } from '@/services/api/adminTypes';

interface AlertsStatsProps {
  stats: AlertsStatsType | null;
  isLoading?: boolean;
}

export const AlertsStats = ({ stats, isLoading }: AlertsStatsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <DetectiveCard key={i} hoverable={false}>
            <div className="animate-pulse">
              <div className="mb-2 h-4 w-1/2 rounded bg-gray-700"></div>
              <div className="h-8 w-3/4 rounded bg-gray-700"></div>
            </div>
          </DetectiveCard>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statsCards = [
    {
      label: 'Alertas Abiertas',
      value: stats.open_alerts,
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      label: 'Reconocidas',
      value: stats.acknowledged_alerts,
      icon: AlertCircle,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      label: 'Resueltas',
      value: stats.resolved_alerts,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Tiempo Promedio',
      value: stats.avg_resolution_time_hours
        ? `${stats.avg_resolution_time_hours.toFixed(1)}h`
        : 'N/A',
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <DetectiveCard key={index} hoverable={false}>
            <div className="flex items-center gap-4">
              <div className={`rounded-lg p-3 ${stat.bgColor}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="mb-1 text-sm text-detective-text-secondary">{stat.label}</p>
                <p className="text-2xl font-bold text-detective-text">{stat.value}</p>
              </div>
            </div>
          </DetectiveCard>
        );
      })}
    </div>
  );
};

export default AlertsStats;
