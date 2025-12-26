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
   * Note: This endpoint is not exposed by the backend controller yet.
   * The backend has a validateToken method in PasswordRecoveryService,
   * but it's not exposed as a public endpoint. Token validation happens
   * internally when resetPassword is called.
   *
   * For now, we'll validate by attempting to use the token, or implement
   * basic client-side validation (token length, format, etc.)
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
    // Basic client-side validation
    // Real validation will happen when user submits the reset form
    if (!token || token.length < 10) {
      return { valid: false };
    }

    // Token format looks valid
    // The actual validation will happen server-side when resetPassword is called
    return { valid: true };
  },
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default passwordAPI;
