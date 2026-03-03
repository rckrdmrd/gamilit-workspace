/** @deprecated Since 2025-10 — 2FA feature disabled. Zero consumers. Safe to delete. */

/**
 * Two-Factor Authentication API
 *
 * @description API client for 2FA operations.
 * @implements GAP-P0-001
 */

import { apiClient } from './apiClient';

export interface TwoFactorStatus {
  enabled: boolean;
  method: 'email' | 'sms' | 'authenticator' | null;
}

export interface SetupResponse {
  message: string;
  expiresAt: string;
}

export interface VerifySetupResponse {
  message: string;
  backupCodes?: string[];
}

export interface VerifyResponse {
  valid: boolean;
}

export const twoFactorAPI = {
  /**
   * Get 2FA status for current user
   */
  getStatus: async (): Promise<TwoFactorStatus> => {
    const response = await apiClient.get<TwoFactorStatus>('/auth/2fa/status');
    return response.data;
  },

  /**
   * Initiate 2FA setup
   */
  setup: async (method: 'email' | 'sms' | 'authenticator' = 'email'): Promise<SetupResponse> => {
    const response = await apiClient.post<SetupResponse>('/auth/2fa/setup', { method });
    return response.data;
  },

  /**
   * Verify 2FA setup code (completes setup)
   */
  verifySetup: async (code: string): Promise<VerifySetupResponse> => {
    const response = await apiClient.post<VerifySetupResponse>('/auth/2fa/setup/verify', { code });
    return response.data;
  },

  /**
   * Verify 2FA code during login
   */
  verify: async (userId: string, code: string): Promise<VerifyResponse> => {
    const response = await apiClient.post<VerifyResponse>('/auth/2fa/verify', { userId, code });
    return response.data;
  },

  /**
   * Disable 2FA
   */
  disable: async (password: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/2fa/disable', { password });
    return response.data;
  },

  /**
   * Resend 2FA code
   */
  resend: async (userId: string): Promise<SetupResponse> => {
    const response = await apiClient.post<SetupResponse>('/auth/2fa/resend', { userId });
    return response.data;
  },
};
