/**
 * useManualReviews Hook - Manage manual review workflow for M3-M5 exercises
 *
 * Provides React Query-based data fetching and mutations for:
 * - Paginated list of pending reviews with filters
 * - Detailed review information
 * - Starting, updating, and completing reviews
 *
 * @module apps/teacher/hooks/useManualReviews
 */

import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import {
  manualReviewApi,
  ManualReview,
  UpdateReviewRequest,
  CompleteReviewRequest,
  CompleteReviewResponse,
} from '@shared/api/manualReviewApi';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const manualReviewKeys = {
  all: ['teacher', 'manualReviews'] as const,
  pending: (filters?: ManualReviewFilters) => [...manualReviewKeys.all, 'pending', filters] as const,
  detail: (id: string) => [...manualReviewKeys.all, 'detail', id] as const,
};

// ============================================================================
// TYPES
// ============================================================================

export interface ManualReviewFilters {
  exerciseId?: string;
  moduleId?: string;
  classroomId?: string;
}

// ============================================================================
// HOOK: useManualReviews
// ============================================================================

/**
 * Hook to fetch paginated list of pending manual reviews
 *
 * @param filters - Optional filters (exerciseId, moduleId, classroomId)
 * @returns React Query result with pending reviews
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch } = useManualReviews({
 *   moduleId: 'module-4'
 * });
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <ErrorMessage />;
 *
 * return <ReviewList reviews={data} onRefresh={refetch} />;
 * ```
 */
export function useManualReviews(
  filters?: ManualReviewFilters,
): UseQueryResult<ManualReview[], Error> {
  return useQuery<ManualReview[], Error>({
    queryKey: manualReviewKeys.pending(filters),
    queryFn: () => manualReviewApi.getPendingReviews(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes - data considered fresh
    gcTime: 5 * 60 * 1000, // 5 minutes - cache garbage collection
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1,
  });
}

// ============================================================================
// HOOK: useManualReviewDetail
// ============================================================================

/**
 * Hook to fetch detailed information about a specific review
 *
 * @param reviewId - Review ID to fetch
 * @param enabled - Whether the query should run (default: true if reviewId exists)
 * @returns React Query result with detailed review data
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useManualReviewDetail(selectedReviewId);
 *
 * if (!selectedReviewId) return null;
 * if (isLoading) return <Spinner />;
 *
 * return <ReviewDetail review={data} />;
 * ```
 */
export function useManualReviewDetail(
  reviewId: string | null,
  enabled = true,
): UseQueryResult<ManualReview, Error> {
  return useQuery<ManualReview, Error>({
    queryKey: manualReviewKeys.detail(reviewId ?? ''),
    queryFn: () => {
      if (!reviewId) {
        throw new Error('Review ID is required');
      }
      return manualReviewApi.getReviewById(reviewId);
    },
    enabled: !!reviewId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes - detailed data stays fresh longer
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

// ============================================================================
// HOOK: useStartReview
// ============================================================================

/**
 * Mutation hook to start a manual review
 *
 * @returns React Query mutation for starting a review
 *
 * @example
 * ```tsx
 * const { mutate: startReview, isPending } = useStartReview();
 *
 * const handleStart = (reviewId: string) => {
 *   startReview(reviewId, {
 *     onSuccess: (review) => navigate(`/teacher/reviews/${review.id}`),
 *     onError: (error) => toast.error(error.message),
 *   });
 * };
 * ```
 */
export function useStartReview(): UseMutationResult<ManualReview, Error, string> {
  const queryClient = useQueryClient();

  return useMutation<ManualReview, Error, string>({
    mutationFn: (reviewId: string) => manualReviewApi.startReview(reviewId),
    onSuccess: () => {
      // Invalidate pending reviews list to reflect the change
      queryClient.invalidateQueries({ queryKey: manualReviewKeys.all });
    },
  });
}

// ============================================================================
// HOOK: useUpdateReview
// ============================================================================

interface UpdateReviewVariables {
  reviewId: string;
  updates: UpdateReviewRequest;
}

/**
 * Mutation hook to update a review (save progress)
 *
 * @returns React Query mutation for updating a review
 *
 * @example
 * ```tsx
 * const { mutate: updateReview, isPending } = useUpdateReview();
 *
 * const handleSave = () => {
 *   updateReview({
 *     reviewId: review.id,
 *     updates: { evaluations, generalFeedback }
 *   }, {
 *     onSuccess: () => toast.success('Progreso guardado'),
 *   });
 * };
 * ```
 */
export function useUpdateReview(): UseMutationResult<ManualReview, Error, UpdateReviewVariables> {
  const queryClient = useQueryClient();

  return useMutation<ManualReview, Error, UpdateReviewVariables>({
    mutationFn: ({ reviewId, updates }) => manualReviewApi.updateReview(reviewId, updates),
    onSuccess: (data, variables) => {
      // Update the cache with the new data
      queryClient.setQueryData(manualReviewKeys.detail(variables.reviewId), data);
    },
  });
}

// ============================================================================
// HOOK: useCompleteReview
// ============================================================================

interface CompleteReviewVariables {
  reviewId: string;
  completion: CompleteReviewRequest;
}

/**
 * Mutation hook to complete a review and send feedback
 *
 * @returns React Query mutation for completing a review
 *
 * @example
 * ```tsx
 * const { mutate: completeReview, isPending } = useCompleteReview();
 *
 * const handleComplete = () => {
 *   completeReview({
 *     reviewId: review.id,
 *     completion: { evaluations, generalFeedback, notifyStudent: true }
 *   }, {
 *     onSuccess: () => {
 *       toast.success('Revision completada');
 *       navigate('/teacher/reviews');
 *     },
 *   });
 * };
 * ```
 */
export function useCompleteReview(): UseMutationResult<CompleteReviewResponse, Error, CompleteReviewVariables> {
  const queryClient = useQueryClient();

  return useMutation<CompleteReviewResponse, Error, CompleteReviewVariables>({
    mutationFn: ({ reviewId, completion }) => manualReviewApi.completeReview(reviewId, completion),
    onSuccess: (_, variables) => {
      // Invalidate all manual review queries
      queryClient.invalidateQueries({ queryKey: manualReviewKeys.all });
      // Remove the specific review from cache as it's no longer pending
      queryClient.removeQueries({ queryKey: manualReviewKeys.detail(variables.reviewId) });
    },
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

export { manualReviewApi, type ManualReview, type UpdateReviewRequest, type CompleteReviewRequest };
