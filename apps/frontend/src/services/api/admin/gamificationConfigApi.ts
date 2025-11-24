/**
 * Gamification Config API Client
 *
 * API service for admin gamification configuration (US-AE-005)
 * Connects to backend endpoints in AdminGamificationConfigController
 */

import { apiClient } from '@/services/api/apiClient';
import type {
  GamificationParameter,
  MayaRank,
  GamificationStats,
  UpdateParameterDto,
  BulkUpdateParametersDto,
  UpdateMayaRankDto,
  PreviewImpactDto,
  ImpactPreview,
  ListParametersQuery,
} from '@/types/admin/gamification.types';

const BASE_URL = '/admin/gamification/config';

/**
 * Gamification Configuration API
 */
export const gamificationConfigApi = {
  // ========================================
  // PARAMETERS
  // ========================================

  /**
   * List all gamification parameters
   *
   * @param query Optional filters (category, isActive, search, pagination)
   * @returns Paginated list of parameters
   */
  async listParameters(query?: ListParametersQuery): Promise<{
    data: GamificationParameter[];
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await apiClient.get(`${BASE_URL}/parameters`, {
      params: query,
    });
    return response.data;
  },

  /**
   * Get a specific parameter by key
   *
   * @param key Parameter key (e.g., "gamification.xp.base_per_exercise")
   * @returns Parameter details
   */
  async getParameter(key: string): Promise<GamificationParameter> {
    const response = await apiClient.get(`${BASE_URL}/parameters/${key}`);
    return response.data;
  },

  /**
   * Update a parameter value
   *
   * @param key Parameter key
   * @param data New value and optional reason
   * @returns Updated parameter
   */
  async updateParameter(
    key: string,
    data: UpdateParameterDto
  ): Promise<GamificationParameter> {
    const response = await apiClient.patch(
      `${BASE_URL}/parameters/${key}`,
      data
    );
    return response.data;
  },

  /**
   * Reset a parameter to its default value
   *
   * @param key Parameter key
   * @returns Reset parameter
   */
  async resetParameter(key: string): Promise<GamificationParameter> {
    const response = await apiClient.post(
      `${BASE_URL}/parameters/${key}/reset`
    );
    return response.data;
  },

  /**
   * Bulk update multiple parameters
   *
   * @param data Array of parameter updates
   * @returns Update result
   */
  async bulkUpdateParameters(
    data: BulkUpdateParametersDto
  ): Promise<{ updated: number; parameters: GamificationParameter[] }> {
    const response = await apiClient.post(
      `${BASE_URL}/parameters/bulk-update`,
      data
    );
    return response.data;
  },

  // ========================================
  // MAYA RANKS
  // ========================================

  /**
   * List all Maya ranks
   *
   * @returns Array of Maya ranks
   */
  async listMayaRanks(): Promise<MayaRank[]> {
    const response = await apiClient.get(`${BASE_URL}/maya-ranks`);
    return response.data;
  },

  /**
   * Get a specific Maya rank by ID
   *
   * @param id Rank ID
   * @returns Maya rank details
   */
  async getMayaRank(id: string): Promise<MayaRank> {
    const response = await apiClient.get(`${BASE_URL}/maya-ranks/${id}`);
    return response.data;
  },

  /**
   * Update a Maya rank
   *
   * @param id Rank ID
   * @param data Rank updates
   * @returns Updated rank
   */
  async updateMayaRank(
    id: string,
    data: UpdateMayaRankDto
  ): Promise<MayaRank> {
    const response = await apiClient.patch(
      `${BASE_URL}/maya-ranks/${id}`,
      data
    );
    return response.data;
  },

  // ========================================
  // PREVIEW & STATS
  // ========================================

  /**
   * Preview the impact of changing a parameter
   *
   * @param data Parameter key and new value
   * @returns Impact preview with affected users
   */
  async previewImpact(data: PreviewImpactDto): Promise<ImpactPreview> {
    const response = await apiClient.post(`${BASE_URL}/preview-impact`, data);
    return response.data;
  },

  /**
   * Get general gamification statistics
   *
   * @returns Stats summary
   */
  async getStats(): Promise<GamificationStats> {
    const response = await apiClient.get(`${BASE_URL}/stats`);
    return response.data;
  },
};
