import type { ComponentType } from 'react';
import {
  PlayCircle,
  CheckCircle,
  Code,
  FileText,
  ListChecks,
  HelpCircle,
  Play,
} from 'lucide-react';
import type { Exercise } from '@/shared/types/educational.types';
import { ExerciseType } from '@/shared/types/educational.types';
import type { ExerciseAttempt } from '@/shared/types/progress.types';

interface ExerciseAttemptCardProps {
  exercise: Exercise;
  attempts?: ExerciseAttempt[];
  onStart: () => void;
}

/**
 * ExerciseAttemptCard Component
 * Displays an exercise card with attempt history
 *
 * Features:
 * - Exercise icon based on type
 * - Exercise title and description
 * - Status badge (not_attempted, in_progress, completed)
 * - Best score display
 * - Attempts count
 * - "Start" or "Continue" button
 * - Hover effect
 *
 * @param exercise - Exercise data
 * @param attempts - Exercise attempts (optional)
 * @param onStart - Start/continue handler
 */
export const ExerciseAttemptCard = ({
  exercise,
  attempts = [],
  onStart,
}: ExerciseAttemptCardProps) => {
  // Helper functions to format score and attempt count
  const formatScore = (score: number, maxScore: number) => {
    return `${score}/${maxScore}`;
  };

  const formatAttemptCount = (count: number) => {
    return count === 1 ? '1 attempt' : `${count} attempts`;
  };

  // Calculate status and best score
  const hasAttempts = attempts.length > 0;
  const completedAttempts = attempts.filter((a) => a.status === 'completed');
  const hasCompleted = completedAttempts.length > 0;
  const inProgressAttempt = attempts.find((a) => a.status === 'in_progress');
  const bestScore = hasCompleted
    ? Math.max(...completedAttempts.map((a) => a.score))
    : inProgressAttempt?.score || 0;

  // Determine status
  const status = hasCompleted ? 'completed' : hasAttempts ? 'in_progress' : 'not_attempted';
  const statusText = hasCompleted ? 'Completed' : hasAttempts ? 'In Progress' : 'Not Started';

  // Get icon for exercise type
  const getExerciseIcon = (type: ExerciseType) => {
    const iconMap: Partial<Record<ExerciseType, ComponentType<{ className?: string }>>> = {
      [ExerciseType.CRUCIGRAMA]: ListChecks,
      [ExerciseType.LINEA_TIEMPO]: FileText,
      [ExerciseType.SOPA_LETRAS]: Code,
      [ExerciseType.MAPA_CONCEPTUAL]: FileText,
      [ExerciseType.EMPAREJAMIENTO]: ListChecks,
      [ExerciseType.VERDADERO_FALSO]: HelpCircle,
      [ExerciseType.COMPLETAR_ESPACIOS]: FileText,
    };
    return iconMap[type] || FileText;
  };

  const Icon = getExerciseIcon(exercise.type);

  // Get status color
  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'not_attempted':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Button text
  const buttonText = hasCompleted ? 'Review' : hasAttempts ? 'Continue' : 'Start';

  return (
    <div
      className="
        rounded-lg border border-gray-200 bg-white p-4 shadow-sm
        transition-all duration-200 hover:border-orange-300 hover:shadow-md
      "
    >
      <div className="flex items-start space-x-4">
        {/* Exercise Icon */}
        <div className="flex-shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50">
            <Icon className="h-6 w-6 text-orange-600" />
          </div>
        </div>

        {/* Exercise Info */}
        <div className="min-w-0 flex-1">
          {/* Title and Status */}
          <div className="mb-2 flex items-start justify-between">
            <h4 className="mr-2 line-clamp-1 text-base font-semibold text-gray-900">
              {exercise.title}
            </h4>
            <span
              className={`
                flex-shrink-0 whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold
                ${getStatusColor()}
              `}
            >
              {statusText}
            </span>
          </div>

          {/* Description */}
          <p className="mb-3 line-clamp-2 text-sm text-gray-600">{exercise.description}</p>

          {/* Stats Row */}
          <div className="mb-3 flex items-center space-x-4">
            {/* Exercise Type */}
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500">Type:</span>
              <span className="text-xs font-medium capitalize text-gray-700">
                {exercise.type.replace('_', ' ')}
              </span>
            </div>

            {/* Attempts Count */}
            {hasAttempts && (
              <div className="flex items-center space-x-1">
                <PlayCircle className="h-3 w-3 text-gray-500" />
                <span className="text-xs font-medium text-gray-700">
                  {formatAttemptCount(attempts.length)}
                </span>
              </div>
            )}

            {/* Best Score */}
            {hasCompleted && (
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span className="text-xs font-medium text-gray-700">
                  Best: {formatScore(bestScore, exercise.max_score || exercise.max_points)}
                </span>
              </div>
            )}

            {/* Estimated Time */}
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500">~{exercise.estimated_time_minutes} min</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onStart}
            className="
              inline-flex w-full items-center justify-center space-x-2 rounded-lg
              bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors
              hover:bg-orange-700 focus:outline-none
              focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 sm:w-auto
            "
          >
            <Play className="h-4 w-4" />
            <span>{buttonText}</span>
          </button>
        </div>
      </div>

      {/* Progress Indicator for In Progress */}
      {inProgressAttempt && status === 'in_progress' && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700">Current Progress</span>
            <span className="text-xs font-semibold text-orange-600">
              {formatScore(inProgressAttempt.score, exercise.max_score || exercise.max_points)}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-1.5 rounded-full bg-orange-600 transition-all duration-300"
              style={{
                width: `${(inProgressAttempt.score / (exercise.max_score || exercise.max_points)) * 100}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseAttemptCard;
