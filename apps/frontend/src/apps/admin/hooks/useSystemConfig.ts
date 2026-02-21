/**
 * useSystemConfig Hook
 *
 * Hook for managing system configuration by category.
 *
 * Migrated to React Query for automatic caching, deduplication,
 * and background refetching.
 *
 * @param category - Configuration category (general, email, notifications, security, maintenance)
 * @returns Configuration data, loading state, error, and update functions
 *
 * Updated: 2026-02-20 - Migrated to React Query
 */

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/services/api/adminAPI';
import { STALE_TIMES } from '@/shared/constants/queryKeys';
import type { SystemConfig } from '@/services/api/adminTypes';

// ============================================================================
// Query Key Factories
// ============================================================================

const systemConfigKeys = {
  all: ['admin', 'system-config'] as const,
  category: (category?: string) => ['admin', 'system-config', category] as const,
};

// ============================================================================
// Hook
// ============================================================================

export function useSystemConfig(
  category?: 'general' | 'email' | 'notifications' | 'security' | 'maintenance',
) {
  const queryClient = useQueryClient();

  // ============================================================================
  // QUERY
  // ============================================================================

  const configQuery = useQuery({
    queryKey: systemConfigKeys.category(category),
    queryFn: async () => {
      let data: Record<string, unknown>;
      if (category) {
        data = await adminAPI.settings.getCategoryConfig(category) as Record<string, unknown>;
      } else {
        data = await adminAPI.settings.getConfig() as Record<string, unknown>;
      }
      return data;
    },
    enabled: false, // manual trigger via fetchConfig
    staleTime: STALE_TIMES.SEMI_STATIC,
  });

  // ============================================================================
  // MUTATION
  // ============================================================================

  const updateMutation = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      let data: Record<string, unknown>;
      if (category) {
        data = await adminAPI.settings.updateCategoryConfig(category, values) as Record<string, unknown>;
      } else {
        data = await adminAPI.settings.updateConfig(values as SystemConfig) as Record<string, unknown>;
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(systemConfigKeys.category(category), data);
      queryClient.invalidateQueries({ queryKey: systemConfigKeys.all });
    },
  });

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const fetchConfig = useCallback(async () => {
    const result = await configQuery.refetch();
    return result.data;
  }, [configQuery]);

  const updateConfig = useCallback(
    async (values: Record<string, unknown>) => {
      return updateMutation.mutateAsync(values);
    },
    [updateMutation],
  );

  const reset = useCallback(() => {
    queryClient.removeQueries({ queryKey: systemConfigKeys.category(category) });
  }, [queryClient, category]);

  // ============================================================================
  // RETURN (unchanged interface)
  // ============================================================================

  return {
    config: configQuery.data ?? null,
    isLoading: configQuery.isLoading || configQuery.isFetching || updateMutation.isPending,
    error:
      configQuery.error instanceof Error
        ? configQuery.error.message
        : updateMutation.error instanceof Error
          ? updateMutation.error.message
          : null,
    fetchConfig,
    updateConfig,
    reset,
  };
}
