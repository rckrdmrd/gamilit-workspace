import React from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { AdminLayout } from '../layouts/AdminLayout';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import {
  Users,
  BookOpen,
  Trophy,
  Activity,
  Building2,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

/**
 * AdminDashboardPage - Dashboard principal para administradores
 */
export default function AdminDashboardPage() {
  const { user, logout } = useAuth();

  const gamificationData = {
    userId: user?.id || 'mock-admin-id',
    level: 20,
    totalXP: 5000,
    mlCoins: 2500,
    rank: 'Super Admin',
    achievements: ['admin_master', 'system_guardian', 'platform_builder'],
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  // Mock stats - reemplazar con datos reales del API
  const stats = {
    total_users: 1250,
    active_users: 890,
    total_institutions: 15,
    total_exercises: 450,
    total_ml_coins: 125000,
    system_health: 98,
    pending_approvals: 8,
    critical_alerts: 2,
  };

  return (
    <AdminLayout
      user={user || undefined}
      gamificationData={gamificationData}
      organizationName="GAMILIT Platform Admin"
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-detective-text">Panel de Administración</h1>
          <p className="text-detective-text-secondary mt-1">
            Gestiona la plataforma GAMILIT de forma centralizada
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DetectiveCard hoverable={false}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-detective-text-secondary mb-1">Usuarios Totales</p>
                <p className="text-2xl font-bold text-detective-text">{stats.total_users}</p>
                <p className="text-xs text-green-500 mt-1">
                  {stats.active_users} activos
                </p>
              </div>
              <Users className="w-10 h-10 text-blue-500" />
            </div>
          </DetectiveCard>

          <DetectiveCard hoverable={false}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-detective-text-secondary mb-1">Instituciones</p>
                <p className="text-2xl font-bold text-detective-text">{stats.total_institutions}</p>
                <p className="text-xs text-detective-text-secondary mt-1">Registradas</p>
              </div>
              <Building2 className="w-10 h-10 text-purple-500" />
            </div>
          </DetectiveCard>

          <DetectiveCard hoverable={false}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-detective-text-secondary mb-1">Ejercicios</p>
                <p className="text-2xl font-bold text-detective-text">{stats.total_exercises}</p>
                <p className="text-xs text-detective-text-secondary mt-1">En la plataforma</p>
              </div>
              <BookOpen className="w-10 h-10 text-green-500" />
            </div>
          </DetectiveCard>

          <DetectiveCard hoverable={false}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-detective-text-secondary mb-1">ML Coins</p>
                <p className="text-2xl font-bold text-detective-gold">
                  {stats.total_ml_coins.toLocaleString()}
                </p>
                <p className="text-xs text-detective-text-secondary mt-1">En circulación</p>
              </div>
              <Trophy className="w-10 h-10 text-detective-gold" />
            </div>
          </DetectiveCard>
        </div>

        {/* System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DetectiveCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-detective-text flex items-center gap-2">
                <Activity className="w-6 h-6 text-green-500" />
                Estado del Sistema
              </h2>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                {stats.system_health}% Operativo
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-detective-bg-secondary rounded-lg">
                <span className="text-sm text-detective-text">API Backend</span>
                <span className="text-sm text-green-500 font-medium">✓ Operativo</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-detective-bg-secondary rounded-lg">
                <span className="text-sm text-detective-text">Base de Datos</span>
                <span className="text-sm text-green-500 font-medium">✓ Operativo</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-detective-bg-secondary rounded-lg">
                <span className="text-sm text-detective-text">Sistema de Archivos</span>
                <span className="text-sm text-green-500 font-medium">✓ Operativo</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-detective-bg-secondary rounded-lg">
                <span className="text-sm text-detective-text">Servicios Externos</span>
                <span className="text-sm text-yellow-500 font-medium">⚠ Degradado</span>
              </div>
            </div>
          </DetectiveCard>

          <DetectiveCard>
            <h2 className="text-xl font-bold text-detective-text mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-orange-500" />
              Alertas y Notificaciones
            </h2>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-red-900/20 rounded-lg border border-red-500/30">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-400">
                    {stats.critical_alerts} Alertas Críticas
                  </p>
                  <p className="text-xs text-detective-text-secondary mt-1">
                    Requieren atención inmediata
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
                <ShieldCheck className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-400">
                    {stats.pending_approvals} Aprobaciones Pendientes
                  </p>
                  <p className="text-xs text-detective-text-secondary mt-1">
                    Contenido esperando revisión
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                <TrendingUp className="w-5 h-5 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-400">
                    15% Incremento de Usuarios
                  </p>
                  <p className="text-xs text-detective-text-secondary mt-1">
                    En los últimos 7 días
                  </p>
                </div>
              </div>
            </div>
          </DetectiveCard>
        </div>

        {/* Quick Actions */}
        <DetectiveCard>
          <h2 className="text-xl font-bold text-detective-text mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-detective-bg-secondary rounded-lg hover:bg-opacity-80 transition-colors text-center">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-detective-text">Gestionar Usuarios</p>
            </button>
            <button className="p-4 bg-detective-bg-secondary rounded-lg hover:bg-opacity-80 transition-colors text-center">
              <Building2 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-detective-text">Instituciones</p>
            </button>
            <button className="p-4 bg-detective-bg-secondary rounded-lg hover:bg-opacity-80 transition-colors text-center">
              <BookOpen className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-detective-text">Contenido</p>
            </button>
            <button className="p-4 bg-detective-bg-secondary rounded-lg hover:bg-opacity-80 transition-colors text-center">
              <Trophy className="w-8 h-8 text-detective-gold mx-auto mb-2" />
              <p className="text-sm font-medium text-detective-text">Gamificación</p>
            </button>
          </div>
        </DetectiveCard>
      </div>
    </AdminLayout>
  );
}
