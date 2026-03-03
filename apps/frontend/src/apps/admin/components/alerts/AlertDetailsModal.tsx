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

import { Calendar, Users } from 'lucide-react';
import { Modal } from '@shared/components/common/Modal';
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

export const AlertDetailsModal = ({ alert, isOpen, onClose }: AlertDetailsModalProps) => {
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalles de Alerta"
      size="xl"
    >
      {alert && (
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto space-y-6">
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
                Nivel de Escalacion
              </label>
              <p className="mt-1 text-detective-text">{alert.escalation_level}</p>
            </div>
          </div>

          {/* System Information */}
          {(alert.source_system || alert.source_module || alert.error_code) && (
            <div className="border-t border-gray-700 pt-4">
              <h4 className="mb-3 text-sm font-semibold text-detective-text">
                Informacion del Sistema
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
                      Modulo
                    </label>
                    <p className="mt-1 text-detective-text">{alert.source_module}</p>
                  </div>
                )}
                {alert.error_code && (
                  <div>
                    <label className="text-sm font-medium text-detective-text-secondary">
                      Codigo de Error
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
              <h4 className="mb-3 text-sm font-semibold text-detective-text">Gestion</h4>
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
          {renderJsonData(alert.metrics, 'Metricas')}

          {/* Footer */}
          <div className="flex justify-end border-t border-gray-200 pt-4">
            <DetectiveButton variant="secondary" onClick={onClose}>
              Cerrar
            </DetectiveButton>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default AlertDetailsModal;
