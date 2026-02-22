/**
 * AchievementCard Component (View Model Combinado)
 *
 * NOTA ARQUITECTÓNICA: Este componente está diseñado para trabajar con
 * el view model AchievementWithProgress que combina datos del logro con
 * el estado del usuario. Incluye animaciones framer-motion y botón para
 * reclamar recompensas. Usado en el módulo de gamificación social.
 *
 * Para componentes que usan el modelo relacional separado
 * (Achievement + UserAchievement), ver: @shared/components/AchievementCard.tsx
 *
 * Displays individual achievement card with animations and claim functionality.
 */

import type { MouseEvent } from 'react';
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
  'footprints': Footprints,
  'target': Target,
  'book-open': BookOpen,
  'graduation-cap': GraduationCap,
  'compass': Compass,
  'trophy': Trophy,
  'zap': Zap,
  'star': Star,
  'flame': Flame,
  'award': Award,
  'sunrise': Sunrise,
  'moon': Moon,
  'calendar': Calendar,
  'trending-up': TrendingUp,
  'shield': Shield,
  'check-circle': CheckCircle,
  'sparkles': Sparkles,
  'search': Search,
  'timer': Timer,
  'link': Link,
  'check': Check,
  'crown': Crown,
  'brain': Brain,
  'layers': Layers,
  'focus': Target, // Using Target as fallback for focus
  'user-plus': UserPlus,
  'users': Users,
  'flag': Flag,
  'heart-handshake': HeartHandshake,
  'users-round': UsersRound,
  'thumbs-up': ThumbsUp,
  'handshake': Handshake,
  'egg': Egg,
  'clock': Clock,
  'key': Key,
  'puzzle': Puzzle,
  'gem': Gem,
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

export const AchievementCard = ({
  achievement,
  onClick,
  onClaimRewards,
  isClaiming = false,
}: AchievementCardProps) => {
  const IconComponent = achievementIconMap[achievement.icon] || Award;
  const isLocked = !achievement.isUnlocked;
  const canClaimRewards = achievement.isUnlocked && !achievement.rewardsClaimed && onClaimRewards;

  const handleClaimClick = async (e: MouseEvent) => {
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
      className={`relative p-4 rounded-detective border-2 cursor-pointer transition-all ${
        rarityColors[achievement.rarity]
      } ${rarityGlow[achievement.rarity]} ${
        isLocked ? 'opacity-60 grayscale' : ''
      }`}
    >
      {/* Rarity Badge */}
      <div className="absolute top-2 right-2">
        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
          achievement.rarity === 'legendary' ? 'bg-detective-gold text-white' :
          achievement.rarity === 'epic' ? 'bg-detective-orange text-white' :
          achievement.rarity === 'rare' ? 'bg-blue-500 text-white' :
          'bg-gray-400 text-white'
        }`}>
          {achievement.rarity.toUpperCase()}
        </span>
      </div>

      {/* Icon */}
      <div className="flex justify-center mb-3">
        <div className={`p-4 rounded-full ${
          isLocked ? 'bg-gray-300' : 'bg-gradient-to-br from-orange-500 to-orange-600'
        }`}>
          <IconComponent className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-detective-lg font-bold text-center text-detective-text mb-2">
        {achievement.title}
      </h3>

      {/* Description */}
      <p className="text-detective-sm text-detective-text-secondary text-center mb-3 min-h-[40px]">
        {achievement.isHidden && isLocked ? '???' : achievement.description}
      </p>

      {/* Progress Bar (if applicable) */}
      {achievement.progress && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-detective-text-secondary mb-1">
            <span>Progreso</span>
            <span>{achievement.progress.current}/{achievement.progress.required}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(achievement.progress.current / achievement.progress.required) * 100}%` }}
              className="bg-gradient-to-r from-detective-orange to-detective-gold h-2 rounded-full"
            />
          </div>
        </div>
      )}

      {/* Rewards - FIX: CORR-ACH-004 - Manejar valores undefined con ?? 0 */}
      <div className="flex justify-around items-center pt-3 border-t border-gray-200">
        <div className="flex items-center gap-1">
          <Coins className="w-4 h-4 text-detective-gold" />
          <span className="text-detective-sm font-semibold text-detective-text">
            {achievement.mlCoinsReward ?? 0} ML
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="w-4 h-4 text-detective-orange" />
          <span className="text-detective-sm font-semibold text-detective-text">
            {achievement.xpReward ?? 0} XP
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
          className="w-full mt-3 py-2 px-4 bg-gradient-to-r from-detective-gold to-yellow-500
                     text-white font-semibold rounded-lg shadow-md hover:shadow-lg
                     transition-all duration-200 flex items-center justify-center gap-2
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isClaiming ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Reclamando...
            </>
          ) : (
            <>
              <Gift className="w-4 h-4" />
              Reclamar Recompensas
            </>
          )}
        </motion.button>
      )}

      {/* Rewards Claimed Badge */}
      {achievement.isUnlocked && achievement.rewardsClaimed && (
        <div className="mt-3 py-1 px-3 bg-green-100 text-green-700 text-xs font-medium rounded-full text-center">
          Recompensas reclamadas
        </div>
      )}

      {/* Unlocked Badge */}
      {achievement.isUnlocked && (
        <div className="absolute top-2 left-2">
          <CheckCircle className="w-6 h-6 text-detective-success" />
        </div>
      )}

      {/* Locked Icon */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Lock className="w-12 h-12 text-gray-400 opacity-20" />
        </div>
      )}
    </motion.div>
  );
};
