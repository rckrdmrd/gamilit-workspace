/**
 * useGamificationConfig Hook
 *
 * React Query hook for gamification configuration management (US-AE-005)
 * Provides queries and mutations for parameters, Maya ranks, and stats
 */

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
   *
   * @param query Optional filters (category, isActive, search, pagination)
   */
  const useParameters = (query?: ListParametersQuery) => {
    return useQuery({
      queryKey: QUERY_KEYS.parameters(query),
      queryFn: () => gamificationConfigApi.listParameters(query),
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
   */
  const useMayaRanks = () => {
    return useQuery({
      queryKey: QUERY_KEYS.mayaRanks(),
      queryFn: () => gamificationConfigApi.listMayaRanks(),
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
   */
  const useStats = () => {
    return useQuery({
      queryKey: QUERY_KEYS.stats(),
      queryFn: () => gamificationConfigApi.getStats(),
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
    mutationFn: (data: BulkUpdateParametersDto) =>
      gamificationConfigApi.bulkUpdateParameters(data),
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
    mutationFn: (data: PreviewImpactDto) =>
      gamificationConfigApi.previewImpact(data),
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
