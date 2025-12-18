/**
 * User Stats Types
 *
 * Type definitions for user statistics and gamification metrics.
 *
 * @description
 * Canonical types for user statistics matching backend entity.
 * This file provides simplified types for use in components and pages.
 * For complete types, see /shared/types/user-stats.types.ts
 *
 * @see Backend Entity: gamification_system.user_stats table
 * @see /shared/types/user-stats.types.ts for complete UserStats interface
 */

import { MayaRank } from '../shared/constants/ranks.constants';

/**
 * User Statistics Interface (Simplified)
 *
 * Core gamification statistics for a user.
 * This is a simplified version for component usage.
 *
 * @description
 * Use this interface in components and pages that need basic user stats.
 * For complete stats with all fields, use UserStats from shared/types/user-stats.types.ts
 */
export interface UserStats {
  /**
   * Unique identifier for the stats record
   */
  id: string;

  /**
   * User ID (FK → auth.users)
   */
  userId: string;

  /**
   * Total XP accumulated
   */
  totalXp: number;

  /**
   * Current ML Coins balance
   */
  totalMlCoins: number;

  /**
   * Current Maya rank
   * Values: 'Ajaw', 'Nacom', "Ah K'in", 'Halach Uinic', "K'uk'ulkan"
   */
  currentRank: MayaRank;

  /**
   * Current user level (starts at 1)
   */
  currentLevel: number;

  /**
   * Number of completed exercises
   */
  exercisesCompleted: number;

  /**
   * Number of correct answers
   */
  correctAnswers: number;

  /**
   * Total number of answers
   */
  totalAnswers: number;

  /**
   * Total time spent on platform (in minutes)
   */
  studyTimeMinutes: number;

  /**
   * Current consecutive days streak
   */
  currentStreak: number;

  /**
   * Maximum streak reached
   */
  longestStreak: number;

  /**
   * Last activity timestamp
   */
  lastActivityAt: Date | string;

  /**
   * Record creation timestamp
   */
  createdAt: Date | string;

  /**
   * Record last update timestamp
   */
  updatedAt: Date | string;
}

/**
 * Streak Statistics
 *
 * Information about user activity streaks
 */
export interface StreakStats {
  /**
   * Current consecutive days streak
   */
  currentStreak: number;

  /**
   * Maximum streak reached
   */
  longestStreak: number;

  /**
   * Total active days on platform
   */
  totalDaysActive: number;
}
