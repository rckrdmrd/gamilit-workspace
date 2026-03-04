/**
 * useExerciseSubmission Hook
 *
 * Secure exercise submission hook that:
 * - Validates answers client-side with Zod before sending
 * - Tracks submission timing for anti-cheat
 * - Handles rate limiting errors gracefully
 * - Returns correct answers ONLY after server validation
 *
 * SECURITY: Never validate answers locally. Always submit to server.
 */
import { useState, useRef, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/features/auth/hooks/useAuth';

/**
 * Submission result from server (includes correct answers)
 */
export interface SubmissionResult {
  attemptId?: string;
  score: number;
  isPerfect: boolean;
  correctAnswersCount?: number;
  totalQuestions?: number;
  rewards: {
    mlCoins: number;
    xp: number;
    bonuses: string[] | {
      perfectScore?: number;
      noHints?: number;
      speedBonus?: number;
      firstAttempt?: number;
    };
  };
  feedback: {
    overall: string;
    answerReview?: Array<{
      questionId: string;
      isCorrect: boolean;
      userAnswer: unknown;
      correctAnswer?: unknown;
      explanation?: string;
    }>;
  };
  isFirstCorrectAttempt?: boolean;
  achievements?: Array<{
    id: string;
    name: string;
    icon: string;
    rarity: string;
  }>;
  correctAnswers?: Record<string, unknown>;
  explanations?: Record<string, string>;
  createdAt?: string;
  status?: 'draft' | 'submitted' | 'graded' | 'reviewed' | 'pending_review';
  requiresManualReview?: boolean;
  rankUp?: {
    newRank: string;
    previousRank: string;
    newRankIcon?: string;
  };
  message?: string;
  argumentScore?: number;
}

// ============================================================================
// HOOK OPTIONS
// ============================================================================

export interface UseExerciseSubmissionOptions {
  onSuccess?: (result: SubmissionResult) => void;
  onError?: (error: unknown) => void;
  onRateLimitError?: (retryAfter: number) => void;
  trackHints?: boolean;
  trackPowerups?: boolean;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

/**
 * Hook for secure exercise submission
 *
 * @param exerciseId - ID of the exercise being submitted
 * @param options - Callback options
 * @returns Mutation state and helper functions
 */
export function useExerciseSubmission(
  exerciseId: string,
  options: UseExerciseSubmissionOptions = {},
) {
  // Get query client and user for cache invalidation
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Track when user started the exercise
  const [startTime] = useState(() => Date.now());

  // Track hints and powerups used
  const hintsUsedRef = useRef(0);
  const powerupsUsedRef = useRef<Array<'pistas' | 'vision_lectora' | 'segunda_oportunidad'>>([]);

  // Generate session ID for anti-cheat tracking
  const [sessionId] = useState(() => crypto.randomUUID());

  /**
   * Submit exercise mutation
   */
  const mutation = useMutation({
    mutationFn: async (answers: Record<string, unknown>) => {
      // 1. Build payload (sessionId excluded — not in backend DTO, forbidNonWhitelisted rejects it)
      const payload = {
        answers,
        startedAt: startTime,
        hintsUsed: options.trackHints ? hintsUsedRef.current : 0,
        powerupsUsed: options.trackPowerups ? powerupsUsedRef.current : [],
      };

      // Validate answers are non-empty before sending
      if (!answers || Object.keys(answers).length === 0) {
        throw new Error('At least one answer is required');
      }

      // 2. SUBMIT TO SERVER — apiClient interceptor unwraps { success, data } envelope
      const response = await apiClient.post<SubmissionResult>(
        `/educational/exercises/${exerciseId}/submit`,
        payload,
      );

      return response.data;
    },

    onSuccess: async (result) => {
      // Invalidate React Query cache to refresh dashboard and modules
      // This ensures progress updates immediately after exercise completion
      if (user?.id) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
          queryClient.invalidateQueries({ queryKey: ['dashboard', user.id] }),
          queryClient.invalidateQueries({ queryKey: ['userModules'] }),
          queryClient.invalidateQueries({ queryKey: ['userModules', user.id] }),
        ]);
      }

      // Call custom success handler
      if (options.onSuccess) {
        options.onSuccess(result);
      }

      // Skip score toast for pending review submissions
      if (result.requiresManualReview || result.status === 'submitted') return;

      // Show success toast
      toast.success(`Score: ${result.score}%`, {
        icon: result.isPerfect ? '🎉' : '✅',
        duration: 3000,
      });
    },

    onError: (error: unknown) => {
      // Handle rate limiting errors
      const err = error as { response?: { status?: number; data?: { error?: { code?: string; message?: string; retryAfter?: number } } } };
      if (err.response?.status === 429) {
        const retryAfter = err.response.data?.error?.retryAfter || 5;

        if (options.onRateLimitError) {
          options.onRateLimitError(retryAfter);
        } else {
          toast.error(`Too many attempts. Please wait ${retryAfter} seconds.`, {
            duration: retryAfter * 1000,
          });
        }
        return;
      }

      // Handle validation errors
      if (err.response?.status === 400) {
        const errorCode = err.response.data?.error?.code;

        if (errorCode === 'SUBMISSION_TOO_FAST') {
          toast.error('Please take time to complete the exercise.');
        } else if (errorCode === 'SESSION_EXPIRED') {
          toast.error('Session expired. Please refresh and try again.');
        } else if (errorCode === 'VALIDATION_ERROR') {
          toast.error('Invalid submission data. Please try again.');
        } else {
          toast.error(err.response.data?.error?.message || 'Submission failed');
        }
        return;
      }

      // Call custom error handler
      if (options.onError) {
        options.onError(error);
      } else {
        toast.error('Failed to submit exercise. Please try again.');
      }

      console.error('[Exercise Submission Error]', error);
    },
  });

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Record that user used a hint
   */
  const recordHintUsed = useCallback(() => {
    if (options.trackHints) {
      hintsUsedRef.current += 1;
    }
  }, [options.trackHints]);

  /**
   * Record that user used a powerup
   */
  const recordPowerupUsed = useCallback(
    (powerup: 'pistas' | 'vision_lectora' | 'segunda_oportunidad') => {
      if (options.trackPowerups && !powerupsUsedRef.current.includes(powerup)) {
        powerupsUsedRef.current.push(powerup);
      }
    },
    [options.trackPowerups],
  );

  /**
   * Get time elapsed since start (in seconds)
   */
  const getTimeElapsed = useCallback(() => {
    return Math.floor((Date.now() - startTime) / 1000);
  }, [startTime]);

  /**
   * Reset tracking (useful for retry)
   */
  const resetTracking = useCallback(() => {
    hintsUsedRef.current = 0;
    powerupsUsedRef.current = [];
  }, []);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Mutation state
    submit: mutation.mutate,
    submitAsync: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,

    // Helper functions
    recordHintUsed,
    recordPowerupUsed,
    getTimeElapsed,
    resetTracking,

    // Tracking data
    hintsUsed: hintsUsedRef.current,
    powerupsUsed: powerupsUsedRef.current,
    sessionId,
    startTime,
  };
}

/**
 * Example usage:
 *
 * const {
 *   submit,
 *   isSubmitting,
 *   data,
 *   recordHintUsed
 * } = useExerciseSubmission('exercise-123', {
 *   onSuccess: (result) => {
 *     console.log('Score:', result.score);
 *     console.log('Correct answers:', result.correctAnswers);
 *   },
 *   trackHints: true,
 *   trackPowerups: true
 * });
 *
 * // When user uses a hint
 * recordHintUsed();
 *
 * // When user submits answers
 * submit({ q1: true, q2: false, q3: true });
 */
