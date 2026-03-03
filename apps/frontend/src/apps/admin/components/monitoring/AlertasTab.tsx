/**
 * AlertasTab Component
 *
 * Displays system alerts integration with quick actions and statistics.
 *
 * Features:
 * - Alert statistics (open, acknowledged, resolved)
 * - Recent alerts list (last 10)
 * - Quick actions (acknowledge, resolve)
 * - Filter by severity
 * - Link to full Alerts page
 * - Inline alert management
 *
 * @author Frontend-Developer Agent
 * @date 2025-11-24
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { AlertTriangle, CheckCircle, ExternalLink, Shield } from 'lucide-react';
import { AlertsStats } from '../alerts/AlertsStats';
import {
  getSeverityColorWithBorder,
  getStatusTextColor,
  getStatusLabel,
  formatAlertTimestamp,
} from '../alerts/alertUtils';
import type { SystemAlert, AlertsStats as AlertsStatsType, SystemAlertSeverity } from '@/services/api/adminTypes';

interface AlertasTabProps {
  alerts: SystemAlert[];
  stats: AlertsStatsType | null;
  isLoading: boolean;
  onRefresh: () => Promise<void>;
  onAcknowledge: (id: string, note?: string) => Promise<void>;
  onResolve: (id: string, note: string) => Promise<void>;
}

// Utility functions imported from alertUtils.ts

/**
 * Alertas Tab Component
 */
export const AlertasTab = ({
  alerts,
  stats,
  isLoading,
  onAcknowledge,
  onResolve,
}: AlertasTabProps) => {
  const navigate = useNavigate();
  const [filterSeverity, setFilterSeverity] = useState<SystemAlertSeverity | 'all'>('all');
  const [actioningAlertId, setActioningAlertId] = useState<string | null>(null);

  // Filter alerts by severity
  const filteredAlerts = alerts.filter((alert) => {
    if (filterSeverity === 'all') return true;
    return alert.severity === filterSeverity;
  });

  // Show only last 10 alerts
  const recentAlerts = filteredAlerts.slice(0, 10);

  // Handle acknowledge
  const handleAcknowledge = async (alertId: string) => {
    setActioningAlertId(alertId);
    try {
      await onAcknowledge(alertId, 'Reconocido desde Monitoreo');
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    } finally {
      setActioningAlertId(null);
    }
  };

  // Handle resolve with default note
  const handleResolve = async (alertId: string) => {
    setActioningAlertId(alertId);
    try {
      await onResolve(alertId, 'Resuelto desde Monitoreo - Verificación manual completada');
    } catch (error) {
      console.error('Error resolving alert:', error);
    } finally {
      setActioningAlertId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-detective-text">
          <Shield className="h-6 w-6 text-blue-400" />
          Integración de Alertas
        </h2>

        <DetectiveButton
          onClick={() => navigate('/admin/alerts')}
          variant="primary"
          className="flex items-center gap-2"
        >
          Ver Todas las Alertas
          <ExternalLink className="h-4 w-4" />
        </DetectiveButton>
      </div>

      {/* Statistics Cards - Reutilizando AlertsStats component */}
      <AlertsStats stats={stats} isLoading={isLoading} />

      {/* Recent Alerts */}
      <DetectiveCard className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-detective-text">
            <AlertTriangle className="h-5 w-5" />
            Alertas Recientes
          </h3>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Severidad:</label>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as SystemAlertSeverity | 'all')}
              className="rounded border border-gray-600 bg-gray-700 px-3 py-1 text-sm text-gray-300 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas</option>
              <option value="critical">Crítica</option>
              <option value="high">Alta</option>
              <option value="medium">Media</option>
              <option value="low">Baja</option>
            </select>
          </div>
        </div>

        {recentAlerts.length === 0 ? (
          <div className="py-8 text-center text-gray-400">
            <Shield className="mx-auto mb-2 h-12 w-12 opacity-50" />
            <p>No hay alertas para mostrar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-lg border border-gray-700 p-4 transition-colors hover:bg-gray-800/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded border px-2 py-1 text-xs font-semibold ${getSeverityColorWithBorder(
                          alert.severity,
                        )}`}
                      >
                        {alert.severity.toUpperCase()}
                      </span>

                      <span className={`text-sm font-semibold ${getStatusTextColor(alert.status)}`}>
                        {getStatusLabel(alert.status).toUpperCase()}
                      </span>

                      <span className="text-xs text-gray-500">
                        {formatAlertTimestamp(alert.triggered_at)}
                      </span>

                      {alert.alert_type && (
                        <span className="font-mono text-xs text-gray-500">{alert.alert_type}</span>
                      )}
                    </div>

                    <h4 className="mb-1 font-semibold text-detective-text">{alert.title}</h4>

                    {alert.description && (
                      <p className="mb-2 text-sm text-gray-400">{alert.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {alert.affected_users > 0 && (
                        <span>Usuarios afectados: {alert.affected_users}</span>
                      )}

                      {alert.source_module && <span>Módulo: {alert.source_module}</span>}

                      {alert.acknowledged_by_name && (
                        <span>Reconocida por: {alert.acknowledged_by_name}</span>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-shrink-0 gap-2">
                    {alert.status === 'open' && (
                      <>
                        <DetectiveButton
                          onClick={() => handleAcknowledge(alert.id)}
                          disabled={actioningAlertId === alert.id}
                          variant="secondary"
                          size="sm"
                          className="text-xs"
                        >
                          Reconocer
                        </DetectiveButton>

                        <DetectiveButton
                          onClick={() => handleResolve(alert.id)}
                          disabled={actioningAlertId === alert.id}
                          variant="primary"
                          size="sm"
                          className="text-xs"
                        >
                          Resolver
                        </DetectiveButton>
                      </>
                    )}

                    {alert.status === 'acknowledged' && (
                      <DetectiveButton
                        onClick={() => handleResolve(alert.id)}
                        disabled={actioningAlertId === alert.id}
                        variant="primary"
                        size="sm"
                        className="text-xs"
                      >
                        Resolver
                      </DetectiveButton>
                    )}

                    {alert.status === 'resolved' && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-green-400">
                        <CheckCircle className="h-3 w-3" />
                        Completada
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {recentAlerts.length > 0 && (
          <div className="mt-4 text-center">
            <DetectiveButton
              onClick={() => navigate('/admin/alerts')}
              variant="secondary"
              className="mx-auto flex items-center gap-2"
            >
              Ver Todas las Alertas ({alerts.length} total)
              <ExternalLink className="h-4 w-4" />
            </DetectiveButton>
          </div>
        )}
      </DetectiveCard>
    </div>
  );
};

export default AlertasTab;
