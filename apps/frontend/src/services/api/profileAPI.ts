/* eslint-disable rulesdir/no-api-route-issues */
/**
 * Profile API - User Profile and Preferences Management
 *
 * Provides methods for:
 * - Updating user profile information
 * - Managing user preferences
 * - Uploading avatars
 * - Changing passwords
 */

import { apiClient } from './apiClient';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Data transfer object for updating user profile
 */
export interface UpdateProfileDto {
  display_name?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  grade_level?: string;
}

/**
 * Data transfer object for updating user preferences
 */
export interface UpdatePreferencesDto {
  theme?: string;
  language?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    in_app?: boolean;
  };
}

/**
 * Data transfer object for changing password
 */
export interface UpdatePasswordDto {
  current_password: string;
  new_password: string;
}

/**
 * Response from profile update
 */
export interface ProfileUpdateResponse {
  id: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  grade_level?: string;
  avatar_url?: string;
  updated_at: string;
}

/**
 * Response from preferences update
 */
export interface PreferencesUpdateResponse {
  id: string;
  preferences: Record<string, unknown>;
  updated_at: string;
}

/**
 * Response from avatar upload
 */
export interface AvatarUploadResponse {
  avatar_url: string;
  updated_at: string;
}

/**
 * Response from password change
 */
export interface PasswordUpdateResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// API METHODS
// ============================================================================

/**
 * Profile API service for managing user profiles and preferences
 */
export const profileAPI = {
  /**
   * Update user profile information
   *
   * @param userId - User ID
   * @param data - Profile data to update
   * @returns Updated profile data
   */
  updateProfile: async (userId: string, data: UpdateProfileDto): Promise<ProfileUpdateResponse> => {
    const response = await apiClient.put(`/users/${userId}/profile`, data);
    return response.data;
  },

  /**
   * Update user preferences
   *
   * @param userId - User ID
   * @param preferences - Preferences to update
   * @returns Updated preferences data
   */
  updatePreferences: async (
    userId: string,
    preferences: UpdatePreferencesDto,
  ): Promise<PreferencesUpdateResponse> => {
    const response = await apiClient.put(`/users/${userId}/preferences`, { preferences });
    return response.data;
  },

  /**
   * Upload user avatar
   *
   * @param userId - User ID
   * @param file - Avatar image file
   * @returns Avatar URL
   */
  uploadAvatar: async (userId: string, file: File): Promise<AvatarUploadResponse> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.post(`/users/${userId}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  },

  /**
   * Update user password
   *
   * @param userId - User ID
   * @param passwords - Current and new password
   * @returns Success response
   */
  updatePassword: async (
    userId: string,
    passwords: UpdatePasswordDto,
  ): Promise<PasswordUpdateResponse> => {
    const response = await apiClient.put(`/users/${userId}/password`, passwords);
    return response.data;
  },
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default profileAPI;
