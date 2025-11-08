/**
 * Gamification Types
 * Type definitions for Gamification Module API responses
 *
 * @see Backend: modules/gamification/controllers/user-stats.controller.ts
 * @see Database: gamification_system.user_stats
 */

/**
 * Maya Rank Enum
 * Matches database enum: gamification_system.maya_rank
 */
export enum MayaRank {
  AJAW = 'Ajaw',
  NACOM = 'Nacom',
  AH_KIN = "Ah K'in",
  HALACH_UINIC = 'Halach Uinic',
  KUKULKAN = "K'uk'ulkan"
}

/**
 * User Statistics
 * Complete user stats from gamification system
 *
 * @see Backend: GET /api/v1/gamification/users/:userId/stats
 * @see Database: gamification_system.user_stats
 */
export interface UserStats {
  /**
   * User stats record ID
   */
  id: string;

  /**
   * User ID (foreign key)
   */
  user_id: string;

  // =====================================================
  // LEVEL & XP
  // =====================================================

  /**
   * Current level
   */
  level: number;

  /**
   * Total XP accumulated
   */
  total_xp: number;

  /**
   * XP needed to reach next level
   */
  xp_to_next_level: number;

  // =====================================================
  // MAYA RANK SYSTEM
  // =====================================================

  /**
   * Current Maya rank
   */
  current_rank: MayaRank | string;

  /**
   * Progress towards next rank (0-100%)
   */
  rank_progress: number;

  // =====================================================
  // ML COINS (IN-GAME CURRENCY)
  // =====================================================

  /**
   * Current ML Coins balance
   */
  ml_coins: number;

  /**
   * Total ML Coins earned historically
   */
  ml_coins_earned_total: number;

  /**
   * Total ML Coins spent historically
   */
  ml_coins_spent_total: number;

  // =====================================================
  // STREAK & ACTIVITY
  // =====================================================

  /**
   * Current consecutive days active
   */
  current_streak: number;

  /**
   * Maximum streak ever achieved
   */
  max_streak: number;

  /**
   * Total days user has been active
   */
  days_active_total: number;

  // =====================================================
  // PROGRESS METRICS
  // =====================================================

  /**
   * Total exercises completed
   */
  exercises_completed: number;

  /**
   * Total modules completed
   */
  modules_completed: number;

  /**
   * Total cumulative score
   */
  total_score: number;

  // =====================================================
  // ACHIEVEMENTS & CERTIFICATES
  // =====================================================

  /**
   * Total achievements earned
   */
  achievements_earned: number;

  /**
   * Total certificates earned
   */
  certificates_earned: number;

  // =====================================================
  // SESSION TRACKING
  // =====================================================

  /**
   * Total number of sessions/logins
   */
  sessions_count: number;

  // =====================================================
  // AUDIT
  // =====================================================

  /**
   * Timestamp of record creation
   */
  created_at?: string;

  /**
   * Timestamp of last update
   */
  updated_at?: string;
}

/**
 * User Rank Information
 * Simplified rank info for leaderboards and badges
 *
 * @see Backend: GET /api/v1/gamification/users/:userId/rank
 */
export interface UserRank {
  current_rank: MayaRank | string;
  rank_progress: number;
  level: number;
  next_rank: MayaRank | string | null;
  levels_to_next_rank: number;
}

/**
 * ML Coins Balance
 * Detailed ML Coins information
 */
export interface MLCoinsBalance {
  user_id: string;
  ml_coins: number;
  ml_coins_earned_total: number;
  ml_coins_spent_total: number;
}

/**
 * Stats Update DTO
 * Fields that can be updated via PATCH
 */
export interface UpdateUserStatsDto {
  total_xp?: number;
  level?: number;
  current_rank?: MayaRank | string;
  rank_progress?: number;
  ml_coins?: number;
  ml_coins_earned_total?: number;
  ml_coins_spent_total?: number;
  current_streak?: number;
  max_streak?: number;
  days_active_total?: number;
  exercises_completed?: number;
  modules_completed?: number;
  total_score?: number;
  achievements_earned?: number;
  certificates_earned?: number;
  sessions_count?: number;
}
