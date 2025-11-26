/**
 * useGrantBonus Hook - Manage ML Coins bonus granting operations
 *
 * Provides functionality for teachers to grant manual bonus ML Coins
 * to students for exceptional performance, behavior, or participation.
 *
 * @module apps/teacher/hooks/useGrantBonus
 */

import { useState, useCallback } from 'react';
import { bonusCoinsApi } from '@services/api/teacher';
import type { GrantBonusRequest, GrantBonusResponse } from '@services/api/teacher';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Return type of useGrantBonus hook
 */
export interface UseGrantBonusReturn {
  /**
   * Whether a grant operation is in progress
   */
  loading: boolean;

  /**
   * Error from the last grant operation, if any
   */
  error: Error | null;

  /**
   * Result from the last successful grant operation
   */
  success: GrantBonusResponse | null;

  /**
   * Grant bonus ML Coins to a student
   *
   * @param studentId - ID of the student to grant bonus to
   * @param amount - Amount of ML Coins to grant (1-1000)
   * @param reason - Reason for granting the bonus (min 10 chars)
   * @returns Promise that resolves with the grant result
   */
  grantBonus: (studentId: string, amount: number, reason: string) => Promise<GrantBonusResponse>;

  /**
   * Reset the hook state (clear error, success, loading)
   */
  reset: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for granting bonus ML Coins to students
 *
 * This hook manages the state for granting manual bonus coins to students,
 * including loading state, error handling, and success results.
 *
 * @returns UseGrantBonusReturn Hook return object with state and methods
 *
 * @example
 * ```typescript
 * function TeacherGamification() {
 *   const { grantBonus, loading, error, success, reset } = useGrantBonus();
 *
 *   const handleGrantBonus = async () => {
 *     try {
 *       const result = await grantBonus('student-123', 100, 'Participación excepcional');
 *       toast.success(`${result.amountGranted} ML Coins otorgados!`);
 *     } catch (err) {
 *       toast.error(err.message);
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleGrantBonus} disabled={loading}>
 *       {loading ? 'Otorgando...' : 'Otorgar Bonus'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useGrantBonus(): UseGrantBonusReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState<GrantBonusResponse | null>(null);

  /**
   * Grant bonus ML Coins to a student
   */
  const grantBonus = useCallback(
    async (studentId: string, amount: number, reason: string): Promise<GrantBonusResponse> => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        const data: GrantBonusRequest = {
          amount,
          reason: reason.trim(),
        };

        const result = await bonusCoinsApi.grantBonus(studentId, data);

        setSuccess(result);
        setLoading(false);

        return result;
      } catch (err) {
        const error = err as Error;
        console.error('[useGrantBonus] Error granting bonus:', error);
        setError(error);
        setLoading(false);
        throw error;
      }
    },
    [],
  );

  /**
   * Reset hook state
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(null);
  }, []);

  return {
    loading,
    error,
    success,
    grantBonus,
    reset,
  };
}
