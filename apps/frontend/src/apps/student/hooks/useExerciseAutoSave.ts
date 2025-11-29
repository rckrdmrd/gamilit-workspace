/**
 * useExerciseAutoSave Hook
 *
 * Hook para auto-guardar progreso de ejercicios y recuperarlo al recargar.
 * Evita pérdida de progreso si el estudiante cierra el navegador.
 *
 * Features:
 * - Auto-save periódico (configurable, default 30s)
 * - Recuperación automática al montar
 * - Debounce para evitar llamadas excesivas
 * - Indicadores de estado (saving, saved, error)
 * - Fallback a localStorage si API falla
 *
 * @module useExerciseAutoSave
 * @author Frontend-Agent
 * @date 2025-11-26
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  autoSaveProgress,
  getAutoSavedProgress,
  clearAutoSavedProgress,
  type AutoSaveProgressData,
} from '@/features/progress/api/progressAPI';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Hook options
 */
export interface UseExerciseAutoSaveOptions {
  /** Exercise ID */
  exerciseId: string;
  /** Enable/disable auto-save */
  enabled?: boolean;
  /** Auto-save interval in milliseconds (default: 30000 = 30 seconds) */
  intervalMs?: number;
  /** Debounce delay in milliseconds (default: 2000 = 2 seconds) */
  debounceMs?: number;
  /** Callback when data is recovered */
  onRecovered?: (data: AutoSaveProgressData) => void;
  /** Callback on save success */
  onSaveSuccess?: (savedAt: Date) => void;
  /** Callback on save error */
  onSaveError?: (error: Error) => void;
}

/**
 * Auto-save state
 */
export interface AutoSaveState {
  /** Current save status */
  status: 'idle' | 'saving' | 'saved' | 'error';
  /** Last successful save timestamp */
  lastSavedAt: Date | null;
  /** Recovered data from previous session */
  recoveredData: AutoSaveProgressData | null;
  /** Error message if status is 'error' */
  error: string | null;
}

/**
 * Hook return type
 */
export interface UseExerciseAutoSaveReturn extends AutoSaveState {
  /** Manually trigger save (debounced) */
  saveProgress: (data: AutoSaveProgressData) => void;
  /** Clear recovered data after using it */
  clearRecoveredData: () => void;
  /** Clear all auto-saved data */
  clearAutoSave: () => Promise<void>;
  /** Force immediate save (bypasses debounce) */
  forceSave: (data: AutoSaveProgressData) => Promise<void>;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * useExerciseAutoSave Hook
 *
 * @example
 * ```tsx
 * const {
 *   status,
 *   lastSavedAt,
 *   recoveredData,
 *   saveProgress,
 *   clearRecoveredData
 * } = useExerciseAutoSave({
 *   exerciseId: 'exercise-123',
 *   enabled: true,
 *   intervalMs: 30000
 * });
 *
 * // Recuperar al montar
 * useEffect(() => {
 *   if (recoveredData) {
 *     setAnswers(recoveredData.partialAnswers);
 *     clearRecoveredData();
 *   }
 * }, [recoveredData]);
 *
 * // Auto-guardar cuando cambian respuestas
 * useEffect(() => {
 *   if (answers) {
 *     saveProgress({
 *       partialAnswers: answers,
 *       timeSpentSeconds: timeSpent
 *     });
 *   }
 * }, [answers, timeSpent]);
 * ```
 */
export function useExerciseAutoSave(
  options: UseExerciseAutoSaveOptions,
): UseExerciseAutoSaveReturn {
  const {
    exerciseId,
    enabled = true,
    intervalMs = 30000,
    debounceMs = 2000,
    onRecovered,
    onSaveSuccess,
    onSaveError,
  } = options;

  // ============================================================================
  // STATE
  // ============================================================================

  const [state, setState] = useState<AutoSaveState>({
    status: 'idle',
    lastSavedAt: null,
    recoveredData: null,
    error: null,
  });

  // ============================================================================
  // REFS
  // ============================================================================

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<AutoSaveProgressData | null>(null);
  const isMountedRef = useRef(true);

  // ============================================================================
  // FUNCTIONS
  // ============================================================================

  /**
   * Perform actual save operation
   */
  const performSave = useCallback(
    async (data: AutoSaveProgressData) => {
      if (!enabled || !exerciseId) return;

      setState((prev) => ({ ...prev, status: 'saving', error: null }));

      try {
        const result = await autoSaveProgress(exerciseId, data);

        if (isMountedRef.current) {
          setState((prev) => ({
            ...prev,
            status: 'saved',
            lastSavedAt: result.savedAt,
            error: null,
          }));

          onSaveSuccess?.(result.savedAt);

          // Reset to idle after 3 seconds
          setTimeout(() => {
            if (isMountedRef.current) {
              setState((prev) => (prev.status === 'saved' ? { ...prev, status: 'idle' } : prev));
            }
          }, 3000);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error al guardar progreso';

        if (isMountedRef.current) {
          setState((prev) => ({
            ...prev,
            status: 'error',
            error: errorMessage,
          }));

          onSaveError?.(error instanceof Error ? error : new Error(errorMessage));
        }
      }
    },
    [enabled, exerciseId, onSaveSuccess, onSaveError],
  );

  /**
   * Debounced save function
   */
  const saveProgress = useCallback(
    (data: AutoSaveProgressData) => {
      if (!enabled || !exerciseId) return;

      lastDataRef.current = data;

      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new debounce timer
      debounceTimerRef.current = setTimeout(() => {
        performSave(data);
      }, debounceMs);
    },
    [enabled, exerciseId, debounceMs, performSave],
  );

  /**
   * Force immediate save (bypass debounce)
   */
  const forceSave = useCallback(
    async (data: AutoSaveProgressData) => {
      // Clear debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      await performSave(data);
    },
    [performSave],
  );

  /**
   * Clear recovered data
   */
  const clearRecoveredData = useCallback(() => {
    setState((prev) => ({ ...prev, recoveredData: null }));
  }, []);

  /**
   * Clear all auto-saved data
   */
  const clearAutoSave = useCallback(async () => {
    try {
      await clearAutoSavedProgress(exerciseId);
      setState((prev) => ({ ...prev, recoveredData: null }));
    } catch (error) {
      console.error('Error clearing auto-save:', error);
    }
  }, [exerciseId]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Load saved progress on mount
   */
  useEffect(() => {
    if (!enabled || !exerciseId) return;

    const loadSavedProgress = async () => {
      try {
        const saved = await getAutoSavedProgress(exerciseId);

        if (saved && isMountedRef.current) {
          setState((prev) => ({ ...prev, recoveredData: saved }));
          onRecovered?.(saved);
        }
      } catch (error) {
        console.error('Error loading saved progress:', error);
      }
    };

    loadSavedProgress();
  }, [exerciseId, enabled, onRecovered]);

  /**
   * Auto-save interval (saves last known data)
   */
  useEffect(() => {
    if (!enabled || intervalMs <= 0) return;

    autoSaveTimerRef.current = setInterval(() => {
      if (lastDataRef.current) {
        performSave(lastDataRef.current);
      }
    }, intervalMs);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [enabled, intervalMs, performSave]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, []);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    ...state,
    saveProgress,
    clearRecoveredData,
    clearAutoSave,
    forceSave,
  };
}
