import type { ElementType } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  Clock,
  Zap,
  Star,
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { cn } from '@shared/utils/cn';
import { EnhancedCard } from '@shared/components/base/EnhancedCard';
import { resolveLucideIcon } from '@shared/utils/iconResolver';

// Import mission helpers
const getMissionProgress = (mission: Mission): { current: number; target: number } => {
  return {
    current: mission.currentProgress ?? 0,
    target: mission.targetProgress ?? 0,
  };
};

const getMissionRewards = (mission: Mission): { xp: number; mlCoins: number } => {
  return {
    xp: mission.xpReward ?? 0,
    mlCoins: mission.mlReward ?? 0,
  };
};

interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special' | 'achievement';
  difficulty: 'easy' | 'medium' | 'hard';
  progress: number; // 0-100
  currentProgress: number;
  targetProgress: number;
  xpReward: number;
  mlReward?: number;
  timeLimit?: Date;
  icon?: string;
  category: string;
  isCompleted: boolean;
  isExpired: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface MissionsPanelProps {
  missions: Mission[];
  loading: boolean;
  error: Error | null;
  onMissionClick?: (missionId: string) => void;
}

interface MissionCardProps {
  mission: Mission;
  index: number;
  onMissionClick?: (missionId: string) => void;
}

const MissionCard = ({ mission, index, onMissionClick }: MissionCardProps) => {
  const getMissionIcon = (): ElementType => {
    if (mission.icon) {
      return resolveLucideIcon(mission.icon, 'target');
    }

    switch (mission.type) {
      case 'daily':
        return Clock;
      case 'weekly':
        return Star;
      case 'special':
        return Star;
      case 'achievement':
        return resolveLucideIcon('trophy', 'target');
      default:
        return Target;
    }
  };

  const getMissionColor = () => {
    if (mission.isCompleted) return 'border-green-200 bg-green-50';
    if (mission.isExpired) return 'border-red-200 bg-red-50';

    switch (mission.priority) {
      case 'high':
        return 'border-orange-200 bg-orange-50';
      case 'medium':
        return 'border-blue-200 bg-blue-50';
      case 'low':
        return 'border-gray-200 bg-gray-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const getDifficultyStars = () => {
    const starCount = mission.difficulty === 'easy' ? 1 : mission.difficulty === 'medium' ? 2 : 3;
    return Array.from({ length: 3 }, (_, i) => (
      <Star
        key={i}
        className={cn('h-3 w-3', i < starCount ? 'fill-current text-yellow-500' : 'text-gray-300')}
      />
    ));
  };

  const getTimeRemaining = () => {
    if (!mission.timeLimit) return null;

    const now = new Date();
    const timeLimit = new Date(mission.timeLimit);
    const diff = timeLimit.getTime() - now.getTime();

    if (diff <= 0) return 'Expirada';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const handleClick = () => {
    if (onMissionClick && !mission.isExpired) {
      onMissionClick(mission.id);
    }
  };

  const timeRemaining = getTimeRemaining();
  const isUrgent =
    mission.timeLimit && new Date(mission.timeLimit).getTime() - Date.now() < 3600000; // Less than 1 hour
  const MissionIcon = getMissionIcon();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={cn('relative', mission.isExpired && 'opacity-60')}
    >
      <EnhancedCard
        variant="warning"
        hover={!mission.isExpired && !mission.isCompleted}
        padding="md"
        onClick={handleClick}
        className={cn(getMissionColor())}
      >
        {/* Mission Header */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-white/80 p-1.5">
              <MissionIcon className="h-4 w-4 text-orange-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold leading-tight text-gray-900">{mission.title}</h4>
              <p className="mt-1 line-clamp-2 text-xs text-gray-600">{mission.description}</p>
            </div>
          </div>

          {!mission.isCompleted && !mission.isExpired && (
            <ArrowRight className="h-4 w-4 flex-shrink-0 text-gray-400" />
          )}
        </div>

        {/* Mission Metadata */}
        <div className="mb-3 flex items-center gap-3 text-xs">
          {/* Type Badge */}
          <span
            className={cn(
              'rounded-full px-2 py-1 font-medium',
              mission.type === 'daily'
                ? 'bg-blue-100 text-blue-800'
                : mission.type === 'weekly'
                  ? 'bg-purple-100 text-purple-800'
                  : mission.type === 'special'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800',
            )}
          >
            {mission.type === 'daily'
              ? 'Diaria'
              : mission.type === 'weekly'
                ? 'Semanal'
                : mission.type === 'special'
                  ? 'Especial'
                  : 'Logro'}
          </span>

          {/* Difficulty */}
          <div className="flex items-center gap-1">{getDifficultyStars()}</div>

          {/* Time Remaining */}
          {timeRemaining && (
            <div
              className={cn('flex items-center gap-1', isUrgent ? 'text-red-600' : 'text-gray-600')}
            >
              <Clock className="h-3 w-3" />
              <span>{timeRemaining}</span>
              {isUrgent && <AlertTriangle className="h-3 w-3" />}
            </div>
          )}
        </div>

        {/* Progress Section */}
        <div className="space-y-2">
          {/* Progress Bar */}
          {(() => {
            const { current, target } = getMissionProgress(mission);
            return (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Progreso</span>
                  <span className="font-medium text-gray-900">
                    {current}/{target}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${mission.progress}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: index * 0.1 + 0.3 }}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-300',
                      mission.isCompleted
                        ? 'bg-green-500'
                        : mission.isExpired
                          ? 'bg-red-500'
                          : mission.priority === 'high'
                            ? 'bg-orange-500'
                            : mission.priority === 'medium'
                              ? 'bg-blue-500'
                              : 'bg-gray-500',
                    )}
                  />
                </div>
              </div>
            );
          })()}

          {/* Rewards */}
          {(() => {
            const { xp, mlCoins } = getMissionRewards(mission);
            return (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-yellow-500" />
                    <span className="font-medium">{xp} XP</span>
                  </div>
                  {mlCoins > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="flex h-3 w-3 items-center justify-center rounded-full bg-green-500">
                        <span className="text-[8px] font-bold text-white">ML</span>
                      </div>
                      <span className="font-medium">{mlCoins}</span>
                    </div>
                  )}
                </div>

                {/* Status Icon */}
                {mission.isCompleted ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : mission.isExpired ? (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                ) : mission.priority === 'high' ? (
                  <Flame className="h-4 w-4 text-orange-600" />
                ) : null}
              </div>
            );
          })()}
        </div>

        {/* Completion Badge */}
        {mission.isCompleted && (
          <div className="absolute -right-1 -top-1">
            <div className="flex items-center gap-1 rounded-full bg-green-600 px-2 py-1 text-xs font-bold text-white">
              <CheckCircle className="h-3 w-3" />
              ¡Completada!
            </div>
          </div>
        )}

        {/* Urgent Badge */}
        {isUrgent && !mission.isCompleted && !mission.isExpired && (
          <div className="absolute -right-1 -top-1">
            <div className="flex items-center gap-1 rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white">
              <AlertTriangle className="h-3 w-3" />
              ¡Urgente!
            </div>
          </div>
        )}
      </EnhancedCard>
    </motion.div>
  );
};

const MissionSkeleton = () => (
  <EnhancedCard variant="warning" hover={false} padding="md">
    <div className="mb-3 flex items-start justify-between">
      <div className="flex flex-1 items-center gap-2">
        <div className="h-6 w-6 animate-pulse rounded bg-gray-200"></div>
        <div className="flex-1 space-y-1">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
          <div className="h-3 w-32 animate-pulse rounded bg-gray-100"></div>
        </div>
      </div>
    </div>

    <div className="mb-3 flex items-center gap-3">
      <div className="h-5 w-12 animate-pulse rounded-full bg-gray-200"></div>
      <div className="h-3 w-16 animate-pulse rounded bg-gray-200"></div>
    </div>

    <div className="space-y-2">
      <div className="h-1.5 w-full animate-pulse rounded-full bg-gray-200"></div>
      <div className="flex justify-between">
        <div className="h-3 w-12 animate-pulse rounded bg-gray-200"></div>
        <div className="h-3 w-8 animate-pulse rounded bg-gray-200"></div>
      </div>
    </div>
  </EnhancedCard>
);

export const MissionsPanel = ({
  missions,
  loading,
  error,
  onMissionClick,
}: MissionsPanelProps) => {
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
            <h3 className="font-semibold text-red-800">Error al cargar misiones</h3>
            <p className="text-sm text-red-600">
              No se pudieron cargar las misiones activas. Intenta actualizar.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Calculate mission stats
  const activeMissions = missions.filter((m) => !m.isCompleted && !m.isExpired);
  const urgentMissions = missions.filter(
    (m) =>
      !m.isCompleted &&
      !m.isExpired &&
      m.timeLimit &&
      new Date(m.timeLimit).getTime() - Date.now() < 3600000,
  );

  return (
    <div className="space-y-4">
      {/* Panel Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <Target className="h-5 w-5 text-orange-600" />
            Misiones Activas
          </h3>
          <p className="mt-1 text-xs text-gray-600">
            Completa misiones para ganar XP y recompensas
          </p>
        </div>

        {/* Mission Counter */}
        {!loading && missions.length > 0 && (
          <div className="text-right">
            <div className="text-lg font-bold text-orange-600">{activeMissions.length}</div>
            <div className="text-xs text-gray-600">activas</div>
          </div>
        )}
      </motion.div>

      {/* Urgent Missions Alert */}
      {urgentMissions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-lg border border-red-200 bg-red-50 p-3"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">
              {urgentMissions.length} misión{urgentMissions.length > 1 ? 'es' : ''} expira
              {urgentMissions.length === 1 ? '' : 'n'} pronto
            </span>
          </div>
        </motion.div>
      )}

      {/* Missions List */}
      <div className="max-h-[500px] space-y-3 overflow-y-auto pr-1">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 3 }, (_, i) => <MissionSkeleton key={i} />)
        ) : missions.length === 0 ? (
          // Empty state
          <div className="py-8 text-center">
            <Target className="mx-auto mb-3 h-8 w-8 text-gray-300" />
            <h4 className="mb-1 text-sm font-medium text-gray-900">No hay misiones disponibles</h4>
            <p className="text-xs text-gray-600">Las nuevas misiones aparecerán aquí pronto.</p>
          </div>
        ) : (
          // Mission cards
          missions
            .sort((a, b) => {
              // Sort by: completed last, then by priority and urgency
              if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
              if (a.isExpired !== b.isExpired) return a.isExpired ? 1 : -1;

              const priorityOrder = { high: 0, medium: 1, low: 2 };
              return priorityOrder[a.priority] - priorityOrder[b.priority];
            })
            .map((mission, index) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                index={index}
                onMissionClick={onMissionClick}
              />
            ))
        )}
      </div>
    </div>
  );
};

export default MissionsPanel;
