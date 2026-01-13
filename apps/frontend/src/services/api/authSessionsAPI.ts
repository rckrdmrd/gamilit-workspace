/**
 * Auth Sessions API Integration
 *
 * API client for authentication session management.
 * Handles listing, viewing, and revoking user sessions.
 *
 * @module authSessionsAPI
 * @version 1.0.0
 * @date 2026-01-13
 */

import { apiClient } from '@/services/api/apiClient';
import { handleAPIError } from './apiErrorHandler';
import { API_ENDPOINTS } from '@/config/api.config';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Device type for session
 */
export type SessionDeviceType = 'desktop' | 'mobile' | 'tablet' | 'unknown';

/**
 * Auth Session
 *
 * Represents an active authentication session
 */
export interface AuthSession {
  id: string;
  user_id: string;
  device_type: SessionDeviceType;
  device_name?: string;
  browser?: string;
  os?: string;
  ip_address: string;
  location?: string;
  is_current: boolean;
  last_activity: string;
  created_at: string;
  expires_at: string;
}

/**
 * Session Summary
 */
export interface SessionSummary {
  total_sessions: number;
  active_sessions: number;
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
    unknown: number;
  };
  locations: string[];
  last_login: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get all active sessions
 *
 * @description Fetches all active sessions for the current user
 *
 * @returns Promise<AuthSession[]>
 *
 * @endpoint GET /api/v1/auth/sessions
 */
export async function getSessions(): Promise<AuthSession[]> {
  try {
    const response = await apiClient.get<AuthSession[]>(API_ENDPOINTS.auth.getSessions);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch sessions');
  }
}

/**
 * Get session by ID
 *
 * @description Fetches details of a specific session
 *
 * @param sessionId - Session UUID
 * @returns Promise<AuthSession>
 *
 * @endpoint GET /api/v1/auth/sessions/:id
 */
export async function getSessionById(sessionId: string): Promise<AuthSession> {
  try {
    const response = await apiClient.get<AuthSession>(`/auth/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch session');
  }
}

/**
 * Get current session
 *
 * @description Fetches the current active session
 *
 * @returns Promise<AuthSession>
 *
 * @endpoint GET /api/v1/auth/sessions/current
 */
export async function getCurrentSession(): Promise<AuthSession> {
  try {
    const response = await apiClient.get<AuthSession>('/auth/sessions/current');
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch current session');
  }
}

/**
 * Get session summary
 *
 * @description Fetches a summary of all sessions for the current user
 *
 * @returns Promise<SessionSummary>
 *
 * @endpoint GET /api/v1/auth/sessions/summary
 */
export async function getSessionSummary(): Promise<SessionSummary> {
  try {
    const response = await apiClient.get<SessionSummary>('/auth/sessions/summary');
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch session summary');
  }
}

/**
 * Revoke a specific session
 *
 * @description Terminates a specific session (logs out that device)
 *
 * @param sessionId - Session UUID to revoke
 * @returns Promise<void>
 *
 * @endpoint DELETE /api/v1/auth/sessions/:id
 */
export async function revokeSession(sessionId: string): Promise<void> {
  try {
    await apiClient.delete(API_ENDPOINTS.auth.revokeSession(sessionId));
  } catch (error) {
    throw handleAPIError(error, 'Failed to revoke session');
  }
}

/**
 * Revoke all other sessions
 *
 * @description Terminates all sessions except the current one
 *
 * @returns Promise<{ revoked_count: number }>
 *
 * @endpoint DELETE /api/v1/auth/sessions
 */
export async function revokeAllOtherSessions(): Promise<{ revoked_count: number }> {
  try {
    const response = await apiClient.delete<{ revoked_count: number }>('/auth/sessions');
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to revoke all sessions');
  }
}

/**
 * Revoke sessions by device type
 *
 * @description Terminates all sessions from a specific device type
 *
 * @param deviceType - Device type to revoke
 * @returns Promise<{ revoked_count: number }>
 *
 * @endpoint DELETE /api/v1/auth/sessions/device/:deviceType
 */
export async function revokeSessionsByDevice(
  deviceType: SessionDeviceType,
): Promise<{ revoked_count: number }> {
  try {
    const response = await apiClient.delete<{ revoked_count: number }>(
      `/auth/sessions/device/${deviceType}`,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to revoke sessions by device');
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Auth Sessions API namespace
 *
 * @usage
 * ```ts
 * import { authSessionsAPI } from '@/services/api/authSessionsAPI';
 *
 * // Get all sessions
 * const sessions = await authSessionsAPI.getAll();
 *
 * // Revoke a specific session
 * await authSessionsAPI.revoke('session-id');
 *
 * // Revoke all other sessions
 * await authSessionsAPI.revokeAllOthers();
 * ```
 */
export const authSessionsAPI = {
  // Get sessions
  getAll: getSessions,
  getById: getSessionById,
  getCurrent: getCurrentSession,
  getSummary: getSessionSummary,

  // Revoke sessions
  revoke: revokeSession,
  revokeAllOthers: revokeAllOtherSessions,
  revokeByDevice: revokeSessionsByDevice,
};

export default authSessionsAPI;
