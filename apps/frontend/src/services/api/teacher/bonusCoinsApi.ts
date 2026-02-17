/**
 * Bonus Coins API Service
 *
 * Provides methods to grant bonus ML Coins to students.
 * Teachers can reward students for exceptional behavior, participation,
 * or achievements with manual bonus coins.
 *
 * All endpoints require authentication with admin_teacher role.
 *
 * @module services/api/teacher/bonusCoinsApi
 */

import { apiClient } from '../apiClient';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Request payload for granting bonus coins
 */
export interface GrantBonusRequest {
  /**
   * Amount of ML Coins to grant (1-1000)
   */
  amount: number;

  /**
   * Reason for granting the bonus (minimum 10 characters)
   */
  reason: string;
}

/**
 * Response after granting bonus coins
 */
export interface GrantBonusResponse {
  /**
   * Whether the operation was successful
   */
  success: boolean;

  /**
   * New balance of the student after granting bonus
   */
  newBalance: number;

  /**
   * Success message
   */
  message: string;

  /**
   * Amount of coins that were granted
   */
  amountGranted: number;

  /**
   * Reason provided for the bonus
   */
  reason: string;
}

// ============================================================================
// BONUS COINS API CLASS
// ============================================================================

/**
 * Bonus Coins API Service
 *
 * Handles all bonus coins-related API calls for teachers to grant
 * manual bonuses to their students.
 */
class BonusCoinsAPI {
  private readonly baseUrl = '/teacher/students';

  /**
   * Grant bonus ML Coins to a student
   *
   * Allows teachers to manually award bonus coins to students for
   * exceptional performance, behavior, or participation.
   *
   * @param studentId - ID of the student to grant bonus to
   * @param data - Bonus data (amount, reason)
   * @returns Promise<GrantBonusResponse> Result of the grant operation
   * @throws Error if request fails or validation fails
   *
   * @example
   * ```typescript
   * // Grant bonus for participation
   * const result = await bonusCoinsApi.grantBonus('student-123', {
   *   amount: 100,
   *   reason: 'Participación excepcional en clase y ayuda a compañeros'
   * });
   *
   * console.log(result.message); // "100 ML Coins otorgados exitosamente"
   * console.log(`Nuevo balance: ${result.newBalance} ML Coins`);
   * ```
   */
  async grantBonus(studentId: string, data: GrantBonusRequest): Promise<GrantBonusResponse> {
    try {
      // Client-side validation
      if (data.amount < 1 || data.amount > 1000) {
        throw new Error('La cantidad debe estar entre 1 y 1000 ML Coins');
      }

      if (!data.reason || data.reason.trim().length < 10) {
        throw new Error('La razón debe tener al menos 10 caracteres');
      }

      const response = await apiClient.post<GrantBonusResponse>(
        `${this.baseUrl}/${studentId}/bonus`,
        data,
      );

      return response.data;
    } catch (error: unknown) {
      console.error('[BonusCoinsAPI] Error granting bonus:', error);

      // Provide user-friendly error messages
      const apiError = error as { response?: { data?: { message?: string } } };
      if (apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      }

      throw error;
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Singleton instance of BonusCoinsAPI
 * Use this instance for all bonus coins-related API calls
 *
 * @example
 * ```typescript
 * import { bonusCoinsApi } from '@services/api/teacher';
 *
 * const result = await bonusCoinsApi.grantBonus('student-123', {
 *   amount: 50,
 *   reason: 'Completó todos los ejercicios del módulo con excelencia'
 * });
 * ```
 */
export const bonusCoinsApi = new BonusCoinsAPI();

/**
 * Export the class for testing purposes
 */
export { BonusCoinsAPI };
