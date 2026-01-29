/**
 * Password API - Password Reset and Recovery Management
 *
 * Provides methods for:
 * - Requesting password reset via email
 * - Validating reset tokens
 * - Resetting password with token
 */

import { apiClient } from './apiClient';
import { handleAPIError } from './apiErrorHandler';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Data transfer object for requesting password reset
 */
export interface RequestPasswordResetDto {
  email: string;
}

/**
 * Data transfer object for resetting password with token
 */
export interface ResetPasswordDto {
  token: string;
  new_password: string;
}

/**
 * Response from password reset request
 */
export interface PasswordResetRequestResponse {
  message: string;
}

/**
 * Response from password reset
 */
export interface PasswordResetResponse {
  message: string;
}

/**
 * Response from token validation
 */
export interface ValidateTokenResponse {
  valid: boolean;
  userId?: string;
}

// ============================================================================
// API METHODS
// ============================================================================

/**
 * Password API service for managing password reset and recovery
 */
export const passwordAPI = {
  /**
   * Request password reset
   * Sends an email with a password reset link to the provided email address
   *
   * @param email - User's email address
   * @returns Success message (always returns success for security - doesn't reveal if email exists)
   *
   * @example
   * ```typescript
   * await passwordAPI.requestPasswordReset('user@example.com');
   * ```
   */
  requestPasswordReset: async (email: string): Promise<PasswordResetRequestResponse> => {
    try {
      const response = await apiClient.post('/auth/reset-password/request', { email });
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  /**
   * Reset password with token
   * Validates the reset token and updates the user's password
   *
   * @param token - Password reset token from email
   * @param newPassword - New password to set
   * @returns Success message
   * @throws {Error} If token is invalid or expired
   *
   * @example
   * ```typescript
   * await passwordAPI.resetPassword('abc123token', 'NewSecurePass123!');
   * ```
   */
  resetPassword: async (token: string, newPassword: string): Promise<PasswordResetResponse> => {
    try {
      const response = await apiClient.post('/auth/reset-password', {
        token,
        new_password: newPassword,
      });
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  /**
   * Validate reset token
   * Checks if a password reset token is valid and not expired
   *
   * @param token - Password reset token to validate
   * @returns Validation result with valid flag and optional userId
   *
   * @example
   * ```typescript
   * const result = await passwordAPI.validateResetToken('abc123token');
   * if (result.valid) {
   *   // Token is valid, show reset form
   * }
   * ```
   */
  validateResetToken: async (token: string): Promise<ValidateTokenResponse> => {
    try {
      const response = await apiClient.get<ValidateTokenResponse>(
        `/auth/reset-password/validate?token=${encodeURIComponent(token)}`
      );
      return response.data;
    } catch (_error) {
      // If request fails, token is invalid
      return { valid: false };
    }
  },
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default passwordAPI;
