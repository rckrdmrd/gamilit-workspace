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
  // FIX AUDIT-TASK-008: rubric es opcional, backend puede no tener rubric para algunos tipos
  rubric?: RubricCriterion[];
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
    // FIX BUG-TEACHER-REVIEWS-002 2026-01-08: Agregar tipo de ejercicio
    type?: string;
    exercise_type?: string;
  };
  submission?: {
    id: string;
    answers?: unknown;
    // FIX TASK-2026-01-18-008: Backend returns answer_data (snake_case)
    answer_data?: unknown;
    // FIX BUG-TEACHER-REVIEWS-002 2026-01-08: Soportar ambos formatos (camelCase y snake_case)
    submittedAt?: Date;
    submitted_at?: Date;
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
 * TASK-2026-01-18-010: Actualizado para coincidir con backend CreateReviewDto
 *
 * Backend espera:
 * - rubricScores: Record<string, number> (e.g., { creativity: 25, accuracy: 30 })
 * - totalScore: number (0-100)
 * - generalFeedback?: string
 * - detailedFeedback?: Record<string, unknown>
 */
export interface UpdateReviewRequest {
  rubricScores?: Record<string, number>;
  totalScore?: number;
  generalFeedback?: string;
  detailedFeedback?: Record<string, unknown>;
  status?: ReviewStatus;
}

/**
 * Request to complete a review
 * TASK-2026-01-18-010: El endpoint backend NO acepta body
 * Las evaluaciones deben guardarse ANTES con updateReview()
 *
 * @deprecated Use updateReview() first, then completeReview() without params
 */
export interface CompleteReviewRequest {
  evaluations?: RubricEvaluation[];
  generalFeedback?: string;
  notifyStudent?: boolean;
}

/**
 * Reward information returned after completing a review
 * FIX GAP-CRIT-001: Added to show rewards in frontend
 */
export interface ReviewRewards {
  xp_earned: number;
  ml_coins_earned: number;
  rankUp: {
    newRank: string;
    previousRank: string;
    bonusMLCoins: number;
    newMultiplier: number;
  } | null;
}

/**
 * Response when completing a review
 * FIX GAP-CRIT-001: Now includes rewards information
 */
export interface CompleteReviewResponse {
  review: ManualReview;
  rewards: ReviewRewards | null;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Paginated reviews response from backend
 * FIX BUG-TEACHER-REVIEWS-001 2026-01-07: Handle paginated response format
 */
export interface PaginatedReviewsResponse {
  reviews: ManualReview[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * TASK-2026-01-18-012: Filtros para getMyReviews con soporte de status
 */
export interface MyReviewsFilters {
  status?: ReviewStatus | 'all';
  exerciseId?: string;
  moduleId?: string;
  classroomId?: string;
  page?: number;
  limit?: number;
}

/**
 * Get reviews for the current teacher with status filter
 * TASK-2026-01-18-012: Permite ver reviews pendientes, completados o todos
 *
 * @param filters - Optional filters including status
 * @returns List of reviews matching filters
 */
export const getMyReviews = async (filters?: MyReviewsFilters): Promise<ManualReview[]> => {
  const params: Record<string, string | number | undefined> = {};

  if (filters?.status && filters.status !== 'all') {
    params.status = filters.status;
  }
  if (filters?.exerciseId) params.exerciseId = filters.exerciseId;
  if (filters?.moduleId) params.moduleId = filters.moduleId;
  if (filters?.classroomId) params.classroomId = filters.classroomId;
  if (filters?.page) params.page = filters.page;
  if (filters?.limit) params.limit = filters.limit;

  const { data } = await apiClient.get<PaginatedReviewsResponse | ManualReview[]>(
    API_ENDPOINTS.teacher.reviews.myReviews,
    { params },
  );

  // Handle both paginated response and array format
  if (data && typeof data === 'object' && 'reviews' in data && Array.isArray(data.reviews)) {
    return data.reviews;
  }

  if (Array.isArray(data)) {
    return data;
  }

  console.warn('[manualReviewApi] getMyReviews unexpected data format:', data);
  return [];
};

/**
 * Get pending reviews for the current teacher
 *
 * @param filters - Optional filters
 * @returns List of pending reviews
 *
 * FIX BUG-TEACHER-REVIEWS-001 2026-01-07: Backend returns paginated object,
 * we extract the reviews array for backwards compatibility with existing components
 */
export const getPendingReviews = async (filters?: {
  exerciseId?: string;
  moduleId?: string;
  classroomId?: string;
}): Promise<ManualReview[]> => {
  const { data } = await apiClient.get<PaginatedReviewsResponse | ManualReview[]>(
    API_ENDPOINTS.teacher.reviews.pending,
    { params: filters },
  );

  // Handle both paginated response (new format) and array (old format for backwards compatibility)
  if (data && typeof data === 'object' && 'reviews' in data && Array.isArray(data.reviews)) {
    return data.reviews;
  }

  // If already an array (old format or fallback), return as-is
  if (Array.isArray(data)) {
    return data;
  }

  // Fallback to empty array if data format is unexpected
  console.warn('[manualReviewApi] Unexpected data format:', data);
  return [];
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
 * TASK-2026-01-18-010: El endpoint backend NO acepta body.
 * Las evaluaciones (rubricScores, totalScore, feedback) deben guardarse
 * ANTES con updateReview().
 *
 * Este endpoint:
 * 1. Marca el review como 'completed'
 * 2. Llama a gradeSubmission() para calificar el submission
 * 3. Llama a claimRewards() para distribuir XP y ML Coins
 * 4. Envía notificación al estudiante
 *
 * @param reviewId - Review ID
 * @param _completion - DEPRECATED: Body ignorado por backend
 * @returns Completion response with rewards info
 */
export const completeReview = async (
  reviewId: string,
  _completion?: CompleteReviewRequest
): Promise<CompleteReviewResponse> => {
  // TASK-2026-01-18-010: Backend no acepta body, solo POST con ID
  const { data } = await apiClient.post<CompleteReviewResponse>(
    API_ENDPOINTS.teacher.reviews.complete(reviewId),
    {} // Empty body - backend ignores any sent data
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
  rubric: RubricCriterion[] | undefined | null,
  evaluations: RubricEvaluation[] | undefined | null
): number => {
  // Guard against undefined/null arrays
  if (!rubric || !evaluations || rubric.length === 0 || evaluations.length === 0) {
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
  rubric: RubricCriterion[] | undefined | null,
  evaluations: RubricEvaluation[] | undefined | null
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Guard against undefined/null arrays
  if (!rubric || !evaluations) {
    return { valid: false, errors: ['Datos de rúbrica no disponibles'] };
  }

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
  getMyReviews,  // TASK-2026-01-18-012
  getReviewById,
  startReview,
  updateReview,
  completeReview,
  calculateTotalScore,
  validateEvaluations,
};

export default manualReviewApi;
