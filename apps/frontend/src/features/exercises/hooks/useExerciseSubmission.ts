/**
 * useExerciseSubmission Hook
 *
 * ISSUE: #4 (P0) - Exercise Interfaces
 * FECHA: 2025-11-04
 * SPRINT: Sprint 1
 *
 * Hook for submitting exercise answers and handling results.
 * Automatically invalidates dashboard and modules cache on successful submission.
 */

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import type { ExerciseSubmission, ExerciseSubmissionResult } from '../types/exercise.types';
import { dashboardKeys } from '@/apps/student/hooks/useDashboardData';
import { userModulesKeys } from '@/apps/student/hooks/useUserModules';

interface UseExerciseSubmissionOptions {
  onSuccess?: (result: ExerciseSubmissionResult) => void;
  onError?: (error: Error) => void;
}

export const useExerciseSubmission = (options?: UseExerciseSubmissionOptions) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<ExerciseSubmissionResult | null>(null);

  const submitExercise = async (
    submission: ExerciseSubmission,
  ): Promise<ExerciseSubmissionResult | null> => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Backend endpoint: POST /progress/submissions/submit
      // Expects: { userId, exerciseId, answers }
      const { data } = await apiClient.post<ExerciseSubmissionResult>(
        '/progress/submissions/submit',
        submission,
      );

      setResult(data);

      // Invalidate dashboard and modules cache to refresh progress data
      // This ensures the UI updates immediately after completing an exercise
      if (submission.userId) {
        console.log('🔄 [useExerciseSubmission] Invalidating dashboard and modules cache...');

        // Invalidate all dashboard data (rank, progress, coins, achievements)
        await queryClient.invalidateQueries({
          queryKey: dashboardKeys.user(submission.userId),
        });

        // Invalidate modules data to update progress bars
        await queryClient.invalidateQueries({
          queryKey: userModulesKeys.user(submission.userId),
        });

        console.log('✅ [useExerciseSubmission] Cache invalidated successfully');
      }

      options?.onSuccess?.(data);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to submit exercise');
      setError(error);
      options?.onError?.(error);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setIsSubmitting(false);
    setError(null);
    setResult(null);
  };

  return {
    submitExercise,
    isSubmitting,
    error,
    result,
    reset,
  };
};
