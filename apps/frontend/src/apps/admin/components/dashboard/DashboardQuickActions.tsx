import { useNavigate } from 'react-router-dom';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { Users, Building2, BookOpen, Trophy } from 'lucide-react';
import type { SystemMetrics } from '../../types';

interface DashboardQuickActionsProps {
  metrics: SystemMetrics | null;
}

/**
 * DashboardQuickActions - Quick action buttons for the admin dashboard
 *
 * 4-button grid: Manage Users, Institutions, Content, Gamification.
 * Uses useNavigate internally for route navigation.
 * Extracted from AdminDashboardPage inline rendering.
 */
export const DashboardQuickActions: React.FC<DashboardQuickActionsProps> = ({ metrics }) => {
  const navigate = useNavigate();

  return (
    <DetectiveCard>
      <h2 className="mb-4 text-xl font-bold text-detective-text">Acciones Rapidas</h2>
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
          <p className="text-sm font-medium text-detective-text">Gamificacion</p>
          <p className="mt-1 text-xs text-detective-text-secondary">Configurar</p>
        </button>
      </div>
    </DetectiveCard>
  );
};
