/**
 * useGamificationConfig Hook
 *
 * React Query hook for gamification configuration management (US-AE-005)
 * Provides queries and mutations for parameters, Maya ranks, and stats.
 *
 * Data transformations (snake_case -> camelCase, null guards, default values)
 * are applied inside `select` so consumers receive validated, ready-to-use data.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gamificationConfigApi } from '@/services/api/admin/gamificationConfigApi';
import type {
  ListParametersQuery,
  MayaRankConfig,
  GamificationParameter,
  UpdateParameterDto,
  BulkUpdateParametersDto,
  UpdateMayaRankDto,
  PreviewImpactDto,
} from '@/types/admin/gamification.types';
import toast from 'react-hot-toast';

/**
 * Query keys for React Query cache management
 */
const QUERY_KEYS = {
  parameters: (query?: ListParametersQuery) => ['gamification', 'parameters', query],
  parameter: (key: string) => ['gamification', 'parameter', key],
  mayaRanks: () => ['gamification', 'maya-ranks'],
  mayaRank: (id: string) => ['gamification', 'maya-rank', id],
  stats: () => ['gamification', 'stats'],
};

// ========================================
// DATA TRANSFORMATIONS (BUG-ADMIN-008, BUG-ADMIN-009)
// ========================================

/**
 * Normalize a raw Maya rank object from the backend.
 *
 * The backend may return snake_case fields (rank_name, min_xp, etc.) or
 * camelCase fields. This function handles both and returns a validated
 * MayaRankConfig, or null if the object is invalid.
 */
function normalizeRank(r: unknown): MayaRankConfig | null {
  if (!r || typeof r !== 'object') return null;

  const rank = r as Record<string, unknown>;

  const hasId = rank.id || rank.rank_name;
  const hasName = rank.name || rank.rank_name;
  const hasLevel = typeof rank.level === 'number' || typeof rank.rank_order === 'number';

  if (!hasId || !hasName || !hasLevel) return null;

  const name = (rank.name as string) || (rank.rank_name as string) || 'Sin nombre';
  if (!name || name === 'Sin nombre') return null;

  return {
    id:
      (rank.id as string) ||
      (rank.rank_name as string) ||
      `rank-${(rank.level as number) || 0}`,
    name,
    level: (rank.level as number) ?? (rank.rank_order as number) ?? 0,
    minXp: (rank.minXp as number) ?? (rank.min_xp as number) ?? 0,
    maxXp: (rank.maxXp as number | null) ?? (rank.max_xp as number | null) ?? null,
    multiplierXp: (rank.multiplierXp as number) ?? (rank.multiplier_xp as number) ?? 1,
    multiplierMlCoins:
      (rank.multiplierMlCoins as number) ?? (rank.multiplier_ml_coins as number) ?? 1,
    bonusMlCoins: (rank.bonusMlCoins as number) ?? (rank.bonus_ml_coins as number) ?? 0,
    color: (rank.color as string) || '#6B7280',
    icon: (rank.icon as string | null) || null,
    description: (rank.description as string) || '',
    perks: Array.isArray(rank.perks) ? (rank.perks as string[]) : [],
    isActive: (rank.isActive as boolean) ?? (rank.is_active as boolean) ?? true,
    order: (rank.order as number) ?? (rank.rank_order as number) ?? 0,
  };
}

/**
 * Filter and validate raw parameters from the backend response.
 * Returns only parameters with valid id and key fields.
 */
function selectSafeParameters(
  response: { data: GamificationParameter[]; total: number; page: number; limit: number } | undefined,
): GamificationParameter[] {
  if (!response || typeof response !== 'object') return [];
  if (!response.data || !Array.isArray(response.data)) return [];

  return response.data.filter((param): param is GamificationParameter => {
    if (!param || typeof param !== 'object') return false;
    return Boolean(param.id && param.key);
  });
}

/**
 * Hook for gamification configuration management
 *
 * @example
 * const { useParameters, updateParameter } = useGamificationConfig();
 * const { data: params, isLoading } = useParameters();
 * updateParameter.mutate({ key: 'xp.base', data: { value: 15 } });
 */
export function useGamificationConfig() {
  const queryClient = useQueryClient();

  // ========================================
  // QUERIES
  // ========================================

  /**
   * Query for listing all parameters.
   *
   * The raw response is validated in queryFn, then `select` applies
   * defensive filtering so consumers receive GamificationParameter[]
   * directly (not the paginated wrapper).
   *
   * @param query Optional filters (category, isActive, search, pagination)
   */
  const useParameters = (query?: ListParametersQuery) => {
    return useQuery({
      queryKey: QUERY_KEYS.parameters(query),
      queryFn: async () => {
        const response = await gamificationConfigApi.listParameters(query);

        // Validate response structure
        if (!response || typeof response !== 'object') {
          return { data: [], total: 0, page: 1, limit: 10 };
        }

        if (!response.data || !Array.isArray(response.data)) {
          return { ...response, data: [] };
        }

        // Validate each parameter has required fields
        const validatedData = response.data.filter((param) => {
          return param && typeof param === 'object' && param.id && param.key && param.value !== undefined && param.value !== null;
        });

        return {
          ...response,
          data: validatedData,
          total: validatedData.length,
        };
      },
      select: selectSafeParameters,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    });
  };

  /**
   * Query for a specific parameter by key
   *
   * @param key Parameter key
   * @param enabled Whether query is enabled
   */
  const useParameter = (key: string, enabled = true) => {
    return useQuery({
      queryKey: QUERY_KEYS.parameter(key),
      queryFn: () => gamificationConfigApi.getParameter(key),
      enabled,
    });
  };

  /**
   * Query for listing all Maya ranks.
   *
   * The raw backend response may contain snake_case fields. The `select`
   * transform normalizes every rank into camelCase MayaRankConfig objects,
   * filtering out any invalid entries (BUG-ADMIN-008).
   */
  const useMayaRanks = () => {
    return useQuery({
      queryKey: QUERY_KEYS.mayaRanks(),
      queryFn: async () => {
        const data = await gamificationConfigApi.listMayaRanks();
        return Array.isArray(data) ? data : [];
      },
      select: (rawRanks): MayaRankConfig[] => {
        if (!rawRanks || !Array.isArray(rawRanks)) return [];
        return rawRanks
          .map(normalizeRank)
          .filter((r): r is MayaRankConfig => r !== null);
      },
      staleTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
    });
  };

  /**
   * Query for a specific Maya rank by ID
   *
   * @param id Rank ID
   * @param enabled Whether query is enabled
   */
  const useMayaRank = (id: string, enabled = true) => {
    return useQuery({
      queryKey: QUERY_KEYS.mayaRank(id),
      queryFn: () => gamificationConfigApi.getMayaRank(id),
      enabled,
    });
  };

  /**
   * Query for gamification statistics
   * Includes defensive validation for unexpected backend responses
   */
  const useStats = () => {
    return useQuery({
      queryKey: QUERY_KEYS.stats(),
      queryFn: async () => {
        const data = await gamificationConfigApi.getStats();

        if (!data || typeof data !== 'object') {
          return { totalParameters: 0, activeParameters: 0, totalRanks: 0, activeRanks: 0, lastModified: '' };
        }

        return {
          totalParameters: typeof data.totalParameters === 'number' ? data.totalParameters : 0,
          activeParameters: typeof data.activeParameters === 'number' ? data.activeParameters : 0,
          totalRanks: typeof data.totalRanks === 'number' ? data.totalRanks : 0,
          activeRanks: typeof data.activeRanks === 'number' ? data.activeRanks : 0,
          lastModified: data.lastModified || '',
        };
      },
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
    });
  };

  // ========================================
  // MUTATIONS
  // ========================================

  /**
   * Mutation for updating a parameter
   */
  const updateParameter = useMutation({
    mutationFn: ({ key, data }: { key: string; data: UpdateParameterDto }) =>
      gamificationConfigApi.updateParameter(key, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.parameters() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.parameter(variables.key) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats() });
      toast.success('Parámetro actualizado correctamente');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al actualizar parámetro');
    },
  });

  /**
   * Mutation for resetting a parameter to default
   */
  const resetParameter = useMutation({
    mutationFn: (key: string) => gamificationConfigApi.resetParameter(key),
    onSuccess: (_, key) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.parameters() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.parameter(key) });
      toast.success('Parámetro reseteado a valor por defecto');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al resetear parámetro');
    },
  });

  /**
   * Mutation for bulk updating parameters
   */
  const bulkUpdateParameters = useMutation({
    mutationFn: (data: BulkUpdateParametersDto) => gamificationConfigApi.bulkUpdateParameters(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.parameters() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats() });
      toast.success('Parámetros actualizados en masa correctamente');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error en actualización masiva');
    },
  });

  /**
   * Mutation for updating a Maya rank
   */
  const updateMayaRank = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMayaRankDto }) =>
      gamificationConfigApi.updateMayaRank(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.mayaRanks() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.mayaRank(variables.id) });
      toast.success('Rango Maya actualizado correctamente');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al actualizar rango');
    },
  });

  /**
   * Mutation for previewing parameter impact
   */
  const previewImpact = useMutation({
    mutationFn: (data: PreviewImpactDto) => gamificationConfigApi.previewImpact(data),
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al generar preview');
    },
  });

  /**
   * Mutation for restoring all settings to defaults (MEDIO-002 fix)
   * Invalidates all gamification queries on success
   * @added 2025-12-15
   */
  const restoreDefaults = useMutation({
    mutationFn: () => gamificationConfigApi.restoreDefaults(),
    onSuccess: (data) => {
      toast.success(`${data.restored_count} parámetros restaurados a valores por defecto`);
      // Invalidate all gamification queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['gamification'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al restaurar valores por defecto');
    },
  });

  return {
    // Queries
    useParameters,
    useParameter,
    useMayaRanks,
    useMayaRank,
    useStats,
    // Mutations
    updateParameter,
    resetParameter,
    bulkUpdateParameters,
    updateMayaRank,
    previewImpact,
    restoreDefaults,
  };
}
