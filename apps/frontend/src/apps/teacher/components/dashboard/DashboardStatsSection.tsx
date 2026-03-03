import { safeFormatNumber } from '@shared/utils/format.util';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import {
  Users,
  Calendar,
  AlertTriangle,
  FileText,
  Target,
  Award,
} from 'lucide-react';
import type { TeacherDashboardStats, InterventionAlert } from '../../types';

// ============================================================================
// TYPES
// ============================================================================

type TabType =
  | 'overview'
  | 'monitoring'
  | 'assignments'
  | 'progress'
  | 'alerts'
  | 'analytics'
  | 'insights'
  | 'reports'
  | 'communication'
  | 'resources';

export interface DashboardStatsSectionProps {
  stats: TeacherDashboardStats | null;
  alerts: InterventionAlert[];
  onTabChange: (tab: TabType) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function DashboardStatsSection({
  stats,
  alerts,
  onTabChange,
}: DashboardStatsSectionProps) {
  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <DetectiveCard hoverable={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-detective-text-secondary">Estudiantes</p>
              <p className="text-2xl sm:text-3xl font-bold text-detective-text">
                {stats?.active_students ?? 0}/{stats?.total_students ?? 0}
              </p>
              <p className="mt-1 text-xs text-detective-text-secondary">Activos hoy</p>
            </div>
            <Users className="h-10 w-10 text-detective-orange" />
          </div>
        </DetectiveCard>

        <DetectiveCard hoverable={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-detective-text-secondary">Score Promedio</p>
              <p className="text-2xl sm:text-3xl font-bold text-detective-gold">
                {safeFormatNumber(stats?.average_score, 1, '%', 'N/A')}
              </p>
              <p className="mt-1 text-xs text-green-500">
                {/* Engagement calculated from active/total students */}
                {stats?.total_students && stats.total_students > 0
                  ? `${Math.round((stats.active_students / stats.total_students) * 100)}% engagement`
                  : 'N/A'}
              </p>
            </div>
            <Award className="h-10 w-10 text-detective-gold" />
          </div>
        </DetectiveCard>

        <DetectiveCard hoverable={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-detective-text-secondary">
                Tasa de Completitud
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-detective-text">
                {safeFormatNumber(stats?.average_completion, 0, '%', '0%')}
              </p>
              <p className="mt-1 text-xs text-detective-text-secondary">De ejercicios</p>
            </div>
            <Target className="text-detective-accent h-10 w-10" />
          </div>
        </DetectiveCard>

        <DetectiveCard hoverable={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-detective-text-secondary">
                Pendientes de Revisión
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-red-500">
                {alerts?.length ?? stats?.total_submissions_pending ?? 0}
              </p>
              <p className="mt-1 text-xs text-detective-text-secondary">
                {stats?.students_at_risk ? `${stats.students_at_risk} en riesgo` : 'Requieren atención'}
              </p>
            </div>
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
        </DetectiveCard>
      </div>

      {/* Quick Actions */}
      <DetectiveCard>
        <h3 className="mb-4 text-xl font-bold text-detective-text">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <DetectiveButton onClick={() => onTabChange('monitoring')} variant="secondary">
            <Users className="h-5 w-5" />
            Ver Estudiantes
          </DetectiveButton>
          <DetectiveButton
            onClick={() => onTabChange('assignments')}
            variant="secondary"
          >
            <Calendar className="h-5 w-5" />
            Nueva Asignación
          </DetectiveButton>
          <DetectiveButton onClick={() => onTabChange('alerts')} variant="secondary">
            <AlertTriangle className="h-5 w-5" />
            Ver Alertas
          </DetectiveButton>
          <DetectiveButton onClick={() => onTabChange('reports')} variant="secondary">
            <FileText className="h-5 w-5" />
            Generar Reporte
          </DetectiveButton>
        </div>
      </DetectiveCard>
    </>
  );
}
