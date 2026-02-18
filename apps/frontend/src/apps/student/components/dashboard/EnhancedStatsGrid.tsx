/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { motion } from 'framer-motion';
import { Target, Flame, Clock, Trophy, TrendingUp, Award, Zap, Star } from 'lucide-react';
import { cn } from '@shared/utils/cn';
import { EnhancedCard } from '@shared/components/base/EnhancedCard';

interface EnhancedStatsGridProps {
  stats: {
    casesResolved: number;
    currentStreak: number;
    totalTime: number;
    totalXP: number;
    rankPosition?: number;
  };
  loading: boolean;
  error: Error | null;
}

interface StatCardProps {
  icon: React.ComponentType<any>;
  label: string;
  value: string | number;
  subtitle?: string;
  color: string;
  bgColor: string;
  delay: number;
  loading: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  label,
  value,
  subtitle,
  color,
  bgColor,
  delay,
  loading,
}) => {
  if (loading) {
    return (
      <EnhancedCard variant="default" hover={false} padding="md">
        <div className="mb-3 flex items-center justify-between">
          <div className={cn('animate-pulse rounded-lg p-3', bgColor)}>
            <div className="h-6 w-6 rounded bg-gray-300"></div>
          </div>
          <div className="h-4 w-4 animate-pulse rounded bg-gray-300"></div>
        </div>

        <div className="space-y-2">
          <div className="h-8 animate-pulse rounded bg-gray-300"></div>
          <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200"></div>
          {subtitle && <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200"></div>}
        </div>
      </EnhancedCard>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="group"
    >
      <EnhancedCard variant="default" hover={true} padding="md">
        <div className="mb-3 flex items-center justify-between">
          <div
            className={cn(
              'rounded-lg p-3 transition-transform duration-300 group-hover:scale-110',
              bgColor,
            )}
          >
            <Icon className={cn('h-6 w-6', color)} />
          </div>
          <TrendingUp className="h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>

        <div className="space-y-1">
          <div className="text-2xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          <div className="text-sm font-medium text-gray-700">{label}</div>
          {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
        </div>
      </EnhancedCard>
    </motion.div>
  );
};

export const EnhancedStatsGrid: React.FC<EnhancedStatsGridProps & { compact?: boolean }> = ({
  stats,
  loading,
  error,
  compact = false,
}) => {
  // Handle error state
  if (error && !loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-red-200 bg-red-50 p-6"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-red-100 p-2">
            <Target className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-red-800">Error al cargar estadísticas</h3>
            <p className="text-sm text-red-600">
              No se pudieron cargar las métricas del detective. Intenta actualizar.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Format total time (in minutes to hours/minutes)
  const formatTime = (totalMinutes: number): string => {
    // Handle invalid values
    const validMinutes = totalMinutes || 0;
    const hours = Math.floor(validMinutes / 60);
    const minutes = validMinutes % 60;

    if (hours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  };

  // Format rank position
  const formatRank = (position: number): string => {
    // Handle invalid values
    const validPosition = position || 0;
    if (validPosition === 0 || !Number.isFinite(validPosition)) return 'Sin ranking';
    if (validPosition === 1) return '1er lugar';
    if (validPosition === 2) return '2do lugar';
    if (validPosition === 3) return '3er lugar';
    return `${validPosition}° lugar`;
  };

  // Get streak emoji based on current streak
  const getStreakEmoji = (streak: number): string => {
    // Handle invalid values
    const validStreak = streak || 0;
    if (validStreak >= 30) return '🔥';
    if (validStreak >= 14) return '⚡';
    if (validStreak >= 7) return '🌟';
    if (validStreak >= 3) return '✨';
    return '📚';
  };

  interface StatCard {
    icon: React.ComponentType<any>;
    label: string;
    value: string | number;
    subtitle: string;
    color: string;
    bgColor: string;
    borderColor: string;
    delay: number;
  }

  const statCards: StatCard[] = [
    {
      icon: Target,
      label: 'Casos Resueltos',
      value: stats.casesResolved || 0,
      subtitle: 'Misterios completados',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-200',
      delay: 0.1,
    },
    {
      icon: Flame,
      label: 'Racha Actual',
      value: `${stats.currentStreak || 0} ${getStreakEmoji(stats.currentStreak)}`,
      subtitle: (stats.currentStreak || 0) > 0 ? 'días consecutivos' : 'Comienza tu racha hoy',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-200',
      delay: 0.2,
    },
    {
      icon: Clock,
      label: 'Tiempo Total',
      value: formatTime(stats.totalTime),
      subtitle: 'investigando misterios',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200',
      delay: 0.3,
    },
    {
      icon: Trophy,
      label: 'XP Total',
      value: stats.totalXP || 0,
      subtitle: 'puntos de experiencia',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-200',
      delay: 0.4,
    },
  ];

  // Compact version for sidebar
  if (compact) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <EnhancedCard variant="default" hover={false} padding="md">
          {/* Header */}
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-lg bg-orange-100 p-2">
              <Award className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Estadísticas</h3>
              <p className="text-xs text-gray-600">Detective</p>
            </div>
          </div>

          {/* Stats List */}
          <div className="space-y-3">
            {statCards.map((card) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: card.delay }}
                className="flex items-center justify-between border-b border-gray-100 py-2 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className={cn('rounded-lg p-2', card.bgColor)}>
                    <card.icon className={cn('h-4 w-4', card.color)} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">{card.label}</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </EnhancedCard>
      </motion.div>
    );
  }

  // Full version for main area
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <Award className="h-6 w-6 text-orange-600" />
            Estadísticas Detective
          </h2>
          <p className="mt-1 text-sm text-gray-600">Tu progreso como detective de la lectura</p>
        </div>

        {/* Rank Badge */}
        {stats.rankPosition && stats.rankPosition > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-2 rounded-full border border-yellow-200 bg-gradient-to-r from-yellow-100 to-orange-100 px-4 py-2"
          >
            <Star className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-semibold text-yellow-800">
              {formatRank(stats.rankPosition)}
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {statCards.map((card) => (
          <StatCard
            key={card.label}
            icon={card.icon}
            label={card.label}
            value={card.value}
            subtitle={card.subtitle}
            color={card.color}
            bgColor={card.bgColor}
            delay={card.delay}
            loading={loading}
          />
        ))}
      </div>

      {/* Achievement Milestones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6"
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <Zap className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900">Próximos Hitos</h3>
            <p className="text-sm text-blue-600">Objetivos por alcanzar</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* Next Case Milestone */}
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-900">
              {Math.ceil((stats.casesResolved || 0) / 10) * 10 || 0}
            </div>
            <div className="text-sm text-blue-600">Casos objetivo</div>
            <div className="mt-1 text-xs text-blue-500">
              {Math.ceil((stats.casesResolved || 0) / 10) * 10 - (stats.casesResolved || 0) || 0}{' '}
              casos restantes
            </div>
          </div>

          {/* Next XP Milestone */}
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-900">
              {Math.ceil((stats.totalXP || 0) / 1000) * 1000 || 0}
            </div>
            <div className="text-sm text-purple-600">XP objetivo</div>
            <div className="mt-1 text-xs text-purple-500">
              {Math.ceil((stats.totalXP || 0) / 1000) * 1000 - (stats.totalXP || 0) || 0} XP
              restantes
            </div>
          </div>

          {/* Next Streak Milestone */}
          <div className="text-center">
            <div className="text-2xl font-bold text-red-900">
              {Math.max(7, Math.ceil(((stats.currentStreak || 0) + 1) / 7) * 7) || 7}
            </div>
            <div className="text-sm text-red-600">Días objetivo</div>
            <div className="mt-1 text-xs text-red-500">
              {Math.max(7, Math.ceil(((stats.currentStreak || 0) + 1) / 7) * 7) -
                (stats.currentStreak || 0) || 7}{' '}
              días restantes
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EnhancedStatsGrid;
