/**
 * CompletionModal Component
 * Displays exercise completion with XP/ML Coins animations, achievements, and next steps
 */

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { useProgression } from '@/features/gamification/ranks/hooks/useProgression';
import { useCoins } from '@/features/gamification/economy/hooks/useCoins';
import { TransactionTypeEnum } from '@/features/gamification/economy/types/economyTypes';
import { useAchievementsStore } from '@/features/gamification/social/store/achievementsStore';
import type { Achievement as SSOTAchievement } from '@shared/types/achievement.types';
import {
  Trophy,
  Star,
  Coins,
  RotateCcw,
  ChevronRight,
  ArrowLeft,
  Award,
  Target,
  Clock,
  Zap,
  Crown,
  Flame,
} from 'lucide-react';

/**
 * CompletionAchievement
 *
 * Achievement display info for completion modal.
 * Derivado del SSOT Achievement con campos opcionales para compatibilidad.
 *
 * @see SSOT: @shared/types/achievement.types.ts
 * P2-001: Tipo derivado - campos específicos para vista de completación
 */
type CompletionAchievement = Pick<
  SSOTAchievement,
  'id' | 'name' | 'description' | 'icon' | 'rarity'
> & {
  // Campos legacy para compatibilidad con backend antiguo
  key?: string;
  title?: string; // Alias de 'name'
  mlCoinsReward?: number;
  xpReward?: number;
  iconUrl?: string; // Alias de 'icon'
};

/**
 * Achievement - Alias del tipo derivado para este componente
 * P2-001: Ahora deriva del SSOT en lugar de definirse localmente
 */
type Achievement = CompletionAchievement;

interface CompletionModalProps {
  isOpen: boolean;
  success: boolean;
  score: number;
  maxScore: number;
  xpGained: number;
  mlCoinsGained: number;
  timeSpent: number;
  hintsUsed: number;
  achievements?: Achievement[];
  moduleId: string;
  exerciseId?: string;
  onClose: () => void;
  onRetry: () => void;
  onNextExercise?: () => void;
  // Sprint 2 - New fields
  rankUp?: {
    newRank: string;
    previousRank?: string;
    bonusMLCoins: number;
    newMultiplier: number;
  } | null;
  streakInfo?: {
    currentStreak: number;
    milestone: boolean;
    reward: number;
  };
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  isOpen,
  success,
  score,
  maxScore,
  xpGained,
  mlCoinsGained,
  timeSpent,
  hintsUsed,
  achievements = [],
  moduleId,
  exerciseId = 'unknown',
  onRetry,
  onNextExercise,
  rankUp,
  streakInfo,
}) => {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);
  const [animatedXP, setAnimatedXP] = useState(0);
  const [animatedCoins, setAnimatedCoins] = useState(0);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Gamification hooks
  const { addXP, checkRankUp } = useProgression();
  const { earnCoins } = useCoins();
  const { unlockAchievement } = useAchievementsStore();

  // Ref to prevent duplicate reward application
  const rewardsApplied = useRef(false);

  /**
   * Apply gamification rewards (XP, ML Coins, Achievements)
   */
  const applyRewards = async () => {
    try {
      // Add XP
      if (xpGained > 0) {
        await addXP(xpGained, 'exercise_completion', exerciseId);
        console.log(`✅ XP Added: +${xpGained} XP`);
      }

      // Add ML Coins
      if (mlCoinsGained > 0) {
        earnCoins(
          mlCoinsGained,
          TransactionTypeEnum.EARNED_EXERCISE,
          `Ejercicio completado: ${exerciseId}`,
        );
        console.log(`✅ ML Coins Added: +${mlCoinsGained} ML`);
      }

      // Check for rank up
      const didRankUp = checkRankUp();
      if (didRankUp) {
        console.log(
          '🎉 ¡Felicidades! Has subido de rango. Revisa tu perfil para ver tu nuevo rango.',
        );
      }

      // Unlock achievements
      if (achievements && achievements.length > 0) {
        achievements.forEach((achievement) => {
          unlockAchievement(achievement.id);
          console.log(`🏆 ¡Logro Desbloqueado: ${achievement.name}! - ${achievement.description}`);
        });
      }

      console.log('✅ Rewards applied successfully:', {
        xpGained,
        mlCoinsGained,
        achievementsUnlocked: achievements.length,
        exerciseId,
        didRankUp,
      });
    } catch (error) {
      console.error('❌ Error applying rewards:', error);
      console.error('Las recompensas pueden no haberse guardado correctamente');
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isOpen && success) {
      setShowConfetti(true);

      // Animate XP counter
      const xpInterval = setInterval(() => {
        setAnimatedXP((prev) => {
          if (prev >= xpGained) {
            clearInterval(xpInterval);
            return xpGained;
          }
          return prev + Math.ceil(xpGained / 30);
        });
      }, 30);

      // Animate Coins counter
      const coinsInterval = setInterval(() => {
        setAnimatedCoins((prev) => {
          if (prev >= mlCoinsGained) {
            clearInterval(coinsInterval);
            return mlCoinsGained;
          }
          return prev + Math.ceil(mlCoinsGained / 30);
        });
      }, 30);

      // Stop confetti after 5 seconds
      const confettiTimer = setTimeout(() => setShowConfetti(false), 5000);

      return () => {
        clearInterval(xpInterval);
        clearInterval(coinsInterval);
        clearTimeout(confettiTimer);
      };
    } else {
      setAnimatedXP(0);
      setAnimatedCoins(0);
      setShowConfetti(false);
    }
  }, [isOpen, success, xpGained, mlCoinsGained]);

  // Apply rewards when modal opens with success
  useEffect(() => {
    if (isOpen && success && !rewardsApplied.current) {
      applyRewards();
      rewardsApplied.current = true;
    }

    // Reset ref when modal closes
    if (!isOpen) {
      rewardsApplied.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, success]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScorePercentage = () => Math.round((score / maxScore) * 100);

  const getPerformanceMessage = () => {
    const percentage = getScorePercentage();
    if (percentage >= 90) return '¡Excelente trabajo!';
    if (percentage >= 75) return '¡Muy bien hecho!';
    if (percentage >= 60) return '¡Buen trabajo!';
    if (percentage >= 50) return 'Aprobado';
    return 'Sigue intentando';
  };

  const getRarityColor = (rarity?: string) => {
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
  };

  // Helper to get achievement display data (supports both formats)
  const getAchievementDisplay = (achievement: Achievement) => {
    return {
      name: achievement.title || achievement.name || 'Achievement',
      description: achievement.description || '',
      icon: achievement.iconUrl || achievement.icon || '🏆',
      rarity: achievement.rarity || 'common',
      mlCoinsReward: achievement.mlCoinsReward || 0,
      xpReward: achievement.xpReward || 0,
    };
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Confetti */}
        {showConfetti && success && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={500}
            gravity={0.3}
          />
        )}

        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-detective bg-white shadow-2xl dark:bg-gray-800"
        >
          {/* Header */}
          <div
            className={`rounded-t-detective p-8 ${
              success
                ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                : 'bg-gradient-to-br from-orange-500 to-red-600'
            }`}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="text-center"
            >
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
                {success ? (
                  <Trophy className="h-12 w-12 text-white" />
                ) : (
                  <Target className="h-12 w-12 text-white" />
                )}
              </div>
              <h2 className="mb-2 text-3xl font-bold text-white">
                {success ? '¡Ejercicio Completado!' : 'Ejercicio Enviado'}
              </h2>
              <p className="text-lg text-white/90">{getPerformanceMessage()}</p>
            </motion.div>
          </div>

          {/* Content */}
          <div className="space-y-6 p-8">
            {/* Score Display */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="relative inline-block">
                <svg className="h-40 w-40 -rotate-90 transform">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="none"
                    className="text-gray-200"
                  />
                  <motion.circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                    animate={{
                      strokeDashoffset: 2 * Math.PI * 70 * (1 - score / maxScore),
                    }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className={success ? 'text-green-500' : 'text-orange-500'}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-detective-text">{score}</span>
                  <span className="text-sm text-detective-text-secondary">/ {maxScore}</span>
                </div>
              </div>
              <p className="mt-4 text-2xl font-bold text-detective-text">{getScorePercentage()}%</p>
            </motion.div>

            {/* Rewards */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-2 gap-4"
              >
                {/* XP Gained */}
                <div className="rounded-detective bg-gradient-to-br from-detective-orange to-orange-600 p-6 text-center text-white">
                  <Star className="mx-auto mb-2 h-8 w-8" />
                  <p className="mb-1 text-sm opacity-90">XP Ganado</p>
                  <motion.p
                    className="text-3xl font-bold"
                    key={animatedXP}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                  >
                    +{animatedXP}
                  </motion.p>
                </div>

                {/* ML Coins Gained */}
                <div className="rounded-detective bg-gradient-to-br from-detective-gold to-yellow-600 p-6 text-center text-white">
                  <Coins className="mx-auto mb-2 h-8 w-8" />
                  <p className="mb-1 text-sm opacity-90">ML Coins</p>
                  <motion.p
                    className="text-3xl font-bold"
                    key={animatedCoins}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                  >
                    +{animatedCoins}
                  </motion.p>
                </div>
              </motion.div>
            )}

            {/* Stats */}
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
                  <span className="ml-auto font-semibold text-detective-text">
                    {formatTime(timeSpent)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-detective-gold" />
                  <span className="text-detective-text-secondary">Pistas usadas:</span>
                  <span className="ml-auto font-semibold text-detective-text">{hintsUsed}</span>
                </div>
              </div>
            </motion.div>

            {/* Rank Up Notification */}
            {rankUp && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
                className="rounded-detective bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white"
              >
                <div className="text-center">
                  <Crown className="mx-auto mb-3 h-16 w-16" />
                  <h3 className="mb-2 text-2xl font-bold">¡Rango Mejorado!</h3>
                  <p className="mb-3 text-lg">
                    {rankUp.previousRank && (
                      <span className="opacity-75">{rankUp.previousRank} → </span>
                    )}
                    <span className="font-bold">{rankUp.newRank}</span>
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-white/20 p-3">
                      <p className="mb-1 text-sm opacity-90">Bonus ML Coins</p>
                      <p className="text-2xl font-bold">+{rankUp.bonusMLCoins}</p>
                    </div>
                    <div className="rounded-lg bg-white/20 p-3">
                      <p className="mb-1 text-sm opacity-90">Nuevo Multiplicador</p>
                      <p className="text-2xl font-bold">{rankUp.newMultiplier}x</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Streak Milestone */}
            {streakInfo && streakInfo.milestone && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.75, type: 'spring', stiffness: 200 }}
                className="rounded-detective bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white"
              >
                <div className="text-center">
                  <Flame className="mx-auto mb-3 h-16 w-16" />
                  <h3 className="mb-2 text-2xl font-bold">¡Racha Alcanzada!</h3>
                  <p className="mb-2 text-3xl font-bold">{streakInfo.currentStreak} días</p>
                  <p className="mb-3 text-lg">¡Sigue así!</p>
                  <div className="mt-4 rounded-lg bg-white/20 p-3">
                    <p className="mb-1 text-sm opacity-90">Recompensa de Racha</p>
                    <p className="text-2xl font-bold">+{streakInfo.reward} ML Coins</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Achievements */}
            {achievements.length > 0 && (
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
                  {achievements.map((achievement, index) => {
                    const display = getAchievementDisplay(achievement);
                    return (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                        className={`bg-gradient-to-r ${getRarityColor(
                          display.rarity,
                        )} rounded-detective p-4 text-white`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{display.icon}</span>
                          <div className="flex-1">
                            <p className="font-bold">{display.name}</p>
                            <p className="text-sm opacity-90">{display.description}</p>
                            <div className="mt-2 flex gap-2">
                              {display.mlCoinsReward > 0 && (
                                <span className="rounded-full bg-white/20 px-2 py-1 text-xs font-semibold">
                                  +{display.mlCoinsReward} 💰
                                </span>
                              )}
                              {display.xpReward > 0 && (
                                <span className="rounded-full bg-white/20 px-2 py-1 text-xs font-semibold">
                                  +{display.xpReward} ⭐
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex flex-col gap-3 pt-4 sm:flex-row"
            >
              <DetectiveButton
                variant="secondary"
                onClick={() => navigate(`/modules/${moduleId}`)}
                icon={<ArrowLeft className="h-4 w-4" />}
                className="flex-1"
              >
                Volver al Módulo
              </DetectiveButton>

              {!success && (
                <DetectiveButton
                  variant="blue"
                  onClick={onRetry}
                  icon={<RotateCcw className="h-4 w-4" />}
                  className="flex-1"
                >
                  Reintentar
                </DetectiveButton>
              )}

              {onNextExercise && (
                <DetectiveButton
                  variant="primary"
                  onClick={onNextExercise}
                  icon={<ChevronRight className="h-4 w-4" />}
                  className="flex-1"
                >
                  Siguiente Ejercicio
                </DetectiveButton>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
