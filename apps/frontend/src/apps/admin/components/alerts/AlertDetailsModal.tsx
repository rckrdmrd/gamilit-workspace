/**
 * AlertDetailsModal Component
 *
 * Modal displaying complete alert information including:
 * - All alert fields
 * - Context data (formatted JSON)
 * - Metrics (formatted JSON)
 * - Action buttons
 *
 * @component
 */

import React from 'react';
import { X, AlertTriangle, Calendar, Users } from 'lucide-react';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import type {
  SystemAlert,
  SystemAlertSeverity,
  SystemAlertStatus,
} from '@/services/api/adminTypes';

interface AlertDetailsModalProps {
  alert: SystemAlert | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AlertDetailsModal: React.FC<AlertDetailsModalProps> = ({ alert, isOpen, onClose }) => {
  if (!isOpen || !alert) return null;

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
      open: 'text-red-400',
      acknowledged: 'text-orange-400',
      resolved: 'text-green-400',
      suppressed: 'text-gray-400',
    };
    return colors[status];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderJsonData = (data: Record<string, unknown> | undefined, title: string) => {
    if (!data || Object.keys(data).length === 0) return null;

    return (
      <div className="mt-4">
        <h4 className="mb-2 text-sm font-semibold text-detective-text">{title}</h4>
        <pre className="overflow-x-auto rounded-lg bg-detective-bg p-3 text-xs text-detective-text-secondary">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-gray-700 bg-detective-bg-secondary">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-700 bg-detective-bg-secondary p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-detective-orange" />
            <h2 className="text-2xl font-bold text-detective-text">Detalles de Alerta</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-detective-bg"
          >
            <X className="h-6 w-6 text-detective-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${getSeverityColor(alert.severity)}`}
            >
              {alert.severity.toUpperCase()}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusColor(alert.status)}`}
            >
              {alert.status.toUpperCase()}
            </span>
          </div>

          {/* Title and Description */}
          <div>
            <h3 className="mb-2 text-xl font-bold text-detective-text">{alert.title}</h3>
            {alert.description && (
              <p className="text-detective-text-secondary">{alert.description}</p>
            )}
          </div>

          {/* Key Information */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-detective-text-secondary">
                Tipo de Alerta
              </label>
              <p className="mt-1 text-detective-text">
                {alert.alert_type?.replace(/_/g, ' ').toUpperCase() || 'N/A'}
              </p>
            </div>

            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-detective-text-secondary">
                <Users className="h-4 w-4" />
                Usuarios Afectados
              </label>
              <p className="mt-1 text-detective-text">{alert.affected_users}</p>
            </div>

            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-detective-text-secondary">
                <Calendar className="h-4 w-4" />
                Activada
              </label>
              <p className="mt-1 text-detective-text">{formatDate(alert.triggered_at)}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-detective-text-secondary">
                Nivel de Escalación
              </label>
              <p className="mt-1 text-detective-text">{alert.escalation_level}</p>
            </div>
          </div>

          {/* System Information */}
          {(alert.source_system || alert.source_module || alert.error_code) && (
            <div className="border-t border-gray-700 pt-4">
              <h4 className="mb-3 text-sm font-semibold text-detective-text">
                Información del Sistema
              </h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {alert.source_system && (
                  <div>
                    <label className="text-sm font-medium text-detective-text-secondary">
                      Sistema
                    </label>
                    <p className="mt-1 text-detective-text">{alert.source_system}</p>
                  </div>
                )}
                {alert.source_module && (
                  <div>
                    <label className="text-sm font-medium text-detective-text-secondary">
                      Módulo
                    </label>
                    <p className="mt-1 text-detective-text">{alert.source_module}</p>
                  </div>
                )}
                {alert.error_code && (
                  <div>
                    <label className="text-sm font-medium text-detective-text-secondary">
                      Código de Error
                    </label>
                    <p className="mt-1 text-detective-text">{alert.error_code}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Management Information */}
          {(alert.acknowledged_by_name || alert.resolved_by_name) && (
            <div className="border-t border-gray-700 pt-4">
              <h4 className="mb-3 text-sm font-semibold text-detective-text">Gestión</h4>
              <div className="space-y-3">
                {alert.acknowledged_by_name && (
                  <div>
                    <label className="text-sm font-medium text-detective-text-secondary">
                      Reconocido por
                    </label>
                    <p className="mt-1 text-detective-text">
                      {alert.acknowledged_by_name}
                      {alert.acknowledged_at && ` - ${formatDate(alert.acknowledged_at)}`}
                    </p>
                    {alert.acknowledgment_note && (
                      <p className="mt-1 text-sm italic text-detective-text-secondary">
                        "{alert.acknowledgment_note}"
                      </p>
                    )}
                  </div>
                )}
                {alert.resolved_by_name && (
                  <div>
                    <label className="text-sm font-medium text-detective-text-secondary">
                      Resuelto por
                    </label>
                    <p className="mt-1 text-detective-text">
                      {alert.resolved_by_name}
                      {alert.resolved_at && ` - ${formatDate(alert.resolved_at)}`}
                    </p>
                    {alert.resolution_note && (
                      <p className="mt-1 text-sm italic text-detective-text-secondary">
                        "{alert.resolution_note}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Context Data */}
          {renderJsonData(alert.context_data, 'Datos de Contexto')}

          {/* Metrics */}
          {renderJsonData(alert.metrics, 'Métricas')}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex justify-end border-t border-gray-700 bg-detective-bg-secondary p-6">
          <DetectiveButton variant="secondary" onClick={onClose}>
            Cerrar
          </DetectiveButton>
        </div>
      </div>
    </div>
  );
};

export default AlertDetailsModal;
