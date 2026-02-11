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

/**
 * NOTA: El interceptor de apiClient (líneas 99-108) hace unwrap automático
 * cuando detecta { success, data }. Por lo tanto, response.data ya contiene
 * directamente los datos (no el wrapper { success, data }).
 *
 * Flujo:
 * 1. Backend controller retorna: data
 * 2. Backend interceptor envuelve: { success: true, data: data, ... }
 * 3. Frontend interceptor desenvuelve: response.data = data
 */
export const missionsAPI = {
  /**
   * Get 3 daily missions (auto-generates if needed)
   */
  getDailyMissions: async (): Promise<Mission[]> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.gamification.missions.daily);
      // Después del unwrap, response.data es directamente el array de misiones
      return Array.isArray(response.data) ? response.data : [];
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
      // Después del unwrap, response.data es directamente el array de misiones
      return Array.isArray(response.data) ? response.data : [];
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
      // Después del unwrap, response.data es directamente el array de misiones
      return Array.isArray(response.data) ? response.data : [];
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
      // Después del unwrap, response.data es { mission, rewards, rewards_granted }
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  /**
   * Get mission progress
   */
  getMissionProgress: async (missionId: string) => {
    try {
      const response = await apiClient.patch(API_ENDPOINTS.gamification.missions.progress(missionId));
      // Después del unwrap, response.data es directamente el objeto de progreso
      return response.data;
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
      // Después del unwrap, response.data es directamente el objeto de stats
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },
};
