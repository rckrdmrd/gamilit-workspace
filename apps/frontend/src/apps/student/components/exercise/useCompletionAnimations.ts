/**
 * useCompletionAnimations Hook
 *
 * Manages confetti, XP/ML Coins counter animations, and window-resize tracking
 * for the CompletionModal.
 *
 * @see CompletionModal.tsx (consumer)
 */

import { useEffect, useState } from 'react';

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
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  // Window resize tracking
  useEffect(() => {
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  return { showConfetti, animatedXP, animatedCoins, windowSize };
}
