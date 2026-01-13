/**
 * Exercise Attempts API Integration
 *
 * API client for exercise attempts (intentos de ejercicios).
 * Handles attempt tracking, history, analytics, and export.
 *
 * @module exerciseAttemptsAPI
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
 * Exercise Attempt Status
 */
export type AttemptStatus = 'in_progress' | 'completed' | 'abandoned' | 'timed_out';

/**
 * Exercise Attempt
 *
 * Represents a single attempt at an exercise
 */
export interface ExerciseAttempt {
  id: string;
  user_id: string;
  exercise_id: string;
  module_id?: string;
  session_id?: string;
  status: AttemptStatus;
  started_at: string;
  completed_at?: string;
  time_spent?: number;
  score?: number;
  max_score?: number;
  percentage?: number;
  is_correct?: boolean;
  answers?: Record<string, unknown>;
  feedback?: string;
  hints_used?: number;
  retries?: number;
  xp_earned?: number;
  ml_coins_earned?: number;
  created_at: string;
  updated_at?: string;
}

/**
 * Attempt Analytics
 */
export interface AttemptAnalytics {
  user_id: string;
  total_attempts: number;
  completed_attempts: number;
  correct_attempts: number;
  average_score: number;
  average_time_spent: number;
  total_time_spent: number;
  completion_rate: number;
  accuracy_rate: number;
  improvement_trend: number;
  strongest_modules: string[];
  weakest_modules: string[];
  recent_performance: {
    date: string;
    attempts: number;
    accuracy: number;
  }[];
}

/**
 * Create Attempt DTO
 */
export interface CreateAttemptDto {
  exercise_id: string;
  module_id?: string;
  session_id?: string;
}

/**
 * Submit Attempt DTO
 */
export interface SubmitAttemptDto {
  answers: Record<string, unknown>;
  time_spent?: number;
  hints_used?: number;
}

/**
 * Attempt Filters
 */
export interface AttemptFilters {
  module_id?: string;
  exercise_id?: string;
  status?: AttemptStatus;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Start a new exercise attempt
 *
 * @description Creates a new attempt record when user starts an exercise
 *
 * @param data - Attempt creation data
 * @returns Promise<ExerciseAttempt>
 *
 * @endpoint POST /api/v1/progress/attempts
 */
export async function startAttempt(data: CreateAttemptDto): Promise<ExerciseAttempt> {
  try {
    const response = await apiClient.post<ExerciseAttempt>('/progress/attempts', data);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to start exercise attempt');
  }
}

/**
 * Get attempt by ID
 *
 * @description Fetches detailed information about a specific attempt
 *
 * @param attemptId - Attempt UUID
 * @returns Promise<ExerciseAttempt>
 *
 * @endpoint GET /api/v1/progress/attempts/:id
 */
export async function getAttemptById(attemptId: string): Promise<ExerciseAttempt> {
  try {
    const response = await apiClient.get<ExerciseAttempt>(`/progress/attempts/${attemptId}`);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch attempt');
  }
}

/**
 * Get user attempts
 *
 * @description Fetches all exercise attempts for a user with optional filters
 *
 * @param userId - User UUID
 * @param filters - Optional filters
 * @returns Promise<ExerciseAttempt[]>
 *
 * @endpoint GET /api/v1/progress/attempts/users/:userId
 */
export async function getUserAttempts(
  userId: string,
  filters?: AttemptFilters,
): Promise<ExerciseAttempt[]> {
  try {
    const response = await apiClient.get<ExerciseAttempt[]>(
      API_ENDPOINTS.educational.exerciseAttempts(userId),
      { params: filters },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch user attempts');
  }
}

/**
 * Get current user attempts
 *
 * @description Fetches attempts for the authenticated user (uses JWT)
 *
 * @param filters - Optional filters
 * @returns Promise<ExerciseAttempt[]>
 *
 * @endpoint GET /api/v1/progress/attempts/me
 */
export async function getMyAttempts(filters?: AttemptFilters): Promise<ExerciseAttempt[]> {
  try {
    const response = await apiClient.get<ExerciseAttempt[]>('/progress/attempts/me', {
      params: filters,
    });
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch your attempts');
  }
}

/**
 * Submit attempt answers
 *
 * @description Submits answers for an in-progress attempt and calculates score
 *
 * @param attemptId - Attempt UUID
 * @param data - Submission data with answers
 * @returns Promise<ExerciseAttempt>
 *
 * @endpoint POST /api/v1/progress/attempts/:id/submit
 */
export async function submitAttempt(
  attemptId: string,
  data: SubmitAttemptDto,
): Promise<ExerciseAttempt> {
  try {
    const response = await apiClient.post<ExerciseAttempt>(
      `/progress/attempts/${attemptId}/submit`,
      data,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to submit attempt');
  }
}

/**
 * Abandon attempt
 *
 * @description Marks an in-progress attempt as abandoned
 *
 * @param attemptId - Attempt UUID
 * @returns Promise<ExerciseAttempt>
 *
 * @endpoint POST /api/v1/progress/attempts/:id/abandon
 */
export async function abandonAttempt(attemptId: string): Promise<ExerciseAttempt> {
  try {
    const response = await apiClient.post<ExerciseAttempt>(
      `/progress/attempts/${attemptId}/abandon`,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to abandon attempt');
  }
}

/**
 * Get attempt analytics
 *
 * @description Fetches aggregated analytics for a user's attempts
 *
 * @param userId - User UUID
 * @returns Promise<AttemptAnalytics>
 *
 * @endpoint GET /api/v1/progress/attempts/users/:userId/analytics
 */
export async function getAttemptAnalytics(userId: string): Promise<AttemptAnalytics> {
  try {
    const response = await apiClient.get<AttemptAnalytics>(
      `/progress/attempts/users/${userId}/analytics`,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch attempt analytics');
  }
}

/**
 * Get current user analytics
 *
 * @description Fetches analytics for the authenticated user
 *
 * @returns Promise<AttemptAnalytics>
 *
 * @endpoint GET /api/v1/progress/attempts/me/analytics
 */
export async function getMyAnalytics(): Promise<AttemptAnalytics> {
  try {
    const response = await apiClient.get<AttemptAnalytics>('/progress/attempts/me/analytics');
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch your analytics');
  }
}

/**
 * Export attempts to CSV
 *
 * @description Exports user's attempt history as CSV
 *
 * @param userId - User UUID
 * @param filters - Optional date range filters
 * @returns Promise<Blob>
 *
 * @endpoint GET /api/v1/progress/attempts/users/:userId/export
 */
export async function exportAttempts(
  userId: string,
  filters?: Pick<AttemptFilters, 'from_date' | 'to_date'>,
): Promise<Blob> {
  try {
    const response = await apiClient.get(`/progress/attempts/users/${userId}/export`, {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to export attempts');
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Exercise Attempts API namespace
 *
 * @usage
 * ```ts
 * import { exerciseAttemptsAPI } from '@/services/api/exerciseAttemptsAPI';
 *
 * // Start an attempt
 * const attempt = await exerciseAttemptsAPI.start({ exercise_id: 'ex-id' });
 *
 * // Submit answers
 * const result = await exerciseAttemptsAPI.submit(attempt.id, { answers: {...} });
 *
 * // Get analytics
 * const analytics = await exerciseAttemptsAPI.getMyAnalytics();
 * ```
 */
export const exerciseAttemptsAPI = {
  // Attempt lifecycle
  start: startAttempt,
  getById: getAttemptById,
  submit: submitAttempt,
  abandon: abandonAttempt,

  // User attempts
  getUserAttempts,
  getMyAttempts,

  // Analytics & Export
  getAnalytics: getAttemptAnalytics,
  getMyAnalytics,
  export: exportAttempts,
};

export default exerciseAttemptsAPI;
