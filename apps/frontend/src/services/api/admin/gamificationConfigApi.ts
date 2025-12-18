/**
 * Gamification Config API Client
 *
 * API service for admin gamification configuration (US-AE-005)
 * Connects to backend endpoints in AdminGamificationConfigController
 */

import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';
import type {
  GamificationParameter,
  MayaRankConfig,
  GamificationStats,
  UpdateParameterDto,
  BulkUpdateParametersDto,
  UpdateMayaRankDto,
  PreviewImpactDto,
  ImpactPreview,
  ListParametersQuery,
} from '@/types/admin/gamification.types';

// Use API_ENDPOINTS from unified config (without /v1, that's in API_CONFIG.baseURL)
const BASE_URL = API_ENDPOINTS.admin.gamificationConfig;

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
  async updateParameter(key: string, data: UpdateParameterDto): Promise<GamificationParameter> {
    const response = await apiClient.patch(`${BASE_URL}/parameters/${key}`, data);
    return response.data;
  },

  /**
   * Reset a parameter to its default value
   *
   * @param key Parameter key
   * @returns Reset parameter
   */
  async resetParameter(key: string): Promise<GamificationParameter> {
    const response = await apiClient.post(`${BASE_URL}/parameters/${key}/reset`);
    return response.data;
  },

  /**
   * Bulk update multiple parameters
   *
   * @param data Array of parameter updates
   * @returns Update result
   */
  async bulkUpdateParameters(
    data: BulkUpdateParametersDto,
  ): Promise<{ updated: number; parameters: GamificationParameter[] }> {
    const response = await apiClient.post(`${BASE_URL}/parameters/bulk-update`, data);
    return response.data;
  },

  // ========================================
  // MAYA RANKS
  // ========================================

  /**
   * List all Maya ranks configuration
   *
   * @returns Array of Maya rank configs
   * @see MayaRankConfig - Configuration interface (not to confuse with MayaRank enum)
   */
  async listMayaRanks(): Promise<MayaRankConfig[]> {
    const response = await apiClient.get(`${BASE_URL}/maya-ranks`);
    return response.data;
  },

  /**
   * Get a specific Maya rank config by ID
   *
   * @param id Rank ID
   * @returns Maya rank config details
   */
  async getMayaRank(id: string): Promise<MayaRankConfig> {
    const response = await apiClient.get(`${BASE_URL}/maya-ranks/${id}`);
    return response.data;
  },

  /**
   * Update a Maya rank config
   *
   * @param id Rank ID
   * @param data Rank updates
   * @returns Updated rank config
   */
  async updateMayaRank(id: string, data: UpdateMayaRankDto): Promise<MayaRankConfig> {
    const response = await apiClient.patch(`${BASE_URL}/maya-ranks/${id}`, data);
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

  // ========================================
  // RESTORE DEFAULTS (MEDIO-002 fix)
  // ========================================

  /**
   * Restore all gamification settings to default values
   *
   * @returns Restore result with list of restored parameters
   * @see Backend: POST /api/admin/gamification/restore-defaults
   * @added 2025-12-15 (MEDIO-002)
   */
  async restoreDefaults(): Promise<RestoreDefaultsResult> {
    const response = await apiClient.post(`${BASE_URL}/restore-defaults`);
    return response.data;
  },
};

/**
 * Result type for restore defaults operation
 */
export interface RestoreDefaultsResult {
  restored_count: number;
  restored_settings: Array<{
    key: string;
    previous_value: number;
    default_value: number;
  }>;
  restored_at: string;
  restored_by: string;
}
