/**
 * @deprecated Use FeedbackModal with rich feedback data instead.
 * Los subcomponentes (CompletionModalSections.tsx) son consumidos por FeedbackModal.
 * Retenido por compatibilidad. Se eliminara en v5.0.
 *
 * CompletionModal Component
 * Displays exercise completion with XP/ML Coins animations, achievements, and next steps.
 *
 * Orchestrates subcomponents:
 * - CompletionHeader: gradient header with trophy/avatar
 * - CompletionScoreDisplay: animated score circle (from CompletionModalSections)
 * - CompletionRewards: XP + ML Coins cards (from CompletionModalSections)
 * - CompletionStats: time + hints used (from CompletionModalSections)
 * - RankUpNotification: rank promotion banner (from CompletionModalSections)
 * - StreakMilestone: streak achievement banner (from CompletionModalSections)
 * - AchievementsList: unlocked achievements (from CompletionModalSections)
 * - CompletionActions: retry, next, back buttons
 * - useCompletionAnimations: confetti + counter animations hook
 *
 * ACCESSIBILITY (WCAG 2.1 AA):
 * - Focus trap: uses useFocusTrap for keyboard navigation (WCAG 2.4.3 Focus Order)
 * - Escape key: closes modal (WCAG 2.1.2 No Keyboard Trap)
 * - ARIA: role="dialog", aria-modal="true", aria-labelledby for title
 * - Backdrop: clickable to close
 * - Body scroll lock: prevents background scrolling when open
 *
 * @see GUIA-WCAG-ACCESSIBILITY.md Section 3.6 (Modales y Dialogos)
 * @see @shared/hooks/useFocusTrap
 */

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import { Modal } from '@shared/components/common/Modal';
import { useProgression } from '@/features/gamification/ranks/hooks/useProgression';
import { useCoins } from '@/features/gamification/economy/hooks/useCoins';
import { useEquipment } from '@/features/gamification/social/hooks/useEquipment';
import { useAuth } from '@/app/providers/AuthContext';
import { TransactionTypeEnum } from '@/features/gamification/economy/types/economyTypes';
import { useAchievementsStore } from '@/features/gamification/social/store/achievementsStore';
import type { Achievement as SSOTAchievement } from '@shared/types/achievement.types';
import { X } from 'lucide-react';
import {
  CompletionScoreDisplay,
  CompletionRewards,
  CompletionStats,
  RankUpNotification,
  StreakMilestone,
  AchievementsList,
} from './CompletionModalSections';
import type { AchievementDisplay } from './CompletionModalSections';
import { CompletionHeader } from './CompletionHeader';
import { CompletionActions } from './CompletionActions';
import { useCompletionAnimations } from './useCompletionAnimations';

/**
 * CompletionAchievement — derived from SSOT Achievement with optional legacy fields.
 * @see SSOT: @shared/types/achievement.types.ts
 */
type Achievement = Pick<SSOTAchievement, 'id' | 'name' | 'description' | 'icon' | 'rarity'> & {
  key?: string;
  title?: string;
  mlCoinsReward?: number;
  xpReward?: number;
  iconUrl?: string;
};

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

export const CompletionModal = ({
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
  onClose,
  onRetry,
  onNextExercise,
  rankUp,
  streakInfo,
}: CompletionModalProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addXP, checkRankUp } = useProgression();
  const { earnCoins } = useCoins();
  const { unlockAchievement } = useAchievementsStore();
  const rewardsApplied = useRef(false);

  // Animations: confetti, XP/coins counters, window size
  const { showConfetti, animatedXP, animatedCoins, windowSize } =
    useCompletionAnimations({ isOpen, success, xpGained, mlCoinsGained });

  // Avatar cosmetics (frame renders only in RankProgressWidget, not on avatars)
  const { equippedItems } = useEquipment();
  const equippedAvatar = equippedItems.find((e) => e.item?.metadata?.type === 'avatar');
  const avatarSrc =
    (equippedAvatar?.item?.metadata?.asset_url as string | undefined) || user?.avatar_url || null;

  // ─── Reward application ─────────────────────────────
  const applyRewards = async () => {
    try {
      if (xpGained > 0) {
        await addXP(xpGained, 'exercise_completion', exerciseId);
      }
      if (mlCoinsGained > 0) {
        earnCoins(mlCoinsGained, TransactionTypeEnum.EARNED_EXERCISE, `Ejercicio completado: ${exerciseId}`);
      }
      checkRankUp();
      achievements.forEach((a) => unlockAchievement(a.id));
    } catch (error) {
      console.error('Error applying rewards:', error);
    }
  };

  // ─── Effects ────────────────────────────────────────
  // Note: ESC key and scroll lock are handled by Modal component

  useEffect(() => {
    if (isOpen && success && !rewardsApplied.current) {
      applyRewards();
      rewardsApplied.current = true;
    }
    if (!isOpen) rewardsApplied.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, success]);

  // ─── Helpers ────────────────────────────────────────
  const getPerformanceMessage = (): string => {
    const pct = Math.round((score / maxScore) * 100);
    if (pct >= 90) return '¡Excelente trabajo!';
    if (pct >= 75) return '¡Muy bien hecho!';
    if (pct >= 60) return '¡Buen trabajo!';
    if (pct >= 50) return 'Aprobado';
    return 'Sigue intentando';
  };

  const toDisplayAchievements = (items: Achievement[]): AchievementDisplay[] =>
    items.map((a) => ({
      name: a.title || a.name || 'Achievement',
      description: a.description || '',
      icon: a.iconUrl || a.icon || '',
      rarity: a.rarity || 'common',
      mlCoinsReward: a.mlCoinsReward || 0,
      xpReward: a.xpReward || 0,
    }));

  // ─── Render ─────────────────────────────────────────
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      animated
      size="2xl"
      showCloseButton={false}
      overlayClassName="bg-black/70 backdrop-blur-sm p-4"
      className="max-h-[90vh] overflow-y-auto rounded-detective shadow-2xl dark:bg-gray-800"
      contentClassName="custom"
      ariaLabelledBy="completion-modal-title"
    >
      {showConfetti && success && (
        <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} gravity={0.3} />
      )}

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute right-3 top-3 z-10 flex items-center justify-center rounded-full bg-white/20 p-2 min-w-[44px] min-h-[44px] text-white transition-colors hover:bg-white/40 touch-manipulation"
        aria-label="Cerrar modal"
      >
        <X className="h-6 w-6" />
      </button>

      <CompletionHeader
        success={success}
        performanceMessage={getPerformanceMessage()}
        avatarSrc={avatarSrc}
        userName={user ? (user.firstName || user.email || 'U') : null}
      />

      {/* Content — composed from subcomponents */}
      <div className="space-y-4 p-4 sm:space-y-6 sm:p-6 md:p-8 max-h-[calc(90vh-120px)] overflow-y-auto">
        <CompletionScoreDisplay score={score} maxScore={maxScore} success={success} />
        {success && <CompletionRewards animatedXP={animatedXP} animatedCoins={animatedCoins} />}
        <CompletionStats timeSpent={timeSpent} hintsUsed={hintsUsed} />
        {rankUp && <RankUpNotification rankUp={rankUp} />}
        {streakInfo && streakInfo.milestone && <StreakMilestone streakInfo={streakInfo} />}
        {achievements.length > 0 && <AchievementsList achievements={toDisplayAchievements(achievements)} />}

        <CompletionActions
          success={success}
          onBackToModule={() => navigate(`/modules/${moduleId}`)}
          onRetry={onRetry}
          onNextExercise={onNextExercise}
        />
      </div>
    </Modal>
  );
};
