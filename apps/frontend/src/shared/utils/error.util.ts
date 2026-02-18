/**
 * Error Utility
 *
 * Shared error message extraction for API errors.
 * Replaces the repeated `(error as any).response?.data?.message` pattern
 * across settings, auth, and page components.
 *
 * @module shared/utils/error.util
 */

export interface AxiosLikeError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

/**
 * Extract a user-friendly error message from an unknown error.
 *
 * Handles:
 * - Axios-like errors with response.data.message
 * - Standard Error objects with .message
 * - Unknown error types with fallback
 */
export function extractApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    const axiosError = error as AxiosLikeError;
    return axiosError.response?.data?.message || error.message || fallback;
  }

  if (typeof error === 'string') {
    return error;
  }

  return fallback;
}
