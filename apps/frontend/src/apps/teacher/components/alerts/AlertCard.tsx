import {
  AlertTriangle,
  AlertCircle,
  Info,
  XCircle,
  MessageSquare,
  BookOpen,
  CheckCircle,
} from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import type { InterventionAlert } from '../../types';

interface AlertCardProps {
  alert: InterventionAlert;
  onSendMessage?: (alertId: string) => void;
  onAssignHelp?: (alertId: string) => void;
  onMarkForFollowUp?: (alertId: string) => void;
  onResolve?: (alertId: string) => void;
}

/**
 * AlertCard Component
 *
 * Displays an intervention alert card with severity indicator, student info,
 * metrics, and action buttons.
 *
 * @synchronized-with backend StudentInterventionAlert type
 * @last-sync 2026-01-25
 *
 * Field mappings (frontend uses backend field names):
 * - severity (not priority)
 * - title (not message)
 * - status (not resolved boolean)
 * - alert_type (not type)
 * - metrics (not details)
 */
export function AlertCard({
  alert,
  onSendMessage,
  onAssignHelp,
  onMarkForFollowUp,
  onResolve,
}: AlertCardProps) {
  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-500 bg-opacity-10',
          borderColor: 'border-red-500',
          badge: 'bg-red-500',
          text: 'CRÍTICO',
        };
      case 'high':
        return {
          icon: AlertTriangle,
          color: 'text-orange-500',
          bgColor: 'bg-orange-500 bg-opacity-10',
          borderColor: 'border-orange-500',
          badge: 'bg-orange-500',
          text: 'ALTO',
        };
      case 'medium':
        return {
          icon: AlertCircle,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500 bg-opacity-10',
          borderColor: 'border-yellow-500',
          badge: 'bg-yellow-500',
          text: 'MEDIO',
        };
      default:
        return {
          icon: Info,
          color: 'text-blue-500',
          bgColor: 'bg-blue-500 bg-opacity-10',
          borderColor: 'border-blue-500',
          badge: 'bg-blue-500',
          text: 'BAJO',
        };
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'no_activity':
        return '🚨';
      case 'low_score':
        return '⚠️';
      case 'declining_trend':
        return '📉';
      case 'repeated_failures':
        return '🎯';
      case 'excessive_time':
        return '⏱️';
      case 'low_engagement':
        return '📊';
      default:
        return '⚠️';
    }
  };

  // Use 'severity' field (backend field name)
  const config = getSeverityConfig(alert.severity);
  const Icon = config.icon;

  // Check if alert is resolved using 'status' field (not boolean 'resolved')
  const isResolved = alert.status === 'resolved';
  const isActive = alert.status === 'active';

  const getTimeSince = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) {
      return `Hace ${diffMins} min`;
    } else if (diffMins < 1440) {
      return `Hace ${Math.floor(diffMins / 60)} hrs`;
    } else {
      return `Hace ${Math.floor(diffMins / 1440)} días`;
    }
  };

  // Extract metrics for display (backend uses 'metrics' JSONB field)
  const metrics = alert.metrics as Record<string, unknown> | null;
  const moduleName =
    metrics && typeof metrics.module_name === 'string' ? metrics.module_name : undefined;
  const exerciseName =
    metrics && typeof metrics.exercise_name === 'string' ? metrics.exercise_name : undefined;

  return (
    <DetectiveCard hoverable={false} className={`border-l-4 ${config.borderColor}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-1 items-start gap-3">
            <div className={`rounded-lg p-2 ${config.bgColor}`}>
              <Icon className={`h-5 w-5 ${config.color}`} />
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-lg">{getAlertIcon(alert.alert_type)}</span>
                <h3 className="font-bold text-detective-text">{alert.student_name}</h3>
              </div>
              {/* Use 'title' field (backend field name, not 'message') */}
              <p className="text-sm text-detective-text">{alert.title}</p>
              {alert.description && (
                <p className="text-xs text-detective-text-secondary mt-1">{alert.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded px-2 py-1 text-xs font-bold text-white ${config.badge}`}>
              {config.text}
            </span>
            {isResolved && (
              <span className="rounded bg-green-500 px-2 py-1 text-xs font-bold text-white">
                RESUELTO
              </span>
            )}
            {alert.status === 'acknowledged' && (
              <span className="rounded bg-blue-500 px-2 py-1 text-xs font-bold text-white">
                RECONOCIDO
              </span>
            )}
          </div>
        </div>

        {/* Metrics/Details from backend JSONB field */}
        {metrics && Object.keys(metrics).length > 0 && (
          <div className={`rounded-lg p-3 ${config.bgColor}`}>
            <div className="space-y-2 text-sm text-detective-text">
              {metrics.days_inactive !== undefined && (
                <p>
                  <strong>Días sin actividad:</strong> {String(metrics.days_inactive)}
                </p>
              )}
              {metrics.average_score !== undefined && (
                <p>
                  <strong>Promedio actual:</strong> {Number(metrics.average_score).toFixed(0)}%
                </p>
              )}
              {moduleName && (
                <p>
                  <strong>Módulo:</strong> {moduleName}
                </p>
              )}
              {exerciseName && (
                <p>
                  <strong>Ejercicio:</strong> {exerciseName}
                </p>
              )}
              {metrics.failure_count !== undefined && (
                <p>
                  <strong>Intentos fallidos:</strong> {String(metrics.failure_count)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Resolution Notes (shown when resolved) */}
        {isResolved && alert.resolution_notes && (
          <div className="rounded-lg bg-green-50 p-3">
            <p className="mb-2 text-xs text-green-700 font-medium">Resolución:</p>
            <p className="text-sm text-green-800">{alert.resolution_notes}</p>
            {alert.resolved_by_name && (
              <p className="text-xs text-green-600 mt-1">Por: {alert.resolved_by_name}</p>
            )}
          </div>
        )}

        {/* Quick Actions - only show for active alerts */}
        {isActive && (
          <div className="border-detective-border flex flex-wrap gap-2 border-t pt-2">
            <DetectiveButton variant="secondary" onClick={() => onSendMessage?.(alert.id)}>
              <MessageSquare className="h-4 w-4" />
              Enviar Mensaje
            </DetectiveButton>
            <DetectiveButton variant="secondary" onClick={() => onAssignHelp?.(alert.id)}>
              <BookOpen className="h-4 w-4" />
              Asignar Ayuda
            </DetectiveButton>
            <DetectiveButton variant="secondary" onClick={() => onMarkForFollowUp?.(alert.id)}>
              Marcar Seguimiento
            </DetectiveButton>
            <DetectiveButton variant="primary" onClick={() => onResolve?.(alert.id)}>
              <CheckCircle className="h-4 w-4" />
              Resolver
            </DetectiveButton>
          </div>
        )}

        {/* Timestamp - use generated_at (backend field name) */}
        <div className="flex items-center justify-between text-xs text-detective-text-secondary">
          <span>{getTimeSince(alert.generated_at)}</span>
          <span>ID: {alert.id.substring(0, 8)}</span>
        </div>
      </div>
    </DetectiveCard>
  );
}
