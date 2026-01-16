import React from 'react';
import { Trophy, Lock, CheckCircle, Gift } from 'lucide-react';
import { cn } from '@shared/utils';
import { formatRelativeTime } from '@/shared/utils/format.util';
import type {
  Achievement,
  UserAchievement,
  AchievementStatus,
} from '@/shared/types/achievement.types';

/**
 * AchievementCard Props
 */
interface AchievementCardProps {
  achievement: Achievement;
  userAchievement?: UserAchievement;
  onClick?: () => void;
  className?: string;
}

/**
 * Get category color classes
 */
const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    progress: 'border-blue-500 bg-blue-50',
    streak: 'border-orange-500 bg-orange-50',
    completion: 'border-green-500 bg-green-50',
    social: 'border-purple-500 bg-purple-50',
    special: 'border-pink-500 bg-pink-50',
    mastery: 'border-yellow-500 bg-yellow-50',
    exploration: 'border-cyan-500 bg-cyan-50',
  };
  return colors[category] || 'border-gray-500 bg-gray-50';
};

/**
 * Get category badge color
 */
const getCategoryBadgeColor = (category: string): string => {
  const colors: Record<string, string> = {
    progress: 'bg-blue-100 text-blue-800',
    streak: 'bg-orange-100 text-orange-800',
    completion: 'bg-green-100 text-green-800',
    social: 'bg-purple-100 text-purple-800',
    special: 'bg-pink-100 text-pink-800',
    mastery: 'bg-yellow-100 text-yellow-800',
    exploration: 'bg-cyan-100 text-cyan-800',
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};

/**
 * Get status from user achievement
 */
const getStatus = (userAchievement?: UserAchievement): AchievementStatus => {
  if (!userAchievement) return 'locked' as AchievementStatus;
  return userAchievement.status;
};

/**
 * AchievementCard Component (Modelo Relacional)
 *
 * NOTA ARQUITECTÓNICA: Este componente está diseñado para trabajar con
 * el modelo de datos relacional donde Achievement y UserAchievement son
 * entidades separadas. Usado por pages que necesitan manipular estos
 * datos de forma independiente (ej: AchievementsPage.tsx).
 *
 * Para componentes que usan el view model combinado (AchievementWithProgress),
 * ver: @features/gamification/social/components/Achievements/AchievementCard.tsx
 *
 * Displays a single achievement with icon, name, description, progress, and rewards.
 * Supports different states: locked, in progress, earned, claimed.
 *
 * Features:
 * - Large icon/badge display
 * - Category color-coding
 * - Progress bar for in-progress achievements
 * - Status badges (Locked, In Progress, Earned, Claimed)
 * - Rewards display (XP + ML Coins)
 * - Earned date for completed achievements
 * - Hover effect with scale and shadow
 * - Hidden achievements display as mystery
 * - Click handler for modal/detail view
 */
export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  userAchievement,
  onClick,
  className,
}) => {
  const status = getStatus(userAchievement);
  const progress = userAchievement?.progress || 0;
  const isLocked = status === 'locked';
  const isEarned = status === 'earned' || status === 'claimed';
  const isClaimed = status === 'claimed';
  const isInProgress = status === 'in_progress';
  const isHidden = achievement.isHidden && isLocked;

  return (
    <div
      className={cn(
        'relative rounded-lg border-2 p-4 transition-all duration-200',
        'cursor-pointer hover:scale-105 hover:shadow-lg',
        getCategoryColor(achievement.category),
        isLocked && 'opacity-60 grayscale',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Rarity Badge (top-right) */}
      {achievement.rarity && !isHidden && (
        <div
          className={cn(
            'absolute right-2 top-2 rounded px-2 py-1 text-xs font-semibold',
            achievement.rarity === 'legendary' && 'bg-yellow-100 text-yellow-800',
            achievement.rarity === 'epic' && 'bg-purple-100 text-purple-800',
            achievement.rarity === 'rare' && 'bg-blue-100 text-blue-800',
            achievement.rarity === 'common' && 'bg-gray-100 text-gray-600',
          )}
        >
          {achievement.rarity.toUpperCase()}
        </div>
      )}

      {/* Icon/Badge */}
      <div className="mb-3 flex justify-center">
        <div
          className={cn(
            'flex h-16 w-16 items-center justify-center rounded-full text-3xl',
            isLocked ? 'bg-gray-200' : 'bg-white shadow-md',
          )}
        >
          {isHidden ? (
            <span className="text-gray-400">???</span>
          ) : isLocked ? (
            <Lock className="h-8 w-8 text-gray-400" />
          ) : (
            <span>{achievement.icon || '🏆'}</span>
          )}
        </div>
      </div>

      {/* Title */}
      <h3
        className={cn(
          'mb-2 text-center text-lg font-bold',
          isLocked ? 'text-gray-500' : 'text-gray-900',
        )}
      >
        {isHidden ? 'Logro Oculto' : achievement.name}
      </h3>

      {/* Description */}
      <p className={cn('mb-3 text-center text-sm', isLocked ? 'text-gray-400' : 'text-gray-600')}>
        {isHidden ? 'Sigue jugando para descubrir este logro...' : achievement.description}
      </p>

      {/* Category Badge */}
      {!isHidden && (
        <div className="mb-3 flex justify-center">
          <span
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium',
              getCategoryBadgeColor(achievement.category),
            )}
          >
            {achievement.category.toUpperCase()}
          </span>
        </div>
      )}

      {/* Progress Bar (for in-progress achievements) */}
      {isInProgress && !isHidden && (
        <div className="mb-3">
          <div className="mb-1 flex justify-between text-xs text-gray-600">
            <span>Progreso</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Status Badge */}
      <div className="mb-3 flex justify-center">
        {isLocked && (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            <Lock className="mr-1 h-3 w-3" />
            Bloqueado
          </span>
        )}
        {isInProgress && (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
            <Trophy className="mr-1 h-3 w-3" />
            En Progreso {Math.round(progress)}%
          </span>
        )}
        {isEarned && !isClaimed && (
          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Ganado
          </span>
        )}
        {isClaimed && (
          <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
            <Gift className="mr-1 h-3 w-3" />
            Reclamado
          </span>
        )}
      </div>

      {/* Rewards (if not hidden) */}
      {!isHidden && achievement.rewards && (
        <div className="mt-3 border-t border-gray-200 pt-3">
          <div className="flex justify-center space-x-4 text-sm">
            {achievement.rewards.xp > 0 && (
              <div className="flex items-center text-yellow-600">
                <Trophy className="mr-1 h-4 w-4" />
                <span className="font-semibold">{achievement.rewards.xp} XP</span>
              </div>
            )}
            {achievement.rewards.mlCoins > 0 && (
              <div className="flex items-center text-purple-600">
                <Gift className="mr-1 h-4 w-4" />
                <span className="font-semibold">{achievement.rewards.mlCoins} ML</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Earned Date (if earned) */}
      {isEarned && userAchievement?.earnedAt && !isHidden && (
        <div className="mt-2 text-center text-xs text-gray-500">
          Ganado {formatRelativeTime(userAchievement.earnedAt)}
        </div>
      )}
    </div>
  );
};

export default AchievementCard;
