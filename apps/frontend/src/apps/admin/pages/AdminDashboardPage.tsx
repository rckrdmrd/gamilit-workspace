import { useEffect } from 'react';
import { AdminPageShell } from '../components/shared';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { DashboardStatsGrid } from '../components/dashboard/DashboardStatsGrid';
import { SystemHealthCard } from '../components/dashboard/SystemHealthCard';
import { AlertsNotificationsCard } from '../components/dashboard/AlertsNotificationsCard';
import { DashboardQuickActions } from '../components/dashboard/DashboardQuickActions';
import { RefreshCw } from 'lucide-react';

/**
 * AdminDashboardPage - Dashboard principal para administradores
 * Updated: 2025-11-19 - Integrated with useAdminDashboard hook (FE-059)
 * Refactored: 2026-02-18 - Migrated to AdminPageShell + extracted inline sections
 */
export default function AdminDashboardPage() {
  const { systemHealth, metrics, alerts, loading, error, lastUpdated, refreshAll, dismissAlert } =
    useAdminDashboard();

  // Fetch dashboard data on mount
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return (
    <AdminPageShell>
      <div className="space-y-6">
        {/* Header with Refresh */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-detective-text">Panel de Administracion</h1>
            <p className="mt-1 text-detective-text-secondary">
              Gestiona la plataforma GAMILIT de forma centralizada
            </p>
            {lastUpdated && (
              <p className="mt-1 text-xs text-detective-text-secondary">
                Ultima actualizacion: {lastUpdated.toLocaleTimeString('es-ES')}
              </p>
            )}
          </div>
          <DetectiveButton variant="secondary" onClick={refreshAll} disabled={loading}>
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </DetectiveButton>
        </div>

        {/* Error Message */}
        <div aria-live="polite">
          {error && (
            <DetectiveCard>
              <div className="rounded-lg border border-red-500/50 bg-red-500/20 p-4 text-red-500" role="alert">
                <p className="font-semibold">Error al cargar dashboard:</p>
                <p>{error}</p>
              </div>
            </DetectiveCard>
          )}
        </div>

        {/* Loading State */}
        {loading && !metrics ? (
          <div className="py-12 text-center" aria-live="polite">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-detective-orange" role="status">
              <span className="sr-only">Cargando datos del dashboard</span>
            </div>
            <p className="mt-4 text-detective-text-secondary">Cargando datos del dashboard...</p>
          </div>
        ) : (
          <DashboardStatsGrid metrics={metrics} />
        )}

        {/* System Health + Alerts */}
        {!loading && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2" role="region" aria-label="Salud del sistema y alertas">
            <SystemHealthCard
              systemHealth={systemHealth}
              activeSessions={metrics?.activeSessions}
            />
            <AlertsNotificationsCard
              alerts={alerts}
              flaggedContentCount={metrics?.flaggedContentCount}
              onDismissAlert={dismissAlert}
            />
          </div>
        )}

        {/* Quick Actions */}
        {!loading && <DashboardQuickActions metrics={metrics} />}
      </div>
    </AdminPageShell>
  );
}
