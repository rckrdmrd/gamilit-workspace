import type { ReactNode } from 'react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { SkeletonCard } from '@shared/components/loading';
import { EmptyState } from '@shared/components/feedback';
import { Users, Calendar, FileText, Award } from 'lucide-react';
import type { Activity } from '@services/api/teacher';
import type { UpcomingAssignment } from '@services/api/teacher/assignmentsApi';

// ============================================================================
// TYPES
// ============================================================================

export interface DashboardRecentActivityProps {
  activities: Activity[];
  upcomingDeadlines: UpcomingAssignment[];
  upcomingLoading: boolean;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Safely format a timestamp string to a localized short date/time string.
 */
function formatTimestamp(timestamp: string): string {
  try {
    return new Date(timestamp).toLocaleString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (_e) {
    return timestamp; // Fallback to raw value if parsing fails
  }
}

/**
 * Get the appropriate icon element for an activity type.
 */
function getActivityIcon(type: Activity['type']): ReactNode {
  if (type === 'submission')
    return <FileText className="mt-1 h-5 w-5 text-green-500" />;
  if (type === 'achievement_unlocked')
    return <Award className="mt-1 h-5 w-5 text-detective-gold" />;
  if (type === 'assignment_created')
    return <Calendar className="mt-1 h-5 w-5 text-blue-500" />;
  if (type === 'student_joined')
    return <Users className="text-detective-accent mt-1 h-5 w-5" />;
  return <Calendar className="text-detective-accent mt-1 h-5 w-5" />;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function DashboardRecentActivity({
  activities,
  upcomingDeadlines,
  upcomingLoading,
}: DashboardRecentActivityProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <DetectiveCard>
        <h3 className="mb-4 text-lg font-bold text-detective-text">
          Actividad Reciente
        </h3>
        {activities && activities.length > 0 ? (
          <div className="space-y-3">
            {activities
              .filter((activity) => activity && activity.id && activity.timestamp)
              .slice(0, 5)
              .map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 rounded-lg bg-detective-bg-secondary p-3"
                >
                  {getActivityIcon(activity.type)}
                  <div className="flex-1">
                    <p className="text-sm text-detective-text">
                      {activity.description}
                    </p>
                    <p className="text-xs text-detective-text-secondary">
                      {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <EmptyState
            icon={Calendar}
            title="No hay actividad reciente"
            className="py-8"
          />
        )}
      </DetectiveCard>

      <DetectiveCard>
        <h3 className="mb-4 text-lg font-bold text-detective-text">
          Próximas Fechas Límite
        </h3>
        {upcomingLoading ? (
          <div className="space-y-3">
            <SkeletonCard variant="small" />
            <SkeletonCard variant="small" />
          </div>
        ) : upcomingDeadlines.length > 0 ? (
          <div className="space-y-3">
            {upcomingDeadlines.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-start gap-3 rounded-lg bg-detective-bg-secondary p-3"
              >
                <Calendar className="mt-1 h-5 w-5 text-detective-orange" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-detective-text">
                    {assignment.title}
                  </p>
                  <p className="text-xs text-detective-text-secondary">
                    {assignment.daysRemaining === 0
                      ? 'Vence hoy'
                      : assignment.daysRemaining === 1
                        ? 'Vence mañana'
                        : `Vence en ${assignment.daysRemaining} días`}
                  </p>
                  <p className="text-xs text-detective-text-secondary">
                    {assignment.submittedCount}/{assignment.totalStudents} estudiantes
                    completaron
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Calendar}
            title="No hay fechas limite proximas"
            className="py-8"
          />
        )}
      </DetectiveCard>
    </div>
  );
}
