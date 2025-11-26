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
    const response = await apiClient.get('/gamification/missions/daily');
    return response.data.data.missions;
  },

  /**
   * Get 5 weekly missions (auto-generates if needed)
   */
  getWeeklyMissions: async (): Promise<Mission[]> => {
    const response = await apiClient.get('/gamification/missions/weekly');
    return response.data.data.missions;
  },

  /**
   * Get active special missions (events)
   */
  getSpecialMissions: async (): Promise<Mission[]> => {
    const response = await apiClient.get('/gamification/missions/special');
    return response.data.data.missions;
  },

  /**
   * Claim mission rewards
   */
  claimRewards: async (missionId: string) => {
    const response = await apiClient.post(`/gamification/missions/${missionId}/claim`);
    return response.data.data;
  },

  /**
   * Get mission progress
   */
  getMissionProgress: async (missionId: string) => {
    const response = await apiClient.get(`/gamification/missions/${missionId}/progress`);
    return response.data.data;
  },

  /**
   * Get user mission statistics
   */
  getMissionStats: async (userId: string) => {
    const response = await apiClient.get(`/gamification/missions/stats/${userId}`);
    return response.data.data;
  },
};
