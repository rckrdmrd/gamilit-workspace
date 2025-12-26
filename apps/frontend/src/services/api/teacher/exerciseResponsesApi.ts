/**
 * Exercise Responses API Service
 *
 * Provides endpoints for viewing and analyzing student exercise attempts and responses.
 * This API allows teachers to:
 * - View all exercise attempts with filtering and pagination
 * - Get detailed information about specific attempts
 * - View all attempts by a student
 * - View all responses for a specific exercise
 *
 * @module services/api/teacher/exerciseResponsesApi
 */

import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '@/config/api.config';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Query parameters for fetching attempts list
 */
export interface GetAttemptsQuery {
  page?: number;
  limit?: number;
  student_id?: string;
  student_search?: string;
  exercise_id?: string;
  module_id?: string;
  classroom_id?: string;
  from_date?: string;
  to_date?: string;
  is_correct?: boolean;
  sort_by?: 'submitted_at' | 'score' | 'time';
  sort_order?: 'asc' | 'desc';
}

/**
 * Single attempt response (list view)
 */
export interface AttemptResponse {
  id: string;
  student_id: string;
  student_name: string;
  exercise_id: string;
  exercise_title: string;
  module_name: string;
  attempt_number: number;
  submitted_answers: Record<string, unknown>;
  is_correct: boolean;
  score: number;
  time_spent_seconds: number;
  hints_used: number;
  comodines_used: string[];
  xp_earned: number;
  ml_coins_earned: number;
  submitted_at: string;
}

/**
 * Detailed attempt response (includes correct answers)
 */
export interface AttemptDetailResponse extends AttemptResponse {
  correct_answer: Record<string, unknown>;
  exercise_type: string;
  max_score: number;
}

/**
 * Paginated list of attempts
 */
export interface AttemptsListResponse {
  data: AttemptResponse[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// ============================================================================
// API SERVICE
// ============================================================================

/**
 * Exercise Responses API Service
 *
 * @example
 * ```typescript
 * // Get all attempts with filters
 * const attempts = await exerciseResponsesApi.getAttempts({
 *   classroom_id: 'classroom-123',
 *   page: 1,
 *   limit: 20
 * });
 *
 * // Get single attempt detail
 * const detail = await exerciseResponsesApi.getAttemptDetail('attempt-123');
 *
 * // Get attempts by student
 * const studentAttempts = await exerciseResponsesApi.getAttemptsByStudent('student-123');
 * ```
 */
export const exerciseResponsesApi = {
  /**
   * Get paginated list of attempts with optional filters
   *
   * @param query - Query parameters for filtering and pagination
   * @returns Promise with paginated attempts list
   */
  getAttempts: async (query: GetAttemptsQuery = {}): Promise<AttemptsListResponse> => {
    const response = await apiClient.get<AttemptsListResponse>(
      API_ENDPOINTS.teacher.attempts.list,
      { params: query }
    );
    return response.data;
  },

  /**
   * Get detailed information about a specific attempt
   * Includes correct answers for comparison
   *
   * @param id - Attempt ID
   * @returns Promise with detailed attempt information
   */
  getAttemptDetail: async (id: string): Promise<AttemptDetailResponse> => {
    const response = await apiClient.get<AttemptDetailResponse>(
      API_ENDPOINTS.teacher.attempts.get(id)
    );
    return response.data;
  },

  /**
   * Get all attempts by a specific student
   *
   * @param studentId - Student ID
   * @returns Promise with array of student's attempts
   */
  getAttemptsByStudent: async (studentId: string): Promise<AttemptResponse[]> => {
    const response = await apiClient.get<AttemptResponse[]>(
      API_ENDPOINTS.teacher.attempts.byStudent(studentId)
    );
    return response.data;
  },

  /**
   * Get all responses for a specific exercise
   * Useful for seeing how all students performed on a particular exercise
   *
   * @param exerciseId - Exercise ID
   * @param query - Optional query parameters for filtering and pagination
   * @returns Promise with paginated list of exercise responses
   */
  getExerciseResponses: async (
    exerciseId: string,
    query: GetAttemptsQuery = {},
  ): Promise<AttemptsListResponse> => {
    const response = await apiClient.get<AttemptsListResponse>(
      API_ENDPOINTS.teacher.attempts.exerciseResponses(exerciseId),
      { params: query }
    );
    return response.data;
  },
};

/**
 * Type alias for the API service
 */
export type ExerciseResponsesAPI = typeof exerciseResponsesApi;
