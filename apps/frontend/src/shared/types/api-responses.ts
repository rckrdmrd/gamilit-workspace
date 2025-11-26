/**
 * API Response Types - Centralized pagination types
 *
 * Matches backend PaginatedResponseDto structure.
 * Use these types for all paginated API responses.
 *
 * @module shared/types/api-responses
 */

/**
 * Pagination info returned by backend
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Generic paginated response wrapper
 *
 * @template T - Type of items in the data array
 *
 * @example
 * ```typescript
 * interface User { id: string; name: string; }
 *
 * const response: PaginatedResponse<User> = {
 *   data: [{ id: '1', name: 'John' }],
 *   pagination: {
 *     page: 1,
 *     limit: 10,
 *     total: 45,
 *     totalPages: 5,
 *     hasNextPage: true,
 *     hasPreviousPage: false,
 *   }
 * };
 * ```
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}
