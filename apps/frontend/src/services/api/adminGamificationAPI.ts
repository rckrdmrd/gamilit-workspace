/**
 * Admin Gamification API Integration
 *
 * API client for admin gamification parameter management.
 * Handles configuration of XP, coins, ranks, and reward settings.
 *
 * @module adminGamificationAPI
 * @version 1.0.0
 * @date 2026-01-13
 */

import { apiClient } from '@/services/api/apiClient';
import { handleAPIError } from './apiErrorHandler';
import { API_ENDPOINTS } from '@/config/api.config';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * XP Configuration
 */
export interface XpConfig {
  base_xp_per_exercise: number;
  streak_multiplier: number;
  difficulty_multipliers: {
    easy: number;
    medium: number;
    hard: number;
  };
  time_bonus_threshold: number;
  time_bonus_percentage: number;
  perfect_score_bonus: number;
}

/**
 * ML Coins Configuration
 */
export interface CoinsConfig {
  base_coins_per_exercise: number;
  daily_login_bonus: number;
  streak_bonus_per_day: number;
  achievement_rewards: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  mission_rewards: {
    daily: number;
    weekly: number;
    special: number;
  };
}

/**
 * Maya Rank Configuration
 */
export interface MayaRankConfig {
  name: string;
  display_name: string;
  min_xp: number;
  max_xp: number;
  xp_multiplier: number;
  coin_multiplier: number;
  perks: string[];
  badge_url?: string;
  color: string;
}

/**
 * Gamification Parameters
 */
export interface GamificationParameters {
  id: string;
  xp: XpConfig;
  coins: CoinsConfig;
  ranks: MayaRankConfig[];
  leaderboard: {
    refresh_interval: number;
    entries_per_page: number;
    show_inactive_users: boolean;
  };
  achievements: {
    enabled: boolean;
    notification_enabled: boolean;
    auto_claim: boolean;
  };
  missions: {
    daily_count: number;
    weekly_count: number;
    auto_generate: boolean;
    expiry_hours: number;
  };
  updated_at: string;
  updated_by?: string;
}

/**
 * Update Parameters DTO
 */
export interface UpdateParametersDto {
  xp?: Partial<XpConfig>;
  coins?: Partial<CoinsConfig>;
  leaderboard?: Partial<GamificationParameters['leaderboard']>;
  achievements?: Partial<GamificationParameters['achievements']>;
  missions?: Partial<GamificationParameters['missions']>;
}

/**
 * Update Rank DTO
 */
export interface UpdateRankDto {
  display_name?: string;
  min_xp?: number;
  max_xp?: number;
  xp_multiplier?: number;
  coin_multiplier?: number;
  perks?: string[];
  badge_url?: string;
  color?: string;
}

/**
 * Parameter Change Preview
 */
export interface ParameterChangePreview {
  affected_users: number;
  rank_changes: {
    user_id: string;
    username: string;
    current_rank: string;
    new_rank: string;
  }[];
  economy_impact: {
    total_xp_change: number;
    total_coins_change: number;
  };
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get gamification parameters
 *
 * @description Fetches current gamification configuration
 *
 * @returns Promise<GamificationParameters>
 *
 * @endpoint GET /api/v1/admin/gamification/parameters
 */
export async function getParameters(): Promise<GamificationParameters> {
  try {
    const response = await apiClient.get<GamificationParameters>(
      '/admin/gamification/parameters',
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch gamification parameters');
  }
}

/**
 * Update gamification parameters
 *
 * @description Updates gamification configuration
 *
 * @param data - Parameters to update
 * @returns Promise<GamificationParameters>
 *
 * @endpoint PUT /api/v1/admin/gamification/parameters
 */
export async function updateParameters(
  data: UpdateParametersDto,
): Promise<GamificationParameters> {
  try {
    const response = await apiClient.put<GamificationParameters>(
      '/admin/gamification/parameters',
      data,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to update gamification parameters');
  }
}

/**
 * Get all Maya ranks
 *
 * @description Fetches all configured Maya ranks
 *
 * @returns Promise<MayaRankConfig[]>
 *
 * @endpoint GET /api/v1/admin/gamification/maya-ranks
 */
export async function getMayaRanks(): Promise<MayaRankConfig[]> {
  try {
    const response = await apiClient.get<MayaRankConfig[]>('/admin/gamification/maya-ranks');
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch Maya ranks');
  }
}

/**
 * Update Maya rank
 *
 * @description Updates a specific Maya rank configuration
 *
 * @param rankName - Internal rank name (e.g., 'ajaw', 'nacom')
 * @param data - Rank configuration to update
 * @returns Promise<MayaRankConfig>
 *
 * @endpoint PUT /api/v1/admin/gamification/maya-ranks/:rankName
 */
export async function updateMayaRank(
  rankName: string,
  data: UpdateRankDto,
): Promise<MayaRankConfig> {
  try {
    const response = await apiClient.put<MayaRankConfig>(
      `/admin/gamification/maya-ranks/${rankName}`,
      data,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to update Maya rank');
  }
}

/**
 * Preview parameter changes
 *
 * @description Previews the impact of parameter changes before applying
 *
 * @param data - Proposed parameter changes
 * @returns Promise<ParameterChangePreview>
 *
 * @endpoint POST /api/v1/admin/gamification/preview-changes
 */
export async function previewChanges(
  data: UpdateParametersDto,
): Promise<ParameterChangePreview> {
  try {
    const response = await apiClient.post<ParameterChangePreview>(
      API_ENDPOINTS.admin.gamification.previewChanges,
      data,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to preview changes');
  }
}

/**
 * Restore default parameters
 *
 * @description Resets all gamification parameters to default values
 *
 * @returns Promise<GamificationParameters>
 *
 * @endpoint POST /api/v1/admin/gamification/restore-defaults
 */
export async function restoreDefaults(): Promise<GamificationParameters> {
  try {
    const response = await apiClient.post<GamificationParameters>(
      API_ENDPOINTS.admin.gamification.restoreDefaults,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to restore default parameters');
  }
}

/**
 * Get gamification settings
 *
 * @description Fetches gamification settings (alias for parameters)
 *
 * @returns Promise<GamificationParameters>
 *
 * @endpoint GET /api/v1/admin/gamification/settings
 */
export async function getSettings(): Promise<GamificationParameters> {
  try {
    const response = await apiClient.get<GamificationParameters>(
      API_ENDPOINTS.admin.gamification.settings,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch gamification settings');
  }
}

/**
 * Update gamification settings
 *
 * @description Updates gamification settings (alias for parameters)
 *
 * @param data - Settings to update
 * @returns Promise<GamificationParameters>
 *
 * @endpoint PUT /api/v1/admin/gamification/settings
 */
export async function updateSettings(
  data: UpdateParametersDto,
): Promise<GamificationParameters> {
  try {
    const response = await apiClient.put<GamificationParameters>(
      API_ENDPOINTS.admin.gamification.updateSettings,
      data,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to update gamification settings');
  }
}

/**
 * Get parameter history
 *
 * @description Fetches history of parameter changes for audit
 *
 * @param limit - Number of entries to fetch
 * @returns Promise<{ changes: Array<{ timestamp: string; changed_by: string; changes: unknown }> }>
 *
 * @endpoint GET /api/v1/admin/gamification/parameters/history
 */
export async function getParameterHistory(
  limit: number = 50,
): Promise<{ changes: Array<{ timestamp: string; changed_by: string; changes: unknown }> }> {
  try {
    const response = await apiClient.get<{
      changes: Array<{ timestamp: string; changed_by: string; changes: unknown }>;
    }>('/admin/gamification/parameters/history', { params: { limit } });
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch parameter history');
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Admin Gamification API namespace
 *
 * @usage
 * ```ts
 * import { adminGamificationAPI } from '@/services/api/adminGamificationAPI';
 *
 * // Get current parameters
 * const params = await adminGamificationAPI.getParameters();
 *
 * // Update XP configuration
 * await adminGamificationAPI.updateParameters({
 *   xp: { base_xp_per_exercise: 15 }
 * });
 *
 * // Update Maya rank
 * await adminGamificationAPI.updateMayaRank('ajaw', {
 *   xp_multiplier: 1.5
 * });
 *
 * // Preview changes before applying
 * const preview = await adminGamificationAPI.previewChanges({
 *   xp: { base_xp_per_exercise: 20 }
 * });
 * ```
 */
export const adminGamificationAPI = {
  // Parameters
  getParameters,
  updateParameters,
  previewChanges,
  restoreDefaults,

  // Settings (alias)
  getSettings,
  updateSettings,

  // Maya Ranks
  getMayaRanks,
  updateMayaRank,

  // Audit
  getHistory: getParameterHistory,
};

export default adminGamificationAPI;
