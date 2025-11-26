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

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { AlertTriangle, CheckCircle, ExternalLink, Clock, Shield } from 'lucide-react';
import type { SystemAlert, AlertsStats, SystemAlertSeverity } from '@/services/api/adminTypes';

interface AlertasTabProps {
  alerts: SystemAlert[];
  stats: AlertsStats | null;
  isLoading: boolean;
  onRefresh: () => Promise<void>;
  onAcknowledge: (id: string, note?: string) => Promise<void>;
  onResolve: (id: string, note: string) => Promise<void>;
}

/**
 * Get severity color
 */
function getSeverityColor(severity: SystemAlertSeverity): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-500/20 text-red-400 border-red-500/50';
    case 'high':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
    case 'medium':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    case 'low':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
  }
}

/**
 * Get status color
 */
function getStatusColor(status: string): string {
  switch (status) {
    case 'open':
      return 'text-red-400';
    case 'acknowledged':
      return 'text-yellow-400';
    case 'resolved':
      return 'text-green-400';
    case 'suppressed':
      return 'text-gray-400';
    default:
      return 'text-gray-400';
  }
}

/**
 * Format timestamp
 */
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(diff / (1000 * 60));

  if (minutes < 60) {
    return `Hace ${minutes}m`;
  } else if (hours < 24) {
    return `Hace ${hours}h`;
  } else {
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  }
}

/**
 * Alertas Tab Component
 */
export const AlertasTab: React.FC<AlertasTabProps> = ({
  alerts,
  stats,
  onAcknowledge,
  onResolve,
}) => {
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
        <h2 className="flex items-center gap-2 text-2xl font-bold text-detective-text">
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

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Open Alerts */}
          <DetectiveCard className="p-6">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <div className="mb-1 text-sm text-gray-400">Alertas Abiertas</div>
                <div className="text-3xl font-bold text-red-400">{stats.open_alerts}</div>
              </div>
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="text-xs text-gray-400">Requieren atención</div>
          </DetectiveCard>

          {/* Acknowledged Alerts */}
          <DetectiveCard className="p-6">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <div className="mb-1 text-sm text-gray-400">Reconocidas</div>
                <div className="text-3xl font-bold text-yellow-400">
                  {stats.acknowledged_alerts}
                </div>
              </div>
              <Clock className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="text-xs text-gray-400">En proceso</div>
          </DetectiveCard>

          {/* Resolved Alerts */}
          <DetectiveCard className="p-6">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <div className="mb-1 text-sm text-gray-400">Resueltas</div>
                <div className="text-3xl font-bold text-green-400">{stats.resolved_alerts}</div>
              </div>
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="text-xs text-gray-400">Completadas</div>
          </DetectiveCard>

          {/* Average Resolution Time */}
          <DetectiveCard className="p-6">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <div className="mb-1 text-sm text-gray-400">Tiempo Promedio</div>
                <div className="text-2xl font-bold text-purple-400">
                  {stats.avg_resolution_time_hours.toFixed(1)}h
                </div>
              </div>
              <Clock className="h-5 w-5 text-purple-400" />
            </div>
            <div className="text-xs text-gray-400">De resolución</div>
          </DetectiveCard>
        </div>
      )}

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
                        className={`rounded border px-2 py-1 text-xs font-semibold ${getSeverityColor(
                          alert.severity,
                        )}`}
                      >
                        {alert.severity.toUpperCase()}
                      </span>

                      <span className={`text-sm font-semibold ${getStatusColor(alert.status)}`}>
                        {alert.status === 'open' && 'ABIERTA'}
                        {alert.status === 'acknowledged' && 'RECONOCIDA'}
                        {alert.status === 'resolved' && 'RESUELTA'}
                        {alert.status === 'suppressed' && 'SUPRIMIDA'}
                      </span>

                      <span className="text-xs text-gray-500">
                        {formatTimestamp(alert.triggered_at)}
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
