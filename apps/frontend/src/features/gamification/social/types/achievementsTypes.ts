/**
 * Achievement Types for Social Feature
 *
 * NOTA: Este módulo define tipos específicos para el feature social.
 * Para los tipos canónicos, usar @shared/types/achievement.types
 *
 * NOTE: Backend uses different category names. Mapping:
 * - Frontend 'progress' -> Backend 'educational', 'progress'
 * - Frontend 'mastery' -> Backend 'mastery', 'skill'
 * - Frontend 'social' -> Backend 'social'
 * - Frontend 'hidden' -> Backend 'hidden', 'special'
 *
 * @see SSOT: @shared/types/achievement.types.ts
 * P2-001: Consolidación de types - re-export desde SSOT
 */

// Import for local use
import type {
  AchievementCategory,
  Achievement as BaseAchievement,
  AchievementReward,
} from '@shared/types/achievement.types';

// Re-export canonical types from SSOT
export type { AchievementCategory, AchievementReward };
export type { BaseAchievement };

// Local alias for rarity (matches SSOT NonNullable<Achievement['rarity']>)
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

/**
 * Progress tracking for a single achievement
 */
export interface AchievementProgress {
  current: number;
  required: number;
  percentage?: number;
}

/**
 * Requirements to unlock an achievement (UI-specific structure)
 * Note: SSOT uses AchievementCondition[] for conditions
 */
export interface AchievementRequirements {
  prerequisiteAchievements?: string[];
  rank?: string;
  level?: number;
  exercisesCompleted?: number;
  perfectScores?: number;
  friendsCount?: number;
  guildMembership?: boolean;
}

/**
 * AchievementWithProgress
 *
 * View model que combina datos del logro con estado del usuario.
 * Usado en componentes que muestran logros con su progreso.
 *
 * P2-001: Tipo derivado - combina BaseAchievement + UserProgress
 */
export interface AchievementWithProgress {
  id: string;
  title: string;
  name?: string; // Alternative to title (aligned with SSOT 'name')
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  mlCoinsReward: number;
  xpReward: number;
  rewards?: AchievementReward; // Alternativa estructurada (alineada con SSOT)
  // User progress fields
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress?: AchievementProgress;
  requirements?: AchievementRequirements;
  isHidden?: boolean;
  rewardsClaimed?: boolean; // True if user has claimed rewards for this achievement
}

/**
 * @deprecated Use AchievementWithProgress for clarity.
 * Alias mantenido para compatibilidad.
 */
export type Achievement = AchievementWithProgress;

export interface AchievementUnlockNotification {
  achievement: Achievement;
  timestamp: Date;
  showConfetti: boolean;
}

export interface AchievementStats {
  totalAchievements: number;
  unlockedAchievements: number;
  progressAchievements: number;
  masteryAchievements: number;
  socialAchievements: number;
  hiddenAchievements: number;
  totalMlCoinsEarned: number;
  totalXpEarned: number;
  completionRate?: number;
}
