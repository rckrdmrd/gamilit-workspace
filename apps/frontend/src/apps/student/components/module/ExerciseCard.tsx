/**
 * ExerciseCard - Card content for exercises within a module.
 *
 * Shows difficulty badge, XP reward, estimated time, and action button.
 *
 * @module apps/student/components/module/ExerciseCard
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, Clock, Star, CheckCircle, Construction } from 'lucide-react';
import { getColorSchemeById } from '@shared/utils/colorPalette';
import { cn } from '@shared/utils/cn';
import { DIFFICULTY_LABELS, getDifficultyBadgeClasses } from './difficulty';

interface ExerciseCardExercise {
  id: string;
  title: string;
  description?: string;
  difficulty_level?: string;
  difficulty?: string;
  xp_reward?: number;
  estimated_time_minutes?: number;
  is_active?: boolean;
}

interface ExerciseCardProps {
  exercise: ExerciseCardExercise;
  completed?: boolean;
}

export function ExerciseCard({ exercise, completed = false }: ExerciseCardProps) {
  const colorScheme = useMemo(() => getColorSchemeById(exercise.id), [exercise.id]);
  const isInactive = !exercise.is_active;
  const difficultyLevel = exercise.difficulty_level || exercise.difficulty || 'beginner';

  return (
    <>
      {/* Header with gradient icon and status badges */}
      <div className="mb-3 flex items-start justify-between">
        <motion.div
          className={cn(
            'flex h-16 w-16 items-center justify-center rounded-xl',
            'bg-gradient-to-br shadow-lg',
            colorScheme.iconGradient,
            isInactive && 'opacity-60',
          )}
          whileHover={{ scale: 1.05, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <Target className="h-8 w-8 text-white" />
        </motion.div>
        {completed && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-md"
          >
            <CheckCircle className="h-4 w-4" />
            Completado
          </motion.span>
        )}
        {isInactive && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1.5 rounded-lg border border-detective-orange-dark bg-gradient-to-r from-detective-orange-400 to-detective-orange px-3 py-1.5 text-xs font-bold text-white shadow-orange"
          >
            <Construction className="h-4 w-4" />
            Proximamente
          </motion.span>
        )}
      </div>

      {/* Title */}
      <h3 className="mb-2 text-base font-bold text-gray-900">{exercise.title || 'Sin titulo'}</h3>

      {/* Description */}
      {exercise.description && (
        <p className="mb-3 line-clamp-2 text-xs text-gray-600" title={exercise.description}>{exercise.description}</p>
      )}

      {/* Badges */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <motion.span
          whileHover={{ scale: 1.05 }}
          className={cn(
            'rounded-lg border-2 px-2.5 py-1 text-xs font-bold shadow-sm',
            getDifficultyBadgeClasses(difficultyLevel),
          )}
        >
          {DIFFICULTY_LABELS[difficultyLevel]?.toUpperCase() || difficultyLevel.toUpperCase()}
        </motion.span>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-1.5 rounded-lg border-2 border-amber-300 bg-gradient-to-r from-amber-100 to-orange-100 px-2.5 py-1 shadow-sm"
        >
          <Star className="h-4 w-4 text-amber-600" />
          <span className="text-xs font-bold text-amber-700">{exercise.xp_reward ?? 0} XP</span>
        </motion.div>

        {exercise.estimated_time_minutes && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1.5 rounded-lg border-2 border-blue-300 bg-gradient-to-r from-blue-100 to-cyan-100 px-2.5 py-1 shadow-sm"
          >
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-700">
              {exercise.estimated_time_minutes} min
            </span>
          </motion.div>
        )}
      </div>

      {/* Action Button */}
      <motion.button
        whileHover={!isInactive && !completed ? { scale: 1.03, y: -2 } : undefined}
        whileTap={!isInactive && !completed ? { scale: 0.97 } : undefined}
        className={cn(
          'w-full rounded-xl py-3 text-sm font-bold text-white',
          'flex items-center justify-center gap-2',
          'bg-gradient-to-r shadow-lg transition-shadow',
          !isInactive && !completed && 'hover:shadow-xl',
          completed
            ? 'cursor-default from-green-500 to-emerald-500'
            : isInactive
              ? 'cursor-default from-gray-400 to-gray-500 opacity-60'
              : colorScheme.buttonGradient,
        )}
        disabled={isInactive || completed}
      >
        {completed ? <CheckCircle className="h-4 w-4" /> : <Target className="h-4 w-4" />}
        {isInactive ? 'En Construccion' : completed ? 'Ejercicio Completado' : 'Comenzar Ejercicio'}
        {!isInactive && !completed && (
          <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            {'\u2192'}
          </motion.span>
        )}
      </motion.button>
    </>
  );
}
