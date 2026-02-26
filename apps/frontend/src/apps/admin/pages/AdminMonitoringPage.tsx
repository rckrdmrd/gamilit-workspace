import { useState } from 'react';
import { LogsViewer } from '../components/monitoring/LogsViewer';
import { MetricsTab } from '../components/monitoring/MetricsTab';
import { ErrorTrackingTab } from '../components/monitoring/ErrorTrackingTab';
import { AlertasTab } from '../components/monitoring/AlertasTab';
import { AdminPageShell } from '../components/shared';
import { AdminTabBar, type AdminTab } from '../components/shared';
import { useMonitoring } from '../hooks/useMonitoring';
import { useAlerts } from '../hooks/useAlerts';
import { Activity, AlertTriangle, FileText, XCircle } from 'lucide-react';

/**
 * AdminMonitoringPage - Monitoreo del sistema en tiempo real
 *
 * Estado: COMPLETO ✅
 * - Tab "Logs" (Audit Log) - IMPLEMENTADO
 * - Tab "Métricas" - IMPLEMENTADO
 * - Tab "Error Tracking" - IMPLEMENTADO
 * - Tab "Alertas" - IMPLEMENTADO
 *
 * Updated: 2025-11-24 - Completed all monitoring tabs (Plan 4)
 */

type MonitoringTabType = 'logs' | 'metrics' | 'errors' | 'alerts';

const TABS: AdminTab<MonitoringTabType>[] = [
  { id: 'logs', label: 'Logs', icon: FileText },
  { id: 'metrics', label: 'Métricas', icon: Activity },
  { id: 'errors', label: 'Error Tracking', icon: XCircle },
  { id: 'alerts', label: 'Alertas', icon: AlertTriangle },
];

export default function AdminMonitoringPage() {
  const [activeTab, setActiveTab] = useState<MonitoringTabType>('logs');

  // Monitoring hook for metrics and errors
  const {
    metrics,
    errorStats,
    recentErrors,
    errorTrends,
    isLoading: monitoringLoading,
    refreshAll: refreshMonitoring,
  } = useMonitoring();

  // Alerts hook for alerts integration
  const {
    alerts,
    stats: alertStats,
    isLoading: alertsLoading,
    fetchAlerts,
    acknowledgeAlert,
    resolveAlert,
  } = useAlerts();

  return (
    <AdminPageShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="mb-2 flex items-center gap-3">
            <Activity className="h-8 w-8 text-purple-500" />
            <h1 className="text-2xl sm:text-3xl font-bold text-detective-text">Monitoreo del Sistema</h1>
          </div>
          <p className="mt-1 text-detective-text-secondary">
            Monitorea el rendimiento, actividad y salud del sistema en tiempo real
          </p>
        </div>

        {/* Tabs */}
        <AdminTabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} variant="underline" />

        {/* Tab Content */}
        <div className="mt-6" role="region" aria-label={`Contenido de pestana: ${TABS.find(t => t.id === activeTab)?.label ?? activeTab}`}>
          {activeTab === 'logs' && <LogsViewer />}

          {activeTab === 'metrics' && (
            <MetricsTab
              metrics={metrics}
              isLoading={monitoringLoading}
              onRefresh={refreshMonitoring}
            />
          )}

          {activeTab === 'errors' && (
            <ErrorTrackingTab
              stats={errorStats}
              recentErrors={recentErrors}
              trends={errorTrends}
              isLoading={monitoringLoading}
              onRefresh={refreshMonitoring}
            />
          )}

          {activeTab === 'alerts' && (
            <AlertasTab
              alerts={alerts}
              stats={alertStats}
              isLoading={alertsLoading}
              onRefresh={fetchAlerts}
              onAcknowledge={acknowledgeAlert}
              onResolve={resolveAlert}
            />
          )}
        </div>
      </div>
    </AdminPageShell>
  );
}
