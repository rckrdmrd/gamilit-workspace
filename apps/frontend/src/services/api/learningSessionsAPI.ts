/**
 * Learning Sessions API Integration
 *
 * API client for learning sessions (sesiones de aprendizaje).
 * Handles session creation, tracking, engagement updates, and statistics.
 *
 * @module learningSessionsAPI
 * @version 1.0.0
 * @date 2026-01-13
 */

import { apiClient } from '@/services/api/apiClient';
import { handleAPIError } from './apiErrorHandler';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Device type for session tracking
 */
export type DeviceType = 'desktop' | 'tablet' | 'mobile';

/**
 * Statistics period
 */
export type StatsPeriod = 'daily' | 'weekly' | 'monthly';

/**
 * Learning Session
 *
 * Represents a learning session record
 */
export interface LearningSession {
  id: string;
  user_id: string;
  module_id?: string;
  started_at: string;
  ended_at?: string;
  duration?: string;
  is_active: boolean;
  exercises_completed?: number;
  exercises_attempted?: number;
  xp_earned?: number;
  ml_coins_earned?: number;
  engagement_score?: number;
  focus_time?: string;
  idle_time?: string;
  device_type?: DeviceType;
  browser?: string;
  ip_address?: string;
  location?: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Create Learning Session DTO
 */
export interface CreateLearningSessionDto {
  user_id: string;
  module_id?: string;
  device_type?: DeviceType;
}

/**
 * Update Engagement DTO
 */
export interface UpdateEngagementDto {
  clicks_count?: number;
  page_views?: number;
  resource_downloads?: number;
  exercises_attempted?: number;
  exercises_completed?: number;
  content_viewed?: number;
  active_time?: string;
  idle_time?: string;
}

/**
 * Session Statistics
 */
export interface SessionStats {
  user_id: string;
  period: StatsPeriod;
  total_sessions: number;
  total_time: string;
  average_duration: string;
  total_exercises_completed: number;
  total_xp_earned: number;
  total_ml_coins_earned: number;
  average_engagement: number;
  sessions_per_day: number;
  most_active_day?: string;
  most_active_time?: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Create a new learning session
 *
 * @description Starts a new learning session for tracking time and user activity
 *
 * @param data - Session creation data
 * @returns Promise<LearningSession>
 *
 * @endpoint POST /api/v1/progress/sessions
 *
 * @example
 * ```ts
 * const session = await createSession({
 *   user_id: 'user-uuid',
 *   module_id: 'module-uuid',
 *   device_type: 'desktop'
 * });
 * ```
 */
export async function createSession(data: CreateLearningSessionDto): Promise<LearningSession> {
  try {
    const response = await apiClient.post<LearningSession>('/progress/sessions', data);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to create learning session');
  }
}

/**
 * Get session by ID
 *
 * @description Fetches detailed information about a specific session
 *
 * @param sessionId - Session UUID
 * @returns Promise<LearningSession>
 *
 * @endpoint GET /api/v1/progress/sessions/:id
 */
export async function getSessionById(sessionId: string): Promise<LearningSession> {
  try {
    const response = await apiClient.get<LearningSession>(`/progress/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch session');
  }
}

/**
 * Get user sessions
 *
 * @description Fetches all learning sessions for a user, ordered by most recent
 *
 * @param userId - User UUID
 * @returns Promise<LearningSession[]>
 *
 * @endpoint GET /api/v1/progress/sessions/users/:userId
 */
export async function getUserSessions(userId: string): Promise<LearningSession[]> {
  try {
    const response = await apiClient.get<LearningSession[]>(
      `/progress/sessions/users/${userId}`,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch user sessions');
  }
}

/**
 * Get active session
 *
 * @description Fetches the currently active learning session for a user
 *
 * @param userId - User UUID
 * @returns Promise<LearningSession | null>
 *
 * @endpoint GET /api/v1/progress/sessions/users/:userId/active
 */
export async function getActiveSession(userId: string): Promise<LearningSession | null> {
  try {
    const response = await apiClient.get<LearningSession | null>(
      `/progress/sessions/users/${userId}/active`,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch active session');
  }
}

/**
 * End a learning session
 *
 * @description Ends an active session, calculating duration and final stats
 *
 * @param sessionId - Session UUID
 * @returns Promise<LearningSession>
 *
 * @endpoint POST /api/v1/progress/sessions/:id/end
 */
export async function endSession(sessionId: string): Promise<LearningSession> {
  try {
    const response = await apiClient.post<LearningSession>(
      `/progress/sessions/${sessionId}/end`,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to end session');
  }
}

/**
 * Update session engagement
 *
 * @description Updates the engagement score based on user interactions
 *
 * @param sessionId - Session UUID
 * @param data - Engagement metrics to update
 * @returns Promise<LearningSession>
 *
 * @endpoint PATCH /api/v1/progress/sessions/:id/engagement
 */
export async function updateEngagement(
  sessionId: string,
  data: UpdateEngagementDto,
): Promise<LearningSession> {
  try {
    const response = await apiClient.patch<LearningSession>(
      `/progress/sessions/${sessionId}/engagement`,
      data,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to update engagement');
  }
}

/**
 * Get session statistics
 *
 * @description Fetches aggregated session statistics for a user by period
 *
 * @param userId - User UUID
 * @param period - Aggregation period (daily, weekly, monthly)
 * @returns Promise<SessionStats>
 *
 * @endpoint GET /api/v1/progress/sessions/users/:userId/stats
 */
export async function getSessionStats(
  userId: string,
  period: StatsPeriod = 'daily',
): Promise<SessionStats> {
  try {
    const response = await apiClient.get<SessionStats>(
      `/progress/sessions/users/${userId}/stats`,
      { params: { period } },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch session statistics');
  }
}

/**
 * Get sessions by date range
 *
 * @description Fetches all sessions for a user within a date range
 *
 * @param userId - User UUID
 * @param startDate - Start date (ISO 8601)
 * @param endDate - End date (ISO 8601)
 * @returns Promise<LearningSession[]>
 *
 * @endpoint GET /api/v1/progress/sessions/users/:userId/range
 */
export async function getSessionsByDateRange(
  userId: string,
  startDate: string,
  endDate: string,
): Promise<LearningSession[]> {
  try {
    const response = await apiClient.get<LearningSession[]>(
      `/progress/sessions/users/${userId}/range`,
      { params: { startDate, endDate } },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch sessions by date range');
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Learning Sessions API namespace
 *
 * @usage
 * ```ts
 * import { learningSessionsAPI } from '@/services/api/learningSessionsAPI';
 *
 * // Start a session
 * const session = await learningSessionsAPI.create({ user_id: 'user-id' });
 *
 * // Get active session
 * const active = await learningSessionsAPI.getActive('user-id');
 *
 * // End session
 * await learningSessionsAPI.end(session.id);
 *
 * // Get statistics
 * const stats = await learningSessionsAPI.getStats('user-id', 'weekly');
 * ```
 */
export const learningSessionsAPI = {
  // Session lifecycle
  create: createSession,
  getById: getSessionById,
  end: endSession,

  // User sessions
  getUserSessions,
  getActive: getActiveSession,
  getByDateRange: getSessionsByDateRange,

  // Engagement & stats
  updateEngagement,
  getStats: getSessionStats,
};

export default learningSessionsAPI;
