/**
 * ModuleDetailPage - Shows module info, exercises, and progress.
 *
 * Uses useModuleDetail hook for data fetching.
 * ExerciseCard, ModuleMetaSections, and difficulty utils are extracted.
 */

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
  Trophy,
  Coins,
  TrendingUp,
  CheckCircle,
  BookOpen,
} from 'lucide-react';
import { useModuleDetail } from '@shared/hooks/useModules';

import { ExerciseCard } from '@/apps/student/components/module/ExerciseCard';
import { ModuleMetaSections } from '@/apps/student/components/module/ModuleMetaSections';
import {
  DIFFICULTY_SHORT_LABELS,
  DIFFICULTY_COLORS,
  DIFFICULTY_BG_COLORS,
} from '@/apps/student/components/module/difficulty';

export default function ModuleDetailPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { gamificationData } = useUserGamification(user?.id);

  const { module, exercises, progress, loading, error } = useModuleDetail(
    moduleId || '',
    user?.id,
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
        <GamifiedHeader
          user={user ?? undefined}
          gamificationData={gamificationData}
          onLogout={logout}
        />
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-1/3 rounded bg-gray-200" />
            <div className="h-64 rounded bg-gray-200" />
            <div className="h-32 rounded bg-gray-200" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 rounded bg-gray-200" />
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
          onLogout={logout}
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
            <p className="font-semibold">Error al cargar el modulo</p>
            <p className="mt-1 text-sm">
              {error || 'No se pudo encontrar el modulo solicitado'}
            </p>
            <button
              onClick={() => navigate(0)}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Reintentar
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  const completedExercises = progress?.completed_exercises || 0;
  const totalExercises = progress?.total_exercises || exercises.length;
  const progressPercentage =
    progress?.progress_percentage ||
    (totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0);
  const moduleDifficulty =
    typeof module.difficulty_level === 'string' ? module.difficulty_level : 'beginner';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <GamifiedHeader
        user={user || undefined}
        gamificationData={gamificationData}
        onLogout={logout}
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

        {/* Header */}
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            {module.difficulty_level && (
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-bold ${DIFFICULTY_BG_COLORS[moduleDifficulty] || 'bg-gray-100'} ${DIFFICULTY_COLORS[moduleDifficulty] || 'text-gray-600'}`}
              >
                {(
                  DIFFICULTY_SHORT_LABELS[moduleDifficulty] ||
                  moduleDifficulty ||
                  'DESCONOCIDO'
                ).toUpperCase()}
              </span>
            )}
            {(() => {
              const tags: string[] = Array.isArray(module.tags) ? module.tags : [];
              return tags.slice(0, 3).map((tag: string, idx: number) => (
                <span
                  key={idx}
                  className="rounded-md bg-white/80 px-2 py-0.5 text-xs font-semibold text-gray-700 backdrop-blur-sm"
                >
                  {tag}
                </span>
              ));
            })()}
          </div>
          <h1 className="mb-1 text-2xl font-bold text-gray-900">{module.title}</h1>
          {module.subtitle && <p className="text-sm text-gray-600">{module.subtitle}</p>}
        </div>

        {/* Description + Progress */}
        <EnhancedCard variant="primary" padding="md" hover={false} className="mb-6">
          <div className="space-y-4">
            <div>
              <h2 className="mb-2 flex items-center gap-2 text-base font-bold text-gray-900">
                <BookOpen className="h-4 w-4 text-orange-600" />
                Descripcion
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">{module.description}</p>
            </div>
            {module.summary && (
              <div className="border-t border-gray-200 pt-3">
                <p className="text-sm font-medium italic text-gray-700">{module.summary}</p>
              </div>
            )}
            <div className="pt-3">
              <ProgressBar
                progress={progressPercentage}
                showLabel={true}
                label={`${completedExercises} de ${totalExercises} ejercicios completados`}
              />
            </div>
          </div>
        </EnhancedCard>

        {/* Stats Grid */}
        <div className="mb-6 grid grid-cols-3 gap-3 md:grid-cols-5">
          {module.estimated_duration_minutes && (
            <ColorfulCard index={0} hover={false} padding="sm" className="text-center">
              <Clock className="mx-auto mb-1 h-6 w-6 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-1 text-white" />
              <p className="text-lg font-bold text-gray-900">
                {module.estimated_duration_minutes}min
              </p>
              <p className="text-xs text-gray-600">Duracion</p>
            </ColorfulCard>
          )}
          {module.difficulty_level && (
            <ColorfulCard index={1} hover={false} padding="sm" className="text-center">
              <TrendingUp className="mx-auto mb-1 h-6 w-6 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 p-1 text-white" />
              <p className="text-lg font-bold text-gray-900">
                {DIFFICULTY_SHORT_LABELS[moduleDifficulty] || moduleDifficulty}
              </p>
              <p className="text-xs text-gray-600">Dificultad</p>
            </ColorfulCard>
          )}
          {module.xp_reward && (
            <ColorfulCard index={2} hover={false} padding="sm" className="text-center">
              <Trophy className="mx-auto mb-1 h-6 w-6 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-400 p-1 text-white" />
              <p className="text-lg font-bold text-gray-900">+{module.xp_reward}</p>
              <p className="text-xs text-gray-600">XP</p>
            </ColorfulCard>
          )}
          {module.ml_coins_reward && (
            <ColorfulCard index={3} hover={false} padding="sm" className="text-center">
              <Coins className="mx-auto mb-1 h-6 w-6 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 p-1 text-white" />
              <p className="text-lg font-bold text-gray-900">+{module.ml_coins_reward}</p>
              <p className="text-xs text-gray-600">ML Coins</p>
            </ColorfulCard>
          )}
          <ColorfulCard index={4} hover={false} padding="sm" className="text-center">
            <CheckCircle className="mx-auto mb-1 h-6 w-6 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 p-1 text-white" />
            <p className="text-lg font-bold text-gray-900">{Math.round(progressPercentage)}%</p>
            <p className="text-xs text-gray-600">Completo</p>
          </ColorfulCard>
        </div>

        {/* Meta sections: objectives, competencies, skills, prerequisites, rango */}
        <ModuleMetaSections module={module} />

        {/* Exercises */}
        <div className="mb-6">
          <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-detective-text">
            <Target className="h-5 w-5 text-detective-orange" />
            Ejercicios del Modulo
          </h2>
          <p className="mb-3 text-sm text-detective-text-secondary">
            {completedExercises} de {totalExercises} ejercicios completados
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {exercises.map((exercise, index) => (
              <ColorfulCard
                key={exercise.id}
                id={exercise.id}
                hover={!exercise.completed}
                padding="md"
                onClick={exercise.completed ? undefined : () => navigate(`/exercises/${exercise.id}`)}
                animationDelay={index * 0.1}
              >
                <ExerciseCard exercise={exercise} completed={Boolean(exercise.completed)} />
              </ColorfulCard>
            ))}
          </div>

          {exercises.length === 0 && (
            <EnhancedCard variant="default" hover={false} className="py-12 text-center">
              <Target className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <p className="text-lg text-detective-text-secondary">
                No hay ejercicios disponibles en este modulo todavia.
              </p>
            </EnhancedCard>
          )}
        </div>

        <div className="h-16" />
      </div>
    </div>
  );
}
