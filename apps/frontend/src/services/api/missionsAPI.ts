/**
 * Missions API
 *
 * API client for missions endpoints.
 * Phase 4 implementation.
 *
 * @deprecated Este módulo usa una definición de Mission legacy con `objective` singular.
 * Para nuevas implementaciones, usar:
 * - Tipos: @/features/gamification/missions/types/missionsTypes.ts
 * - Transformer: @/features/gamification/missions/utils/missionTransformer.ts
 *
 * Deuda técnica: Consolidar ambos sistemas en el tipo canónico con `objectives[]`.
 * Ref: PLAN-IMPLEMENTACION-CORRECCIONES-2025-11-26
 * @see apps/frontend/src/features/missions/MIGRATION-GUIDE.md
 */

import { apiClient } from '@/services/api/apiClient';
import { handleAPIError } from '@/services/api/apiErrorHandler';
import { API_ENDPOINTS } from '@/config/api.config';

/**
 * @deprecated Usar Mission de @/features/gamification/missions/types/missionsTypes.ts
 */
export interface Mission {
  id: string;
  userId: string;
  type: 'daily' | 'weekly' | 'special';
  category:
    | 'exercises'
    | 'modules'
    | 'score'
    | 'streak'
    | 'achievements'
    | 'social'
    | 'coins'
    | 'xp';
  title: string;
  description: string;
  objective: {
    type: string;
    target: number;
    current: number;
  };
  rewards: {
    mlCoins: number;
    xp: number;
    items?: string[];
  };
  status: 'active' | 'completed' | 'claimed' | 'expired';
  expiresAt: string;
  createdAt: string;
  completedAt?: string;
  claimedAt?: string;
}

export const missionsAPI = {
  /**
   * Get 3 daily missions (auto-generates if needed)
   */
  getDailyMissions: async (): Promise<Mission[]> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.gamification.missions.daily);
      return response.data.data.missions;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  /**
   * Get 5 weekly missions (auto-generates if needed)
   */
  getWeeklyMissions: async (): Promise<Mission[]> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.gamification.missions.weekly);
      return response.data.data.missions;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  /**
   * Get active special missions (events)
   */
  getSpecialMissions: async (): Promise<Mission[]> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.gamification.missions.special);
      return response.data.data.missions;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  /**
   * Claim mission rewards
   */
  claimRewards: async (missionId: string) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.gamification.missions.claim(missionId));
      return response.data.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  /**
   * Get mission progress
   */
  getMissionProgress: async (missionId: string) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.gamification.missions.progress(missionId));
      return response.data.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  /**
   * Get user mission statistics
   */
  getMissionStats: async (userId: string) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.gamification.missions.stats(userId));
      return response.data.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  /**
   * Get current user's mission statistics
   * Uses /me endpoint to extract userId from JWT token
   */
  getMyMissionStats: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.gamification.missions.statsMe);
      return response.data.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  /**
   * Start a mission
   *
   * @description Marks a mission as 'in_progress'.
   * Only missions with status 'active' can be started.
   *
   * @param missionId - Mission UUID
   * @returns Updated mission with status 'in_progress'
   *
   * @endpoint POST /api/v1/gamification/missions/:id/start
   */
  startMission: async (missionId: string): Promise<Mission> => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.gamification.missions.start(missionId));
      return response.data.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  /**
   * Update mission progress
   *
   * @description Increments progress of a specific objective within a mission.
   * Recalculates overall mission progress (0-100%).
   * If all objectives are completed, marks the mission as 'completed'.
   *
   * Supported objective types:
   * - complete_exercises: Exercises completed
   * - correct_streak: Correct answer streak
   * - study_time: Study time in minutes
   * - consecutive_days: Consecutive login days
   *
   * @param missionId - Mission UUID
   * @param objectiveType - Type of objective to update
   * @param increment - Amount to increment (default: 1)
   * @returns Updated mission with new progress
   *
   * @endpoint PATCH /api/v1/gamification/missions/:id/progress
   */
  updateProgress: async (
    missionId: string,
    objectiveType: string,
    increment: number = 1,
  ): Promise<Mission> => {
    try {
      const response = await apiClient.patch(
        API_ENDPOINTS.gamification.missions.progress(missionId),
        {
          objective_type: objectiveType,
          increment,
        },
      );
      return response.data.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },
};
