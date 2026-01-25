/**
 * useConfigCategories Hook
 *
 * Custom hook for fetching configuration categories and validating config.
 *
 * Features:
 * - Fetch all available configuration categories
 * - Validate configuration before saving
 *
 * Backend Endpoints:
 * - GET /admin/system/config/categories
 * - POST /admin/system/config/validate
 *
 * Created: 2026-01-25 - P1 Gap Integration
 */

import { useState, useCallback } from 'react';
import { getConfigCategories, validateConfig } from '@/services/api/adminAPI';
import type { SettingsCategory } from '@/services/api/adminTypes';

export interface ConfigValidationResult {
  valid: boolean;
  errors: Array<{ field: string; message: string; value?: unknown }>;
  warnings: string[];
}

export interface UseConfigCategoriesResult {
  // Data
  categories: SettingsCategory[];
  validationResult: ConfigValidationResult | null;

  // State
  isLoading: boolean;
  isValidating: boolean;
  error: string | null;

  // Actions
  fetchCategories: () => Promise<SettingsCategory[]>;
  validateConfiguration: (category: SettingsCategory, config: Record<string, unknown>) => Promise<ConfigValidationResult>;
  clearValidation: () => void;
}

/**
 * Hook for managing configuration categories and validation
 *
 * @example
 * ```tsx
 * const {
 *   categories,
 *   validationResult,
 *   fetchCategories,
 *   validateConfiguration
 * } = useConfigCategories();
 *
 * // Fetch categories on mount
 * useEffect(() => {
 *   fetchCategories();
 * }, []);
 *
 * // Validate before saving
 * const handleSave = async (config) => {
 *   const result = await validateConfiguration('security', config);
 *   if (result.valid) {
 *     // Proceed with save
 *   }
 * };
 * ```
 */
export function useConfigCategories(): UseConfigCategoriesResult {
  // State
  const [categories, setCategories] = useState<SettingsCategory[]>([]);
  const [validationResult, setValidationResult] = useState<ConfigValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all configuration categories
   * Backend: GET /admin/system/config/categories
   */
  const fetchCategories = useCallback(async (): Promise<SettingsCategory[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getConfigCategories();
      setCategories(data || []);
      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch config categories';
      setError(errorMessage);
      console.error('[useConfigCategories] Error fetching categories:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Validate configuration before saving
   * Backend: POST /admin/system/config/validate
   *
   * @param category - Configuration category to validate
   * @param config - Configuration object to validate
   * @returns Validation result with errors and warnings
   */
  const validateConfiguration = useCallback(
    async (category: SettingsCategory, config: Record<string, unknown>): Promise<ConfigValidationResult> => {
      setIsValidating(true);
      setError(null);

      try {
        const result = await validateConfig(category, config);

        // Ensure result has expected structure
        const normalizedResult: ConfigValidationResult = {
          valid: result?.valid ?? false,
          errors: result?.errors || [],
          warnings: [],
        };

        setValidationResult(normalizedResult);
        return normalizedResult;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to validate configuration';
        setError(errorMessage);
        console.error('[useConfigCategories] Error validating config:', err);

        // Return failed validation result
        const failedResult: ConfigValidationResult = {
          valid: false,
          errors: [{ field: '_general', message: errorMessage }],
          warnings: [],
        };
        setValidationResult(failedResult);
        return failedResult;
      } finally {
        setIsValidating(false);
      }
    },
    [],
  );

  /**
   * Clear validation result
   */
  const clearValidation = useCallback(() => {
    setValidationResult(null);
    setError(null);
  }, []);

  return {
    // Data
    categories,
    validationResult,

    // State
    isLoading,
    isValidating,
    error,

    // Actions
    fetchCategories,
    validateConfiguration,
    clearValidation,
  };
}
