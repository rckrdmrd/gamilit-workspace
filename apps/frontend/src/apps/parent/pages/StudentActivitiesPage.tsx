/**
 * StudentActivitiesPage
 *
 * EXT-011 Parent Portal - Student Activity Feed Page
 *
 * @description Full activity feed for a specific linked student.
 * Shows chronological list of exercises, achievements, level-ups and more
 * with activity-type badges and pagination.
 *
 * @see ET-PAR-002-portal-dashboard.md
 * @created 2026-02-27
 */

import { useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  TrendingUp,
  Award,
  Star,
  BookOpen,
  Flame,
  Target,
  ChevronDown,
  AlertCircle,
  Activity,
} from 'lucide-react';
import { parentAPI } from '@/features/parent/api/parentAPI';
import { useParentStore } from '@/features/parent/store/parentStore';
import { ActivityType } from '@/features/parent/types/parent.types';
import type { RecentActivity } from '@/features/parent/types/parent.types';

// ============================================================================
// CONSTANTS
// ============================================================================

const PAGE_SIZE = 20;

const ACTIVITY_CONFIG: Record<
  ActivityType,
  { icon: React.ReactNode; bg: string; label: string }
> = {
  [ActivityType.EXERCISE_COMPLETED]: {
    icon: <TrendingUp className="w-5 h-5 text-green-600" />,
    bg: 'bg-green-100',
    label: 'Ejercicio completado',
  },
  [ActivityType.ACHIEVEMENT_UNLOCKED]: {
    icon: <Award className="w-5 h-5 text-yellow-600" />,
    bg: 'bg-yellow-100',
    label: 'Logro desbloqueado',
  },
  [ActivityType.LEVEL_UP]: {
    icon: <Star className="w-5 h-5 text-purple-600" />,
    bg: 'bg-purple-100',
    label: 'Subio de nivel',
  },
  [ActivityType.RANK_PROMOTION]: {
    icon: <Star className="w-5 h-5 text-indigo-600" />,
    bg: 'bg-indigo-100',
    label: 'Promocion de rango',
  },
  [ActivityType.MODULE_COMPLETED]: {
    icon: <BookOpen className="w-5 h-5 text-blue-600" />,
    bg: 'bg-blue-100',
    label: 'Modulo completado',
  },
  [ActivityType.ASSIGNMENT_SUBMITTED]: {
    icon: <Target className="w-5 h-5 text-teal-600" />,
    bg: 'bg-teal-100',
    label: 'Tarea entregada',
  },
  [ActivityType.STREAK_MILESTONE]: {
    icon: <Flame className="w-5 h-5 text-orange-600" />,
    bg: 'bg-orange-100',
    label: 'Hito de racha',
  },
};

const DEFAULT_ACTIVITY_CONFIG = {
  icon: <Activity className="w-5 h-5 text-gray-600" />,
  bg: 'bg-gray-100',
  label: 'Actividad',
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const ActivityBadge = ({ type }: { type: ActivityType }) => {
  const config = ACTIVITY_CONFIG[type] ?? DEFAULT_ACTIVITY_CONFIG;
  return (
    <div className={`p-2 rounded-lg flex-shrink-0 ${config.bg}`} aria-hidden="true">
      {config.icon}
    </div>
  );
};

const ActivitySkeletonRow = () => (
  <div className="p-4 flex items-start gap-4 animate-pulse">
    <div className="w-9 h-9 bg-gray-200 rounded-lg flex-shrink-0" />
    <div className="flex-1 space-y-2 pt-1">
      <div className="h-4 w-48 bg-gray-200 rounded" />
      <div className="h-3 w-64 bg-gray-200 rounded" />
      <div className="h-3 w-32 bg-gray-200 rounded" />
    </div>
    <div className="h-4 w-14 bg-gray-200 rounded" />
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const StudentActivitiesPage = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { students } = useParentStore();

  const [displayLimit, setDisplayLimit] = useState(PAGE_SIZE);
  const [typeFilter, setTypeFilter] = useState<ActivityType | 'all'>('all');

  const student = students.find((s) => s.studentId === studentId);

  const {
    data: activities,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<RecentActivity[], Error>({
    queryKey: ['parent', 'student-activities', studentId],
    queryFn: () => parentAPI.getStudentActivities(studentId!, 100),
    enabled: !!studentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const filteredActivities = activities
    ? typeFilter === 'all'
      ? activities
      : activities.filter((a) => a.activityType === typeFilter)
    : [];

  const visibleActivities = filteredActivities.slice(0, displayLimit);
  const hasMore = filteredActivities.length > displayLimit;

  const handleLoadMore = useCallback(() => {
    setDisplayLimit((prev) => prev + PAGE_SIZE);
  }, []);

  const handleFilterChange = (filter: ActivityType | 'all') => {
    setTypeFilter(filter);
    setDisplayLimit(PAGE_SIZE);
  };

  // Student not found guard
  if (!isLoading && !student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Estudiante no encontrado</p>
          <Link to="/parent/dashboard" className="text-indigo-600 hover:underline">
            Volver al Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const studentInitials = student
    ? student.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '??';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <button
              onClick={() => navigate(`/parent/child/${studentId}`)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Volver al perfil del estudiante"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Student avatar */}
            {student && (
              <div className="flex items-center gap-3">
                {student.avatarUrl ? (
                  <img
                    src={student.avatarUrl}
                    alt={student.displayName}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {studentInitials}
                  </div>
                )}
                <div>
                  <h1 className="font-bold text-gray-900">{student.displayName}</h1>
                  <p className="text-xs text-gray-500">Actividades recientes</p>
                </div>
              </div>
            )}

            {!student && (
              <div>
                <h1 className="font-bold text-gray-900">Actividades</h1>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter bar */}
        <div className="flex gap-2 flex-wrap mb-6" role="group" aria-label="Filtrar por tipo de actividad">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              typeFilter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
            aria-pressed={typeFilter === 'all'}
          >
            Todas
          </button>
          {(Object.entries(ACTIVITY_CONFIG) as [ActivityType, (typeof ACTIVITY_CONFIG)[ActivityType]][]).map(
            ([type, config]) => (
              <button
                key={type}
                onClick={() => handleFilterChange(type)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  typeFilter === type
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
                aria-pressed={typeFilter === type}
              >
                {config.label}
              </button>
            ),
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="bg-white rounded-xl shadow-sm divide-y" aria-live="polite" aria-label="Cargando actividades">
            {Array.from({ length: 8 }).map((_, i) => (
              <ActivitySkeletonRow key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 p-8 bg-white rounded-xl shadow-sm text-center"
            role="alert"
          >
            <AlertCircle className="w-12 h-12 text-red-300" />
            <div>
              <p className="font-medium text-gray-900">Error al cargar actividades</p>
              <p className="text-sm text-gray-500 mt-1">
                {error?.message ?? 'Por favor intenta de nuevo'}
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
            >
              Reintentar
            </button>
          </motion.div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && filteredActivities.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-sm p-12 text-center"
          >
            <Activity className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="font-medium text-gray-900">
              {typeFilter === 'all'
                ? 'No hay actividades recientes'
                : 'No hay actividades de este tipo'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {typeFilter !== 'all' && (
                <button
                  onClick={() => handleFilterChange('all')}
                  className="text-indigo-600 hover:underline"
                >
                  Ver todas las actividades
                </button>
              )}
            </p>
          </motion.div>
        )}

        {/* Activity feed */}
        {!isLoading && !isError && visibleActivities.length > 0 && (
          <>
            <div className="bg-white rounded-xl shadow-sm divide-y" aria-label="Lista de actividades" role="feed">
              {visibleActivities.map((activity, index) => (
                <motion.article
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.3) }}
                  className="p-4 flex items-start gap-4"
                >
                  <ActivityBadge type={activity.activityType} />

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
                    {activity.description && (
                      <p className="text-sm text-gray-600 mt-0.5 line-clamp-2" title={activity.description}>
                        {activity.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(activity.timestamp).toLocaleDateString('es-MX', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {activity.xpEarned && (
                    <span className="text-sm font-semibold text-green-600 flex-shrink-0">
                      +{activity.xpEarned} XP
                    </span>
                  )}
                </motion.article>
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="mt-4 text-center">
                <button
                  onClick={handleLoadMore}
                  className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                  Cargar mas ({filteredActivities.length - displayLimit} restantes)
                </button>
              </div>
            )}

            <p className="text-center text-xs text-gray-400 mt-4">
              Mostrando {visibleActivities.length} de {filteredActivities.length} actividades
            </p>
          </>
        )}
      </main>
    </div>
  );
};

export default StudentActivitiesPage;
