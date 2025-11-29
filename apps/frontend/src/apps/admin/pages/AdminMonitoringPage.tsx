import React, { useState } from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { AdminLayout } from '../layouts/AdminLayout';
import { LogsViewer } from '../components/monitoring/LogsViewer';
import { MetricsTab } from '../components/monitoring/MetricsTab';
import { ErrorTrackingTab } from '../components/monitoring/ErrorTrackingTab';
import { AlertasTab } from '../components/monitoring/AlertasTab';
import { useMonitoring } from '../hooks/useMonitoring';
import { useAlerts } from '../hooks/useAlerts';
import { useUserGamification } from '@shared/hooks/useUserGamification';
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
const AdminMonitoringPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'metrics' | 'logs' | 'errors' | 'alerts'>('logs');

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

  // Use useUserGamification hook with real API endpoint
  const { gamificationData, isLoading: gamificationLoading } = useUserGamification(user?.id);

  // Fallback gamification data while loading or if data not available
  const displayGamificationData = gamificationData || {
    userId: user?.id || '',
    level: gamificationLoading ? 0 : 1,
    totalXP: 0,
    mlCoins: 0,
    rank: gamificationLoading ? 'Cargando...' : 'Ajaw',
    rankColor: '#9E9E9E',
    progressToNextLevel: 0,
    xpToNextLevel: 100,
    achievements: [],
    totalAchievements: 0,
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <AdminLayout
      user={user || undefined}
      gamificationData={displayGamificationData}
      organizationName="GAMILIT Platform Admin"
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="mb-2 flex items-center gap-3">
            <Activity className="h-8 w-8 text-purple-500" />
            <h1 className="text-3xl font-bold text-detective-text">Monitoreo del Sistema</h1>
          </div>
          <p className="mt-1 text-detective-text-secondary">
            Monitorea el rendimiento, actividad y salud del sistema en tiempo real
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('logs')}
            className={`border-b-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'logs'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Logs
            </div>
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`border-b-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'metrics'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Métricas
            </div>
          </button>
          <button
            onClick={() => setActiveTab('errors')}
            className={`border-b-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'errors'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Error Tracking
            </div>
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`border-b-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'alerts'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alertas
            </div>
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
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
    </AdminLayout>
  );
};

export default AdminMonitoringPage;
