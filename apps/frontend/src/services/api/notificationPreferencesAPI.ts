/**
 * Notification Preferences API Integration
 *
 * API client for notification preferences management.
 * Handles user notification settings, channels, and device registration.
 *
 * @module notificationPreferencesAPI
 * @version 1.0.0
 * @date 2026-01-13
 */

import { apiClient } from '@/services/api/apiClient';
import { handleAPIError } from './apiErrorHandler';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Notification Channel
 */
export type NotificationChannel = 'email' | 'push' | 'in_app' | 'sms';

/**
 * Notification Category
 */
export type NotificationCategory =
  | 'achievements'
  | 'missions'
  | 'social'
  | 'progress'
  | 'assignments'
  | 'system'
  | 'marketing';

/**
 * Channel Preferences
 */
export interface ChannelPreferences {
  email: boolean;
  push: boolean;
  in_app: boolean;
  sms: boolean;
}

/**
 * Category Preferences
 */
export interface CategoryPreferences {
  achievements: ChannelPreferences;
  missions: ChannelPreferences;
  social: ChannelPreferences;
  progress: ChannelPreferences;
  assignments: ChannelPreferences;
  system: ChannelPreferences;
  marketing: ChannelPreferences;
}

/**
 * Notification Preferences
 */
export interface NotificationPreferences {
  id: string;
  user_id: string;
  enabled: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  digest_enabled: boolean;
  digest_frequency?: 'daily' | 'weekly';
  categories: CategoryPreferences;
  created_at: string;
  updated_at: string;
}

/**
 * Update Preferences DTO
 */
export interface UpdatePreferencesDto {
  enabled?: boolean;
  quiet_hours_enabled?: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  digest_enabled?: boolean;
  digest_frequency?: 'daily' | 'weekly';
  categories?: Partial<CategoryPreferences>;
}

/**
 * User Device
 */
export interface UserDevice {
  id: string;
  user_id: string;
  device_type: 'web' | 'ios' | 'android';
  device_token: string;
  device_name?: string;
  is_active: boolean;
  last_used: string;
  created_at: string;
}

/**
 * Register Device DTO
 */
export interface RegisterDeviceDto {
  device_type: 'web' | 'ios' | 'android';
  device_token: string;
  device_name?: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get notification preferences
 *
 * @description Fetches current user's notification preferences
 *
 * @returns Promise<NotificationPreferences>
 *
 * @endpoint GET /api/v1/notifications/preferences
 */
export async function getPreferences(): Promise<NotificationPreferences> {
  try {
    const response = await apiClient.get<NotificationPreferences>('/notifications/preferences');
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch notification preferences');
  }
}

/**
 * Update notification preferences
 *
 * @description Updates current user's notification preferences
 *
 * @param data - Preferences to update
 * @returns Promise<NotificationPreferences>
 *
 * @endpoint PATCH /api/v1/notifications/preferences
 */
export async function updatePreferences(
  data: UpdatePreferencesDto,
): Promise<NotificationPreferences> {
  try {
    const response = await apiClient.patch<NotificationPreferences>(
      '/notifications/preferences',
      data,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to update notification preferences');
  }
}

/**
 * Toggle category channel
 *
 * @description Toggles a specific channel for a category
 *
 * @param category - Notification category
 * @param channel - Notification channel
 * @param enabled - Enable or disable
 * @returns Promise<NotificationPreferences>
 *
 * @endpoint PATCH /api/v1/notifications/preferences/category/:category/channel/:channel
 */
export async function toggleCategoryChannel(
  category: NotificationCategory,
  channel: NotificationChannel,
  enabled: boolean,
): Promise<NotificationPreferences> {
  try {
    const response = await apiClient.patch<NotificationPreferences>(
      `/notifications/preferences/category/${category}/channel/${channel}`,
      { enabled },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to toggle notification channel');
  }
}

/**
 * Reset preferences to defaults
 *
 * @description Resets all notification preferences to default values
 *
 * @returns Promise<NotificationPreferences>
 *
 * @endpoint POST /api/v1/notifications/preferences/reset
 */
export async function resetPreferences(): Promise<NotificationPreferences> {
  try {
    const response = await apiClient.post<NotificationPreferences>(
      '/notifications/preferences/reset',
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to reset notification preferences');
  }
}

/**
 * Get registered devices
 *
 * @description Fetches all registered devices for push notifications
 *
 * @returns Promise<UserDevice[]>
 *
 * @endpoint GET /api/v1/notifications/devices
 */
export async function getDevices(): Promise<UserDevice[]> {
  try {
    const response = await apiClient.get<UserDevice[]>('/notifications/devices');
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch registered devices');
  }
}

/**
 * Register device for push notifications
 *
 * @description Registers a new device for push notifications
 *
 * @param data - Device registration data
 * @returns Promise<UserDevice>
 *
 * @endpoint POST /api/v1/notifications/devices
 */
export async function registerDevice(data: RegisterDeviceDto): Promise<UserDevice> {
  try {
    const response = await apiClient.post<UserDevice>('/notifications/devices', data);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to register device');
  }
}

/**
 * Unregister device
 *
 * @description Removes a device from push notification registration
 *
 * @param deviceId - Device UUID
 * @returns Promise<void>
 *
 * @endpoint DELETE /api/v1/notifications/devices/:id
 */
export async function unregisterDevice(deviceId: string): Promise<void> {
  try {
    await apiClient.delete(`/notifications/devices/${deviceId}`);
  } catch (error) {
    throw handleAPIError(error, 'Failed to unregister device');
  }
}

/**
 * Test push notification
 *
 * @description Sends a test push notification to verify device registration
 *
 * @param deviceId - Device UUID to test
 * @returns Promise<{ success: boolean; message: string }>
 *
 * @endpoint POST /api/v1/notifications/devices/:id/test
 */
export async function testPushNotification(
  deviceId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      `/notifications/devices/${deviceId}/test`,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to send test notification');
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Notification Preferences API namespace
 *
 * @usage
 * ```ts
 * import { notificationPreferencesAPI } from '@/services/api/notificationPreferencesAPI';
 *
 * // Get preferences
 * const prefs = await notificationPreferencesAPI.get();
 *
 * // Update preferences
 * await notificationPreferencesAPI.update({ quiet_hours_enabled: true });
 *
 * // Register device
 * await notificationPreferencesAPI.registerDevice({
 *   device_type: 'web',
 *   device_token: 'token-from-service-worker'
 * });
 * ```
 */
export const notificationPreferencesAPI = {
  // Preferences
  get: getPreferences,
  update: updatePreferences,
  toggleChannel: toggleCategoryChannel,
  reset: resetPreferences,

  // Devices
  getDevices,
  registerDevice,
  unregisterDevice,
  testPush: testPushNotification,
};

export default notificationPreferencesAPI;
