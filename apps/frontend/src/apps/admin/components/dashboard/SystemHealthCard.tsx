import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { Activity } from 'lucide-react';
import type { SystemHealth } from '../../types';

interface SystemHealthCardProps {
  systemHealth: SystemHealth | null;
  activeSessions?: number;
}

/**
 * SystemHealthCard - System health status panel for the admin dashboard
 *
 * Displays: overall status badge, API backend, database, CPU, memory, and active users.
 * Extracted from AdminDashboardPage inline rendering.
 */
export const SystemHealthCard: React.FC<SystemHealthCardProps> = ({
  systemHealth,
  activeSessions,
}) => {
  return (
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
              ? '\u2713 Operativo'
              : systemHealth.status === 'degraded'
                ? '\u26A0 Degradado'
                : '\u2715 Critico'}
          </span>
        )}
      </div>

      {systemHealth ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-detective-bg-secondary p-3">
            <span className="text-sm text-detective-text">API Backend</span>
            <span className="text-sm font-medium text-green-500">
              {'\u2713'} {systemHealth.apiUptime}
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
                ? '\u2713 Operativo'
                : systemHealth.database === 'degraded'
                  ? '\u26A0 Degradado'
                  : '\u2715 Fuera de servicio'}
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
            <span className="text-sm text-detective-text">Usuarios Activos (24h)</span>
            <span className="text-sm font-medium text-blue-500">
              {/* FIX-2025-01-07: activeUsers comes from metrics.activeSessions, not systemHealth */}
              {activeSessions ?? systemHealth.activeUsers ?? 0}
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
  );
};
