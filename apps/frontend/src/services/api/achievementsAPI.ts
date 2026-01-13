/**
 * Achievements API Integration
 *
 * API client for achievements/logros in the gamification system.
 * Handles fetching achievements catalog, user achievements, progress tracking,
 * and claiming rewards.
 *
 * @module achievementsAPI
 * @version 1.0.0
 * @date 2026-01-13
 */

import { apiClient } from '@/services/api/apiClient';
import { handleAPIError } from './apiErrorHandler';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Achievement Category
 */
export type AchievementCategory =
  | 'starter'
  | 'progress'
  | 'mastery'
  | 'social'
  | 'special'
  | 'hidden';

/**
 * Achievement Definition
 *
 * Represents an achievement available in the system
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  icon_url?: string;
  is_secret: boolean;
  is_active: boolean;
  is_repeatable: boolean;
  reward_ml_coins: number;
  reward_xp?: number;
  conditions: Record<string, unknown>;
  rewards?: {
    xp?: number;
    badge?: string | null;
    ml_coins?: number;
  };
  order_index: number;
  points_value?: number;
  created_at: string;
  updated_at: string;
}

/**
 * User Achievement
 *
 * Represents a user's progress/completion of an achievement
 */
export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;
  max_progress: number;
  is_completed: boolean;
  completion_percentage: number;
  completed_at: string | null;
  rewards_claimed: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Achievement details (joined from achievements table)
  achievement?: Achievement;
}

/**
 * User Achievements Response
 *
 * Response structure from getUserAchievements endpoint
 */
export interface UserAchievementsResponse {
  data: {
    achievements: UserAchievement[];
    total: number;
  };
}

/**
 * Achievement Summary
 *
 * Statistical summary of user's achievements
 */
export interface AchievementSummary {
  total_available: number;
  completed: number;
  completion_percentage: number;
  unclaimed_rewards: number;
}

/**
 * Grant Achievement DTO
 *
 * Data for granting/updating an achievement for a user
 */
export interface GrantAchievementDto {
  user_id: string;
  achievement_id: string;
  progress?: number;
  max_progress?: number;
  is_completed?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Update Achievement Status DTO
 *
 * Data for updating achievement active status (admin)
 */
export interface UpdateAchievementStatusDto {
  is_active: boolean;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get all achievements
 *
 * @description Fetches all available achievements in the system.
 * By default, excludes secret achievements unless includeSecret is true.
 *
 * @param includeSecret - Include secret/hidden achievements (default: false)
 * @returns Promise<Achievement[]>
 *
 * @endpoint GET /api/v1/gamification/achievements
 *
 * @example
 * ```ts
 * const achievements = await getAllAchievements();
 * const allIncludingSecret = await getAllAchievements(true);
 * ```
 */
export async function getAllAchievements(includeSecret = false): Promise<Achievement[]> {
  try {
    const response = await apiClient.get<Achievement[]>('/gamification/achievements', {
      params: { includeSecret: includeSecret.toString() },
    });
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch achievements');
  }
}

/**
 * Get achievement by ID
 *
 * @description Fetches detailed information about a specific achievement
 *
 * @param id - Achievement UUID
 * @returns Promise<Achievement>
 *
 * @endpoint GET /api/v1/gamification/achievements/:id
 *
 * @example
 * ```ts
 * const achievement = await getAchievementById('550e8400-e29b-41d4-a716-446655440000');
 * ```
 */
export async function getAchievementById(id: string): Promise<Achievement> {
  try {
    const response = await apiClient.get<Achievement>(`/gamification/achievements/${id}`);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch achievement');
  }
}

/**
 * Get user achievements
 *
 * @description Fetches all achievements for a user with their progress.
 * Returns completed, in-progress, and locked achievements.
 *
 * @param userId - User UUID
 * @returns Promise<UserAchievement[]>
 *
 * @endpoint GET /api/v1/gamification/users/:userId/achievements
 *
 * @example
 * ```ts
 * const userAchievements = await getUserAchievements('550e8400-e29b-41d4-a716-446655440000');
 * const completed = userAchievements.filter(a => a.is_completed);
 * ```
 */
export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  try {
    const response = await apiClient.get<UserAchievementsResponse>(
      `/gamification/users/${userId}/achievements`,
    );
    // Backend wraps in { data: { achievements, total } }
    return response.data.data.achievements;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch user achievements');
  }
}

/**
 * Get user achievements with metadata
 *
 * @description Same as getUserAchievements but returns full response with total count
 *
 * @param userId - User UUID
 * @returns Promise<{ achievements: UserAchievement[]; total: number }>
 *
 * @endpoint GET /api/v1/gamification/users/:userId/achievements
 */
export async function getUserAchievementsWithMeta(
  userId: string,
): Promise<{ achievements: UserAchievement[]; total: number }> {
  try {
    const response = await apiClient.get<UserAchievementsResponse>(
      `/gamification/users/${userId}/achievements`,
    );
    return response.data.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch user achievements');
  }
}

/**
 * Get achievement summary
 *
 * @description Fetches statistical summary of user's achievements
 * (total, completed, percentage, unclaimed rewards)
 *
 * @param userId - User UUID
 * @returns Promise<AchievementSummary>
 *
 * @endpoint GET /api/v1/gamification/users/:userId/achievements/summary
 *
 * @example
 * ```ts
 * const summary = await getAchievementSummary('user-id');
 * console.log(`${summary.completed}/${summary.total_available} achievements completed`);
 * ```
 */
export async function getAchievementSummary(userId: string): Promise<AchievementSummary> {
  try {
    const response = await apiClient.get<AchievementSummary>(
      `/gamification/users/${userId}/achievements/summary`,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch achievement summary');
  }
}

/**
 * Grant achievement to user
 *
 * @description Grants or updates progress on an achievement for a user.
 * Used by admin/system to manually grant achievements.
 *
 * @param userId - User UUID
 * @param achievementId - Achievement UUID
 * @param data - Grant data (progress, metadata, etc.)
 * @returns Promise<UserAchievement>
 *
 * @endpoint POST /api/v1/gamification/users/:userId/achievements/:achievementId
 *
 * @example
 * ```ts
 * const granted = await grantAchievement('user-id', 'achievement-id', {
 *   progress: 1,
 *   max_progress: 1,
 *   is_completed: true
 * });
 * ```
 */
export async function grantAchievement(
  userId: string,
  achievementId: string,
  data: Partial<GrantAchievementDto> = {},
): Promise<UserAchievement> {
  try {
    const response = await apiClient.post<UserAchievement>(
      `/gamification/users/${userId}/achievements/${achievementId}`,
      {
        user_id: userId,
        achievement_id: achievementId,
        ...data,
      },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to grant achievement');
  }
}

/**
 * Claim achievement rewards
 *
 * @description Claims the rewards (ML Coins, XP) for a completed achievement.
 * The achievement must be completed and rewards not yet claimed.
 *
 * @param userId - User UUID
 * @param achievementId - Achievement UUID
 * @returns Promise<UserAchievement>
 *
 * @endpoint POST /api/v1/gamification/users/:userId/achievements/:achievementId/claim
 *
 * @example
 * ```ts
 * const claimed = await claimAchievementRewards('user-id', 'achievement-id');
 * console.log('Rewards claimed:', claimed.rewards_claimed);
 * ```
 */
export async function claimAchievementRewards(
  userId: string,
  achievementId: string,
): Promise<UserAchievement> {
  try {
    const response = await apiClient.post<UserAchievement>(
      `/gamification/users/${userId}/achievements/${achievementId}/claim`,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to claim achievement rewards');
  }
}

/**
 * Update achievement status (Admin)
 *
 * @description Updates the active/inactive status of an achievement.
 * Admin only endpoint.
 *
 * @param id - Achievement UUID
 * @param isActive - New active status
 * @returns Promise<{ success: boolean; achievement: Achievement }>
 *
 * @endpoint PATCH /api/v1/gamification/achievements/:id
 *
 * @example
 * ```ts
 * const result = await updateAchievementStatus('achievement-id', false);
 * console.log('Achievement deactivated:', !result.achievement.is_active);
 * ```
 */
export async function updateAchievementStatus(
  id: string,
  isActive: boolean,
): Promise<{ success: boolean; achievement: Achievement }> {
  try {
    const response = await apiClient.patch<{ success: boolean; achievement: Achievement }>(
      `/gamification/achievements/${id}`,
      { is_active: isActive },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to update achievement status');
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Achievements API namespace
 *
 * @usage
 * ```ts
 * import { achievementsAPI } from '@/services/api/achievementsAPI';
 *
 * // Get all achievements
 * const achievements = await achievementsAPI.getAll();
 *
 * // Get user's achievements
 * const userAchievements = await achievementsAPI.getUserAchievements('user-id');
 *
 * // Claim rewards
 * await achievementsAPI.claimRewards('user-id', 'achievement-id');
 * ```
 */
export const achievementsAPI = {
  // Catalog operations
  getAll: getAllAchievements,
  getById: getAchievementById,

  // User achievements
  getUserAchievements,
  getUserAchievementsWithMeta,
  getSummary: getAchievementSummary,

  // User actions
  claimRewards: claimAchievementRewards,

  // Admin operations
  admin: {
    grant: grantAchievement,
    updateStatus: updateAchievementStatus,
  },
};

export default achievementsAPI;
