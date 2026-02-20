/**
 * Admin Settings API
 *
 * Functions for system configuration and settings management.
 * Split from adminAPI.ts monolith for modularity.
 */

import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';
import { handleAPIError } from '../apiErrorHandler';
import type {
  SystemConfig,
  SettingsCategory,
} from '../adminTypes';

// ============================================================================
// SETTINGS
// ============================================================================

/**
 * Get system configuration
 *
 * Status: Backend IMPLEMENTED
 */
export async function getSystemConfig(): Promise<SystemConfig> {
  try {
    const response = await apiClient.get<SystemConfig>(API_ENDPOINTS.admin.system.config);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch system config');
  }
}

/**
 * Update system configuration
 *
 * Status: Backend IMPLEMENTED
 */
export async function updateSystemConfig(config: SystemConfig): Promise<SystemConfig> {
  try {
    const response = await apiClient.post<SystemConfig>(API_ENDPOINTS.admin.system.config, config);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to update system config');
  }
}

/**
 * Get config categories
 */
export async function getConfigCategories(): Promise<SettingsCategory[]> {
  try {
    const response = await apiClient.get<SettingsCategory[]>(
      API_ENDPOINTS.admin.system.configCategories,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch config categories');
  }
}

/**
 * Get category configuration
 */
export async function getCategoryConfig(category: SettingsCategory): Promise<Record<string, unknown>> {
  try {
    const response = await apiClient.get<Record<string, unknown>>(API_ENDPOINTS.admin.system.categoryConfig(category));
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to fetch config for category ${category}`);
  }
}

/**
 * Update category configuration
 */
export async function updateCategoryConfig(
  category: SettingsCategory,
  _settings: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  try {
    const response = await apiClient.put<Record<string, unknown>>(
      API_ENDPOINTS.admin.system.categoryConfig(category),
      _settings,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to update config for category ${category}`);
  }
}

/**
 * Validate configuration
 */
export async function validateConfig(
  category: SettingsCategory,
  _settings: Record<string, unknown>,
): Promise<{ valid: boolean; errors?: string[] }> {
  try {
    const response = await apiClient.post<{ valid: boolean; errors?: string[] }>(
      API_ENDPOINTS.admin.system.validateConfig,
      { category, settings: _settings },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to validate config');
  }
}

/**
 * Settings API namespace object
 */
export const settingsApi = {
  getSystemConfig,
  updateSystemConfig,
  getConfigCategories,
  getCategoryConfig,
  updateCategoryConfig,
  validateConfig,
};
