/**
 * useSharedResources Hook
 *
 * Custom hook for browsing, rating, commenting, and downloading shared educational resources.
 * Powers the ResourceSharingPanel component.
 * Uses React Query for server state management (STANDARD-API compliant).
 *
 * @module apps/teacher/hooks/useSharedResources
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  resourceSharingApi,
  mapToSharedResource,
} from '@/services/api/teacher/resourceSharingApi';
import type {
  SearchResourcesParams,
  ResourceComment,
} from '@/services/api/teacher/resourceSharingApi';
import type { SharedResource } from '@/apps/teacher/types';

// ============================================================================
// TYPES
// ============================================================================

export interface ResourceFilters {
  type?: string;
  category?: string;
  search?: string;
  sort_by?: 'created_at' | 'rating' | 'downloads' | 'title';
  sort_order?: 'asc' | 'desc';
}

export interface UseSharedResourcesReturn {
  // State
  resources: SharedResource[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  error: Error | null;
  filters: ResourceFilters;

  // Methods
  updateFilters: (newFilters: Partial<ResourceFilters>) => void;
  setPage: (page: number) => void;
  refresh: () => void;
  clearError: () => void;

  // Resource actions
  rateResource: (resourceId: string, rating: number) => Promise<void>;
  addComment: (resourceId: string, text: string) => Promise<ResourceComment>;
  downloadResource: (resourceId: string) => Promise<void>;
  getComments: (resourceId: string, page?: number) => Promise<ResourceComment[]>;
}

// ============================================================================
// QUERY KEYS
// ============================================================================

const sharedResourceKeys = {
  all: ['shared-resources'] as const,
  list: (filters: ResourceFilters, page: number, limit: number) =>
    [...sharedResourceKeys.all, 'list', { ...filters, page, limit }] as const,
  comments: (resourceId: string, page: number) =>
    [...sharedResourceKeys.all, 'comments', resourceId, page] as const,
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for managing shared educational resources
 *
 * @param initialFilters - Optional initial filter values
 * @param pageSize - Number of results per page (default: 10)
 * @returns Object with state and methods for managing shared resources
 *
 * @example
 * ```typescript
 * const {
 *   resources,
 *   loading,
 *   updateFilters,
 *   rateResource,
 *   addComment,
 *   downloadResource
 * } = useSharedResources({ category: 'Pedagogia' });
 * ```
 */
export function useSharedResources(
  initialFilters: ResourceFilters = {},
  pageSize: number = 10,
): UseSharedResourcesReturn {
  const [page, setPageState] = useState(1);
  const [filters, setFilters] = useState<ResourceFilters>(initialFilters);
  const queryClient = useQueryClient();

  // ============================================================================
  // QUERY: Fetch resources
  // ============================================================================

  const listQuery = useQuery({
    queryKey: sharedResourceKeys.list(filters, page, pageSize),
    queryFn: async () => {
      const params: SearchResourcesParams = {
        ...filters,
        page,
        limit: pageSize,
      };
      const response = await resourceSharingApi.getResources(params);
      return {
        resources: response.data.map((r) => mapToSharedResource(r)),
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
      };
    },
    staleTime: 30_000,
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const rateMutation = useMutation({
    mutationFn: ({ resourceId, rating }: { resourceId: string; rating: number }) =>
      resourceSharingApi.rateResource(resourceId, rating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sharedResourceKeys.all });
    },
  });

  const commentMutation = useMutation({
    mutationFn: ({ resourceId, text }: { resourceId: string; text: string }) =>
      resourceSharingApi.addComment(resourceId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sharedResourceKeys.all });
    },
  });

  const downloadMutation = useMutation({
    mutationFn: (resourceId: string) =>
      resourceSharingApi.recordDownload(resourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sharedResourceKeys.all });
    },
  });

  // ============================================================================
  // FILTER & PAGINATION
  // ============================================================================

  const updateFilters = useCallback((newFilters: Partial<ResourceFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPageState(1);
  }, []);

  const setPage = useCallback((newPage: number) => {
    setPageState(newPage);
  }, []);

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: sharedResourceKeys.all });
  }, [queryClient]);

  const clearError = useCallback(() => {
    // React Query manages error state; reset by refetching
    listQuery.refetch();
  }, [listQuery]);

  // ============================================================================
  // RESOURCE ACTIONS
  // ============================================================================

  const rateResource = useCallback(async (resourceId: string, rating: number) => {
    await rateMutation.mutateAsync({ resourceId, rating });
  }, [rateMutation]);

  const addComment = useCallback(async (resourceId: string, text: string): Promise<ResourceComment> => {
    return commentMutation.mutateAsync({ resourceId, text });
  }, [commentMutation]);

  const downloadResource = useCallback(async (resourceId: string) => {
    await downloadMutation.mutateAsync(resourceId);
  }, [downloadMutation]);

  const getComments = useCallback(async (resourceId: string, commentPage = 1): Promise<ResourceComment[]> => {
    const response = await resourceSharingApi.getComments(resourceId, commentPage);
    return response.data;
  }, []);

  // ============================================================================
  // RETURN
  // ============================================================================

  const mutationError = rateMutation.error || commentMutation.error || downloadMutation.error;

  return {
    resources: listQuery.data?.resources ?? [],
    total: listQuery.data?.total ?? 0,
    page,
    totalPages: listQuery.data?.totalPages ?? 0,
    loading: listQuery.isLoading || rateMutation.isPending || commentMutation.isPending || downloadMutation.isPending,
    error: (listQuery.error as Error | null) ?? (mutationError as Error | null),
    filters,
    updateFilters,
    setPage,
    refresh,
    clearError,
    rateResource,
    addComment,
    downloadResource,
    getComments,
  };
}
