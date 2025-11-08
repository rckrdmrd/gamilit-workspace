/**
 * Ranks API Integration
 *
 * API client for rank & progression endpoints including XP management,
 * rank-ups, prestige, multipliers, and progression history.
 */

import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS, FEATURE_FLAGS } from '@/services/api/apiConfig';
import { handleAPIError } from '@/services/api/apiErrorHandler';
import type { ApiResponse } from '@/services/api/apiTypes';
import type {
  UserRankProgress,
  MayaRank,
  AddXPRequest,
  AddXPResponse,
  RankUpEvent,
  PrestigeRequest,
  PrestigeResponse,
  MultiplierBreakdown,
  MultiplierSource,
  ProgressionHistoryEntry,
  XPSource,
} from '../types/ranksTypes';
import { MOCK_USER_NACOM } from '../mockData/ranksMockData';

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

/**
 * Mock add XP
 */
const mockAddXP = async (
  amount: number,
  source: XPSource,
  description?: string
): Promise<AddXPResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    success: true,
    newXP: MOCK_USER_NACOM.currentXP + amount,
    newLevel: MOCK_USER_NACOM.currentLevel,
    leveledUp: false,
    rankedUp: false,
  };
};

// ============================================================================
// RANKS API FUNCTIONS
// ============================================================================

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
      API_ENDPOINTS.ranks.current
    );

    return data.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Get progression statistics
 *
 * @returns User progression stats
 */
export const getProgressionStats = async (): Promise<UserRankProgress> => {
  try {
    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      return await mockGetCurrentRank();
    }

    const { data } = await apiClient.get<ApiResponse<UserRankProgress>>(
      API_ENDPOINTS.ranks.progress
    );

    return data.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Add XP to user
 *
 * @param amount - XP amount to add
 * @param source - Source of XP (exercise, achievement, etc.)
 * @param description - Optional description
 * @param metadata - Optional metadata
 * @returns Add XP response with level/rank up info
 */
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

    const { data } = await apiClient.post<ApiResponse<AddXPResponse>>(
      API_ENDPOINTS.ranks.addXP,
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

/**
 * Trigger level up
 *
 * @returns Updated rank progress
 */
export const levelUp = async (): Promise<UserRankProgress> => {
  try {
    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        ...MOCK_USER_NACOM,
        currentLevel: MOCK_USER_NACOM.currentLevel + 1,
      };
    }

    const { data } = await apiClient.post<ApiResponse<UserRankProgress>>(
      API_ENDPOINTS.ranks.levelUp
    );

    return data.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Trigger rank up
 *
 * @returns Rank up event data
 */
export const rankUp = async (): Promise<RankUpEvent> => {
  try {
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
      API_ENDPOINTS.ranks.rankUp
    );

    return data.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Prestige user (reset with bonuses)
 *
 * @param confirmed - Confirmation flag
 * @returns Prestige response
 */
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

    const { data } = await apiClient.post<ApiResponse<PrestigeResponse>>(
      API_ENDPOINTS.ranks.prestige,
      { confirmed }
    );

    return data.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Get progression history
 *
 * @param limit - Number of entries to return
 * @returns Progression history entries
 */
export const getProgressionHistory = async (
  limit?: number
): Promise<ProgressionHistoryEntry[]> => {
  try {
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
      API_ENDPOINTS.ranks.history,
      { params: { limit } }
    );

    return data.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Get multiplier breakdown
 *
 * @returns Current multiplier breakdown
 */
export const getMultipliers = async (): Promise<MultiplierBreakdown> => {
  try {
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

    const { data } = await apiClient.get<ApiResponse<MultiplierBreakdown>>(
      API_ENDPOINTS.ranks.multipliers
    );

    return data.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Add multiplier source
 *
 * @param source - Multiplier source to add
 * @returns Updated multiplier breakdown
 */
export const addMultiplier = async (
  source: MultiplierSource
): Promise<MultiplierBreakdown> => {
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
        sources: [source],
        total: 1.0 * source.value,
        hasExpiringSoon: false,
        expiringSoon: [],
      };
    }

    const { data } = await apiClient.post<ApiResponse<MultiplierBreakdown>>(
      API_ENDPOINTS.ranks.addMultiplier,
      source
    );

    return data.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Remove multiplier source
 *
 * @param type - Multiplier type to remove
 * @returns Updated multiplier breakdown
 */
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

    const { data } = await apiClient.delete<ApiResponse<MultiplierBreakdown>>(
      API_ENDPOINTS.ranks.removeMultiplier(type)
    );

    return data.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  getCurrentRank,
  getProgressionStats,
  addXP,
  levelUp,
  rankUp,
  prestige,
  getProgressionHistory,
  getMultipliers,
  addMultiplier,
  removeMultiplier,
};
