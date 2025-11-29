/**
 * useGamificationConfig Hook
 *
 * React Query hook for gamification configuration management (US-AE-005)
 * Provides queries and mutations for parameters, Maya ranks, and stats
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gamificationConfigApi } from '@/services/api/admin/gamificationConfigApi';
import type {
  ListParametersQuery,
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
   * Query for listing all parameters
   * Includes defensive validation for unexpected backend responses
   *
   * @param query Optional filters (category, isActive, search, pagination)
   */
  const useParameters = (query?: ListParametersQuery) => {
    return useQuery({
      queryKey: QUERY_KEYS.parameters(query),
      queryFn: async () => {
        try {
          const response = await gamificationConfigApi.listParameters(query);

          // Defensive: Validate response structure
          if (!response || typeof response !== 'object') {
            console.warn(
              '[useGamificationConfig] listParameters returned invalid response:',
              response,
            );
            return { data: [], total: 0, page: 1, limit: 10 };
          }

          // Defensive: Validate data array exists
          if (!response.data || !Array.isArray(response.data)) {
            console.warn('[useGamificationConfig] listParameters missing data array:', response);
            return { ...response, data: [] };
          }

          // Defensive: Validate each parameter has required fields
          const validatedData = response.data.filter((param) => {
            if (!param || typeof param !== 'object') {
              console.warn('[useGamificationConfig] Invalid parameter object:', param);
              return false;
            }

            if (!param.id || !param.key) {
              console.warn('[useGamificationConfig] Parameter missing id or key:', param);
              return false;
            }

            if (param.value === undefined || param.value === null) {
              console.warn('[useGamificationConfig] Parameter missing value:', param);
              return false;
            }

            return true;
          });

          return {
            ...response,
            data: validatedData,
            total: validatedData.length,
          };
        } catch (error) {
          console.error('[useGamificationConfig] Error fetching parameters:', error);
          return { data: [], total: 0, page: 1, limit: 10 };
        }
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
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
   * Query for listing all Maya ranks
   * Includes defensive validation for unexpected backend responses
   */
  const useMayaRanks = () => {
    return useQuery({
      queryKey: QUERY_KEYS.mayaRanks(),
      queryFn: async () => {
        try {
          const data = await gamificationConfigApi.listMayaRanks();

          // Defensive: Validate response is an array
          if (!Array.isArray(data)) {
            console.warn('[useGamificationConfig] listMayaRanks returned non-array:', data);
            return [];
          }

          // Defensive: Validate each rank has required fields
          // Cast to any to allow checking both camelCase and snake_case fields from backend
          const validatedRanks = data.filter((rank) => {
            if (!rank || typeof rank !== 'object') {
              console.warn('[useGamificationConfig] Invalid rank object:', rank);
              return false;
            }

            const rankAny = rank as any;
            const hasId = rank.id || rankAny.rank_name;
            const hasName = rank.name || rankAny.rank_name;
            const hasLevel =
              typeof rank.level === 'number' || typeof rankAny.rank_order === 'number';

            if (!hasId || !hasName || !hasLevel) {
              console.warn('[useGamificationConfig] Rank missing required fields:', rank);
              return false;
            }

            return true;
          });

          return validatedRanks;
        } catch (error) {
          console.error('[useGamificationConfig] Error fetching Maya ranks:', error);
          return [];
        }
      },
      staleTime: 1000 * 60 * 10, // 10 minutes
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
        try {
          const data = await gamificationConfigApi.getStats();

          // Defensive: Validate response structure
          if (!data || typeof data !== 'object') {
            console.warn('[useGamificationConfig] getStats returned invalid response:', data);
            return {
              totalParameters: 0,
              activeParameters: 0,
              totalRanks: 0,
              activeRanks: 0,
            };
          }

          // Defensive: Ensure numeric fields with fallbacks
          return {
            totalParameters: typeof data.totalParameters === 'number' ? data.totalParameters : 0,
            activeParameters: typeof data.activeParameters === 'number' ? data.activeParameters : 0,
            totalRanks: typeof data.totalRanks === 'number' ? data.totalRanks : 0,
            activeRanks: typeof data.activeRanks === 'number' ? data.activeRanks : 0,
            lastModified: data.lastModified || undefined,
          };
        } catch (error) {
          console.error('[useGamificationConfig] Error fetching stats:', error);
          return {
            totalParameters: 0,
            activeParameters: 0,
            totalRanks: 0,
            activeRanks: 0,
          };
        }
      },
      staleTime: 1000 * 60 * 2, // 2 minutes
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
  };
}
