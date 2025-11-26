import { motion } from 'framer-motion';
import { BookOpen, Target, TrendingUp, Clock, Flame, Award } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import type { ProgressData } from '../../hooks/useDashboardData';

interface ProgressStatsProps {
  data: ProgressData | null;
  loading?: boolean;
}

export function ProgressStats({ data, loading }: ProgressStatsProps) {
  if (loading || !data) {
    return (
      <DetectiveCard className="h-full">
        <div className="animate-pulse">
          <div className="mb-4 h-6 w-1/2 rounded bg-detective-bg-secondary" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded bg-detective-bg-secondary" />
            ))}
          </div>
        </div>
      </DetectiveCard>
    );
  }

  const stats = [
    {
      label: 'Módulos',
      value: `${data.completedModules}/${data.totalModules}`,
      icon: BookOpen,
      color: 'text-detective-orange',
      bgGradient: 'bg-gradient-to-br from-orange-50 to-orange-100',
      borderColor: 'border-detective-orange',
      progress: (data.completedModules / data.totalModules) * 100,
    },
    {
      label: 'Ejercicios',
      value: `${data.completedExercises}/${data.totalExercises}`,
      icon: Target,
      color: 'text-detective-blue',
      bgGradient: 'bg-gradient-to-br from-blue-50 to-blue-100',
      borderColor: 'border-detective-blue',
      progress: (data.completedExercises / data.totalExercises) * 100,
    },
    {
      label: 'Promedio',
      value: `${data.averageScore.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-detective-success',
      bgGradient: 'bg-gradient-to-br from-green-50 to-green-100',
      borderColor: 'border-detective-success',
      progress: data.averageScore,
    },
    {
      label: 'Tiempo',
      value: `${Math.floor(data.totalTimeSpent / 60)}h`,
      icon: Clock,
      color: 'text-purple-500',
      bgGradient: 'bg-gradient-to-br from-purple-50 to-purple-100',
      borderColor: 'border-purple-400',
    },
    {
      label: 'Racha actual',
      value: `${data.currentStreak} días`,
      icon: Flame,
      color: 'text-detective-gold',
      bgGradient: 'bg-gradient-to-br from-amber-50 to-amber-100',
      borderColor: 'border-detective-gold',
    },
    {
      label: 'Mejor racha',
      value: `${data.longestStreak} días`,
      icon: Award,
      color: 'text-detective-gold',
      bgGradient: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
      borderColor: 'border-detective-gold',
    },
  ];

  return (
    <DetectiveCard className="h-full">
      <h3 className="mb-4 text-lg font-bold text-detective-text">Estadísticas de Progreso</h3>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05, y: -4 }}
              transition={{
                delay: index * 0.05,
                duration: 0.2,
              }}
              className={`p-4 ${stat.bgGradient} rounded-lg border-2 ${stat.borderColor} cursor-pointer shadow-md transition-all hover:shadow-xl`}
            >
              <div className="mb-2 flex items-start justify-between">
                <div className={`rounded-lg bg-white/70 p-2 ${stat.color}`}>
                  <Icon className={`h-5 w-5`} />
                </div>
                {stat.progress !== undefined && (
                  <span className="rounded-full bg-white/70 px-2 py-1 text-xs font-bold text-detective-text">
                    {Math.round(stat.progress)}%
                  </span>
                )}
              </div>

              <p className="mb-1 text-2xl font-bold text-detective-text">{stat.value}</p>
              <p className="text-xs font-medium text-detective-text-secondary">{stat.label}</p>

              {stat.progress !== undefined && (
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/70 shadow-inner">
                  <motion.div
                    className={`h-full ${stat.color.replace('text-', 'bg-')} rounded-full shadow-sm`}
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.progress}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: index * 0.1 }}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Streak bonus */}
      {data.currentStreak >= 7 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-lg border border-detective-gold/20 bg-gradient-to-r from-detective-gold/10 to-detective-orange/10 p-3"
        >
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-detective-gold" />
            <div>
              <p className="text-sm font-semibold text-detective-text">¡Racha impresionante!</p>
              <p className="text-xs text-detective-text-secondary">
                Mantén tu racha para ganar bonificaciones extras
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </DetectiveCard>
  );
}
