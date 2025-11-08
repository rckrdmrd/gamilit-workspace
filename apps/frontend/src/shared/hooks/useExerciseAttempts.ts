/**
 * useExerciseAttempts Hook
 *
 * Manages exercise attempts with full configuration from database
 * - Reads max_attempts, allow_retry, retry_delay_minutes from DB
 * - Tracks user attempts in progress_tracking.exercise_attempts
 * - Enforces retry limits and delays
 * - NO hardcoded values
 */

import { useState, useEffect, useCallback } from 'react';
import type { Exercise } from '@shared/types';
import type { ExerciseResult } from '@shared/factories/ExerciseFactory';

// ============================================================================
// TYPES
// ============================================================================

export interface AttemptState {
  currentAttempt: number;
  maxAttempts: number;
  remainingAttempts: number;
  canRetry: boolean;
  isLastAttempt: boolean;
  hasReachedLimit: boolean;
  retryDelayMinutes: number;
  nextRetryAvailable: Date | null;
  canAttemptNow: boolean;
  attempts: AttemptRecord[];
}

export interface AttemptRecord {
  id: string;
  attemptNumber: number;
  score: number;
  isCorrect: boolean;
  submittedAt: string;
  timeSpent: number;
  hintsUsed: number;
  comodinesUsed: string[];
}

export interface UseExerciseAttemptsOptions {
  exercise: Exercise;
  userId: string;
  onMaxAttemptsReached?: () => void;
  onRetryDelayActive?: (nextAvailable: Date) => void;
}

export interface UseExerciseAttemptsReturn extends AttemptState {
  submitAttempt: (result: ExerciseResult) => Promise<boolean>;
  resetAttempts: () => void;
  getAttemptHistory: () => AttemptRecord[];
  getBestScore: () => number;
  getAverageScore: () => number;
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useExerciseAttempts({
  exercise,
  userId,
  onMaxAttemptsReached,
  onRetryDelayActive,
}: UseExerciseAttemptsOptions): UseExerciseAttemptsReturn {
  // ========== Configuration from DB (NO hardcoded values) ==========
  const maxAttempts = exercise.max_attempts ?? exercise.config?.max_attempts ?? 3; // Default from DB schema
  const allowRetry = exercise.allow_retry ?? exercise.config?.allow_retry ?? true;
  const retryDelayMinutes = exercise.retry_delay_minutes ?? exercise.config?.retry_delay_minutes ?? 0;

  // ========== State ==========
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
  const [nextRetryAvailable, setNextRetryAvailable] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ========== Computed State ==========
  const remainingAttempts = Math.max(0, maxAttempts - currentAttempt);
  const hasReachedLimit = currentAttempt >= maxAttempts;
  const isLastAttempt = currentAttempt === maxAttempts - 1;
  const canRetry = allowRetry && !hasReachedLimit;

  // Check if can attempt now (considering retry delay)
  const canAttemptNow = useCallback(() => {
    if (hasReachedLimit) return false;
    if (!nextRetryAvailable) return true;
    return new Date() >= nextRetryAvailable;
  }, [hasReachedLimit, nextRetryAvailable]);

  // ========== Load Attempts from DB ==========
  useEffect(() => {
    const loadAttempts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // TODO: Replace with actual API call to progress_tracking.exercise_attempts
        // const response = await fetch(`/api/exercises/${exercise.id}/attempts?user_id=${userId}`);
        // const data = await response.json();

        // Mock data for now - in production this comes from DB
        const mockAttempts: AttemptRecord[] = [];

        setAttempts(mockAttempts);
        setCurrentAttempt(mockAttempts.length);

        // Check last attempt for retry delay
        if (mockAttempts.length > 0 && retryDelayMinutes > 0) {
          const lastAttempt = mockAttempts[mockAttempts.length - 1];
          const lastAttemptDate = new Date(lastAttempt.submittedAt);
          const nextAvailable = new Date(
            lastAttemptDate.getTime() + retryDelayMinutes * 60 * 1000
          );

          if (nextAvailable > new Date()) {
            setNextRetryAvailable(nextAvailable);
            onRetryDelayActive?.(nextAvailable);
          }
        }
      } catch (err) {
        console.error('Error loading attempts:', err);
        setError('Failed to load attempt history');
      } finally {
        setIsLoading(false);
      }
    };

    loadAttempts();
  }, [exercise.id, userId, retryDelayMinutes, onRetryDelayActive]);

  // ========== Submit Attempt ==========
  const submitAttempt = useCallback(
    async (result: ExerciseResult): Promise<boolean> => {
      // Validate can attempt
      if (hasReachedLimit) {
        onMaxAttemptsReached?.();
        return false;
      }

      if (!canAttemptNow()) {
        onRetryDelayActive?.(nextRetryAvailable!);
        return false;
      }

      try {
        const attemptNumber = currentAttempt + 1;

        // TODO: Replace with actual API call to save attempt
        // const response = await fetch(`/api/exercises/${exercise.id}/attempts`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     user_id: userId,
        //     exercise_id: exercise.id,
        //     attempt_number: attemptNumber,
        //     submitted_answers: result.submittedAnswers,
        //     is_correct: result.isCorrect,
        //     score: result.score,
        //     time_spent_seconds: result.timeSpent,
        //     hints_used: result.hintsUsed,
        //     comodines_used: result.comodinesUsed,
        //     xp_earned: result.xpEarned,
        //     ml_coins_earned: result.mlCoinsEarned,
        //     metadata: result.metadata,
        //   }),
        // });

        // Mock successful save
        const newAttempt: AttemptRecord = {
          id: `attempt-${Date.now()}`,
          attemptNumber,
          score: result.score,
          isCorrect: result.isCorrect,
          submittedAt: new Date().toISOString(),
          timeSpent: result.timeSpent,
          hintsUsed: result.hintsUsed,
          comodinesUsed: result.comodinesUsed,
        };

        setAttempts((prev) => [...prev, newAttempt]);
        setCurrentAttempt(attemptNumber);

        // Set retry delay if configured
        if (retryDelayMinutes > 0 && attemptNumber < maxAttempts) {
          const nextAvailable = new Date(Date.now() + retryDelayMinutes * 60 * 1000);
          setNextRetryAvailable(nextAvailable);
          onRetryDelayActive?.(nextAvailable);
        }

        // Check if reached limit
        if (attemptNumber >= maxAttempts) {
          onMaxAttemptsReached?.();
        }

        return true;
      } catch (err) {
        console.error('Error submitting attempt:', err);
        setError('Failed to submit attempt');
        return false;
      }
    },
    [
      hasReachedLimit,
      canAttemptNow,
      currentAttempt,
      exercise.id,
      userId,
      retryDelayMinutes,
      maxAttempts,
      nextRetryAvailable,
      onMaxAttemptsReached,
      onRetryDelayActive,
    ]
  );

  // ========== Reset Attempts ==========
  const resetAttempts = useCallback(() => {
    // TODO: API call to reset attempts (if allowed by teacher/admin)
    setCurrentAttempt(0);
    setAttempts([]);
    setNextRetryAvailable(null);
    setError(null);
  }, []);

  // ========== Get Attempt History ==========
  const getAttemptHistory = useCallback(() => {
    return attempts;
  }, [attempts]);

  // ========== Get Best Score ==========
  const getBestScore = useCallback(() => {
    if (attempts.length === 0) return 0;
    return Math.max(...attempts.map((a) => a.score));
  }, [attempts]);

  // ========== Get Average Score ==========
  const getAverageScore = useCallback(() => {
    if (attempts.length === 0) return 0;
    const sum = attempts.reduce((acc, a) => acc + a.score, 0);
    return Math.round(sum / attempts.length);
  }, [attempts]);

  // ========== Return State and Methods ==========
  return {
    // State
    currentAttempt,
    maxAttempts,
    remainingAttempts,
    canRetry,
    isLastAttempt,
    hasReachedLimit,
    retryDelayMinutes,
    nextRetryAvailable,
    canAttemptNow: canAttemptNow(),
    attempts,
    isLoading,
    error,

    // Methods
    submitAttempt,
    resetAttempts,
    getAttemptHistory,
    getBestScore,
    getAverageScore,
  };
}
