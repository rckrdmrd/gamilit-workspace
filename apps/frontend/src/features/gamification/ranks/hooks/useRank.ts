/**
 * useRank Hook
 *
 * Custom hook for accessing current rank information and rank-related utilities.
 *
 * CORRECCIONES APLICADAS (2025-12-14):
 * - P0-002: isMinRank corregido a 'Ajaw' (era 'Nacom')
 * - P0-003: Progreso ahora usa XP en lugar de ML Coins (umbrales v2.1)
 * - P0-004: COMPLETADO - Usa useRanksConfig para obtener datos del backend
 *
 * Ver: orchestration/reportes/TECH-LEADER-VALIDATION-REPORT-2025-12-14.md
 */

import { useMemo } from 'react';
import { useRanksStore, selectUserProgress, selectCurrentRank } from '../store/ranksStore';
import { useRanksConfig } from './useRanksConfig';
import type { RankDefinition, RankComparison } from '../types/ranksTypes';

/**
 * Hook return type
 */
interface UseRankReturn {
  // Current rank data
  currentRank: RankDefinition;
  currentRankId: string;
  currentLevel: number;
  prestigeLevel: number;

  // Rank progression
  nextRank: RankDefinition | null;
  previousRank: RankDefinition | null;
  canRankUp: boolean;
  progress: number; // 0-100 percentage

  // Rank comparison
  compareToNext: () => RankComparison | null;
  compareToRank: (targetRank: string) => RankComparison | null;

  // Utilities
  isMaxRank: boolean;
  isMinRank: boolean;
  rankOrder: number;
}

/**
 * Custom hook to access rank information
 * P0-004: Uses useRanksConfig to get rank data from backend instead of mockData
 */
export function useRank(): UseRankReturn {
  const userProgress = useRanksStore(selectUserProgress);
  const currentRankId = useRanksStore(selectCurrentRank);

  // P0-004: Use useRanksConfig instead of mockData
  const { getRankById, getNextRank, getPreviousRank, getRankThresholds } = useRanksConfig();

  const currentRank = useMemo(() => getRankById(currentRankId), [currentRankId, getRankById]);

  const nextRank = useMemo(() => getNextRank(currentRankId), [currentRankId, getNextRank]);

  const previousRank = useMemo(
    () => getPreviousRank(currentRankId),
    [currentRankId, getPreviousRank],
  );

  const isMaxRank = useMemo(() => currentRankId === "K'uk'ulkan", [currentRankId]);

  // P0-002 FIX: Ajaw is the minimum rank, not Nacom
  const isMinRank = useMemo(() => currentRankId === 'Ajaw', [currentRankId]);

  // P0-003 & P0-004: Calculate progress using thresholds from backend
  const progress = useMemo(() => {
    if (!nextRank) return 100; // Max rank (K'uk'ulkan)

    // P0-004: Get thresholds from useRanksConfig instead of hardcoded values
    const currentThreshold = getRankThresholds(currentRankId);

    // Use totalXP from store (falls back to currentXP if not available)
    const currentXP = userProgress.totalXP || userProgress.currentXP || 0;

    // Calculate progress within current rank
    const xpInRank = Math.max(0, currentXP - currentThreshold.min);
    const xpRangeSize = currentThreshold.max - currentThreshold.min;

    if (xpRangeSize <= 0 || !isFinite(xpRangeSize)) return 100;

    return Math.min(100, Math.max(0, (xpInRank / xpRangeSize) * 100));
  }, [userProgress.totalXP, userProgress.currentXP, currentRankId, nextRank, getRankThresholds]);

  /**
   * Compare current rank to next rank
   */
  const compareToNext = (): RankComparison | null => {
    if (!nextRank) return null;

    const mlCoinsDifference = nextRank.mlCoinsRequired - userProgress.mlCoinsEarned;
    const multiplierIncrease = nextRank.multiplier - currentRank.multiplier;

    // Find new benefits (not in current rank)
    const newBenefits = nextRank.benefits.filter(
      (benefit) => !currentRank.benefits.includes(benefit),
    );

    return {
      current: currentRank,
      target: nextRank,
      xpDifference: 0, // Will be calculated by backend
      mlCoinsDifference: Math.max(0, mlCoinsDifference),
      multiplierIncrease,
      newBenefits,
    };
  };

  /**
   * Compare current rank to a specific target rank
   * P0-004: Uses getRankById from useRanksConfig
   */
  const compareToRank = (targetRankId: string): RankComparison | null => {
    try {
      const targetRank = getRankById(targetRankId);
      if (!targetRank || (targetRank.id === 'Ajaw' && targetRankId !== 'Ajaw')) {
        return null; // getRankById returns default if not found
      }

      const mlCoinsDifference = targetRank.mlCoinsRequired - userProgress.mlCoinsEarned;
      const multiplierIncrease = targetRank.multiplier - currentRank.multiplier;

      // Find new benefits
      const newBenefits = targetRank.benefits.filter(
        (benefit) => !currentRank.benefits.includes(benefit),
      );

      return {
        current: currentRank,
        target: targetRank,
        xpDifference: 0,
        mlCoinsDifference: Math.max(0, mlCoinsDifference),
        multiplierIncrease,
        newBenefits,
      };
    } catch {
      return null;
    }
  };

  return {
    currentRank,
    currentRankId,
    currentLevel: userProgress.currentLevel,
    prestigeLevel: userProgress.prestigeLevel,
    nextRank,
    previousRank,
    canRankUp: userProgress.canRankUp,
    progress,
    compareToNext,
    compareToRank,
    isMaxRank,
    isMinRank,
    rankOrder: currentRank.order,
  };
}
