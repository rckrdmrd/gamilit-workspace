/**
 * @deprecated Since 2026-02 — Zero external references. Replaced by DashboardComplete.
 * Safe to delete. See TASK-2026-03-03-COMPREHENSIVE-CODEBASE-AUDIT.
 */

/**
 * ModuleCard Component
 *
 * Tarjeta individual de módulo educativo con progreso
 */

import { Lock, CheckCircle, PlayCircle, Clock } from 'lucide-react';
import type { Module } from '@/shared/types/educational.types';
import type { ModuleProgress } from '@/shared/types/progress.types';
import { ProgressStatus } from '@/shared/types/progress.types';

interface ModuleCardProps {
  module: Module;
  progress?: ModuleProgress;
  onClick: () => void;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  very_easy: 'bg-green-100 text-green-800',
  easy: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-orange-100 text-orange-800',
  very_hard: 'bg-red-100 text-red-800',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  very_easy: 'Muy Fácil',
  easy: 'Fácil',
  medium: 'Medio',
  hard: 'Difícil',
  very_hard: 'Muy Difícil',
};

export const ModuleCard = ({ module, progress, onClick }: ModuleCardProps) => {
  // Calculate if module is locked based on progress status
  const isLocked = progress?.status === ProgressStatus.NOT_STARTED;
  const isCompleted =
    progress?.status === ProgressStatus.COMPLETED || progress?.status === ProgressStatus.MASTERED;
  const isInProgress = progress?.status === ProgressStatus.IN_PROGRESS;
  const progressPercentage = progress?.progress_percentage || 0;

  const handleClick = () => {
    if (!isLocked) {
      onClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative rounded-xl border-2 bg-white transition-all duration-300
        ${
          isLocked
            ? 'cursor-not-allowed border-gray-200 opacity-60'
            : 'cursor-pointer border-gray-200 hover:border-purple-400 hover:shadow-lg'
        }
        ${isCompleted ? 'border-green-400' : ''}
        ${isInProgress ? 'border-purple-400' : ''}
      `}
    >
      {/* Icon y Badge de dificultad */}
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div
            className={`
            flex h-12 w-12 items-center justify-center rounded-lg text-2xl
            ${module.color || 'bg-purple-100'}
          `}
          >
            {module.icon || '📚'}
          </div>

          <span
            className={`
            rounded-full px-3 py-1 text-xs font-semibold
            ${module.difficulty ? (DIFFICULTY_COLORS[module.difficulty] ?? 'bg-gray-100 text-gray-800') : 'bg-gray-100 text-gray-800'}
          `}
          >
            {module.difficulty
              ? (DIFFICULTY_LABELS[module.difficulty] ?? module.difficulty)
              : 'N/A'}
          </span>
        </div>

        {/* Título y descripción */}
        <h3 className="mb-2 text-xl font-bold text-gray-900">{module.title}</h3>
        <p className="line-clamp-2 text-sm text-gray-600">{module.description}</p>

        {/* Estadísticas */}
        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center">
            <Clock className="mr-1 h-4 w-4" />
            {Math.ceil(
              (module.estimated_duration_minutes ?? module.estimated_time_minutes ?? 0) / 60,
            )}
            h
          </span>
          <span>{module.total_exercises} ejercicios</span>
        </div>

        {/* Barra de progreso */}
        {progress && !isLocked && (
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-gray-600">Progreso</span>
              <span className="font-semibold text-purple-600">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  isCompleted ? 'bg-green-500' : 'bg-purple-600'
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Recompensas ganadas */}
        {progress && (progress.total_xp_earned > 0 || progress.total_ml_coins_earned > 0) && (
          <div className="mt-3 flex items-center gap-4 text-sm">
            {progress.total_xp_earned > 0 && (
              <span className="font-semibold text-purple-600">+{progress.total_xp_earned} XP</span>
            )}
            {progress.total_ml_coins_earned > 0 && (
              <span className="font-semibold text-yellow-600">
                +{progress.total_ml_coins_earned} ML Coins
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer con estado */}
      <div
        className={`
        flex items-center justify-between border-t px-6 py-3
        ${isLocked ? 'bg-gray-50' : isCompleted ? 'bg-green-50' : isInProgress ? 'bg-purple-50' : 'bg-gray-50'}
      `}
      >
        {isLocked && (
          <div className="flex items-center text-sm text-gray-500">
            <Lock className="mr-2 h-4 w-4" />
            Bloqueado
          </div>
        )}
        {isCompleted && (
          <div className="flex items-center text-sm font-semibold text-green-600">
            <CheckCircle className="mr-2 h-4 w-4" />
            Completado
          </div>
        )}
        {isInProgress && !isCompleted && (
          <div className="flex items-center text-sm font-semibold text-purple-600">
            <PlayCircle className="mr-2 h-4 w-4" />
            Continuar
          </div>
        )}
        {!isLocked && !isCompleted && !isInProgress && (
          <div className="flex items-center text-sm font-semibold text-gray-600">
            <PlayCircle className="mr-2 h-4 w-4" />
            Comenzar
          </div>
        )}

        {progress && (
          <span className="text-xs text-gray-500">
            {progress.completed_exercises}/{module.total_exercises} ejercicios
          </span>
        )}
      </div>

      {/* Indicator de prerequisitos */}
      {isLocked && module.prerequisites && module.prerequisites.length > 0 && (
        <div className="absolute right-2 top-2">
          <div className="rounded bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
            Requiere completar módulo anterior
          </div>
        </div>
      )}
    </div>
  );
};
