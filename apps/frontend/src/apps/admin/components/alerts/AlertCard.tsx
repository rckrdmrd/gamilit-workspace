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
import type { SystemAlert } from '@/services/api/adminTypes';
import {
  getSeverityColor,
  getStatusColor,
  getSeverityLabel,
  getStatusLabel,
  formatAlertTimestampDetailed,
} from './alertUtils';

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
  // Utility functions imported from alertUtils.ts
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
            <span>{formatAlertTimestampDetailed(alert.triggered_at)}</span>
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
