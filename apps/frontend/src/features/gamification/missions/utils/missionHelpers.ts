/**
 * Mission Helper Utilities
 *
 * Helper functions to extract data from Mission objects with fallback support
 */

import type { Mission } from '../types/missionsTypes';

/**
 * Get mission progress with fallback support
 *
 * Tries to extract progress from objectives array first,
 * falls back to currentValue/targetValue if objectives are not available
 */
export function getMissionProgress(mission: Mission): { current: number; target: number } {
  // Try to get from objectives (preferred)
  if (mission.objectives && mission.objectives.length > 0) {
    const firstObjective = mission.objectives[0];
    return {
      current: firstObjective.current,
      target: firstObjective.target,
    };
  }

  // Fallback to backwards compatibility fields
  return {
    current: mission.currentValue,
    target: mission.targetValue,
  };
}

/**
 * Get mission rewards with fallback support
 *
 * Tries to extract rewards from rewards object first,
 * falls back to xpReward/mlCoinsReward if rewards object is not available
 */
export function getMissionRewards(mission: Mission): { xp: number; mlCoins: number } {
  // Try to get from rewards object (preferred)
  if (mission.rewards) {
    return {
      xp: mission.rewards.xp || 0,
      mlCoins: mission.rewards.ml_coins || 0,
    };
  }

  // Fallback to backwards compatibility fields
  return {
    xp: mission.xpReward,
    mlCoins: mission.mlCoinsReward,
  };
}

/**
 * Check if mission is completable (has reached target)
 */
export function isMissionCompletable(mission: Mission): boolean {
  const { current, target } = getMissionProgress(mission);
  return current >= target;
}

/**
 * Get mission completion percentage
 */
export function getMissionProgressPercentage(mission: Mission): number {
  // Use the progress field if available
  if (mission.progress !== undefined) {
    return Math.min(mission.progress, 100);
  }

  // Calculate from current/target
  const { current, target } = getMissionProgress(mission);
  if (target === 0) return 0;

  return Math.min(Math.round((current / target) * 100), 100);
}

/**
 * Check if mission is expired
 */
export function isMissionExpired(mission: Mission): boolean {
  return mission.expiresAt < new Date();
}

/**
 * Get time remaining until expiration in hours
 */
export function getTimeRemaining(mission: Mission): number {
  const now = new Date().getTime();
  const expiry = mission.expiresAt.getTime();
  const diffMs = expiry - now;

  if (diffMs <= 0) return 0;

  return Math.round(diffMs / (1000 * 60 * 60)); // Convert to hours
}

/**
 * Format time remaining as human-readable string
 */
export function formatTimeRemaining(mission: Mission): string {
  const hours = getTimeRemaining(mission);

  if (hours <= 0) return 'Expired';
  if (hours < 1) return 'Less than 1 hour';
  if (hours === 1) return '1 hour';
  if (hours < 24) return hours + ' hours';

  const days = Math.floor(hours / 24);
  if (days === 1) return '1 day';
  return days + ' days';
}

/**
 * Get all objectives descriptions
 */
export function getObjectivesDescriptions(mission: Mission): string[] {
  if (!mission.objectives || mission.objectives.length === 0) {
    return [mission.description];
  }

  return mission.objectives.map((obj) => {
    if (obj.description) {
      return obj.description;
    }

    // Generate description from objective data
    const action = obj.type.replace(/_/g, ' ');
    return action.charAt(0).toUpperCase() + action.slice(1) + ': ' + obj.current + '/' + obj.target;
  });
}

/**
 * Check if mission has multiple objectives
 */
export function hasMultipleObjectives(mission: Mission): boolean {
  return mission.objectives && mission.objectives.length > 1;
}

/**
 * Get total reward value (XP + ML Coins weighted)
 */
export function getTotalRewardValue(mission: Mission, mlCoinsWeight: number = 1): number {
  const rewards = getMissionRewards(mission);
  return rewards.xp + rewards.mlCoins * mlCoinsWeight;
}
