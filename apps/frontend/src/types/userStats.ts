/**
 * User Stats Types (Simplified - CamelCase)
 *
 * @deprecated Este archivo está DEPRECATED. Usar tipos del SSOT:
 *   - SSOT Principal: @/shared/types/user-stats.types.ts (camelCase, completo)
 *   - Para API raw: @/shared/types/gamification.types.ts (snake_case)
 *
 * Este archivo se mantiene por compatibilidad con código existente.
 * Todo código nuevo debe importar de shared/types/user-stats.types.ts
 *
 * @migration 2026-01-16 - Consolidación SSOT UserStats
 * @see SSOT: @/shared/types/user-stats.types.ts
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
