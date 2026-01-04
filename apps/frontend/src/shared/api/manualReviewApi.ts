/**
 * Manual Review API Client
 *
 * API client for manual review service used in modules 4 and 5.
 * Teachers can review, grade, and provide feedback on student submissions
 * that require manual evaluation (essays, multimedia projects, etc.)
 */

import apiClient from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Review Status
 */
export type ReviewStatus = 'pending' | 'in_progress' | 'completed' | 'returned';

/**
 * Media Attachment
 */
export interface MediaAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

/**
 * Rubric Criterion
 */
export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  maxPoints: number;
  weight?: number;
}

/**
 * Rubric Evaluation (for a single criterion)
 */
export interface RubricEvaluation {
  criterionId: string;
  score: number;
  feedback?: string;
}

/**
 * Manual Review Entity
 */
export interface ManualReview {
  id: string;
  submissionId: string;
  exerciseId: string;
  studentId: string;
  teacherId?: string;
  status: ReviewStatus;
  rubric: RubricCriterion[];
  evaluations?: RubricEvaluation[];
  totalScore?: number;
  generalFeedback?: string;
  mediaAttachments?: MediaAttachment[];
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Populated fields (from backend joins)
  student?: {
    id: string;
    name: string;
    email: string;
  };
  exercise?: {
    id: string;
    title: string;
    moduleId: string;
  };
  submission?: {
    id: string;
    answers: unknown;
    submittedAt: Date;
  };
}

/**
 * Request to start a review
 */
export interface StartReviewRequest {
  reviewId: string;
}

/**
 * Request to update a review (save progress)
 */
export interface UpdateReviewRequest {
  evaluations?: RubricEvaluation[];
  generalFeedback?: string;
  status?: ReviewStatus;
}

/**
 * Request to complete a review
 */
export interface CompleteReviewRequest {
  evaluations: RubricEvaluation[];
  generalFeedback?: string;
  notifyStudent?: boolean;
}

/**
 * Response when completing a review
 */
export interface CompleteReviewResponse {
  success: boolean;
  review: ManualReview;
  notificationSent?: boolean;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get pending reviews for the current teacher
 *
 * @param filters - Optional filters
 * @returns List of pending reviews
 */
export const getPendingReviews = async (filters?: {
  exerciseId?: string;
  moduleId?: string;
  classroomId?: string;
}): Promise<ManualReview[]> => {
  const { data } = await apiClient.get<ManualReview[]>(API_ENDPOINTS.teacher.reviews.pending, {
    params: filters,
  });
  return data;
};

/**
 * Get a specific review by ID
 *
 * @param reviewId - Review ID
 * @returns Review with full details
 */
export const getReviewById = async (reviewId: string): Promise<ManualReview> => {
  const { data } = await apiClient.get<ManualReview>(API_ENDPOINTS.teacher.reviews.get(reviewId));
  return data;
};

/**
 * Start a review (marks it as in_progress and assigns to current teacher)
 *
 * @param reviewId - Review ID to start
 * @returns Started review
 */
export const startReview = async (reviewId: string): Promise<ManualReview> => {
  const { data } = await apiClient.post<ManualReview>(
    API_ENDPOINTS.teacher.reviews.start(reviewId),
    {}
  );
  return data;
};

/**
 * Update a review (save progress)
 *
 * @param reviewId - Review ID
 * @param updates - Partial updates to save
 * @returns Updated review
 */
export const updateReview = async (
  reviewId: string,
  updates: UpdateReviewRequest
): Promise<ManualReview> => {
  const { data } = await apiClient.put<ManualReview>(
    API_ENDPOINTS.teacher.reviews.update(reviewId),
    updates
  );
  return data;
};

/**
 * Complete a review and send feedback to student
 *
 * @param reviewId - Review ID
 * @param completion - Final evaluation and feedback
 * @returns Completion response with notification status
 */
export const completeReview = async (
  reviewId: string,
  completion: CompleteReviewRequest
): Promise<CompleteReviewResponse> => {
  const { data } = await apiClient.post<CompleteReviewResponse>(
    API_ENDPOINTS.teacher.reviews.complete(reviewId),
    completion
  );
  return data;
};

/**
 * Calculate total score from rubric evaluations
 *
 * @param rubric - Rubric criteria
 * @param evaluations - Evaluations for each criterion
 * @returns Total score (0-100)
 */
export const calculateTotalScore = (
  rubric: RubricCriterion[],
  evaluations: RubricEvaluation[]
): number => {
  if (rubric.length === 0 || evaluations.length === 0) {
    return 0;
  }

  const totalPossiblePoints = rubric.reduce((sum, criterion) => {
    const weight = criterion.weight || 1;
    return sum + criterion.maxPoints * weight;
  }, 0);

  const totalEarnedPoints = evaluations.reduce((sum, evaluation) => {
    const criterion = rubric.find((c) => c.id === evaluation.criterionId);
    if (!criterion) return sum;

    const weight = criterion.weight || 1;
    return sum + evaluation.score * weight;
  }, 0);

  if (totalPossiblePoints === 0) return 0;

  return Math.round((totalEarnedPoints / totalPossiblePoints) * 100);
};

/**
 * Validate rubric evaluations
 *
 * @param rubric - Rubric criteria
 * @param evaluations - Evaluations to validate
 * @returns Validation result
 */
export const validateEvaluations = (
  rubric: RubricCriterion[],
  evaluations: RubricEvaluation[]
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check that all criteria are evaluated
  for (const criterion of rubric) {
    const evaluation = evaluations.find((e) => e.criterionId === criterion.id);
    if (!evaluation) {
      errors.push(`Falta evaluar: ${criterion.name}`);
      continue;
    }

    // Check that score is within range
    if (evaluation.score < 0 || evaluation.score > criterion.maxPoints) {
      errors.push(
        `Puntaje inválido para ${criterion.name}: debe estar entre 0 y ${criterion.maxPoints}`
      );
    }
  }

  // Check for evaluations of non-existent criteria
  for (const evaluation of evaluations) {
    const criterion = rubric.find((c) => c.id === evaluation.criterionId);
    if (!criterion) {
      errors.push(`Evaluación de criterio inexistente: ${evaluation.criterionId}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// ============================================================================
// EXPORTS
// ============================================================================

export const manualReviewApi = {
  getPendingReviews,
  getReviewById,
  startReview,
  updateReview,
  completeReview,
  calculateTotalScore,
  validateEvaluations,
};

export default manualReviewApi;
