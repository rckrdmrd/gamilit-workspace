/**
 * Profile API - User Profile and Preferences Management
 *
 * Provides methods for:
 * - Updating user profile information
 * - Managing user preferences
 * - Uploading avatars
 * - Changing passwords
 *
 * FIX-2026-01-19: Implemented snake_case → camelCase transformation
 * Backend DTOs use snake_case, frontend interfaces use camelCase
 */

import { apiClient } from './apiClient';
import { handleAPIError } from './apiErrorHandler';

// ============================================================================
// INPUT DTOs (snake_case - sent to backend as-is)
// ============================================================================

/**
 * Data transfer object for updating user profile (sent to backend)
 */
export interface UpdateProfileDto {
  display_name?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  grade_level?: string;
}

/**
 * Data transfer object for updating user preferences (sent to backend)
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
 * Data transfer object for changing password (sent to backend)
 */
export interface UpdatePasswordDto {
  current_password: string;
  new_password: string;
}

// ============================================================================
// BACKEND RESPONSE DTOs (snake_case - received from API)
// ============================================================================

/**
 * Backend profile update response (snake_case)
 * @internal Used for API communication
 */
interface BackendProfileUpdateResponse {
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
 * Backend preferences update response (snake_case)
 * @internal Used for API communication
 */
interface BackendPreferencesUpdateResponse {
  id: string;
  preferences: Record<string, unknown>;
  updated_at: string;
}

/**
 * Backend avatar upload response (snake_case)
 * @internal Used for API communication
 */
interface BackendAvatarUploadResponse {
  avatar_url: string;
  updated_at: string;
}

// ============================================================================
// FRONTEND INTERFACES (camelCase - for frontend consumption)
// ============================================================================

/**
 * Frontend profile update response (camelCase)
 */
export interface ProfileUpdate {
  id: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  gradeLevel?: string;
  avatarUrl?: string;
  updatedAt: Date;
}

/**
 * Frontend preferences update response (camelCase)
 */
export interface PreferencesUpdate {
  id: string;
  preferences: Record<string, unknown>;
  updatedAt: Date;
}

/**
 * Frontend avatar upload response (camelCase)
 */
export interface AvatarUpload {
  avatarUrl: string;
  updatedAt: Date;
}

/**
 * Password update response (no transformation needed - simple types)
 */
export interface PasswordUpdate {
  success: boolean;
  message: string;
}

// ============================================================================
// DEPRECATED ALIASES (backward compatibility)
// ============================================================================

/** @deprecated Use ProfileUpdate instead */
export type ProfileUpdateResponse = ProfileUpdate;

/** @deprecated Use PreferencesUpdate instead */
export type PreferencesUpdateResponse = PreferencesUpdate;

/** @deprecated Use AvatarUpload instead */
export type AvatarUploadResponse = AvatarUpload;

/** @deprecated Use PasswordUpdate instead */
export type PasswordUpdateResponse = PasswordUpdate;

// ============================================================================
// TRANSFORMERS
// ============================================================================

/**
 * Transform backend ProfileUpdateResponse to frontend ProfileUpdate
 */
function mapProfileUpdateResponse(dto: BackendProfileUpdateResponse): ProfileUpdate {
  return {
    id: dto.id,
    displayName: dto.display_name,
    firstName: dto.first_name,
    lastName: dto.last_name,
    bio: dto.bio,
    gradeLevel: dto.grade_level,
    avatarUrl: dto.avatar_url,
    updatedAt: new Date(dto.updated_at),
  };
}

/**
 * Transform backend PreferencesUpdateResponse to frontend PreferencesUpdate
 */
function mapPreferencesUpdateResponse(dto: BackendPreferencesUpdateResponse): PreferencesUpdate {
  return {
    id: dto.id,
    preferences: dto.preferences,
    updatedAt: new Date(dto.updated_at),
  };
}

/**
 * Transform backend AvatarUploadResponse to frontend AvatarUpload
 */
function mapAvatarUploadResponse(dto: BackendAvatarUploadResponse): AvatarUpload {
  return {
    avatarUrl: dto.avatar_url,
    updatedAt: new Date(dto.updated_at),
  };
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
   * @returns Updated profile data (camelCase)
   */
  updateProfile: async (_userId: string, data: UpdateProfileDto): Promise<ProfileUpdate> => {
    try {
      const response = await apiClient.put<BackendProfileUpdateResponse>(
        `/users/profile`,
        data,
      );
      return mapProfileUpdateResponse(response.data);
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  /**
   * Get user preferences
   *
   * @returns User preferences data
   */
  getPreferences: async (): Promise<{ preferences: Record<string, unknown> }> => {
    try {
      const response = await apiClient.get('/users/preferences');
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  /**
   * Update user preferences
   *
   * @param userId - User ID
   * @param preferences - Preferences to update
   * @returns Updated preferences data (camelCase)
   */
  updatePreferences: async (
    _userId: string,
    preferences: UpdatePreferencesDto,
  ): Promise<PreferencesUpdate> => {
    try {
      const response = await apiClient.put<BackendPreferencesUpdateResponse>(
        `/users/preferences`,
        { preferences },
      );
      return mapPreferencesUpdateResponse(response.data);
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  /**
   * Upload user avatar
   *
   * @param userId - User ID
   * @param file - Avatar image file
   * @returns Avatar URL (camelCase)
   */
  uploadAvatar: async (_userId: string, file: File): Promise<AvatarUpload> => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await apiClient.post<BackendAvatarUploadResponse>(
        `/users/avatar`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );

      return mapAvatarUploadResponse(response.data);
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  /**
   * Update user password
   *
   * TASK-023: Corregido para usar endpoint /auth/change-password (existente en backend)
   * El endpoint usa JWT para identificar al usuario, no necesita userId en URL.
   *
   * @param _userId - User ID (deprecated, se mantiene por compatibilidad pero no se usa)
   * @param passwords - Current and new password
   * @returns Success response
   */
  updatePassword: async (
    _userId: string,
    passwords: UpdatePasswordDto,
  ): Promise<PasswordUpdate> => {
    try {
      const response = await apiClient.put<PasswordUpdate>(
        '/auth/change-password',
        passwords,
      );
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  // ============================================================================
  // EMAIL VERIFICATION METHODS
  // ============================================================================

  /**
   * Verify email with token
   *
   * @param token - Email verification token
   * @returns Verification result
   */
  verifyEmail: async (token: string): Promise<{ message: string; verified: boolean }> => {
    try {
      const response = await apiClient.post<{ message: string; verified: boolean }>(
        '/auth/verify-email',
        { token },
      );
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  /**
   * Resend email verification
   *
   * @returns Success message
   */
  resendEmailVerification: async (): Promise<{ message: string }> => {
    try {
      const response = await apiClient.post<{ message: string }>(
        '/auth/verify-email/resend',
      );
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  /**
   * Check email verification status
   *
   * @returns Verification status
   */
  getEmailVerificationStatus: async (): Promise<{ verified: boolean }> => {
    try {
      const response = await apiClient.get<{ verified: boolean }>(
        '/auth/verify-email/status',
      );
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default profileAPI;
