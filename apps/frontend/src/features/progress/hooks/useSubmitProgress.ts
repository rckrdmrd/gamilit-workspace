/**
 * useSubmitProgress Hook
 *
 * Centralized hook for submitting exercise progress with automatic cache invalidation.
 * Use this hook in all exercise mechanics to ensure dashboard and modules update
 * immediately after completing an exercise.
 *
 * @example
 * const { submitProgress, isSubmitting } = useSubmitProgress();
 *
 * const handleComplete = async () => {
 *   const result = await submitProgress(exerciseId, userId, answers);
 *   if (result) {
 *     // Handle success
 *   }
 * };
 */

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { submitExercise, type SubmitExerciseResponse } from '../api/progressAPI';
import { dashboardKeys } from '@/apps/student/hooks/useDashboardData';
import { userModulesKeys } from '@/apps/student/hooks/useUserModules';

interface UseSubmitProgressOptions {
  onSuccess?: (result: SubmitExerciseResponse) => void;
  onError?: (error: Error) => void;
}

interface UseSubmitProgressReturn {
  submitProgress: (
    exerciseId: string,
    userId: string,
    answers: unknown,
  ) => Promise<SubmitExerciseResponse | null>;
  isSubmitting: boolean;
  error: Error | null;
  result: SubmitExerciseResponse | null;
  reset: () => void;
}

export function useSubmitProgress(options?: UseSubmitProgressOptions): UseSubmitProgressReturn {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<SubmitExerciseResponse | null>(null);

  const submitProgress = useCallback(
    async (
      exerciseId: string,
      userId: string,
      answers: unknown,
    ): Promise<SubmitExerciseResponse | null> => {
      try {
        setIsSubmitting(true);
        setError(null);

        console.log('🚀 [useSubmitProgress] Submitting exercise:', exerciseId);

        // Call the progress API
        const response = await submitExercise(exerciseId, userId, answers);

        setResult(response);

        // Invalidate dashboard and modules cache to refresh progress data
        // This ensures the UI updates immediately after completing an exercise
        console.log('🔄 [useSubmitProgress] Invalidating dashboard and modules cache...');

        // Invalidate all dashboard data (rank, progress, coins, achievements)
        await queryClient.invalidateQueries({
          queryKey: dashboardKeys.user(userId),
        });

        // Invalidate modules data to update progress bars
        await queryClient.invalidateQueries({
          queryKey: userModulesKeys.user(userId),
        });

        // Also invalidate any classroom-specific module queries
        await queryClient.invalidateQueries({
          queryKey: userModulesKeys.all,
        });

        console.log('✅ [useSubmitProgress] Cache invalidated successfully');

        options?.onSuccess?.(response);
        return response;
      } catch (err) {
        const submissionError = err instanceof Error ? err : new Error('Failed to submit exercise');
        console.error('❌ [useSubmitProgress] Submission failed:', submissionError);
        setError(submissionError);
        options?.onError?.(submissionError);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [queryClient, options],
  );

  const reset = useCallback(() => {
    setIsSubmitting(false);
    setError(null);
    setResult(null);
  }, []);

  return {
    submitProgress,
    isSubmitting,
    error,
    result,
    reset,
  };
}

export default useSubmitProgress;
