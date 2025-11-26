import { useEffect } from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { AdminLayout } from '../layouts/AdminLayout';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  BookOpen,
  Trophy,
  Activity,
  Building2,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

/**
 * AdminDashboardPage - Dashboard principal para administradores
 * Updated: 2025-11-19 - Integrated with useAdminDashboard hook (FE-059)
 */
export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Use useAdminDashboard hook for real data
  const { systemHealth, metrics, alerts, loading, error, lastUpdated, refreshAll, dismissAlert } =
    useAdminDashboard();

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

  // Fetch dashboard data on mount
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return (
    <AdminLayout
      user={user || undefined}
      gamificationData={displayGamificationData}
      organizationName="GAMILIT Platform Admin"
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Header with Refresh */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-detective-text">Panel de Administración</h1>
            <p className="mt-1 text-detective-text-secondary">
              Gestiona la plataforma GAMILIT de forma centralizada
            </p>
            {lastUpdated && (
              <p className="mt-1 text-xs text-detective-text-secondary">
                Última actualización: {lastUpdated.toLocaleTimeString('es-ES')}
              </p>
            )}
          </div>
          <DetectiveButton variant="secondary" onClick={refreshAll} disabled={loading}>
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </DetectiveButton>
        </div>

        {/* Error Message */}
        {error && (
          <DetectiveCard>
            <div className="rounded-lg border border-red-500/50 bg-red-500/20 p-4 text-red-500">
              <p className="font-semibold">Error al cargar dashboard:</p>
              <p>{error}</p>
            </div>
          </DetectiveCard>
        )}

        {/* Loading State */}
        {loading && !metrics ? (
          <div className="py-12 text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-detective-orange"></div>
            <p className="mt-4 text-detective-text-secondary">Cargando datos del dashboard...</p>
          </div>
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <DetectiveCard hoverable={false}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm text-detective-text-secondary">Usuarios Totales</p>
                    <p className="text-2xl font-bold text-detective-text">
                      {metrics?.totalUsers || 0}
                    </p>
                    <p className="mt-1 text-xs text-green-500">
                      {metrics?.activeSessions || 0} activos
                    </p>
                  </div>
                  <Users className="h-10 w-10 text-blue-500" />
                </div>
              </DetectiveCard>

              <DetectiveCard hoverable={false}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm text-detective-text-secondary">Instituciones</p>
                    <p className="text-2xl font-bold text-detective-text">
                      {metrics?.totalOrganizations || 0}
                    </p>
                    <p className="mt-1 text-xs text-detective-text-secondary">Registradas</p>
                  </div>
                  <Building2 className="h-10 w-10 text-purple-500" />
                </div>
              </DetectiveCard>

              <DetectiveCard hoverable={false}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm text-detective-text-secondary">Almacenamiento</p>
                    <p className="text-2xl font-bold text-detective-text">
                      {metrics?.storageUsed !== null && metrics?.storageUsed !== undefined ? (
                        <>{metrics.storageUsed.toFixed(1)} GB</>
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </p>
                    <p className="mt-1 text-xs text-detective-text-secondary">
                      {metrics?.storageTotal !== null && metrics?.storageTotal !== undefined ? (
                        <>de {metrics.storageTotal} GB</>
                      ) : (
                        <span className="text-gray-500">No disponible</span>
                      )}
                    </p>
                  </div>
                  <BookOpen className="h-10 w-10 text-green-500" />
                </div>
              </DetectiveCard>

              <DetectiveCard hoverable={false}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm text-detective-text-secondary">Contenido Flagged</p>
                    <p className="text-2xl font-bold text-detective-gold">
                      {metrics?.flaggedContentCount !== null &&
                      metrics?.flaggedContentCount !== undefined ? (
                        metrics.flaggedContentCount
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </p>
                    <p className="mt-1 text-xs text-detective-text-secondary">Requiere revisión</p>
                  </div>
                  <Trophy className="h-10 w-10 text-detective-gold" />
                </div>
              </DetectiveCard>
            </div>
          </>
        )}

        {/* System Health */}
        {!loading && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <DetectiveCard>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-bold text-detective-text">
                  <Activity className="h-6 w-6 text-green-500" />
                  Estado del Sistema
                </h2>
                {systemHealth && (
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      systemHealth.status === 'healthy'
                        ? 'bg-green-100 text-green-700'
                        : systemHealth.status === 'degraded'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {systemHealth.status === 'healthy'
                      ? '✓ Operativo'
                      : systemHealth.status === 'degraded'
                        ? '⚠ Degradado'
                        : '✕ Crítico'}
                  </span>
                )}
              </div>

              {systemHealth ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-detective-bg-secondary p-3">
                    <span className="text-sm text-detective-text">API Backend</span>
                    <span className="text-sm font-medium text-green-500">
                      ✓ {systemHealth.apiUptime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-detective-bg-secondary p-3">
                    <span className="text-sm text-detective-text">Base de Datos</span>
                    <span
                      className={`text-sm font-medium ${
                        systemHealth.database === 'healthy'
                          ? 'text-green-500'
                          : systemHealth.database === 'degraded'
                            ? 'text-yellow-500'
                            : 'text-red-500'
                      }`}
                    >
                      {systemHealth.database === 'healthy'
                        ? '✓ Operativo'
                        : systemHealth.database === 'degraded'
                          ? '⚠ Degradado'
                          : '✕ Fuera de servicio'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-detective-bg-secondary p-3">
                    <span className="text-sm text-detective-text">CPU</span>
                    <span className="text-sm text-detective-text-secondary">
                      {systemHealth.cpu.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-detective-bg-secondary p-3">
                    <span className="text-sm text-detective-text">Memoria</span>
                    <span className="text-sm text-detective-text-secondary">
                      {systemHealth.memory.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-detective-bg-secondary p-3">
                    <span className="text-sm text-detective-text">Usuarios Activos</span>
                    <span className="text-sm font-medium text-blue-500">
                      {systemHealth.activeUsers}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="font-medium text-amber-500">No se pudo cargar estado del sistema</p>
                  <p className="mt-2 text-sm text-detective-text-secondary">
                    Intenta actualizar el dashboard
                  </p>
                </div>
              )}
            </DetectiveCard>

            <DetectiveCard>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-detective-text">
                <AlertCircle className="h-6 w-6 text-orange-500" />
                Alertas y Notificaciones
              </h2>

              {alerts && alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex items-start gap-3 rounded-lg border p-3 ${
                        alert.severity === 'high'
                          ? 'border-red-500/30 bg-red-900/20'
                          : alert.severity === 'medium'
                            ? 'border-yellow-500/30 bg-yellow-900/20'
                            : 'border-blue-500/30 bg-blue-900/20'
                      }`}
                    >
                      <AlertCircle
                        className={`mt-0.5 h-5 w-5 ${
                          alert.severity === 'high'
                            ? 'text-red-500'
                            : alert.severity === 'medium'
                              ? 'text-yellow-500'
                              : 'text-blue-500'
                        }`}
                      />
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${
                            alert.severity === 'high'
                              ? 'text-red-400'
                              : alert.severity === 'medium'
                                ? 'text-yellow-400'
                                : 'text-blue-400'
                          }`}
                        >
                          {alert.title}
                        </p>
                        <p className="mt-1 text-xs text-detective-text-secondary">
                          {alert.message}
                        </p>
                      </div>
                      {!alert.dismissed && (
                        <button
                          onClick={() => dismissAlert(alert.id)}
                          className="text-xs text-detective-text-secondary hover:text-detective-text"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {metrics?.flaggedContentCount !== null &&
                    metrics?.flaggedContentCount !== undefined &&
                    metrics.flaggedContentCount > 0 && (
                      <div className="flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-900/20 p-3">
                        <ShieldCheck className="mt-0.5 h-5 w-5 text-yellow-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-yellow-400">
                            {metrics.flaggedContentCount} Contenido Flagged
                          </p>
                          <p className="mt-1 text-xs text-detective-text-secondary">
                            Requiere revisión
                          </p>
                        </div>
                      </div>
                    )}

                  <div className="py-4 text-center text-sm text-detective-text-secondary">
                    <p>No hay alertas activas en este momento</p>
                    <p className="mt-1 text-xs">ⓘ Sistema de alertas en tiempo real próximamente</p>
                  </div>
                </div>
              )}
            </DetectiveCard>
          </div>
        )}

        {/* Quick Actions */}
        {!loading && (
          <DetectiveCard>
            <h2 className="mb-4 text-xl font-bold text-detective-text">Acciones Rápidas</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <button
                onClick={() => navigate('/admin/users')}
                className="rounded-lg bg-detective-bg-secondary p-4 text-center transition-all hover:scale-105 hover:bg-opacity-80"
              >
                <Users className="mx-auto mb-2 h-8 w-8 text-blue-500" />
                <p className="text-sm font-medium text-detective-text">Gestionar Usuarios</p>
                <p className="mt-1 text-xs text-detective-text-secondary">
                  {metrics?.totalUsers || 0} usuarios
                </p>
              </button>
              <button
                onClick={() => navigate('/admin/institutions')}
                className="rounded-lg bg-detective-bg-secondary p-4 text-center transition-all hover:scale-105 hover:bg-opacity-80"
              >
                <Building2 className="mx-auto mb-2 h-8 w-8 text-purple-500" />
                <p className="text-sm font-medium text-detective-text">Instituciones</p>
                <p className="mt-1 text-xs text-detective-text-secondary">
                  {metrics?.totalOrganizations || 0} instituciones
                </p>
              </button>
              <button
                onClick={() => navigate('/admin/content')}
                className="rounded-lg bg-detective-bg-secondary p-4 text-center transition-all hover:scale-105 hover:bg-opacity-80"
              >
                <BookOpen className="mx-auto mb-2 h-8 w-8 text-green-500" />
                <p className="text-sm font-medium text-detective-text">Contenido</p>
                <p className="mt-1 text-xs text-detective-text-secondary">
                  {metrics?.flaggedContentCount !== null &&
                  metrics?.flaggedContentCount !== undefined
                    ? `${metrics.flaggedContentCount} flagged`
                    : 'N/A'}
                </p>
              </button>
              <button
                onClick={() => navigate('/admin/gamification')}
                className="rounded-lg bg-detective-bg-secondary p-4 text-center transition-all hover:scale-105 hover:bg-opacity-80"
              >
                <Trophy className="mx-auto mb-2 h-8 w-8 text-detective-gold" />
                <p className="text-sm font-medium text-detective-text">Gamificación</p>
                <p className="mt-1 text-xs text-detective-text-secondary">Configurar</p>
              </button>
            </div>
          </DetectiveCard>
        )}
      </div>
    </AdminLayout>
  );
}
