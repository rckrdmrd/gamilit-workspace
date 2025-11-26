import React, { useCallback } from 'react';
import { Clock, BookOpen, Award, TrendingUp, Coins, Play } from 'lucide-react';
import type { RecentActivity } from '@/lib/api/progress.api';
import { ActivityAction } from '@/lib/api/progress.api';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface RecentActivityFeedProps {
  activities: RecentActivity[];
  loading?: boolean;
  onActivityClick?: (activity: RecentActivity) => void;
}

/**
 * Activity display configuration map (constant, defined outside component)
 */
const ACTIVITY_DISPLAY_CONFIG: Record<
  ActivityAction,
  {
    icon: typeof BookOpen;
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  [ActivityAction.COMPLETED_MODULE]: {
    icon: BookOpen,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  [ActivityAction.STARTED_MODULE]: {
    icon: Play,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  [ActivityAction.COMPLETED_EXERCISE]: {
    icon: Award,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  [ActivityAction.EARNED_ACHIEVEMENT]: {
    icon: Award,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  [ActivityAction.LEVELED_UP]: {
    icon: TrendingUp,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  [ActivityAction.EARNED_COINS]: {
    icon: Coins,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  [ActivityAction.STARTED_SESSION]: {
    icon: Clock,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
  },
};

const DEFAULT_ACTIVITY_DISPLAY = {
  icon: BookOpen,
  color: 'text-gray-600',
  bgColor: 'bg-gray-50',
  borderColor: 'border-gray-200',
};

/**
 * RecentActivityFeed Component
 * Displays a feed of user's recent learning activities
 */
export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  activities,
  loading = false,
  onActivityClick,
}) => {
  /**
   * Get icon and color for activity action (memoized)
   */
  const getActivityDisplay = useCallback((action: ActivityAction) => {
    return ACTIVITY_DISPLAY_CONFIG[action] || DEFAULT_ACTIVITY_DISPLAY;
  }, []);

  /**
   * Format relative time (e.g., "hace 2 horas")
   */
  const formatRelativeTime = useCallback((date: string | Date) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return formatDistanceToNow(dateObj, { addSuffix: true, locale: es });
    } catch (error) {
      return 'Fecha desconocida';
    }
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex animate-pulse items-start gap-3 rounded-lg border border-gray-200 bg-white p-4"
          >
            <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-3 w-1/2 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white py-12 text-center">
        <BookOpen className="mx-auto mb-3 h-12 w-12 text-gray-400" />
        <p className="font-medium text-gray-600">No hay actividades recientes</p>
        <p className="mt-1 text-sm text-gray-500">Comienza un módulo para ver tu actividad aquí</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const { icon: Icon, color, bgColor, borderColor } = getActivityDisplay(activity.action);

        return (
          <div
            key={activity.id}
            onClick={() => onActivityClick?.(activity)}
            className={`
              flex items-start gap-3 rounded-lg border bg-white p-4 transition-all duration-200
              ${borderColor}
              ${onActivityClick ? 'cursor-pointer hover:scale-[1.01] hover:shadow-md' : ''}
            `}
          >
            {/* Icon */}
            <div
              className={`h-10 w-10 ${bgColor} flex flex-shrink-0 items-center justify-center rounded-lg`}
            >
              <Icon className={`h-5 w-5 ${color}`} />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <p className="font-medium leading-snug text-gray-900">{activity.description}</p>

              {/* Metadata */}
              {activity.metadata && (
                <div className="mt-2 flex items-center gap-3 text-sm">
                  {activity.metadata.xp_earned && (
                    <span className="font-medium text-purple-600">
                      +{activity.metadata.xp_earned} XP
                    </span>
                  )}
                  {activity.metadata.ml_coins_earned && (
                    <span className="font-medium text-amber-600">
                      +{activity.metadata.ml_coins_earned} ML
                    </span>
                  )}
                  {activity.metadata.score !== undefined &&
                    activity.metadata.max_score !== undefined && (
                      <span className="text-gray-600">
                        {activity.metadata.score}/{activity.metadata.max_score} pts
                      </span>
                    )}
                  {activity.metadata.difficulty && (
                    <span className="capitalize text-gray-500">
                      {activity.metadata.difficulty.replace('_', ' ')}
                    </span>
                  )}
                  {activity.metadata.duration_seconds && (
                    <span className="text-gray-500">
                      {Math.ceil(activity.metadata.duration_seconds / 60)} min
                    </span>
                  )}
                </div>
              )}

              {/* Time */}
              <p className="mt-2 text-xs text-gray-500">
                {formatRelativeTime(activity.created_at)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RecentActivityFeed;
