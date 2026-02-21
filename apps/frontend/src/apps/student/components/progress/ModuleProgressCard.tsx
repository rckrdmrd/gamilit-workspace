/**
 * ModuleProgressCard - Card de progreso detallado por módulo
 *
 * @description Muestra el progreso de un estudiante en un módulo específico,
 * incluyendo desglose de ejercicios, tiempo estimado y próximos pasos.
 *
 * @see EPIC 10.3 - Module Progress Tracking
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  Play,
  Trophy,
  Coins,
  ChevronRight,
  Target,
} from 'lucide-react';
import { ProgressBar } from '@shared/components/base/ProgressBar';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';

// ============================================================================
// TYPES
// ============================================================================

export type ExerciseStatus = 'completed' | 'in_progress' | 'pending' | 'skipped';

export interface ExerciseStatusItem {
  exercise_id: string;
  title: string;
  order_index: number;
  exercise_type: string;
  difficulty: string;
  status: ExerciseStatus;
  score?: number | null;
  max_score: number;
  is_correct?: boolean | null;
  xp_reward: number;
  ml_coins_reward: number;
  estimated_minutes: number;
  completed_at?: string | null;
  attempts_count: number;
}

export interface ModuleProgressData {
  user_id: string;
  module_id: string;
  module_title: string;
  total_exercises: number;
  completed_exercises: number;
  in_progress_exercises: number;
  pending_exercises: number;
  skipped_exercises: number;
  progress_percentage: number;
  average_score: number;
  total_xp_earned: number;
  total_ml_coins_earned: number;
  estimated_remaining_minutes: number;
  time_spent: string;
  exercises: ExerciseStatusItem[];
  next_exercise?: ExerciseStatusItem | null;
}

interface ModuleProgressCardProps {
  data: ModuleProgressData;
  onContinue?: () => void;
  onExerciseClick?: (exerciseId: string) => void;
  showExerciseList?: boolean;
  compact?: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStatusIcon = (status: ExerciseStatus) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'in_progress':
      return <Play className="h-4 w-4 text-yellow-500" />;
    case 'pending':
      return <Circle className="h-4 w-4 text-detective-text-secondary" />;
    case 'skipped':
      return <Circle className="h-4 w-4 text-red-400" />;
    default:
      return <Circle className="h-4 w-4 text-detective-text-secondary" />;
  }
};

const getStatusLabel = (status: ExerciseStatus) => {
  switch (status) {
    case 'completed':
      return 'Completado';
    case 'in_progress':
      return 'En progreso';
    case 'pending':
      return 'Pendiente';
    case 'skipped':
      return 'Omitido';
    default:
      return status;
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return 'bg-green-500/20 text-green-400';
    case 'medium':
      return 'bg-yellow-500/20 text-yellow-400';
    case 'hard':
      return 'bg-orange-500/20 text-orange-400';
    case 'expert':
      return 'bg-red-500/20 text-red-400';
    default:
      return 'bg-detective-neutral/20 text-detective-text-secondary';
  }
};

const formatTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

// ============================================================================
// COMPONENT
// ============================================================================

export function ModuleProgressCard({
  data,
  onContinue,
  onExerciseClick,
  showExerciseList = true,
  compact = false,
}: ModuleProgressCardProps): React.ReactElement {
  const {
    module_title,
    total_exercises,
    completed_exercises,
    progress_percentage,
    average_score,
    total_xp_earned,
    total_ml_coins_earned,
    estimated_remaining_minutes,
    exercises,
    next_exercise,
  } = data;

  const isCompleted = progress_percentage === 100;

  return (
    <DetectiveCard className={compact ? 'p-4' : 'p-6'}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-500/20' : 'bg-detective-orange/20'}`}>
            <BookOpen className={`h-5 w-5 ${isCompleted ? 'text-green-500' : 'text-detective-orange'}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{module_title}</h3>
            <p className="text-sm text-detective-text-secondary">
              {completed_exercises}/{total_exercises} ejercicios completados
            </p>
          </div>
        </div>

        {isCompleted && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20">
            <Trophy className="h-4 w-4 text-green-500" />
            <span className="text-xs font-medium text-green-500">Completado</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <ProgressBar
          progress={progress_percentage}
          variant="detective"
          showLabel
          label="Progreso del módulo"
          height="md"
          animated
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-detective-bg-secondary rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Target className="h-4 w-4 text-blue-400" />
            <span className="text-lg font-bold text-white">{average_score.toFixed(0)}%</span>
          </div>
          <p className="text-xs text-detective-text-secondary">Puntaje promedio</p>
        </div>

        <div className="bg-detective-bg-secondary rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Trophy className="h-4 w-4 text-purple-400" />
            <span className="text-lg font-bold text-white">{total_xp_earned}</span>
          </div>
          <p className="text-xs text-detective-text-secondary">XP ganados</p>
        </div>

        <div className="bg-detective-bg-secondary rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Coins className="h-4 w-4 text-yellow-400" />
            <span className="text-lg font-bold text-white">{total_ml_coins_earned}</span>
          </div>
          <p className="text-xs text-detective-text-secondary">ML Coins</p>
        </div>

        <div className="bg-detective-bg-secondary rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock className="h-4 w-4 text-green-400" />
            <span className="text-lg font-bold text-white">{formatTime(estimated_remaining_minutes)}</span>
          </div>
          <p className="text-xs text-detective-text-secondary">Tiempo restante</p>
        </div>
      </div>

      {/* Next Exercise */}
      {next_exercise && !isCompleted && (
        <div className="bg-detective-orange/10 border border-detective-orange/30 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-detective-orange mb-1">Siguiente ejercicio</p>
              <p className="text-sm font-medium text-white">{next_exercise.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded ${getDifficultyColor(next_exercise.difficulty)}`}>
                  {next_exercise.difficulty}
                </span>
                <span className="text-xs text-detective-text-secondary">
                  ~{next_exercise.estimated_minutes} min
                </span>
              </div>
            </div>
            {onContinue && (
              <DetectiveButton variant="primary" size="sm" onClick={onContinue}>
                Continuar
                <ChevronRight className="h-4 w-4 ml-1" />
              </DetectiveButton>
            )}
          </div>
        </div>
      )}

      {/* Exercise List */}
      {showExerciseList && !compact && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-detective-text-secondary mb-2">Desglose de ejercicios</h4>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {exercises.map((exercise, index) => (
              <motion.div
                key={exercise.exercise_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onExerciseClick?.(exercise.exercise_id)}
                className={`
                  flex items-center justify-between p-3 rounded-lg
                  bg-detective-bg-secondary hover:bg-detective-bg
                  transition-colors cursor-pointer
                  ${exercise.status === 'completed' ? 'border-l-2 border-green-500' : ''}
                  ${exercise.status === 'in_progress' ? 'border-l-2 border-yellow-500' : ''}
                `}
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(exercise.status)}
                  <div>
                    <p className="text-sm text-white">{exercise.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${getDifficultyColor(exercise.difficulty)}`}>
                        {exercise.difficulty}
                      </span>
                      <span className="text-xs text-detective-text-secondary">
                        {getStatusLabel(exercise.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  {exercise.status === 'completed' && exercise.score !== null && (
                    <p className="text-sm font-medium text-green-400">
                      {exercise.score}/{exercise.max_score}
                    </p>
                  )}
                  <p className="text-xs text-detective-text-secondary">
                    {exercise.attempts_count > 0 ? `${exercise.attempts_count} intentos` : '~' + exercise.estimated_minutes + ' min'}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </DetectiveCard>
  );
}

export default ModuleProgressCard;
