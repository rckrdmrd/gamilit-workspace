import React from 'react';
import { BookOpen, Clock, TrendingUp } from 'lucide-react';
import type { Module } from '@/shared/types/educational.types';
import type { ModuleProgress } from '@/shared/types/progress.types';
import {
  formatTimeSpent,
  formatProgressPercentage,
  formatRelativeTime,
  getStatusBadgeColor,
  getDifficultyBadgeColor,
} from '@/shared/utils/formatters';

interface ProgressCardProps {
  module: Module;
  progress?: ModuleProgress;
  onClick?: () => void;
}

/**
 * ProgressCard Component
 * Displays a module card with progress information
 *
 * Features:
 * - Module thumbnail/icon
 * - Module title and description (truncated)
 * - Progress bar (0-100%)
 * - Status badge (not_started, in_progress, completed, mastered)
 * - Stats: exercises completed, time spent
 * - Last accessed date
 * - Hover effect with scale
 * - Difficulty badge
 *
 * @param module - Module data
 * @param progress - Module progress data (optional)
 * @param onClick - Click handler
 */
export const ProgressCard: React.FC<ProgressCardProps> = ({ module, progress, onClick }) => {
  const progressPercentage = progress?.progress_percentage || 0;
  const status = progress?.status || 'not_started';
  const exercisesCompleted = progress?.completed_exercises || 0;
  const exercisesTotal = progress?.total_exercises || 0;
  const timeSpent =
    progress?.time_spent_seconds ||
    (typeof progress?.time_spent === 'number' ? progress?.time_spent : 0) ||
    0;
  const lastAccessed = progress?.last_accessed_at;

  // Truncate description
  const truncatedDescription =
    module.description && module.description.length > 120
      ? module.description.substring(0, 120) + '...'
      : module.description || '';

  return (
    <div
      onClick={onClick}
      className={`
        overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm
        transition-all duration-200 hover:scale-[1.02] hover:shadow-md
        ${onClick ? 'cursor-pointer' : ''}
      `}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`${module.title} - ${status}`}
    >
      {/* Module Header with Icon/Thumbnail */}
      <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600">
        {module.thumbnail_url ? (
          <img
            src={module.thumbnail_url}
            alt={module.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <BookOpen className="h-16 w-16 text-white opacity-80" />
        )}

        {/* Difficulty Badge */}
        <div className="absolute right-3 top-3">
          <span
            className={`
              rounded-full px-2 py-1 text-xs font-semibold
              ${getDifficultyBadgeColor(String(module.difficulty || 'beginner'))}
            `}
          >
            {module.difficulty}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4">
        {/* Title and Status Badge */}
        <div className="mb-2 flex items-start justify-between">
          <h3 className="mr-2 line-clamp-2 flex-1 text-lg font-semibold text-gray-900">
            {module.title}
          </h3>
          <span
            className={`
              flex-shrink-0 whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold
              ${getStatusBadgeColor(status)}
            `}
          >
            {status.replace('_', ' ')}
          </span>
        </div>

        {/* Description */}
        <p className="mb-4 line-clamp-2 text-sm text-gray-600">{truncatedDescription}</p>

        {/* Progress Bar */}
        {progress && (
          <div className="mb-4">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">Progress</span>
              <span className="text-xs font-semibold text-orange-600">
                {formatProgressPercentage(progressPercentage)}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-orange-600 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
                role="progressbar"
                aria-valuenow={progressPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
          {/* Exercises Completed */}
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 flex-shrink-0 text-gray-500" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Exercises</p>
              <p className="truncate text-sm font-semibold text-gray-900">
                {exercisesCompleted}/{exercisesTotal}
              </p>
            </div>
          </div>

          {/* Time Spent */}
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 flex-shrink-0 text-gray-500" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Time Spent</p>
              <p className="truncate text-sm font-semibold text-gray-900">
                {formatTimeSpent(timeSpent)}
              </p>
            </div>
          </div>
        </div>

        {/* Last Accessed */}
        {lastAccessed && (
          <div className="mt-3 border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-500">
              Last accessed{' '}
              <span className="font-medium text-gray-700">{formatRelativeTime(lastAccessed)}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressCard;
