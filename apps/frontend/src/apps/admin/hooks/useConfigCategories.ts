/**
 * useConfigCategories Hook
 *
 * Custom hook for fetching configuration categories and validating config.
 *
 * Migrated to React Query for automatic caching, deduplication,
 * and background refetching.
 *
 * Backend Endpoints:
 * - GET /admin/system/config/categories
 * - POST /admin/system/config/validate
 *
 * Created: 2026-01-25 - P1 Gap Integration
 * Updated: 2026-02-20 - Migrated to React Query
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getConfigCategories, validateConfig } from '@/services/api/adminAPI';
import { STALE_TIMES } from '@/shared/constants/queryKeys';
import type { SettingsCategory } from '@/services/api/adminTypes';

// ============================================================================
// Query Key Factories
// ============================================================================

const configCategoriesKeys = {
  categories: () => ['admin', 'config', 'categories'] as const,
};

// ============================================================================
// Types (unchanged for backward compatibility)
// ============================================================================

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

// ============================================================================
// Hook
// ============================================================================

export function useConfigCategories(): UseConfigCategoriesResult {
  const [validationResult, setValidationResult] = useState<ConfigValidationResult | null>(null);

  // ============================================================================
  // QUERY
  // ============================================================================

  const categoriesQuery = useQuery({
    queryKey: configCategoriesKeys.categories(),
    queryFn: async () => {
      const data = await getConfigCategories();
      return (data || []) as SettingsCategory[];
    },
    staleTime: STALE_TIMES.STATIC,
  });

  // ============================================================================
  // MUTATION (validation)
  // ============================================================================

  const validateMutation = useMutation({
    mutationFn: async ({
      category,
      config,
    }: {
      category: SettingsCategory;
      config: Record<string, unknown>;
    }) => {
      const result = await validateConfig(category, config);

      const rawErrors = Array.isArray(result?.errors) ? result.errors : [];
      const errors = rawErrors.map((error: string | { field: string; message: string }) =>
        typeof error === 'string' ? { field: '_general', message: error } : error,
      );

      const normalizedResult: ConfigValidationResult = {
        valid: result?.valid ?? false,
        errors,
        warnings: [],
      };

      return normalizedResult;
    },
    onSuccess: (result) => {
      setValidationResult(result);
    },
    onError: (err) => {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate configuration';
      const failedResult: ConfigValidationResult = {
        valid: false,
        errors: [{ field: '_general', message: errorMessage }],
        warnings: [],
      };
      setValidationResult(failedResult);
    },
  });

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const fetchCategories = useCallback(async (): Promise<SettingsCategory[]> => {
    const result = await categoriesQuery.refetch();
    return result.data ?? [];
  }, [categoriesQuery]);

  const validateConfiguration = useCallback(
    async (category: SettingsCategory, config: Record<string, unknown>): Promise<ConfigValidationResult> => {
      return validateMutation.mutateAsync({ category, config });
    },
    [validateMutation],
  );

  const clearValidation = useCallback(() => {
    setValidationResult(null);
  }, []);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    categories: categoriesQuery.data ?? [],
    validationResult,
    isLoading: categoriesQuery.isLoading,
    isValidating: validateMutation.isPending,
    error: categoriesQuery.error instanceof Error ? categoriesQuery.error.message : categoriesQuery.error ? String(categoriesQuery.error) : null,
    fetchCategories,
    validateConfiguration,
    clearValidation,
  };
}
