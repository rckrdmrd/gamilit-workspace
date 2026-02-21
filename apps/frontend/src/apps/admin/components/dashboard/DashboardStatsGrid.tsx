import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { Users, Building2, BookOpen, Trophy } from 'lucide-react';
import type { SystemMetrics } from '../../types';

interface DashboardStatsGridProps {
  metrics: SystemMetrics | null;
}

/**
 * DashboardStatsGrid - 4 stat cards for the admin dashboard overview
 *
 * Displays: Total Users, Institutions, Storage, and Flagged Content.
 * Extracted from AdminDashboardPage inline rendering.
 */
export const DashboardStatsGrid: React.FC<DashboardStatsGridProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Users */}
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

      {/* Institutions */}
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

      {/* Storage */}
      <DetectiveCard hoverable={false}>
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-1 text-sm text-detective-text-secondary">Almacenamiento</p>
            <p className="text-2xl font-bold text-detective-text">
              {metrics?.storageUsed !== null && metrics?.storageUsed !== undefined ? (
                <>{metrics.storageUsed.toFixed(1)} GB</>
              ) : (
                <span className="text-detective-text-secondary">N/A</span>
              )}
            </p>
            <p className="mt-1 text-xs text-detective-text-secondary">
              {metrics?.storageTotal !== null && metrics?.storageTotal !== undefined ? (
                <>de {metrics.storageTotal} GB</>
              ) : (
                <span className="text-detective-text-secondary">No disponible</span>
              )}
            </p>
          </div>
          <BookOpen className="h-10 w-10 text-green-500" />
        </div>
      </DetectiveCard>

      {/* Flagged Content */}
      <DetectiveCard hoverable={false}>
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-1 text-sm text-detective-text-secondary">Contenido Flagged</p>
            <p className="text-2xl font-bold text-detective-gold">
              {metrics?.flaggedContentCount !== null &&
              metrics?.flaggedContentCount !== undefined ? (
                metrics.flaggedContentCount
              ) : (
                <span className="text-detective-text-secondary">N/A</span>
              )}
            </p>
            <p className="mt-1 text-xs text-detective-text-secondary">Requiere revision</p>
          </div>
          <Trophy className="h-10 w-10 text-detective-gold" />
        </div>
      </DetectiveCard>
    </div>
  );
};
