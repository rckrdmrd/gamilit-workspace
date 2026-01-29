/**
 * Ranks API Integration
 *
 * API client for rank & progression endpoints including XP management,
 * rank-ups, prestige, multipliers, and progression history.
 *
 * IMPORTANT: User ID Requirements
 * ================================
 * Most functions in this API require a userId parameter. This should be obtained
 * from the useAuth() hook in your component:
 *
 * @example
 * ```typescript
 * import { useAuth } from '@/shared/hooks/useAuth';
 * import { getProgressionStats } from './ranksAPI';
 *
 * function MyComponent() {
 *   const { user } = useAuth();
 *
 *   useEffect(() => {
 *     if (user?.id) {
 *       getProgressionStats(user.id).then(stats => {
 *         // Handle stats
 *       });
 *     }
 *   }, [user]);
 * }
 * ```
 *
 * Functions that require userId:
 * - getProgressionStats(userId)
 * - rankUp(userId)
 * - getProgressionHistory(userId, limit?)
 * - getMultipliers(userId)
 * - addMultiplier(source, userId)
 *
 * Functions that DON'T require userId (use JWT):
 * - getCurrentRank() - uses current authenticated user from JWT
 */

import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS, FEATURE_FLAGS } from '@/config/api.config';
import { handleAPIError } from '@/services/api/apiErrorHandler';
import type { ApiResponse } from '@/services/api/apiTypes';
import type {
  UserRankProgress,
  RankUpEvent,
  MultiplierBreakdown,
  MultiplierSource,
  ProgressionHistoryEntry,
} from '../types/ranksTypes';
import { MOCK_USER_NACOM } from '../mockData/ranksMockData';

// ============================================================================
// RESPONSE MAPPERS (snake_case -> camelCase)
// ============================================================================

/**
 * Backend response type for user progress (snake_case)
 * @task TASK-2026-01-17-002 - FASE 2
 */
interface BackendUserProgressResponse {
  user_id: string;
  current_rank: string;
  next_rank: string | null;
  level: number;
  total_xp: number;
  current_xp: number;
  xp_to_next_level: number;
  ml_coins_earned: number;
  rank_progress_percentage: number;
  xp_required_for_next_rank: number;
  xp_remaining_for_next_rank: number;
  can_rank_up: boolean;
  is_max_rank: boolean;
  prestige_level: number;
  can_prestige: boolean;
  multiplier: number;
  activity_streak: number;
  last_activity_at: string | null;
  last_rank_up: string | null;
  ml_coins_bonus_on_promotion: number;
}

/**
 * Backend response type for multiplier breakdown (snake_case)
 */
interface BackendMultiplierSource {
  type: string;
  name: string;
  value: number;
  expires_at?: string;
  is_permanent: boolean;
  description?: string;
  icon?: string;
}

interface BackendMultiplierResponse {
  user_id: string;
  base: number;
  rank: BackendMultiplierSource;
  sources: BackendMultiplierSource[];
  total: number;
  has_expiring_soon: boolean;
  expiring_soon: BackendMultiplierSource[];
}

/**
 * Map backend user progress response to frontend UserRankProgress
 * @task TASK-2026-01-17-002 - FASE 2
 */
const mapUserProgressResponse = (response: BackendUserProgressResponse): UserRankProgress => ({
  currentRank: response.current_rank as UserRankProgress['currentRank'],
  nextRank: response.next_rank as UserRankProgress['nextRank'],
  currentLevel: response.level,
  currentXP: response.current_xp,
  xpToNextLevel: response.xp_to_next_level,
  totalXP: response.total_xp,
  mlCoinsEarned: response.ml_coins_earned,
  prestigeLevel: response.prestige_level,
  multiplier: response.multiplier,
  lastRankUp: response.last_rank_up ? new Date(response.last_rank_up) : new Date(),
  activityStreak: response.activity_streak,
  lastActivityDate: response.last_activity_at ? new Date(response.last_activity_at) : new Date(),
  canRankUp: response.can_rank_up,
  canPrestige: response.can_prestige,
});

/**
 * Map backend multiplier source to frontend MultiplierSource
 */
const mapMultiplierSource = (source: BackendMultiplierSource): MultiplierSource => ({
  type: source.type as MultiplierSource['type'],
  name: source.name,
  value: source.value,
  expiresAt: source.expires_at ? new Date(source.expires_at) : undefined,
  isPermanent: source.is_permanent,
  description: source.description,
  icon: source.icon,
});

/**
 * Map backend multiplier response to frontend MultiplierBreakdown
 * @task TASK-2026-01-17-002 - FASE 2
 */
const mapMultiplierResponse = (response: BackendMultiplierResponse): MultiplierBreakdown => ({
  base: response.base,
  rank: mapMultiplierSource(response.rank),
  sources: response.sources.map(mapMultiplierSource),
  total: response.total,
  hasExpiringSoon: response.has_expiring_soon,
  expiringSoon: response.expiring_soon.map(mapMultiplierSource),
});

// ============================================================================
// MOCK DATA (for development)
// ============================================================================

/**
 * Mock get current rank progress
 */
const mockGetCurrentRank = async (): Promise<UserRankProgress> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return MOCK_USER_NACOM;
};

// ============================================================================
// TYPES FOR RANK CONFIG
// ============================================================================

/**
 * Rank metadata from backend
 */
export interface RankMetadata {
  rank: string;
  name: string;
  description: string;
  xp_min: number;
  xp_max: number; // -1 means Infinity
  ml_coins_bonus: number;
  order: number;
}

// ============================================================================
// RANKS API FUNCTIONS
// ============================================================================

/**
 * Get all ranks configuration from backend
 * P0-004: New function to fetch rank thresholds dynamically
 *
 * @returns Array of rank metadata with XP thresholds
 */
export const getRanksConfig = async (): Promise<RankMetadata[]> => {
  try {
    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      // Mock data with v2.1 thresholds
      return [
        { rank: 'Ajaw', name: 'Ajaw', description: 'Señor', xp_min: 0, xp_max: 499, ml_coins_bonus: 0, order: 1 },
        { rank: 'Nacom', name: 'Nacom', description: 'Capitán de Guerra', xp_min: 500, xp_max: 999, ml_coins_bonus: 100, order: 2 },
        { rank: "Ah K'in", name: "Ah K'in", description: 'Sacerdote del Sol', xp_min: 1000, xp_max: 1499, ml_coins_bonus: 250, order: 3 },
        { rank: 'Halach Uinic', name: 'Halach Uinic', description: 'Hombre Verdadero', xp_min: 1500, xp_max: 1899, ml_coins_bonus: 500, order: 4 },
        { rank: "K'uk'ulkan", name: "K'uk'ulkan", description: 'Serpiente Emplumada', xp_min: 1900, xp_max: -1, ml_coins_bonus: 1000, order: 5 },
      ];
    }

    const { data } = await apiClient.get<RankMetadata[]>(
      '/gamification/ranks',
    );

    // Handle both direct array response and wrapped response
    return Array.isArray(data) ? data : ((data as { data?: RankMetadata[] }).data || []);
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Get current rank progress
 *
 * @returns Current user rank progress data
 */
export const getCurrentRank = async (): Promise<UserRankProgress> => {
  try {
    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      return await mockGetCurrentRank();
    }

    const { data } = await apiClient.get<ApiResponse<UserRankProgress>>(
      API_ENDPOINTS.ranks.current,
    );

    return data.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Get progression statistics
 *
 * @task TASK-2026-01-17-002 - FASE 2: Updated to use new /progress endpoint with mapper
 * @param userId - User ID (REQUIRED - get from useAuth hook)
 * @returns User progression stats
 * @throws Error if userId is not provided
 *
 * @example
 * const { user } = useAuth();
 * const stats = await getProgressionStats(user.id);
 */
export const getProgressionStats = async (userId: string): Promise<UserRankProgress> => {
  try {
    if (!userId) {
      throw new Error('userId is required. Get it from useAuth() hook.');
    }

    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      return await mockGetCurrentRank();
    }

    // TASK-2026-01-17-002: Use new /progress endpoint that returns complete data
    const { data } = await apiClient.get<BackendUserProgressResponse>(
      API_ENDPOINTS.ranks.rankProgress(userId),
    );

    // Map snake_case response to camelCase frontend type
    return mapUserProgressResponse(data);
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Add XP to user
 *
 * ⚠️ NOT IMPLEMENTED - Backend endpoint does not exist in ranks controller
 * XP is managed through user_stats module, not ranks module
 *
 * @param amount - XP amount to add
 * @param source - Source of XP (exercise, achievement, etc.)
 * @param description - Optional description
 * @param metadata - Optional metadata
 * @returns Add XP response with level/rank up info
 */
/*
export const addXP = async (
  amount: number,
  source: XPSource,
  description?: string,
  metadata?: Record<string, unknown>
): Promise<AddXPResponse> => {
  try {
    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      return await mockAddXP(amount, source, description);
    }

    // TODO: Backend needs to implement this endpoint or use user_stats module
    const { data } = await apiClient.post<ApiResponse<AddXPResponse>>(
      '/gamification/user-stats/xp/add', // Placeholder - needs backend implementation
      {
        amount,
        source,
        description,
        metadata,
      }
    );

    return data.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};
*/

/**
 * Trigger level up
 *
 * ⚠️ NOT IMPLEMENTED - Backend endpoint does not exist
 * Level ups are automatic when XP is added through user_stats module
 *
 * @returns Updated rank progress
 */
/*
export const levelUp = async (): Promise<UserRankProgress> => {
  try {
    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        ...MOCK_USER_NACOM,
        currentLevel: MOCK_USER_NACOM.currentLevel + 1,
      };
    }

    // TODO: Backend handles level ups automatically - no manual trigger needed
    const { data } = await apiClient.post<ApiResponse<UserRankProgress>>(
      '/gamification/user-stats/level-up', // Placeholder - backend auto-handles this
    );

    return data.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};
*/

/**
 * Trigger rank up (promote user to next rank)
 *
 * @param userId - User ID (REQUIRED - get from useAuth hook)
 * @returns Rank up event data
 * @throws Error if userId is not provided
 *
 * @example
 * const { user } = useAuth();
 * const result = await rankUp(user.id);
 */
export const rankUp = async (userId: string): Promise<RankUpEvent> => {
  try {
    if (!userId) {
      throw new Error('userId is required. Get it from useAuth() hook.');
    }

    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        fromRank: 'Nacom',
        toRank: 'Ajaw',
        timestamp: new Date(),
        newBenefits: ['Intermediate exercises', 'Level 2 hints', '1.25x multiplier'],
        newMultiplier: 1.25,
        isPrestige: false,
      };
    }

    const { data } = await apiClient.post<ApiResponse<RankUpEvent>>(
      API_ENDPOINTS.ranks.promote(userId),
    );

    return data.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Prestige user (reset with bonuses)
 *
 * ⚠️ NOT IMPLEMENTED - Backend endpoint does not exist
 * Prestige system not yet implemented in backend
 *
 * @param confirmed - Confirmation flag
 * @returns Prestige response
 */
/*
export const prestige = async (confirmed: boolean): Promise<PrestigeResponse> => {
  try {
    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return {
        success: true,
        prestigeLevel: 1,
        newRank: 'Nacom',
        bonuses: {
          level: 1,
          bonusMultiplier: 0.1,
          unlockedFeatures: ['Prestige badge', 'Exclusive cosmetics'],
          cosmetics: ['Bronze star', 'Prestige border'],
          abilities: ['Streak protection'],
          badge: 'bronze-prestige',
          color: 'from-amber-500 to-orange-600',
        },
        newMultiplier: 1.1,
      };
    }

    // TODO: Backend needs to implement prestige system
    const { data } = await apiClient.post<ApiResponse<PrestigeResponse>>(
      '/gamification/ranks/prestige', // Placeholder - needs backend implementation
      { confirmed }
    );

    return data.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};
*/

/**
 * Get progression history
 *
 * @param userId - User ID (REQUIRED - get from useAuth hook)
 * @param limit - Number of entries to return (optional)
 * @returns Progression history entries
 * @throws Error if userId is not provided
 *
 * @example
 * const { user } = useAuth();
 * const history = await getProgressionHistory(user.id, 10);
 */
export const getProgressionHistory = async (
  userId: string,
  limit?: number,
): Promise<ProgressionHistoryEntry[]> => {
  try {
    if (!userId) {
      throw new Error('userId is required. Get it from useAuth() hook.');
    }

    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return [
        {
          id: '1',
          type: 'level_up',
          timestamp: new Date(),
          title: 'Nivel 5 alcanzado',
          description: 'Has subido al nivel 5. ¡Sigue así!',
          rank: 'Nacom',
          xpSnapshot: 500,
          levelSnapshot: 5,
          multiplierSnapshot: 1.0,
        },
      ];
    }

    const { data } = await apiClient.get<ApiResponse<ProgressionHistoryEntry[]>>(
      API_ENDPOINTS.ranks.history(userId),
      { params: { limit } },
    );

    return data.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Get multiplier breakdown
 *
 * @task TASK-2026-01-17-002 - FASE 2: Updated to use new /multipliers endpoint with mapper
 * @param userId - User ID (REQUIRED - get from useAuth hook)
 * @returns Current multiplier breakdown
 * @throws Error if userId is not provided
 *
 * @example
 * const { user } = useAuth();
 * const multipliers = await getMultipliers(user.id);
 */
export const getMultipliers = async (userId: string): Promise<MultiplierBreakdown> => {
  try {
    if (!userId) {
      throw new Error('userId is required. Get it from useAuth() hook.');
    }

    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        base: 1.0,
        rank: {
          type: 'rank',
          name: 'Nacom',
          value: 1.0,
          isPermanent: true,
          description: 'Multiplicador base del rango',
        },
        sources: [],
        total: 1.0,
        hasExpiringSoon: false,
        expiringSoon: [],
      };
    }

    // TASK-2026-01-17-002: Use new /multipliers endpoint that returns complete breakdown
    const { data } = await apiClient.get<BackendMultiplierResponse>(
      API_ENDPOINTS.ranks.multipliers(userId),
    );

    // Map snake_case response to camelCase frontend type
    return mapMultiplierResponse(data);
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Add multiplier source
 *
 * ⚠️ PARTIAL IMPLEMENTATION - Backend may not have dedicated endpoint for adding multipliers
 * Multipliers are typically managed through rank progression and achievements
 *
 * @param source - Multiplier source to add
 * @param userId - User ID (REQUIRED - get from useAuth hook)
 * @returns Updated multiplier breakdown
 * @throws Error if userId is not provided
 *
 * @example
 * const { user } = useAuth();
 * const multiplierSource = { type: 'achievement', value: 1.1, ... };
 * const result = await addMultiplier(multiplierSource, user.id);
 */
export const addMultiplier = async (
  source: MultiplierSource,
  userId: string,
): Promise<MultiplierBreakdown> => {
  try {
    if (!userId) {
      throw new Error('userId is required. Get it from useAuth() hook.');
    }

    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        base: 1.0,
        rank: {
          type: 'rank',
          name: 'Nacom',
          value: 1.0,
          isPermanent: true,
          description: 'Multiplicador base del rango',
        },
        sources: [source],
        total: 1.0 * source.value,
        hasExpiringSoon: false,
        expiringSoon: [],
      };
    }

    // TODO: Verify if backend has dedicated endpoint for adding multipliers
    // Currently using multipliers endpoint (may need adjustment)
    const { data } = await apiClient.post<ApiResponse<MultiplierBreakdown>>(
      API_ENDPOINTS.ranks.multipliers(userId),
      source,
    );

    return data.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Remove multiplier source
 *
 * ⚠️ NOT IMPLEMENTED - Backend endpoint does not exist
 * Multiplier removal is typically handled automatically through expiration
 *
 * @param type - Multiplier type to remove
 * @returns Updated multiplier breakdown
 */
/*
export const removeMultiplier = async (type: string): Promise<MultiplierBreakdown> => {
  try {
    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        base: 1.0,
        rank: {
          type: 'rank',
          name: 'Nacom',
          value: 1.0,
          isPermanent: true,
          description: 'Multiplicador base del rango',
        },
        sources: [],
        total: 1.0,
        hasExpiringSoon: false,
        expiringSoon: [],
      };
    }

    // TODO: Backend needs to implement multiplier removal endpoint
    const { data } = await apiClient.delete<ApiResponse<MultiplierBreakdown>>(
      `/gamification/ranks/multipliers/${type}`, // Placeholder - needs backend implementation
    );

    return data.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};
*/

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  getRanksConfig, // P0-004: New - Get all ranks configuration
  getCurrentRank,
  getProgressionStats,
  // addXP, // Commented out - No backend endpoint (XP managed by user_stats)
  // levelUp, // Commented out - No backend endpoint (automatic)
  rankUp,
  // prestige, // Commented out - No backend endpoint (not implemented yet)
  getProgressionHistory,
  getMultipliers,
  addMultiplier,
  // removeMultiplier, // Commented out - No backend endpoint
};
