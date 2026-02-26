/**
 * useCompletionAnimations Hook
 *
 * Manages confetti, XP/ML Coins counter animations, and window-resize tracking
 * for the CompletionModal.
 *
 * @see CompletionModal.tsx (consumer)
 */

import { useEffect, useState } from 'react';
import { useResponsiveLayout } from '@shared/hooks/useResponsiveLayout';

interface UseCompletionAnimationsParams {
  isOpen: boolean;
  success: boolean;
  xpGained: number;
  mlCoinsGained: number;
}

interface CompletionAnimationState {
  showConfetti: boolean;
  animatedXP: number;
  animatedCoins: number;
  windowSize: { width: number; height: number };
}

export function useCompletionAnimations({
  isOpen,
  success,
  xpGained,
  mlCoinsGained,
}: UseCompletionAnimationsParams): CompletionAnimationState {
  const [showConfetti, setShowConfetti] = useState(false);
  const [animatedXP, setAnimatedXP] = useState(0);
  const [animatedCoins, setAnimatedCoins] = useState(0);
  const { width, height } = useResponsiveLayout();

  // Confetti + counter animations
  useEffect(() => {
    if (isOpen && success) {
      setShowConfetti(true);

      const xpInterval = setInterval(() => {
        setAnimatedXP((prev) => {
          if (prev >= xpGained) {
            clearInterval(xpInterval);
            return xpGained;
          }
          return prev + Math.ceil(xpGained / 30);
        });
      }, 30);

      const coinsInterval = setInterval(() => {
        setAnimatedCoins((prev) => {
          if (prev >= mlCoinsGained) {
            clearInterval(coinsInterval);
            return mlCoinsGained;
          }
          return prev + Math.ceil(mlCoinsGained / 30);
        });
      }, 30);

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

  return { showConfetti, animatedXP, animatedCoins, windowSize: { width, height } };
}
