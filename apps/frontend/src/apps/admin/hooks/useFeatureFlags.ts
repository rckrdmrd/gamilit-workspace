/**
 * useFeatureFlags Hook
 *
 * Hook for managing feature flags with CRUD operations.
 *
 * Features:
 * - List, create, update, delete feature flags
 * - Toggle flags on/off
 * - Filter flags by status
 * - Error handling and loading states
 *
 * Backend Endpoints:
 * - GET /admin/feature-flags
 * - POST /admin/feature-flags
 * - PUT /admin/feature-flags/:key
 * - DELETE /admin/feature-flags/:key
 *
 * Note: Backend endpoints NOT YET IMPLEMENTED
 * Currently uses mock data for development
 *
 * Created: 2025-12-05 - FE-ADMIN-011-016 (Sprint P2-B)
 * Updated: 2026-02-20 - Migrated to React Query
 */

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { FEATURE_FLAGS, API_ENDPOINTS } from '@/config/api.config';
import { STALE_TIMES } from '@/shared/constants/queryKeys';
import type { FeatureFlag, CreateFlagDto, UpdateFlagDto } from '../types';

// ============================================================================
// Query Key Factories
// ============================================================================

const featureFlagKeys = {
  all: ['admin', 'feature-flags'] as const,
  list: () => ['admin', 'feature-flags', 'list'] as const,
};

// ============================================================================
// Types (unchanged for backward compatibility)
// ============================================================================

export interface UseFeatureFlagsResult {
  flags: FeatureFlag[];
  loading: boolean;
  error: string | null;
  createFlag: (data: CreateFlagDto) => Promise<void>;
  updateFlag: (key: string, data: UpdateFlagDto) => Promise<void>;
  deleteFlag: (key: string) => Promise<void>;
  toggleFlag: (key: string) => Promise<void>;
  fetchFlags: () => Promise<void>;
}

// Mock data for development until backend is implemented
const MOCK_FLAGS: FeatureFlag[] = [
  {
    id: '1',
    key: 'ai_assistant_beta',
    name: 'AI Assistant Beta',
    description: 'Enable AI-powered learning assistant for selected users',
    isEnabled: true,
    rolloutPercentage: 25,
    targetRoles: ['admin_teacher'],
    targetUsers: [],
    createdAt: '2024-09-01T00:00:00Z',
    updatedAt: '2024-10-15T10:30:00Z',
    createdBy: 'admin@gamilit.com',
    lastModifiedBy: 'admin@gamilit.com',
  },
  {
    id: '2',
    key: 'new_dashboard_ui',
    name: 'New Dashboard UI',
    description: 'Redesigned student dashboard with improved UX',
    isEnabled: false,
    rolloutPercentage: 0,
    targetRoles: [],
    targetUsers: ['user1@test.com', 'user2@test.com'],
    createdAt: '2024-10-01T00:00:00Z',
    updatedAt: '2024-10-10T14:20:00Z',
    createdBy: 'admin@gamilit.com',
    lastModifiedBy: 'admin@gamilit.com',
  },
  {
    id: '3',
    key: 'gamification_v2',
    name: 'Gamification V2',
    description: 'Enhanced gamification system with new achievements',
    isEnabled: true,
    rolloutPercentage: 100,
    targetRoles: ['student', 'admin_teacher'],
    targetUsers: [],
    createdAt: '2024-08-15T00:00:00Z',
    updatedAt: '2024-09-30T09:00:00Z',
    createdBy: 'admin@gamilit.com',
    lastModifiedBy: 'admin@gamilit.com',
  },
];

// HIGH-005 FIX: Usar FEATURE_FLAGS en lugar de valor hardcodeado
const USE_MOCK_DATA = FEATURE_FLAGS.USE_MOCK_DATA || FEATURE_FLAGS.MOCK_API;

// ============================================================================
// Hook
// ============================================================================

export function useFeatureFlags(): UseFeatureFlagsResult {
  const queryClient = useQueryClient();

  // ============================================================================
  // QUERY
  // ============================================================================

  const flagsQuery = useQuery({
    queryKey: featureFlagKeys.list(),
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        return MOCK_FLAGS;
      }

      // HIGH-005 FIX: Usar ruta directa en lugar de API_ENDPOINTS.admin.base
      const response = await apiClient.get<FeatureFlag[]>('/admin/feature-flags');
      return response.data;
    },
    staleTime: STALE_TIMES.SEMI_STATIC,
    enabled: true,
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const createMutation = useMutation({
    mutationFn: async (data: CreateFlagDto) => {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const newFlag: FeatureFlag = {
          id: Date.now().toString(),
          key: data.key,
          name: data.name,
          description: data.description,
          isEnabled: data.isEnabled ?? false,
          rolloutPercentage: data.rolloutPercentage ?? 0,
          targetRoles: data.targetRoles ?? [],
          targetUsers: data.targetUsers ?? [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'admin@gamilit.com',
          lastModifiedBy: 'admin@gamilit.com',
        };

        return newFlag;
      }

      // HIGH-005 FIX: Usar ruta directa
      const response = await apiClient.post<FeatureFlag>('/admin/feature-flags', data);
      return response.data;
    },
    onSuccess: (newFlag) => {
      // Optimistically add to cache
      queryClient.setQueryData<FeatureFlag[]>(featureFlagKeys.list(), (old) =>
        old ? [...old, newFlag] : [newFlag],
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ key, data }: { key: string; data: UpdateFlagDto }) => {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { key, data };
      }

      // HIGH-005 FIX: Usar ruta directa
      const response = await apiClient.put<FeatureFlag>(`/admin/feature-flags/${key}`, data);
      return response.data;
    },
    onSuccess: (_result, variables) => {
      if (USE_MOCK_DATA) {
        // Update mock data in cache
        queryClient.setQueryData<FeatureFlag[]>(featureFlagKeys.list(), (old) =>
          old?.map((flag) =>
            flag.key === variables.key
              ? {
                  ...flag,
                  ...variables.data,
                  updatedAt: new Date().toISOString(),
                  lastModifiedBy: 'admin@gamilit.com',
                }
              : flag,
          ),
        );
      } else {
        queryClient.invalidateQueries({ queryKey: featureFlagKeys.all });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (key: string) => {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return key;
      }

      // HIGH-005 FIX: Usar ruta centralizada
      await apiClient.delete(API_ENDPOINTS.admin.featureFlags.delete(key));
      return key;
    },
    onSuccess: (deletedKey) => {
      queryClient.setQueryData<FeatureFlag[]>(featureFlagKeys.list(), (old) =>
        old?.filter((flag) => flag.key !== deletedKey),
      );
    },
  });

  // ============================================================================
  // DERIVED STATE
  // ============================================================================

  const flags = flagsQuery.data ?? [];
  const loading =
    flagsQuery.isLoading ||
    flagsQuery.isFetching ||
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const firstError = flagsQuery.error ?? createMutation.error ?? updateMutation.error ?? deleteMutation.error;
  const error = firstError instanceof Error ? firstError.message : firstError ? String(firstError) : null;

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const fetchFlags = useCallback(async (): Promise<void> => {
    await flagsQuery.refetch();
  }, [flagsQuery]);

  const createFlag = useCallback(
    async (data: CreateFlagDto): Promise<void> => {
      await createMutation.mutateAsync(data);
    },
    [createMutation],
  );

  const updateFlag = useCallback(
    async (key: string, data: UpdateFlagDto): Promise<void> => {
      await updateMutation.mutateAsync({ key, data });
    },
    [updateMutation],
  );

  const deleteFlag = useCallback(
    async (key: string): Promise<void> => {
      await deleteMutation.mutateAsync(key);
    },
    [deleteMutation],
  );

  const toggleFlag = useCallback(
    async (key: string): Promise<void> => {
      const flag = flags.find((f) => f.key === key);
      if (!flag) {
        throw new Error(`Flag with key "${key}" not found`);
      }

      await updateMutation.mutateAsync({ key, data: { isEnabled: !flag.isEnabled } });
    },
    [flags, updateMutation],
  );

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    flags,
    loading,
    error,
    createFlag,
    updateFlag,
    deleteFlag,
    toggleFlag,
    fetchFlags,
  };
}
