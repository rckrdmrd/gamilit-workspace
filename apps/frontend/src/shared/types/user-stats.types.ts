/**
 * User Stats Types
 *
 * Type definitions for user gamification statistics.
 *
 * @description Single Source of Truth (SSOT) for user statistics types.
 * Aligned with backend entity: gamification_system.user_stats
 *
 * @see Backend Entity: /modules/gamification/entities/user-stats.entity.ts
 * @see Database: gamification_system.user_stats table
 *
 * DTO-001: Created canonical types for UserStats to replace `any` usage
 */

/**
 * User Statistics Interface
 *
 * Complete gamification statistics for a user including XP, ML Coins,
 * ranks, streaks, and progress metrics.
 *
 * @description This interface mirrors the backend UserStats entity.
 * All field names use camelCase (as returned by backend serialization).
 */
export interface UserStats {
  // =====================================================
  // CORE IDENTIFIERS
  // =====================================================

  /**
   * Unique identifier for the stats record
   */
  id: string;

  /**
   * User ID (FK → auth.users)
   */
  userId: string;

  /**
   * Tenant ID for multi-tenancy
   */
  tenantId?: string;

  // =====================================================
  // LEVEL & XP SYSTEM
  // =====================================================

  /**
   * Current user level (starts at 1)
   */
  level: number;

  /**
   * Total XP accumulated
   */
  totalXp: number;

  /**
   * XP needed to reach next level
   */
  xpToNextLevel: number;

  // =====================================================
  // RANK SYSTEM (Maya Ranks)
  // =====================================================

  /**
   * Current Maya rank
   * Values: 'Ajaw', 'Nacom', 'Ah K'in', 'Halach Uinic', 'K'uk'ulkan'
   */
  currentRank: string;

  /**
   * Progress towards next rank (0-100%)
   */
  rankProgress: number;

  // =====================================================
  // ML COINS SYSTEM
  // =====================================================

  /**
   * Current ML Coins balance
   */
  mlCoins: number;

  /**
   * Total ML Coins earned historically
   */
  mlCoinsEarnedTotal: number;

  /**
   * Total ML Coins spent historically
   */
  mlCoinsSpentTotal: number;

  /**
   * ML Coins earned today (resets daily)
   */
  mlCoinsEarnedToday: number;

  /**
   * Last ML Coins daily reset timestamp
   */
  lastMlCoinsReset?: string; // ISO date string

  // =====================================================
  // STREAK SYSTEM
  // =====================================================

  /**
   * Current consecutive days streak
   */
  currentStreak: number;

  /**
   * Maximum streak reached
   */
  maxStreak: number;

  /**
   * Streak start timestamp
   */
  streakStartedAt?: string; // ISO date string

  /**
   * Total active days on platform
   */
  daysActiveTotal: number;

  // =====================================================
  // PROGRESS & COMPLETION METRICS
  // =====================================================

  /**
   * Number of completed exercises
   */
  exercisesCompleted: number;

  /**
   * Number of completed modules
   */
  modulesCompleted: number;

  /**
   * Total score sum across all exercises
   */
  totalScore: number;

  /**
   * Average score across all exercises (0-100)
   */
  averageScore?: number;

  /**
   * Number of exercises completed with perfect score (100%)
   */
  perfectScores: number;

  // =====================================================
  // ACHIEVEMENTS & REWARDS
  // =====================================================

  /**
   * Number of achievements unlocked
   */
  achievementsEarned: number;

  /**
   * Number of certificates earned
   */
  certificatesEarned: number;

  // =====================================================
  // TIME TRACKING
  // =====================================================

  /**
   * Total time spent on platform (in minutes)
   * Converted from PostgreSQL interval
   */
  totalTimeSpentMinutes: number;

  /**
   * Time spent in last week (in minutes)
   * Converted from PostgreSQL interval
   */
  weeklyTimeSpentMinutes: number;

  /**
   * Number of learning sessions
   */
  sessionsCount: number;

  // =====================================================
  // PERIODIC XP & ACTIVITY
  // =====================================================

  /**
   * XP earned in last week
   */
  weeklyXp: number;

  /**
   * XP earned in last month
   */
  monthlyXp: number;

  /**
   * Exercises completed in last week
   */
  weeklyExercises: number;

  // =====================================================
  // RANKING POSITIONS
  // =====================================================

  /**
   * Position in global ranking (pre-calculated)
   */
  globalRankPosition?: number;

  /**
   * Position in classroom ranking (pre-calculated)
   */
  classRankPosition?: number;

  /**
   * Position in school ranking (pre-calculated)
   */
  schoolRankPosition?: number;

  // =====================================================
  // ACTIVITY TIMESTAMPS
  // =====================================================

  /**
   * Last activity timestamp
   */
  lastActivityAt?: string; // ISO date string

  /**
   * Last login timestamp
   */
  lastLoginAt?: string; // ISO date string

  // =====================================================
  // METADATA & AUDIT
  // =====================================================

  /**
   * Additional metadata (flexible JSONB field)
   */
  metadata?: Record<string, unknown>;

  /**
   * Record creation timestamp
   */
  createdAt: string; // ISO date string

  /**
   * Record last update timestamp
   */
  updatedAt: string; // ISO date string
}

/**
 * User Stats Summary
 *
 * Simplified version of UserStats with only essential fields
 * for quick display in widgets and dashboards.
 */
export interface UserStatsSummary {
  /**
   * Total XP accumulated
   */
  totalXp: number;

  /**
   * Current ML Coins balance
   */
  mlCoins: number;

  /**
   * Current Maya rank
   */
  currentRank: string;

  /**
   * Current user level
   */
  level: number;

  /**
   * XP needed to reach next level
   */
  xpToNextLevel: number;

  /**
   * Number of completed exercises
   */
  exercisesCompleted: number;

  /**
   * Number of completed modules
   */
  modulesCompleted: number;

  /**
   * Average score (0-100)
   */
  averageScore: number;

  /**
   * Total time spent (in minutes)
   */
  totalTimeSpentMinutes: number;

  /**
   * Current consecutive days streak
   */
  currentStreak: number;

  /**
   * Maximum streak reached
   */
  maxStreak: number;

  /**
   * Number of achievements unlocked
   */
  achievementsEarned: number;

  /**
   * Number of certificates earned
   */
  certificatesEarned: number;
}

/**
 * Update User Stats DTO
 *
 * Data allowed to be updated in user statistics.
 * Most stats are auto-calculated by backend, so this is minimal.
 */
export interface UpdateUserStatsDto {
  /**
   * Additional metadata to merge
   */
  metadata?: Record<string, unknown>;
}
