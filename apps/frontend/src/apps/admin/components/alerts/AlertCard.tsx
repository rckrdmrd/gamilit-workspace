/**
 * AlertCard Component
 *
 * Individual alert card displaying:
 * - Severity and status badges
 * - Title and description
 * - Affected users count
 * - Triggered timestamp
 * - Action buttons (View Details, Acknowledge, Resolve, Suppress)
 *
 * @component
 */

import React from 'react';
import { Eye, Check, CheckCircle, XCircle, Clock, Users } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import type {
  SystemAlert,
  SystemAlertSeverity,
  SystemAlertStatus,
} from '@/services/api/adminTypes';

interface AlertCardProps {
  alert: SystemAlert;
  onViewDetails: (alert: SystemAlert) => void;
  onAcknowledge: (alert: SystemAlert) => void;
  onResolve: (alert: SystemAlert) => void;
  onSuppress: (alert: SystemAlert) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onViewDetails,
  onAcknowledge,
  onResolve,
  onSuppress,
}) => {
  const getSeverityColor = (severity: SystemAlertSeverity): string => {
    const colors: Record<SystemAlertSeverity, string> = {
      critical: 'bg-red-500 text-white',
      high: 'bg-orange-500 text-white',
      medium: 'bg-yellow-500 text-gray-900',
      low: 'bg-blue-500 text-white',
    };
    return colors[severity];
  };

  const getStatusColor = (status: SystemAlertStatus): string => {
    const colors: Record<SystemAlertStatus, string> = {
      open: 'bg-red-500/20 text-red-400 border-red-500/50',
      acknowledged: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
      resolved: 'bg-green-500/20 text-green-400 border-green-500/50',
      suppressed: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
    };
    return colors[status];
  };

  const getSeverityLabel = (severity: SystemAlertSeverity): string => {
    const labels: Record<SystemAlertSeverity, string> = {
      critical: 'Crítica',
      high: 'Alta',
      medium: 'Media',
      low: 'Baja',
    };
    return labels[severity];
  };

  const getStatusLabel = (status: SystemAlertStatus): string => {
    const labels: Record<SystemAlertStatus, string> = {
      open: 'Abierto',
      acknowledged: 'Reconocido',
      resolved: 'Resuelto',
      suppressed: 'Suprimido',
    };
    return labels[status];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `Hace ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Hace ${diffHours} horas`;
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
  };

  const canAcknowledge = alert.status === 'open';
  const canResolve = alert.status === 'open' || alert.status === 'acknowledged';
  const canSuppress = alert.status !== 'suppressed' && alert.status !== 'resolved';

  return (
    <DetectiveCard hoverable>
      <div className="space-y-4">
        {/* Header: Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${getSeverityColor(alert.severity)}`}
          >
            {getSeverityLabel(alert.severity)}
          </span>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(alert.status)}`}
          >
            {getStatusLabel(alert.status)}
          </span>
          {alert.alert_type && (
            <span className="rounded-full border border-purple-500/50 bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-400">
              {alert.alert_type.replace(/_/g, ' ').toUpperCase()}
            </span>
          )}
        </div>

        {/* Title */}
        <div>
          <h3 className="mb-2 text-lg font-bold text-detective-text">{alert.title}</h3>
          {alert.description && (
            <p className="line-clamp-2 text-sm text-detective-text-secondary">
              {alert.description}
            </p>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-sm text-detective-text-secondary">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{alert.affected_users} usuarios afectados</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{formatDate(alert.triggered_at)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 border-t border-gray-700 pt-2">
          <DetectiveButton variant="secondary" onClick={() => onViewDetails(alert)}>
            <Eye className="h-4 w-4" />
            Detalles
          </DetectiveButton>

          {canAcknowledge && (
            <DetectiveButton variant="secondary" onClick={() => onAcknowledge(alert)}>
              <Check className="h-4 w-4" />
              Reconocer
            </DetectiveButton>
          )}

          {canResolve && (
            <DetectiveButton variant="primary" onClick={() => onResolve(alert)}>
              <CheckCircle className="h-4 w-4" />
              Resolver
            </DetectiveButton>
          )}

          {canSuppress && (
            <DetectiveButton variant="secondary" onClick={() => onSuppress(alert)}>
              <XCircle className="h-4 w-4" />
              Suprimir
            </DetectiveButton>
          )}
        </div>
      </div>
    </DetectiveCard>
  );
};

export default AlertCard;
