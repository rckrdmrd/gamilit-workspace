/**
 * useLtiConsumers Hook
 *
 * Comprehensive hook for managing LTI consumers in the admin portal.
 *
 * Features:
 * - List all LTI consumers with statistics
 * - CRUD operations for consumers
 * - Connection testing
 * - Credential management
 * - Error handling and loading states
 *
 * Migrated to React Query for automatic caching, deduplication,
 * and background refetching.
 *
 * Created: 2026-01-27 - EXT-007 LTI Integration
 * Updated: 2026-02-20 - Migrated to React Query
 * @see lti-consumers.controller.ts
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ltiApi } from '@/services/api/admin/ltiAPI';
import { STALE_TIMES } from '@/shared/constants/queryKeys';
import type {
  LtiConsumer,
  CreateLtiConsumerDto,
  UpdateLtiConsumerDto,
  LtiConsumerStats,
  ConnectionTestResult,
  LtiCredentials,
} from '@/shared/types/lti.types';

// ============================================================================
// Query Key Factories
// ============================================================================

const ltiConsumerKeys = {
  all: ['admin', 'lti-consumers'] as const,
  list: () => ['admin', 'lti-consumers', 'list'] as const,
  stats: () => ['admin', 'lti-consumers', 'stats'] as const,
};

// ============================================================================
// Types (unchanged for backward compatibility)
// ============================================================================

export interface UseLtiConsumersResult {
  // Data
  consumers: LtiConsumer[];
  stats: LtiConsumerStats | null;
  selectedConsumer: LtiConsumer | null;

  // State
  loading: boolean;
  error: string | null;
  testingConnection: boolean;
  regeneratingCredentials: boolean;

  // Operations
  fetchConsumers: () => Promise<void>;
  fetchStats: () => Promise<void>;
  createConsumer: (data: CreateLtiConsumerDto) => Promise<LtiConsumer>;
  updateConsumer: (id: string, data: UpdateLtiConsumerDto) => Promise<LtiConsumer>;
  verifyConsumer: (id: string) => Promise<LtiConsumer>;
  activateConsumer: (id: string) => Promise<LtiConsumer>;
  deactivateConsumer: (id: string) => Promise<void>;
  testConnection: (id: string) => Promise<ConnectionTestResult>;
  regenerateCredentials: (id: string) => Promise<LtiCredentials>;
  selectConsumer: (consumer: LtiConsumer | null) => void;
  refetch: () => Promise<void>;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook for managing LTI consumers in the admin portal
 *
 * @returns {UseLtiConsumersResult} Consumer data, loading state, and operations
 *
 * @example
 * ```tsx
 * const { consumers, loading, error, createConsumer, testConnection } = useLtiConsumers();
 *
 * const handleCreate = async (data: CreateLtiConsumerDto) => {
 *   try {
 *     await createConsumer(data);
 *     toast.success('Consumer created');
 *   } catch (err) {
 *     toast.error('Failed to create consumer');
 *   }
 * };
 * ```
 */
export function useLtiConsumers(): UseLtiConsumersResult {
  const queryClient = useQueryClient();

  // Client-side state (not server data)
  const [selectedConsumer, setSelectedConsumer] = useState<LtiConsumer | null>(null);

  // ============================================================================
  // QUERIES
  // ============================================================================

  const consumersQuery = useQuery({
    queryKey: ltiConsumerKeys.list(),
    queryFn: async () => {
      const data = await ltiApi.getConsumers();
      return data || [];
    },
    staleTime: STALE_TIMES.DYNAMIC,
  });

  const statsQuery = useQuery({
    queryKey: ltiConsumerKeys.stats(),
    queryFn: async () => {
      const data = await ltiApi.getConsumerStats();
      return data;
    },
    staleTime: STALE_TIMES.DYNAMIC,
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const createMutation = useMutation({
    mutationFn: (data: CreateLtiConsumerDto) => ltiApi.createConsumer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ltiConsumerKeys.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLtiConsumerDto }) =>
      ltiApi.updateConsumer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ltiConsumerKeys.all });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => ltiApi.verifyConsumer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ltiConsumerKeys.all });
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => ltiApi.activateConsumer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ltiConsumerKeys.all });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => ltiApi.deactivateConsumer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ltiConsumerKeys.all });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: (id: string) => ltiApi.testConnection(id),
  });

  const regenerateCredentialsMutation = useMutation({
    mutationFn: (id: string) => ltiApi.regenerateCredentials(id),
  });

  // ============================================================================
  // DERIVED STATE
  // ============================================================================

  const consumers = consumersQuery.data ?? [];
  const stats = statsQuery.data ?? null;

  const loading =
    consumersQuery.isLoading ||
    createMutation.isPending ||
    updateMutation.isPending ||
    verifyMutation.isPending ||
    activateMutation.isPending ||
    deactivateMutation.isPending;

  const firstError =
    consumersQuery.error ??
    createMutation.error ??
    updateMutation.error ??
    verifyMutation.error ??
    activateMutation.error ??
    deactivateMutation.error;

  const error = firstError instanceof Error ? firstError.message : firstError ? String(firstError) : null;

  const testingConnection = testConnectionMutation.isPending;
  const regeneratingCredentials = regenerateCredentialsMutation.isPending;

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const fetchConsumers = useCallback(async (): Promise<void> => {
    await consumersQuery.refetch();
  }, [consumersQuery]);

  const fetchStats = useCallback(async (): Promise<void> => {
    await statsQuery.refetch();
  }, [statsQuery]);

  const refetch = useCallback(async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: ltiConsumerKeys.all });
  }, [queryClient]);

  const createConsumer = useCallback(
    async (data: CreateLtiConsumerDto): Promise<LtiConsumer> => {
      return createMutation.mutateAsync(data);
    },
    [createMutation],
  );

  const updateConsumer = useCallback(
    async (id: string, data: UpdateLtiConsumerDto): Promise<LtiConsumer> => {
      return updateMutation.mutateAsync({ id, data });
    },
    [updateMutation],
  );

  const verifyConsumer = useCallback(
    async (id: string): Promise<LtiConsumer> => {
      return verifyMutation.mutateAsync(id);
    },
    [verifyMutation],
  );

  const activateConsumer = useCallback(
    async (id: string): Promise<LtiConsumer> => {
      return activateMutation.mutateAsync(id);
    },
    [activateMutation],
  );

  const deactivateConsumer = useCallback(
    async (id: string): Promise<void> => {
      await deactivateMutation.mutateAsync(id);
    },
    [deactivateMutation],
  );

  const testConnection = useCallback(
    async (id: string): Promise<ConnectionTestResult> => {
      return testConnectionMutation.mutateAsync(id);
    },
    [testConnectionMutation],
  );

  const regenerateCredentials = useCallback(
    async (id: string): Promise<LtiCredentials> => {
      return regenerateCredentialsMutation.mutateAsync(id);
    },
    [regenerateCredentialsMutation],
  );

  const selectConsumer = useCallback((consumer: LtiConsumer | null): void => {
    setSelectedConsumer(consumer);
  }, []);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Data
    consumers,
    stats,
    selectedConsumer,

    // State
    loading,
    error,
    testingConnection,
    regeneratingCredentials,

    // Operations
    fetchConsumers,
    fetchStats,
    createConsumer,
    updateConsumer,
    verifyConsumer,
    activateConsumer,
    deactivateConsumer,
    testConnection,
    regenerateCredentials,
    selectConsumer,
    refetch,
  };
}
