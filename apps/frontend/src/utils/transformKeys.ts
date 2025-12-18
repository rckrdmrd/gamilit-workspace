/**
 * Transform Keys Utilities
 *
 * Utilities for transforming object keys between snake_case (API) and camelCase (Frontend).
 *
 * @description
 * The backend API uses snake_case for field names (PostgreSQL convention),
 * while the frontend uses camelCase (TypeScript/JavaScript convention).
 * These utilities handle bidirectional transformation.
 *
 * @example
 * ```ts
 * // API response (snake_case) → Frontend (camelCase)
 * const apiData = { user_id: '123', first_name: 'Juan' };
 * const frontendData = snakeToCamel(apiData);
 * // { userId: '123', firstName: 'Juan' }
 *
 * // Frontend (camelCase) → API request (snake_case)
 * const frontendData = { userId: '123', firstName: 'Juan' };
 * const apiData = camelToSnake(frontendData);
 * // { user_id: '123', first_name: 'Juan' }
 * ```
 */

/**
 * Convert snake_case to camelCase
 *
 * Recursively transforms all keys in an object (and nested objects/arrays)
 * from snake_case to camelCase.
 *
 * @param obj - Object, array, or primitive value to transform
 * @returns Transformed value with camelCase keys
 *
 * @example
 * ```ts
 * snakeToCamel({ user_id: '123', user_stats: { total_xp: 500 } })
 * // { userId: '123', userStats: { totalXp: 500 } }
 * ```
 */
export function snakeToCamel(obj: any): any {
  // Handle arrays: transform each element
  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel);
  }

  // Handle objects: transform keys
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce(
      (acc, key) => {
        // Convert snake_case to camelCase
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        acc[camelKey] = snakeToCamel(obj[key]);
        return acc;
      },
      {} as Record<string, any>,
    );
  }

  // Return primitives unchanged
  return obj;
}

/**
 * Convert camelCase to snake_case
 *
 * Recursively transforms all keys in an object (and nested objects/arrays)
 * from camelCase to snake_case.
 *
 * @param obj - Object, array, or primitive value to transform
 * @returns Transformed value with snake_case keys
 *
 * @example
 * ```ts
 * camelToSnake({ userId: '123', userStats: { totalXp: 500 } })
 * // { user_id: '123', user_stats: { total_xp: 500 } }
 * ```
 */
export function camelToSnake(obj: any): any {
  // Handle arrays: transform each element
  if (Array.isArray(obj)) {
    return obj.map(camelToSnake);
  }

  // Handle objects: transform keys
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce(
      (acc, key) => {
        // Convert camelCase to snake_case
        const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
        acc[snakeKey] = camelToSnake(obj[key]);
        return acc;
      },
      {} as Record<string, any>,
    );
  }

  // Return primitives unchanged
  return obj;
}
