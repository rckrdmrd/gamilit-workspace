/**
 * Gamification API Integration
 *
 * API client for gamification features including user stats, achievements,
 * ML Coins, ranks, and leaderboards.
 */

import { apiClient } from '@/services/api/apiClient';
import { handleAPIError } from './apiErrorHandler';

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

/**
 * Rank Metadata
 * Information about a Maya rank configuration
 */
export interface RankMetadata {
  rank: string;
  name: string;
  description: string;
  xp_min: number;
  xp_max: number;
  ml_coins_bonus: number;
  order: number;
}

/**
 * User Rank
 * Current rank record for a user
 */
export interface UserRank {
  id: string;
  user_id: string;
  rank: string;
  is_current: boolean;
  achieved_at: string;
  created_at: string;
  updated_at: string;
}

/**
 * Rank Progress
 * Progress towards the next rank
 */
export interface RankProgress {
  currentRank: string;
  nextRank: string | null;
  currentXP: number;
  xpForCurrentRank: number;
  xpForNextRank: number;
  progressPercentage: number;
  xpRemaining: number;
  isMaxRank: boolean;
}

/**
 * Create User Rank DTO (Admin)
 */
export interface CreateUserRankDto {
  user_id: string;
  rank: string;
  is_current?: boolean;
}

/**
 * Update User Rank DTO (Admin)
 */
export interface UpdateUserRankDto {
  rank?: string;
  is_current?: boolean;
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
export async function getUserGamificationSummary(userId: string): Promise<UserGamificationSummary> {
  try {
    const response = await apiClient.get<UserGamificationSummary>(
      `/gamification/users/${userId}/summary`,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch user gamification summary');
  }
}

// ============================================================================
// RANKS API FUNCTIONS
// ============================================================================

/**
 * List all available ranks
 *
 * @description Fetches all Maya ranks with their metadata (XP requirements, bonuses, etc.)
 * @returns Promise<RankMetadata[]>
 * @endpoint GET /api/v1/gamification/ranks
 */
export async function listRanks(): Promise<RankMetadata[]> {
  try {
    const response = await apiClient.get<RankMetadata[]>('/gamification/ranks');
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch ranks list');
  }
}

/**
 * Get current user's rank
 *
 * @description Fetches the current rank of the authenticated user
 * @returns Promise<UserRank>
 * @endpoint GET /api/v1/gamification/ranks/current
 */
export async function getCurrentRank(): Promise<UserRank> {
  try {
    const response = await apiClient.get<UserRank>('/gamification/ranks/current');
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch current rank');
  }
}

/**
 * Get user's rank progress
 *
 * @description Calculates and returns progress towards the next rank
 * @param userId - User UUID
 * @returns Promise<RankProgress>
 * @endpoint GET /api/v1/gamification/ranks/users/:userId/rank-progress
 */
export async function getRankProgress(userId: string): Promise<RankProgress> {
  try {
    const response = await apiClient.get<RankProgress>(
      `/gamification/ranks/users/${userId}/rank-progress`,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch rank progress');
  }
}

/**
 * Get user's rank history
 *
 * @description Fetches the complete history of ranks achieved by the user
 * @param userId - User UUID
 * @returns Promise<UserRank[]>
 * @endpoint GET /api/v1/gamification/ranks/users/:userId/rank-history
 */
export async function getRankHistory(userId: string): Promise<UserRank[]> {
  try {
    const response = await apiClient.get<UserRank[]>(
      `/gamification/ranks/users/${userId}/rank-history`,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch rank history');
  }
}

/**
 * Check promotion eligibility
 *
 * @description Verifies if the user meets requirements for rank promotion
 * @param userId - User UUID
 * @returns Promise<{ eligible: boolean }>
 * @endpoint GET /api/v1/gamification/ranks/check-promotion/:userId
 */
export async function checkPromotionEligibility(userId: string): Promise<{ eligible: boolean }> {
  try {
    const response = await apiClient.get<{ eligible: boolean }>(
      `/gamification/ranks/check-promotion/${userId}`,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to check promotion eligibility');
  }
}

/**
 * Promote user to next rank
 *
 * @description Promotes the user to the next Maya rank if eligible
 * @param userId - User UUID
 * @returns Promise<UserRank>
 * @endpoint POST /api/v1/gamification/ranks/promote/:userId
 */
export async function promoteUser(userId: string): Promise<UserRank> {
  try {
    const response = await apiClient.post<UserRank>(
      `/gamification/ranks/promote/${userId}`,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to promote user');
  }
}

/**
 * Get rank details by ID
 *
 * @description Fetches detailed information about a specific rank record
 * @param rankId - Rank record UUID
 * @returns Promise<UserRank>
 * @endpoint GET /api/v1/gamification/ranks/:id
 */
export async function getRankDetails(rankId: string): Promise<UserRank> {
  try {
    const response = await apiClient.get<UserRank>(`/gamification/ranks/${rankId}`);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch rank details');
  }
}

// ============================================================================
// ADMIN RANKS API FUNCTIONS
// ============================================================================

/**
 * Create rank record (Admin)
 *
 * @description Manually creates a new rank record. Admin only.
 * @param dto - CreateUserRankDto with user_id and rank
 * @returns Promise<UserRank>
 * @endpoint POST /api/v1/gamification/ranks/admin/ranks
 */
export async function createRank(dto: CreateUserRankDto): Promise<UserRank> {
  try {
    const response = await apiClient.post<UserRank>('/gamification/ranks/admin/ranks', dto);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to create rank');
  }
}

/**
 * Update rank record (Admin)
 *
 * @description Updates an existing rank record. Admin only.
 * @param rankId - Rank record UUID
 * @param dto - UpdateUserRankDto with fields to update
 * @returns Promise<UserRank>
 * @endpoint PUT /api/v1/gamification/ranks/admin/ranks/:id
 */
export async function updateRank(rankId: string, dto: UpdateUserRankDto): Promise<UserRank> {
  try {
    const response = await apiClient.put<UserRank>(
      `/gamification/ranks/admin/ranks/${rankId}`,
      dto,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to update rank');
  }
}

/**
 * Delete rank record (Admin)
 *
 * @description Deletes a rank record. Cannot delete current rank. Admin only.
 * @param rankId - Rank record UUID
 * @returns Promise<void>
 * @endpoint DELETE /api/v1/gamification/ranks/admin/ranks/:id
 */
export async function deleteRank(rankId: string): Promise<void> {
  try {
    await apiClient.delete(`/gamification/ranks/admin/ranks/${rankId}`);
  } catch (error) {
    throw handleAPIError(error, 'Failed to delete rank');
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
 * const ranks = await gamificationAPI.ranks.list();
 * const progress = await gamificationAPI.ranks.getProgress('user-id');
 * ```
 */
export const gamificationAPI = {
  getUserSummary: getUserGamificationSummary,

  // Ranks sub-namespace
  ranks: {
    list: listRanks,
    getCurrent: getCurrentRank,
    getProgress: getRankProgress,
    getHistory: getRankHistory,
    checkPromotion: checkPromotionEligibility,
    promote: promoteUser,
    getDetails: getRankDetails,

    // Admin operations
    admin: {
      create: createRank,
      update: updateRank,
      delete: deleteRank,
    },
  },
};

/**
 * Standalone Ranks API for direct imports
 *
 * @usage
 * ```ts
 * import { ranksAPI } from '@/services/api/gamificationAPI';
 *
 * const progress = await ranksAPI.getProgress('user-id');
 * ```
 */
export const ranksAPI = {
  list: listRanks,
  getCurrent: getCurrentRank,
  getProgress: getRankProgress,
  getHistory: getRankHistory,
  checkPromotion: checkPromotionEligibility,
  promote: promoteUser,
  getDetails: getRankDetails,
  admin: {
    create: createRank,
    update: updateRank,
    delete: deleteRank,
  },
};

export default gamificationAPI;
