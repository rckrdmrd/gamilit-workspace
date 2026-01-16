import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/providers/AuthContext';
import { GamifiedHeader } from '@shared/components/layout/GamifiedHeader';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import { EnhancedCard } from '@shared/components/base/EnhancedCard';
import { ColorfulCard } from '@shared/components/base/ColorfulCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { ProgressBar } from '@shared/components/base/ProgressBar';
import {
  ArrowLeft,
  Target,
  Clock,
  Star,
  Trophy,
  Coins,
  TrendingUp,
  CheckCircle,
  Award,
  Lightbulb,
  BookOpen,
  Brain,
  Shield,
  Zap,
  Construction,
} from 'lucide-react';
import { useModuleDetail } from '@shared/hooks/useModules';
import { getColorSchemeById } from '@shared/utils/colorPalette';
import { cn } from '@shared/utils/cn';
import type { Exercise } from '@shared/types';

// Difficulty labels - CEFR standard (outside component)
const DIFFICULTY_LABELS = {
  beginner: 'Principiante (A1)',
  elementary: 'Elemental (A2)',
  pre_intermediate: 'Pre-Intermedio (B1)',
  intermediate: 'Intermedio (B2)',
  upper_intermediate: 'Intermedio Alto (C1)',
  advanced: 'Avanzado (C2)',
  proficient: 'Competente (C2+)',
  native: 'Nativo',
  // Legacy Spanish mapping (backward compatibility)
  facil: 'Fácil',
  medio: 'Medio',
  dificil: 'Difícil',
  experto: 'Experto',
};

// Exercise Card Content Component (outside to avoid hook issues)
interface ExerciseCardContentProps {
  exercise: Exercise;
  completed?: boolean;
}

function ExerciseCardContent({ exercise, completed = false }: ExerciseCardContentProps) {
  const colorScheme = useMemo(() => getColorSchemeById(exercise.id), [exercise.id]);
  const isInactive = !exercise.is_active; // Check if exercise is inactive

  return (
    <>
      {/* Header with large gradient icon and completion badge */}
      <div className="mb-3 flex items-start justify-between">
        <motion.div
          className={cn(
            'flex h-16 w-16 items-center justify-center rounded-xl',
            'bg-gradient-to-br shadow-lg',
            colorScheme.iconGradient,
            isInactive && 'opacity-60', // Reduce opacity for inactive exercises
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
            Próximamente
          </motion.span>
        )}
      </div>

      {/* Title */}
      <h3 className="mb-2 text-base font-bold text-gray-900">{exercise.title || 'Sin título'}</h3>

      {/* Description */}
      {exercise.description && (
        <p className="mb-3 line-clamp-2 text-xs text-gray-600">{exercise.description}</p>
      )}

      {/* Badges and Stats - More compact and colorful */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {/* Difficulty Badge */}
        <motion.span
          whileHover={{ scale: 1.05 }}
          className={cn(
            'rounded-lg border-2 px-2.5 py-1 text-xs font-bold shadow-sm',
            // CEFR levels: beginner/elementary = easy, intermediate = medium, advanced+ = hard
            exercise.difficulty_level === 'beginner' || exercise.difficulty_level === 'elementary'
              ? 'border-green-300 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700'
              : exercise.difficulty_level === 'pre_intermediate' ||
                  exercise.difficulty_level === 'intermediate'
                ? 'border-yellow-300 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700'
                : exercise.difficulty_level === 'upper_intermediate' ||
                    exercise.difficulty_level === 'advanced'
                  ? 'border-red-300 bg-gradient-to-r from-red-100 to-rose-100 text-red-700'
                  : 'border-purple-300 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700',
          )}
        >
          {DIFFICULTY_LABELS[exercise.difficulty_level]?.toUpperCase() ||
            exercise.difficulty_level?.toUpperCase() ||
            'DESCONOCIDO'}
        </motion.span>

        {/* XP Reward Badge */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-1.5 rounded-lg border-2 border-amber-300 bg-gradient-to-r from-amber-100 to-orange-100 px-2.5 py-1 shadow-sm"
        >
          <Star className="h-4 w-4 text-amber-600" />
          <span className="text-xs font-bold text-amber-700">{exercise.xp_reward ?? 0} XP</span>
        </motion.div>

        {/* Time Badge */}
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

      {/* Action Button - Large and colorful */}
      <motion.button
        whileHover={!isInactive ? { scale: 1.03, y: -2 } : undefined}
        whileTap={!isInactive ? { scale: 0.97 } : undefined}
        className={cn(
          'w-full rounded-xl py-3 text-sm font-bold text-white',
          'flex items-center justify-center gap-2',
          'bg-gradient-to-r shadow-lg transition-shadow',
          !isInactive && 'hover:shadow-xl',
          completed
            ? 'from-blue-500 to-cyan-500'
            : isInactive
              ? 'cursor-default from-gray-400 to-gray-500 opacity-60'
              : colorScheme.buttonGradient,
        )}
        disabled={isInactive}
      >
        <Target className="h-4 w-4" />
        {isInactive ? 'En Construcción' : completed ? 'Volver a intentar' : 'Comenzar Ejercicio'}
        {!isInactive && (
          <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            →
          </motion.span>
        )}
      </motion.button>
    </>
  );
}

export default function ModuleDetailPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Use useUserGamification hook (currently with mock data until backend endpoint is ready)
  const { gamificationData } = useUserGamification(user?.id);

  // Fetch module, exercises, and progress from API
  const { module, exercises, progress, loading, error } = useModuleDetail(moduleId || '', user?.id);

  const difficultyColors: Record<string, string> = {
    beginner: 'text-green-600',
    elementary: 'text-green-600',
    pre_intermediate: 'text-yellow-600',
    intermediate: 'text-yellow-600',
    upper_intermediate: 'text-orange-600',
    advanced: 'text-red-600',
    proficient: 'text-purple-600',
    native: 'text-purple-600',
  };

  const difficultyLabels: Record<string, string> = {
    beginner: 'Principiante',
    elementary: 'Elemental',
    pre_intermediate: 'Pre-Intermedio',
    intermediate: 'Intermedio',
    upper_intermediate: 'Intermedio Alto',
    advanced: 'Avanzado',
    proficient: 'Competente',
    native: 'Nativo',
  };

  const difficultyBgColors: Record<string, string> = {
    beginner: 'bg-green-100',
    elementary: 'bg-green-100',
    pre_intermediate: 'bg-yellow-100',
    intermediate: 'bg-yellow-100',
    upper_intermediate: 'bg-orange-100',
    advanced: 'bg-red-100',
    proficient: 'bg-purple-100',
    native: 'bg-purple-100',
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
        <GamifiedHeader
          user={user ?? undefined}
          gamificationData={gamificationData}
          onLogout={async () => {
            await logout();
            // No need to navigate - performLogout() handles redirect
          }}
        />
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-1/3 rounded bg-gray-200"></div>
            <div className="h-64 rounded bg-gray-200"></div>
            <div className="h-32 rounded bg-gray-200"></div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 rounded bg-gray-200"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !module) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
        <GamifiedHeader
          user={user ?? undefined}
          gamificationData={gamificationData}
          onLogout={async () => {
            await logout();
            // No need to navigate - performLogout() handles redirect
          }}
        />
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <DetectiveButton
            variant="blue"
            icon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate('/dashboard')}
            className="mb-6"
          >
            Volver al Dashboard
          </DetectiveButton>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-lg border-2 border-red-300 bg-red-50 p-4 text-red-800"
          >
            <p className="font-semibold">Error al cargar el módulo</p>
            <p className="mt-1 text-sm">{error || 'No se pudo encontrar el módulo solicitado'}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Reintentar
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Calculate progress percentage based on actual completed exercises from progress data
  // NOTE: apiClient does NOT transform snake_case -> camelCase, data comes in snake_case
  const completedExercises = progress?.completed_exercises || 0;
  const totalExercises = progress?.total_exercises || exercises.length;
  const progressPercentage =
    progress?.progress_percentage ||
    (totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <GamifiedHeader
        user={user || undefined}
        gamificationData={gamificationData}
        onLogout={async () => {
          await logout();
          // No need to navigate - performLogout() handles redirect
        }}
      />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <DetectiveButton
          variant="blue"
          icon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          Volver al Dashboard
        </DetectiveButton>

        {/* Header Section - Compact */}
        {/* NOTE: apiClient does NOT transform, data comes in snake_case */}
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            {module.difficulty_level && (
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-bold ${difficultyBgColors[module.difficulty_level] || 'bg-gray-100'} ${difficultyColors[module.difficulty_level] || 'text-gray-600'}`}
              >
                {(
                  difficultyLabels[module.difficulty_level] ||
                  module.difficulty_level ||
                  'DESCONOCIDO'
                ).toUpperCase()}
              </span>
            )}
            {module.tags &&
              module.tags.slice(0, 3).map((tag: string, idx: number) => (
                <span
                  key={idx}
                  className="rounded-md bg-white/80 px-2 py-0.5 text-xs font-semibold text-gray-700 backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
          </div>
          <h1 className="mb-1 text-2xl font-bold text-gray-900">{module.title}</h1>
          {module.subtitle && <p className="text-sm text-gray-600">{module.subtitle}</p>}
        </div>

        {/* Main Content Card - Compact */}
        <EnhancedCard variant="primary" padding="md" hover={false} className="mb-6">
          <div className="space-y-4">
            {/* Description */}
            <div>
              <h2 className="mb-2 flex items-center gap-2 text-base font-bold text-gray-900">
                <BookOpen className="h-4 w-4 text-orange-600" />
                Descripción
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">{module.description}</p>
            </div>

            {/* Summary (if available) */}
            {module.summary && (
              <div className="border-t border-gray-200 pt-3">
                <p className="text-sm font-medium italic text-gray-700">{module.summary}</p>
              </div>
            )}

            {/* Progress Bar */}
            <div className="pt-3">
              <ProgressBar
                progress={progressPercentage}
                showLabel={true}
                label={`${completedExercises} de ${totalExercises} ejercicios completados`}
              />
            </div>
          </div>
        </EnhancedCard>

        {/* Statistics Section with colorful cards - Compact */}
        {/* NOTE: apiClient does NOT transform, data comes in snake_case */}
        <div className="mb-6 grid grid-cols-3 gap-3 md:grid-cols-5">
          {/* Duration */}
          {module.estimated_duration_minutes && (
            <ColorfulCard index={0} hover={false} padding="sm" className="text-center">
              <Clock className="mx-auto mb-1 h-6 w-6 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-1 text-white" />
              <p className="text-lg font-bold text-gray-900">
                {module.estimated_duration_minutes}min
              </p>
              <p className="text-xs text-gray-600">Duración</p>
            </ColorfulCard>
          )}

          {/* Difficulty */}
          {module.difficulty_level && (
            <ColorfulCard index={1} hover={false} padding="sm" className="text-center">
              <TrendingUp className="mx-auto mb-1 h-6 w-6 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 p-1 text-white" />
              <p className="text-lg font-bold text-gray-900">
                {difficultyLabels[module.difficulty_level] || module.difficulty_level}
              </p>
              <p className="text-xs text-gray-600">Dificultad</p>
            </ColorfulCard>
          )}

          {/* XP Reward */}
          {module.xp_reward && (
            <ColorfulCard index={2} hover={false} padding="sm" className="text-center">
              <Trophy className="mx-auto mb-1 h-6 w-6 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-400 p-1 text-white" />
              <p className="text-lg font-bold text-gray-900">+{module.xp_reward}</p>
              <p className="text-xs text-gray-600">XP</p>
            </ColorfulCard>
          )}

          {/* ML Coins Reward */}
          {module.ml_coins_reward && (
            <ColorfulCard index={3} hover={false} padding="sm" className="text-center">
              <Coins className="mx-auto mb-1 h-6 w-6 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 p-1 text-white" />
              <p className="text-lg font-bold text-gray-900">+{module.ml_coins_reward}</p>
              <p className="text-xs text-gray-600">ML Coins</p>
            </ColorfulCard>
          )}

          {/* Progress */}
          <ColorfulCard index={4} hover={false} padding="sm" className="text-center">
            <CheckCircle className="mx-auto mb-1 h-6 w-6 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 p-1 text-white" />
            <p className="text-lg font-bold text-gray-900">{Math.round(progressPercentage)}%</p>
            <p className="text-xs text-gray-600">Completo</p>
          </ColorfulCard>
        </div>

        {/* Learning Objectives Section - Compact */}
        {/* NOTE: apiClient does NOT transform, data comes in snake_case */}
        {module.learning_objectives && module.learning_objectives.length > 0 && (
          <EnhancedCard variant="info" padding="sm" hover={false} className="mb-6">
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-detective-text">
              <Target className="h-4 w-4 text-detective-orange" />
              Objetivos de Aprendizaje
            </h2>
            <ul className="space-y-2">
              {module.learning_objectives.map((objective: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-detective-gold" />
                  <span className="text-sm text-detective-text-secondary">{objective}</span>
                </li>
              ))}
            </ul>
          </EnhancedCard>
        )}

        {/* Competencies and Skills Section - Compact */}
        {/* NOTE: apiClient does NOT transform, data comes in snake_case */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Competencies */}
          {module.competencies && module.competencies.length > 0 && (
            <EnhancedCard variant="default" hover={false} padding="sm" className="lg:col-span-2">
              <h2 className="mb-2 flex items-center gap-2 text-base font-bold text-detective-text">
                <Award className="h-4 w-4 text-detective-blue" />
                Competencias
              </h2>
              <ul className="space-y-1.5">
                {module.competencies.map((competency: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="mt-0.5 text-sm text-detective-blue">•</span>
                    <span className="text-xs text-detective-text-secondary">{competency}</span>
                  </li>
                ))}
              </ul>
            </EnhancedCard>
          )}

          {/* Skills Developed */}
          {module.skills_developed && module.skills_developed.length > 0 && (
            <EnhancedCard variant="default" hover={false} padding="sm" className="lg:col-span-2">
              <h2 className="mb-2 flex items-center gap-2 text-base font-bold text-detective-text">
                <Brain className="text-detective-purple h-4 w-4" />
                Habilidades Desarrolladas
              </h2>
              <ul className="space-y-1.5">
                {module.skills_developed.map((skill: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-detective-purple mt-0.5 text-sm">•</span>
                    <span className="text-xs text-detective-text-secondary">{skill}</span>
                  </li>
                ))}
              </ul>
            </EnhancedCard>
          )}
        </div>

        {/* Prerequisites Section - Compact */}
        {module.prerequisites && module.prerequisites.length > 0 && (
          <EnhancedCard variant="warning" hover={false} padding="sm" className="mb-6">
            <h2 className="mb-2 flex items-center gap-2 text-base font-bold text-detective-text">
              <Shield className="h-4 w-4 text-detective-blue" />
              Requisitos Previos
            </h2>
            <ul className="space-y-1.5">
              {module.prerequisites.map((prerequisite: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-detective-blue" />
                  <span className="text-xs text-detective-text-secondary">{prerequisite}</span>
                </li>
              ))}
            </ul>
          </EnhancedCard>
        )}

        {/* Rango Maya Section */}
        {(module.rangoMayaRequired || module.rangoMayaGranted) && (
          <EnhancedCard
            variant="default"
            hover={false}
            padding="sm"
            className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {module.rangoMayaRequired && (
                <div>
                  <h3 className="mb-1 flex items-center gap-2 text-sm font-bold text-detective-text">
                    <Shield className="h-4 w-4 text-amber-600" />
                    Rango Requerido
                  </h3>
                  <p className="text-lg font-bold capitalize text-amber-700">
                    {module.rangoMayaRequired}
                  </p>
                </div>
              )}
              {module.rangoMayaGranted && (
                <div>
                  <h3 className="mb-1 flex items-center gap-2 text-sm font-bold text-detective-text">
                    <Zap className="h-4 w-4 text-orange-600" />
                    Rango Otorgado
                  </h3>
                  <p className="text-lg font-bold capitalize text-orange-700">
                    {module.rangoMayaGranted}
                  </p>
                </div>
              )}
            </div>
          </EnhancedCard>
        )}

        {/* Exercises Section - Full Width */}
        <div className="mb-6">
          <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-detective-text">
            <Target className="h-5 w-5 text-detective-orange" />
            Ejercicios del Módulo
          </h2>
          <p className="mb-3 text-sm text-detective-text-secondary">
            {completedExercises} de {totalExercises} ejercicios completados
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {exercises.map((exercise, index) => (
              <ColorfulCard
                key={exercise.id}
                id={exercise.id}
                hover={true}
                padding="md"
                onClick={() => navigate(`/exercises/${exercise.id}`)}
                animationDelay={index * 0.1}
              >
                <ExerciseCardContent
                  exercise={exercise as unknown as Exercise}
                  completed={exercise.completed || false}
                />
              </ColorfulCard>
            ))}
          </div>

          {/* No exercises message */}
          {exercises.length === 0 && (
            <EnhancedCard variant="default" hover={false} className="py-12 text-center">
              <Target className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <p className="text-lg text-detective-text-secondary">
                No hay ejercicios disponibles en este módulo todavía.
              </p>
            </EnhancedCard>
          )}
        </div>

        {/* Bottom Spacing */}
        <div className="h-16" />
      </div>
    </div>
  );
}
