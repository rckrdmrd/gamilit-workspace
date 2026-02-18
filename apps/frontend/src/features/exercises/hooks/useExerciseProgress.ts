/**
 * useExerciseProgress Hook
 *
 * Manages exercise progress state, user answers, and auto-save integration.
 * Extracted from ExercisePage.tsx state management.
 *
 * @version 1.0.0
 * @since Phase 2 - Exercise System Restructuring
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useCallback, useEffect, useRef } from 'react';
import { saveExerciseProgress } from '@/services/api/educationalAPI';
import { useExerciseAutoSave } from '@/apps/student/hooks/useExerciseAutoSave';

// ============================================================================
// TYPES
// ============================================================================

export interface ExerciseProgress {
  currentStep: number;
  totalSteps: number;
  score: number;
  hintsUsed: number;
  timeSpent: number;
  powerupsUsed?: string[];
}

export interface ProgressUpdate {
  progress: Partial<ExerciseProgress>;
  answers: any;
}

export interface UseExerciseProgressReturn {
  /** Current progress state */
  progress: ExerciseProgress;
  /** User's actual answers (format varies by mechanic) */
  userAnswers: any;
  /** Whether there are unsaved changes */
  hasUnsavedChanges: boolean;
  /** Auto-save status */
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  /** Last auto-save timestamp */
  lastSavedAt: Date | null;
  /** Time when exercise started */
  startTime: Date;
  /**
   * Handle progress updates from mechanic components.
   * Supports both new format (ProgressUpdate) and legacy (Partial<ExerciseProgress>).
   */
  handleProgressUpdate: (update: Partial<ExerciseProgress> | ProgressUpdate) => void;
  /** Manually save progress to backend */
  handleSaveProgress: () => Promise<void>;
  /** Clear recovered data after applying it */
  clearRecoveredData: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useExerciseProgress(exerciseId: string | undefined): UseExerciseProgressReturn {
  const [progress, setProgress] = useState<ExerciseProgress>({
    currentStep: 0,
    totalSteps: 1,
    score: 0,
    hintsUsed: 0,
    timeSpent: 0,
  });

  const [userAnswers, setUserAnswers] = useState<any>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const startTimeRef = useRef(new Date());

  // Auto-save hook
  const {
    status: autoSaveStatus,
    lastSavedAt,
    recoveredData,
    saveProgress: autoSaveProgress,
    clearRecoveredData,
  } = useExerciseAutoSave({
    exerciseId: exerciseId || '',
    enabled: !!exerciseId,
    intervalMs: 30000,
    debounceMs: 2000,
  });

  // Recovery: restore saved progress on mount
  useEffect(() => {
    if (recoveredData?.partialAnswers && !userAnswers) {
      setUserAnswers(recoveredData.partialAnswers);

      if (recoveredData.timeSpentSeconds) {
        setProgress((prev) => ({
          ...prev,
          timeSpent: recoveredData.timeSpentSeconds,
        }));
      }

      if (recoveredData.metadata) {
        setProgress((prev) => ({
          ...prev,
          hintsUsed: recoveredData.metadata?.hintsUsed || prev.hintsUsed,
          powerupsUsed: recoveredData.metadata?.comodinesUsed || prev.powerupsUsed,
        }));
      }

      clearRecoveredData();
    }
  }, [recoveredData, userAnswers, clearRecoveredData]);

  // Auto-save trigger when answers/progress change
  useEffect(() => {
    if (!exerciseId || !userAnswers) return;

    const currentTime = Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000);

    autoSaveProgress({
      partialAnswers: userAnswers,
      timeSpentSeconds: currentTime,
      metadata: {
        hintsUsed: progress.hintsUsed,
        comodinesUsed: progress.powerupsUsed,
        currentStep: progress.currentStep,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAnswers, progress.hintsUsed, progress.powerupsUsed, progress.currentStep]);

  /**
   * Handle progress updates from mechanic components.
   * Supports both formats for backward compatibility.
   */
  const handleProgressUpdate = useCallback(
    (update: Partial<ExerciseProgress> | ProgressUpdate) => {
      if (update && typeof update === 'object' && 'progress' in update && 'answers' in update) {
        const progressUpdate = update as ProgressUpdate;
        setProgress((prev) => ({ ...prev, ...progressUpdate.progress }));
        setUserAnswers(progressUpdate.answers);
      } else {
        setProgress((prev) => ({ ...prev, ...(update as Partial<ExerciseProgress>) }));
      }
      setHasUnsavedChanges(true);
    },
    [],
  );

  /**
   * Manually save progress to backend.
   */
  const handleSaveProgress = useCallback(async () => {
    if (!exerciseId) return;

    try {
      await saveExerciseProgress(exerciseId, {
        currentStep: progress.currentStep,
        totalSteps: progress.totalSteps,
        score: progress.score,
        hintsUsed: progress.hintsUsed,
        timeSpent: progress.timeSpent,
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving progress:', error);
      // Fallback to localStorage
      try {
        localStorage.setItem(
          `exercise_${exerciseId}_progress`,
          JSON.stringify({
            progress,
            timestamp: new Date().toISOString(),
          }),
        );
        setHasUnsavedChanges(false);
      } catch (localError) {
        console.error('Failed to save progress locally:', localError);
      }
    }
  }, [exerciseId, progress]);

  return {
    progress,
    userAnswers,
    hasUnsavedChanges,
    autoSaveStatus,
    lastSavedAt,
    startTime: startTimeRef.current,
    handleProgressUpdate,
    handleSaveProgress,
    clearRecoveredData,
  };
}
