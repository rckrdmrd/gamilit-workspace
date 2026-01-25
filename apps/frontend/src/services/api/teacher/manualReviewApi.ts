/**
 * Manual Review API Client
 *
 * API client for the Teacher Manual Review system.
 * Provides methods for managing manual reviews of creative exercises (Modules 3, 4, 5).
 *
 * @module manualReviewApi
 * @created 2026-01-25
 * @task TASK-2026-01-25-ANALISIS-PORTAL-TEACHER (GAP-API-001)
 */

import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '@/config/api.config';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Review status enum
 * @synchronized-with backend/src/modules/progress/entities/manual-review.entity.ts
 */
export enum ManualReviewStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  RETURNED = 'returned',
}

/**
 * Manual Review entity
 */
export interface ManualReview {
  id: string;
  submission_id: string;
  teacher_id: string;
  status: ManualReviewStatus;
  score: number | null;
  feedback: string | null;
  rubric_scores: Record<string, number> | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Populated relations
  submission?: {
    id: string;
    student_id: string;
    student_name?: string;
    exercise_id: string;
    exercise_title?: string;
    module_id: string;
    module_name?: string;
    content: Record<string, unknown>;
    submitted_at: string;
  };
}

/**
 * Paginated reviews response
 */
export interface PaginatedReviewsResponse {
  reviews: ManualReview[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Review statistics
 */
export interface ReviewStats {
  totalPending: number;
  urgentCount: number;
  highCount: number;
  mediumCount: number;
  normalCount: number;
}

/**
 * Module configuration for manual review
 */
export interface ReviewModuleConfig {
  id: string;
  name: string;
  number: number;
}

/**
 * Exercise configuration for manual review
 */
export interface ReviewExerciseConfig {
  id: string;
  title: string;
  exerciseType: string;
  moduleId: string;
  moduleName: string;
  moduleNumber: number;
}

/**
 * Review configuration response
 */
export interface ReviewConfigResponse {
  modules: ReviewModuleConfig[];
  exercises: ReviewExerciseConfig[];
}

/**
 * Complete review result with rewards info
 */
export interface CompleteReviewResult {
  review: ManualReview;
  rewards: {
    xp_earned: number;
    ml_coins_earned: number;
    rankUp: {
      newRank: string;
      previousRank: string;
      bonusMLCoins: number;
      newMultiplier: number;
    } | null;
  } | null;
}

/**
 * Get pending reviews query params
 */
export interface GetPendingReviewsParams {
  moduleId?: string;
  classroomId?: string;
  page?: number;
  limit?: number;
}

/**
 * Create review DTO
 */
export interface CreateReviewDto {
  submission_id: string;
  score?: number;
  feedback?: string;
  rubric_scores?: Record<string, number>;
}

/**
 * Update review DTO
 */
export interface UpdateReviewDto {
  score?: number;
  feedback?: string;
  rubric_scores?: Record<string, number>;
}

/**
 * Return for revision DTO
 */
export interface ReturnForRevisionDto {
  feedback: string;
}

// ============================================================================
// API CLIENT
// ============================================================================

/**
 * Manual Review API Client
 *
 * Provides methods to interact with the teacher manual review system:
 * - Get review configuration (modules/exercises that require manual review)
 * - List pending reviews with filters and pagination
 * - Get review details
 * - Create, update reviews
 * - Start, complete, return reviews
 * - Get review statistics
 */
export const manualReviewApi = {
  /**
   * Get configuration of exercises that require manual review
   *
   * @returns Modules and exercises requiring manual review
   */
  getConfig: async (): Promise<ReviewConfigResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.teacher.reviews.config);
    return response.data;
  },

  /**
   * Get pending reviews for the current teacher
   *
   * @param params - Filter and pagination parameters
   * @returns Paginated list of pending reviews
   */
  getPendingReviews: async (
    params: GetPendingReviewsParams = {},
  ): Promise<PaginatedReviewsResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.teacher.reviews.pending, { params });
    return response.data;
  },

  /**
   * Get pending reviews for a specific module
   *
   * @param moduleOrder - Module order number (3, 4, or 5)
   * @returns List of pending reviews for the module
   */
  getPendingByModule: async (moduleOrder: number): Promise<ManualReview[]> => {
    const response = await apiClient.get(
      `${API_ENDPOINTS.teacher.reviews.pending}/module/${moduleOrder}`,
    );
    return response.data;
  },

  /**
   * Get review statistics
   *
   * @param classroomId - Optional classroom filter
   * @returns Review statistics by priority
   */
  getStats: async (classroomId?: string): Promise<ReviewStats> => {
    const params = classroomId ? { classroomId } : undefined;
    const response = await apiClient.get('/teacher/reviews/stats', { params });
    return response.data;
  },

  /**
   * Get all reviews for the current teacher
   *
   * @param status - Optional status filter
   * @returns List of reviews
   */
  getMyReviews: async (status?: ManualReviewStatus): Promise<ManualReview[]> => {
    const params = status ? { status } : undefined;
    const response = await apiClient.get(API_ENDPOINTS.teacher.reviews.myReviews, { params });
    return response.data;
  },

  /**
   * Get a specific review by ID
   *
   * @param id - Review ID
   * @returns Review details
   */
  getById: async (id: string): Promise<ManualReview> => {
    const response = await apiClient.get(API_ENDPOINTS.teacher.reviews.get(id));
    return response.data;
  },

  /**
   * Create a new review
   *
   * @param data - Review creation data
   * @returns Created review
   */
  create: async (data: CreateReviewDto): Promise<ManualReview> => {
    const response = await apiClient.post('/teacher/reviews', data);
    return response.data;
  },

  /**
   * Update an existing review
   *
   * @param id - Review ID
   * @param data - Update data
   * @returns Updated review
   */
  update: async (id: string, data: UpdateReviewDto): Promise<ManualReview> => {
    const response = await apiClient.put(API_ENDPOINTS.teacher.reviews.update(id), data);
    return response.data;
  },

  /**
   * Start a review (marks as in_progress)
   *
   * @param id - Review ID
   * @returns Updated review
   */
  start: async (id: string): Promise<ManualReview> => {
    const response = await apiClient.post(API_ENDPOINTS.teacher.reviews.start(id));
    return response.data;
  },

  /**
   * Complete a review and distribute rewards to student
   *
   * @param id - Review ID
   * @returns Review with rewards information
   */
  complete: async (id: string): Promise<CompleteReviewResult> => {
    const response = await apiClient.post(API_ENDPOINTS.teacher.reviews.complete(id));
    return response.data;
  },

  /**
   * Return a submission for revision by the student
   *
   * @param id - Review ID
   * @param data - Feedback for the student
   * @returns Updated review
   */
  returnForRevision: async (id: string, data: ReturnForRevisionDto): Promise<ManualReview> => {
    const response = await apiClient.post(`/teacher/reviews/${id}/return`, data);
    return response.data;
  },
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ManualReviewAPI = typeof manualReviewApi;
