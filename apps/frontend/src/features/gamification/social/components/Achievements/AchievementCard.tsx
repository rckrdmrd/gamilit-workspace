/**
 * AchievementCard Component
 * Displays individual achievement card
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  BookOpen,
  Brain,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Coins,
  Compass,
  Crown,
  Egg,
  Flag,
  Flame,
  Footprints,
  Gift,
  GraduationCap,
  Handshake,
  HeartHandshake,
  Key,
  Layers,
  Link,
  Loader,
  Lock,
  Moon,
  Puzzle,
  Search,
  Shield,
  Sparkles,
  Star,
  Sunrise,
  Target,
  ThumbsUp,
  Timer,
  TrendingUp,
  Trophy,
  UserPlus,
  Users,
  UsersRound,
  Zap,
  Gem,
  type LucideIcon,
} from 'lucide-react';
import type { Achievement } from '../../types/achievementsTypes';

interface AchievementCardProps {
  achievement: Achievement;
  onClick?: () => void;
  onClaimRewards?: (achievementId: string) => Promise<void>;
  isClaiming?: boolean;
}

// Icon mapping for achievement icons
const achievementIconMap: Record<string, LucideIcon> = {
  footprints: Footprints,
  target: Target,
  'book-open': BookOpen,
  'graduation-cap': GraduationCap,
  compass: Compass,
  trophy: Trophy,
  zap: Zap,
  star: Star,
  flame: Flame,
  award: Award,
  sunrise: Sunrise,
  moon: Moon,
  calendar: Calendar,
  'trending-up': TrendingUp,
  shield: Shield,
  'check-circle': CheckCircle,
  sparkles: Sparkles,
  search: Search,
  timer: Timer,
  link: Link,
  check: Check,
  crown: Crown,
  brain: Brain,
  layers: Layers,
  focus: Target, // Using Target as fallback for focus
  'user-plus': UserPlus,
  users: Users,
  flag: Flag,
  'heart-handshake': HeartHandshake,
  'users-round': UsersRound,
  'thumbs-up': ThumbsUp,
  handshake: Handshake,
  egg: Egg,
  clock: Clock,
  key: Key,
  puzzle: Puzzle,
  gem: Gem,
};

const rarityColors = {
  common: 'bg-gray-100 border-rarity-common',
  rare: 'bg-blue-50 border-rarity-rare',
  epic: 'bg-orange-50 border-rarity-epic',
  legendary: 'bg-yellow-50 border-rarity-legendary',
};

const rarityGlow = {
  common: 'shadow-sm',
  rare: 'shadow-md shadow-blue-200',
  epic: 'shadow-lg shadow-orange-200',
  legendary: 'shadow-xl shadow-yellow-300 animate-gold-shine',
};

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  onClick,
  onClaimRewards,
  isClaiming = false,
}) => {
  const IconComponent = achievementIconMap[achievement.icon] || Award;
  const isLocked = !achievement.isUnlocked;
  const canClaimRewards = achievement.isUnlocked && !achievement.rewardsClaimed && onClaimRewards;

  const handleClaimClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onClick of parent
    if (onClaimRewards && !isClaiming) {
      await onClaimRewards(achievement.id);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative cursor-pointer rounded-detective border-2 p-4 transition-all ${
        rarityColors[achievement.rarity]
      } ${rarityGlow[achievement.rarity]} ${isLocked ? 'opacity-60 grayscale' : ''}`}
    >
      {/* Rarity Badge */}
      <div className="absolute right-2 top-2">
        <span
          className={`rounded-full px-2 py-1 text-xs font-semibold ${
            achievement.rarity === 'legendary'
              ? 'bg-detective-gold text-white'
              : achievement.rarity === 'epic'
                ? 'bg-detective-orange text-white'
                : achievement.rarity === 'rare'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-400 text-white'
          }`}
        >
          {achievement.rarity.toUpperCase()}
        </span>
      </div>

      {/* Icon */}
      <div className="mb-3 flex justify-center">
        <div
          className={`rounded-full p-4 ${
            isLocked ? 'bg-gray-300' : 'bg-gradient-to-br from-orange-500 to-orange-600'
          }`}
        >
          <IconComponent className="h-8 w-8 text-white" />
        </div>
      </div>

      {/* Title */}
      <h3 className="mb-2 text-center text-detective-lg font-bold text-detective-text">
        {achievement.title}
      </h3>

      {/* Description */}
      <p className="mb-3 min-h-[40px] text-center text-detective-sm text-detective-text-secondary">
        {achievement.isHidden && isLocked ? '???' : achievement.description}
      </p>

      {/* Progress Bar (if applicable) */}
      {achievement.progress && (
        <div className="mb-3">
          <div className="mb-1 flex justify-between text-xs text-detective-text-secondary">
            <span>Progreso</span>
            <span>
              {achievement.progress.current}/{achievement.progress.required}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${(achievement.progress.current / achievement.progress.required) * 100}%`,
              }}
              className="h-2 rounded-full bg-gradient-to-r from-detective-orange to-detective-gold"
            />
          </div>
        </div>
      )}

      {/* Rewards */}
      <div className="flex items-center justify-around border-t border-gray-200 pt-3">
        <div className="flex items-center gap-1">
          <Coins className="h-4 w-4 text-detective-gold" />
          <span className="text-detective-sm font-semibold text-detective-text">
            {achievement.mlCoinsReward} ML
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="h-4 w-4 text-detective-orange" />
          <span className="text-detective-sm font-semibold text-detective-text">
            {achievement.xpReward} XP
          </span>
        </div>
      </div>

      {/* Claim Rewards Button */}
      {canClaimRewards && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleClaimClick}
          disabled={isClaiming}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg
                     bg-gradient-to-r from-detective-gold to-yellow-500 px-4 py-2
                     font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg
                     disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isClaiming ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              Reclamando...
            </>
          ) : (
            <>
              <Gift className="h-4 w-4" />
              Reclamar Recompensas
            </>
          )}
        </motion.button>
      )}

      {/* Rewards Claimed Badge */}
      {achievement.isUnlocked && achievement.rewardsClaimed && (
        <div className="mt-3 rounded-full bg-green-100 px-3 py-1 text-center text-xs font-medium text-green-700">
          Recompensas reclamadas
        </div>
      )}

      {/* Unlocked Badge */}
      {achievement.isUnlocked && (
        <div className="absolute left-2 top-2">
          <CheckCircle className="h-6 w-6 text-detective-success" />
        </div>
      )}

      {/* Locked Icon */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Lock className="h-12 w-12 text-gray-400 opacity-20" />
        </div>
      )}
    </motion.div>
  );
};
