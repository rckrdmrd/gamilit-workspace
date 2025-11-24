/**
 * Gamification API Integration
 *
 * API client for gamification features including user stats, achievements,
 * ML Coins, ranks, and leaderboards.
 */

import { apiClient } from '@/services/api/apiClient';
import { handleAPIError } from './apiErrorHandler';
import type { ApiResponse } from './apiTypes';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * User Gamification Summary
 *
 * Consolidated gamification data for Admin/Teacher portals
 */
export interface UserGamificationSummary {
  userId: string;
  level: number;
  totalXP: number;
  mlCoins: number;
  rank: string;
  rankColor?: string;
  progressToNextLevel: number;
  xpToNextLevel: number;
  achievements: string[];
  totalAchievements: number;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get user gamification summary
 *
 * @description Fetches consolidated gamification data for a user.
 * Used in Admin/Teacher portals to display user's level, XP, coins, rank, etc.
 *
 * @param userId - User UUID
 * @returns Promise<UserGamificationSummary>
 *
 * @endpoint GET /api/v1/gamification/users/:userId/summary
 *
 * @example
 * ```ts
 * const summary = await getUserGamificationSummary('550e8400-e29b-41d4-a716-446655440000');
 * console.log(summary.level, summary.rank, summary.mlCoins);
 * ```
 */
export async function getUserGamificationSummary(
  userId: string
): Promise<UserGamificationSummary> {
  try {
    const response = await apiClient.get<UserGamificationSummary>(
      `/v1/gamification/users/${userId}/summary`
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch user gamification summary');
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Gamification API namespace
 *
 * @usage
 * ```ts
 * import { gamificationAPI } from '@/services/api/gamificationAPI';
 *
 * const summary = await gamificationAPI.getUserSummary('user-id');
 * ```
 */
export const gamificationAPI = {
  getUserSummary: getUserGamificationSummary,
};

export default gamificationAPI;
