/**
 * Admin Gamification API
 *
 * Functions for gamification settings management.
 * Split from adminAPI.ts monolith for modularity.
 */

import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';
import { handleAPIError } from '../apiErrorHandler';
import type {
  GamificationSettings,
} from '../adminTypes';

// ============================================================================
// GAMIFICATION
// ============================================================================

/**
 * Get gamification settings
 */
export async function getGamificationSettings(): Promise<GamificationSettings> {
  try {
    const response = await apiClient.get<GamificationSettings>(
      API_ENDPOINTS.admin.gamification.settings,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch gamification settings');
  }
}

/**
 * Update gamification settings
 */
export async function updateGamificationSettings(
  _category: 'ranks' | 'achievements' | 'economy',
  _data: Record<string, unknown>,
): Promise<GamificationSettings> {
  try {
    const response = await apiClient.put<GamificationSettings>(
      API_ENDPOINTS.admin.gamification.updateSettings,
      { category: _category, data: _data },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to update gamification ${_category}`);
  }
}

/**
 * Preview gamification changes impact
 */
export async function previewGamificationChanges(_changes: Record<string, unknown>): Promise<Record<string, unknown>> {
  try {
    const response = await apiClient.post<Record<string, unknown>>(API_ENDPOINTS.admin.gamification.previewChanges, {
      changes: _changes,
    });
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to preview gamification changes');
  }
}

/**
 * Restore gamification defaults
 */
export async function restoreGamificationDefaults(): Promise<GamificationSettings> {
  try {
    const response = await apiClient.post<GamificationSettings>(
      API_ENDPOINTS.admin.gamification.restoreDefaults,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to restore gamification defaults');
  }
}

/**
 * Gamification API namespace object
 */
export const gamificationApi = {
  getGamificationSettings,
  updateGamificationSettings,
  previewGamificationChanges,
  restoreGamificationDefaults,
};
