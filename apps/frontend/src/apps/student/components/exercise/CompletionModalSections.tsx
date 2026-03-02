/**
 * CompletionModal Subcomponents
 *
 * Extracted sections from CompletionModal for STANDARD-COMPONENT compliance (<300 LOC per file).
 * Each section is a presentational component receiving data via props.
 *
 * @see CompletionModal.tsx (parent orchestrator)
 */

import { motion } from 'framer-motion';
import {
  Star,
  Coins,
  Clock,
  Zap,
  Crown,
  Flame,
  Award,
  Footprints,
  Trophy,
  Target,
  BookOpen,
  Brain,
  Lightbulb,
  Medal,
  Shield,
  Rocket,
  Gem,
  type LucideIcon,
} from 'lucide-react';

// Map achievement icon name strings (from DB) to actual Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  footprints: Footprints,
  trophy: Trophy,
  target: Target,
  book_open: BookOpen,
  bookopen: BookOpen,
  brain: Brain,
  lightbulb: Lightbulb,
  medal: Medal,
  shield: Shield,
  rocket: Rocket,
  gem: Gem,
  star: Star,
  crown: Crown,
  flame: Flame,
  award: Award,
  zap: Zap,
};

function getAchievementIcon(iconName: string) {
  const IconComponent = ICON_MAP[iconName.toLowerCase()];
  if (IconComponent) {
    return <IconComponent className="h-8 w-8" />;
  }
  // Fallback: try rendering as emoji, or use Award as default
  if (iconName.length <= 2) return <span>{iconName}</span>;
  return <Award className="h-8 w-8" />;
}

// ─── Types ──────────────────────────────────────────

export interface AchievementDisplay {
  name: string;
  description: string;
  icon: string;
  rarity: string;
  mlCoinsReward: number;
  xpReward: number;
}

interface RankUpData {
  newRank: string;
  previousRank?: string;
  bonusMLCoins: number;
  newMultiplier: number;
}

interface StreakData {
  currentStreak: number;
  milestone: boolean;
  reward: number;
}

// ─── Helpers ────────────────────────────────────────

function getRarityColor(rarity?: string): string {
  switch (rarity) {
    case 'legendary':
      return 'from-purple-500 to-pink-500';
    case 'epic':
      return 'from-purple-500 to-indigo-500';
    case 'rare':
      return 'from-blue-500 to-cyan-500';
    default:
      return 'from-gray-400 to-gray-600';
  }
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

// ─── ScoreDisplay ───────────────────────────────────

interface ScoreDisplayProps {
  score: number;
  maxScore: number;
  success: boolean;
}

export function CompletionScoreDisplay({ score, maxScore, success }: ScoreDisplayProps) {
  const percentage = Math.round((score / maxScore) * 100);
  const circumference = 2 * Math.PI * 70;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="text-center"
    >
      <div className="relative inline-block">
        <svg className="h-32 w-32 sm:h-40 sm:w-40 -rotate-90 transform" viewBox="0 0 160 160">
          <circle
            cx="80" cy="80" r="70"
            stroke="currentColor" strokeWidth="10" fill="none"
            className="text-gray-200"
          />
          <motion.circle
            cx="80" cy="80" r="70"
            stroke="currentColor" strokeWidth="10" fill="none"
            strokeDasharray={`${circumference}`}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - score / maxScore) }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className={success ? 'text-green-500' : 'text-orange-500'}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-detective-text">{score}</span>
          <span className="text-sm text-detective-text-secondary">/ {maxScore}</span>
        </div>
      </div>
      <p className="mt-4 text-2xl font-bold text-detective-text">{percentage}%</p>
    </motion.div>
  );
}

// ─── Rewards ────────────────────────────────────────

interface RewardsProps {
  animatedXP: number;
  animatedCoins: number;
}

export function CompletionRewards({ animatedXP, animatedCoins }: RewardsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="grid grid-cols-2 gap-4"
    >
      <div className="rounded-detective bg-gradient-to-br from-detective-orange to-orange-600 p-6 text-center text-white">
        <Star className="mx-auto mb-2 h-8 w-8" />
        <p className="mb-1 text-sm font-medium">XP Ganado</p>
        <motion.p className="text-3xl font-bold" key={animatedXP} initial={{ scale: 1.2 }} animate={{ scale: 1 }}>
          +{animatedXP}
        </motion.p>
      </div>
      <div className="rounded-detective bg-gradient-to-br from-detective-gold to-yellow-600 p-6 text-center text-white">
        <Coins className="mx-auto mb-2 h-8 w-8" />
        <p className="mb-1 text-sm font-medium">ML Coins</p>
        <motion.p className="text-3xl font-bold" key={animatedCoins} initial={{ scale: 1.2 }} animate={{ scale: 1 }}>
          +{animatedCoins}
        </motion.p>
      </div>
    </motion.div>
  );
}

// ─── Stats ──────────────────────────────────────────

interface StatsProps {
  timeSpent: number;
  hintsUsed: number;
}

export function CompletionStats({ timeSpent, hintsUsed }: StatsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="space-y-3 rounded-detective bg-gray-50 p-6 dark:bg-gray-900"
    >
      <h3 className="mb-4 flex items-center gap-2 font-bold text-detective-text">
        <Zap className="h-5 w-5 text-detective-orange" />
        Estadísticas del Ejercicio
      </h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-detective-blue" />
          <span className="text-detective-text-secondary">Tiempo:</span>
          <span className="ml-auto font-semibold text-detective-text">{formatTime(timeSpent)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-detective-gold" />
          <span className="text-detective-text-secondary">Pistas usadas:</span>
          <span className="ml-auto font-semibold text-detective-text">{hintsUsed}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── RankUp Notification ────────────────────────────

interface RankUpProps {
  rankUp: RankUpData;
}

export function RankUpNotification({ rankUp }: RankUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
      className="rounded-detective bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white"
    >
      <div className="text-center">
        <Crown className="mx-auto mb-3 h-12 w-12 sm:h-16 sm:w-16" />
        <h3 className="mb-2 text-2xl font-bold">¡Rango Mejorado!</h3>
        <p className="mb-3 text-lg">
          {rankUp.previousRank && <span className="opacity-75">{rankUp.previousRank} → </span>}
          <span className="font-bold">{rankUp.newRank}</span>
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-white/20 p-3">
            <p className="mb-1 text-sm font-medium">Bonus ML Coins</p>
            <p className="text-2xl font-bold">+{rankUp.bonusMLCoins}</p>
          </div>
          <div className="rounded-lg bg-white/20 p-3">
            <p className="mb-1 text-sm font-medium">Nuevo Multiplicador</p>
            <p className="text-2xl font-bold">{rankUp.newMultiplier}x</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Streak Milestone ───────────────────────────────

interface StreakMilestoneProps {
  streakInfo: StreakData;
}

export function StreakMilestone({ streakInfo }: StreakMilestoneProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.75, type: 'spring', stiffness: 200 }}
      className="rounded-detective bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white"
    >
      <div className="text-center">
        <Flame className="mx-auto mb-3 h-12 w-12 sm:h-16 sm:w-16" />
        <h3 className="mb-2 text-2xl font-bold">¡Racha Alcanzada!</h3>
        <p className="mb-2 text-3xl font-bold">{streakInfo.currentStreak} días</p>
        <p className="mb-3 text-lg">¡Sigue así!</p>
        <div className="mt-4 rounded-lg bg-white/20 p-3">
          <p className="mb-1 text-sm font-medium">Recompensa de Racha</p>
          <p className="text-2xl font-bold">+{streakInfo.reward} ML Coins</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Achievements List ──────────────────────────────

interface AchievementsListProps {
  achievements: AchievementDisplay[];
}

export function AchievementsList({ achievements }: AchievementsListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="space-y-3"
    >
      <h3 className="flex items-center gap-2 font-bold text-detective-text">
        <Award className="h-5 w-5 text-detective-gold" />
        ¡Logros Desbloqueados!
      </h3>
      <div className="space-y-2">
        {achievements.map((display, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 + index * 0.1 }}
            className={`bg-gradient-to-r ${getRarityColor(display.rarity)} rounded-detective p-4 text-white`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getAchievementIcon(display.icon)}</span>
              <div className="flex-1">
                <p className="font-bold">{display.name}</p>
                <p className="text-sm text-white/95">{display.description}</p>
                <div className="mt-2 flex gap-2">
                  {display.mlCoinsReward > 0 && (
                    <span className="rounded-full bg-white/20 px-2 py-1 text-xs font-semibold">
                      +{display.mlCoinsReward} ML
                    </span>
                  )}
                  {display.xpReward > 0 && (
                    <span className="rounded-full bg-white/20 px-2 py-1 text-xs font-semibold">
                      +{display.xpReward} XP
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
