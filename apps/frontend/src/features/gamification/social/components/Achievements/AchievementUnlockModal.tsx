/**
 * AchievementUnlockModal Component
 * Celebration modal when achievement is unlocked
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  GraduationCap,
  Handshake,
  HeartHandshake,
  Key,
  Layers,
  Link,
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
import { ConfettiCelebration } from '../../../../../shared/components/celebrations/ConfettiCelebration';

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
  focus: Target,
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

interface AchievementUnlockModalProps {
  achievement: Achievement | null;
  onClose: () => void;
  showConfetti?: boolean;
}

export const AchievementUnlockModal: React.FC<AchievementUnlockModalProps> = ({
  achievement,
  onClose,
  showConfetti = false,
}) => {
  if (!achievement) return null;

  const IconComponent = achievementIconMap[achievement.icon] || Award;

  // Map achievement rarity to confetti rarity type
  const getConfettiRarity = (): 'common' | 'rare' | 'epic' | 'legendary' => {
    const rarity = achievement.rarity?.toLowerCase();
    if (rarity === 'legendary') return 'legendary';
    if (rarity === 'epic') return 'epic';
    if (rarity === 'rare') return 'rare';
    return 'common';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
        onClick={onClose}
      >
        {/* Enhanced Confetti System */}
        <ConfettiCelebration
          show={showConfetti}
          rarity={getConfettiRarity()}
          onComplete={() => {
            // Optional: handle completion
          }}
        />

        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 50 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md overflow-hidden rounded-detective bg-white p-8 shadow-detective-lg"
        >
          {/* Celebration Header */}
          <div className="mb-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, times: [0, 0.5, 1] }}
              className="mb-4 inline-block rounded-full bg-gradient-to-br from-detective-gold to-detective-orange p-6"
            >
              <IconComponent className="h-16 w-16 text-white" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-2 text-detective-3xl font-bold text-detective-text"
            >
              Logro Desbloqueado!
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-detective-xl font-semibold text-detective-orange"
            >
              {achievement.title}
            </motion.p>
          </div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-6 text-center text-detective-text-secondary"
          >
            {achievement.description}
          </motion.p>

          {/* Rewards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6 flex justify-center gap-8 rounded-detective bg-detective-bg p-4"
          >
            <div className="text-center">
              <Coins className="mx-auto mb-2 h-8 w-8 text-detective-gold" />
              <p className="text-detective-2xl font-bold text-detective-text">
                +{achievement.mlCoinsReward}
              </p>
              <p className="text-detective-sm text-detective-text-secondary">ML Coins</p>
            </div>

            <div className="text-center">
              <Zap className="mx-auto mb-2 h-8 w-8 text-detective-orange" />
              <p className="text-detective-2xl font-bold text-detective-text">
                +{achievement.xpReward}
              </p>
              <p className="text-detective-sm text-detective-text-secondary">XP</p>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex gap-3"
          >
            <button
              onClick={onClose}
              className="flex-1 rounded-detective bg-detective-orange py-3 font-semibold text-white transition-colors hover:bg-detective-orange-dark"
            >
              Continuar
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
