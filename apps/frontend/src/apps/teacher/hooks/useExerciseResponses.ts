/**
 * useExerciseResponses Hook - Manage exercise attempts and responses
 *
 * Provides React Query-based data fetching for:
 * - Paginated list of exercise attempts with filters
 * - Detailed attempt information
 * - Student-specific attempts
 * - Exercise-specific responses
 *
 * @module apps/teacher/hooks/useExerciseResponses
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { exerciseResponsesApi } from '@services/api/teacher';
import type {
  GetAttemptsQuery,
  AttemptResponse,
  AttemptDetailResponse,
  AttemptsListResponse,
} from '@services/api/teacher';

// ============================================================================
// HOOK: useExerciseResponses
// ============================================================================

/**
 * Hook to fetch paginated list of exercise attempts with filters
 *
 * @param query - Query parameters for filtering and pagination
 * @returns React Query result with attempts data
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch } = useExerciseResponses({
 *   classroom_id: 'classroom-123',
 *   page: 1,
 *   limit: 20,
 *   is_correct: false // Only show incorrect attempts
 * });
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <ErrorMessage />;
 *
 * return (
 *   <ResponsesTable
 *     attempts={data.data}
 *     total={data.total}
 *     onRefresh={refetch}
 *   />
 * );
 * ```
 */
export function useExerciseResponses(
  query: GetAttemptsQuery = {},
): UseQueryResult<AttemptsListResponse, Error> {
  return useQuery<AttemptsListResponse, Error>({
    queryKey: ['teacher', 'attempts', query],
    queryFn: () => exerciseResponsesApi.getAttempts(query),
    staleTime: 2 * 60 * 1000, // 2 minutes - data considered fresh
    gcTime: 5 * 60 * 1000, // 5 minutes - cache garbage collection
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: true, // Refetch when component mounts
    retry: 1, // Retry once on failure
  });
}

// ============================================================================
// HOOK: useAttemptDetail
// ============================================================================

/**
 * Hook to fetch detailed information about a specific attempt
 * Includes correct answers for comparison
 *
 * @param attemptId - Attempt ID to fetch
 * @param enabled - Whether the query should run (default: true if attemptId exists)
 * @returns React Query result with detailed attempt data
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useAttemptDetail(selectedAttemptId);
 *
 * if (!selectedAttemptId) return null;
 * if (isLoading) return <Spinner />;
 * if (error) return <ErrorMessage />;
 *
 * return (
 *   <AttemptDetailView
 *     attempt={data}
 *     studentAnswer={data.submitted_answers}
 *     correctAnswer={data.correct_answer}
 *   />
 * );
 * ```
 */
export function useAttemptDetail(
  attemptId: string | null,
  enabled = true,
): UseQueryResult<AttemptDetailResponse, Error> {
  return useQuery<AttemptDetailResponse, Error>({
    queryKey: ['teacher', 'attempts', 'detail', attemptId],
    queryFn: () => {
      if (!attemptId) {
        throw new Error('Attempt ID is required');
      }
      return exerciseResponsesApi.getAttemptDetail(attemptId);
    },
    enabled: !!attemptId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes - detailed data stays fresh longer
    gcTime: 10 * 60 * 1000, // 10 minutes - cache garbage collection
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

// ============================================================================
// HOOK: useAttemptsByStudent
// ============================================================================

/**
 * Hook to fetch all attempts by a specific student
 *
 * @param studentId - Student ID to fetch attempts for
 * @param enabled - Whether the query should run (default: true if studentId exists)
 * @returns React Query result with student's attempts
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useAttemptsByStudent(selectedStudentId);
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <ErrorMessage />;
 *
 * return (
 *   <StudentAttemptsTable
 *     studentId={selectedStudentId}
 *     attempts={data}
 *   />
 * );
 * ```
 */
export function useAttemptsByStudent(
  studentId: string | null,
  enabled = true,
): UseQueryResult<AttemptResponse[], Error> {
  return useQuery<AttemptResponse[], Error>({
    queryKey: ['teacher', 'attempts', 'student', studentId],
    queryFn: () => {
      if (!studentId) {
        throw new Error('Student ID is required');
      }
      return exerciseResponsesApi.getAttemptsByStudent(studentId);
    },
    enabled: !!studentId && enabled,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

// ============================================================================
// HOOK: useExerciseSpecificResponses
// ============================================================================

/**
 * Hook to fetch all responses for a specific exercise
 * Useful for analyzing how all students performed on a particular exercise
 *
 * @param exerciseId - Exercise ID to fetch responses for
 * @param query - Optional query parameters for filtering and pagination
 * @param enabled - Whether the query should run (default: true if exerciseId exists)
 * @returns React Query result with exercise responses
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useExerciseSpecificResponses(
 *   exerciseId,
 *   { page: 1, limit: 20 }
 * );
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <ErrorMessage />;
 *
 * return (
 *   <ExerciseAnalysisView
 *     exerciseId={exerciseId}
 *     responses={data.data}
 *     total={data.total}
 *   />
 * );
 * ```
 */
export function useExerciseSpecificResponses(
  exerciseId: string | null,
  query: GetAttemptsQuery = {},
  enabled = true,
): UseQueryResult<AttemptsListResponse, Error> {
  return useQuery<AttemptsListResponse, Error>({
    queryKey: ['teacher', 'exercises', exerciseId, 'responses', query],
    queryFn: () => {
      if (!exerciseId) {
        throw new Error('Exercise ID is required');
      }
      return exerciseResponsesApi.getExerciseResponses(exerciseId, query);
    },
    enabled: !!exerciseId && enabled,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
}
