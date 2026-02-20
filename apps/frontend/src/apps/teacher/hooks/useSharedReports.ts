/**
 * useSharedReports Hook
 *
 * React Query hook for managing shared reports between teachers.
 * Provides queries for shared-by-me and shared-with-me lists,
 * and mutations for share, markViewed, revoke, and updatePermission.
 *
 * @module apps/teacher/hooks/useSharedReports
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  sharedReportsApi,
  type ShareReportDto,
  type SharePermission,
  type SharedReportResponseDto,
  type SharedWithMeResponseDto,
} from '@services/api/teacher/sharedReportsApi';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const sharedReportsKeys = {
  all: ['teacher', 'shared-reports'] as const,
  byMe: () => [...sharedReportsKeys.all, 'by-me'] as const,
  withMe: () => [...sharedReportsKeys.all, 'with-me'] as const,
};

// ============================================================================
// TYPES
// ============================================================================

export interface UseSharedReportsReturn {
  /** Reports shared by the current teacher */
  sharedByMe: SharedReportResponseDto[];
  /** Reports shared with the current teacher */
  sharedWithMe: SharedWithMeResponseDto[];
  /** Whether either query is loading */
  loading: boolean;
  /** Whether shared-by-me is loading */
  loadingByMe: boolean;
  /** Whether shared-with-me is loading */
  loadingWithMe: boolean;
  /** Error from either query */
  error: Error | null;

  /** Share a report with another teacher */
  shareReport: (dto: ShareReportDto) => Promise<SharedReportResponseDto>;
  /** Whether the share mutation is in progress */
  isSharing: boolean;

  /** Mark a shared report as viewed */
  markViewed: (shareId: string) => Promise<void>;

  /** Revoke access to a shared report */
  revokeShare: (shareId: string) => Promise<void>;
  /** Whether the revoke mutation is in progress */
  isRevoking: boolean;

  /** Update permission on a shared report */
  updatePermission: (shareId: string, permission: SharePermission) => Promise<SharedReportResponseDto>;
  /** Whether the permission update mutation is in progress */
  isUpdatingPermission: boolean;

  /** Refresh all shared reports data */
  refresh: () => Promise<void>;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for managing shared reports between teachers
 *
 * @returns Object with state and mutation methods
 *
 * @example
 * ```typescript
 * const {
 *   sharedByMe,
 *   sharedWithMe,
 *   loading,
 *   shareReport,
 *   revokeShare,
 *   updatePermission,
 *   markViewed,
 *   refresh,
 * } = useSharedReports();
 *
 * // Share a report
 * await shareReport({
 *   reportId: 'report-uuid',
 *   sharedWithId: 'teacher-uuid',
 *   permission: 'view',
 *   message: 'Revisa este reporte de progreso',
 * });
 *
 * // Revoke access
 * await revokeShare('share-uuid');
 * ```
 */
export function useSharedReports(): UseSharedReportsReturn {
  const queryClient = useQueryClient();

  // ============================================================================
  // QUERIES
  // ============================================================================

  const byMeQuery = useQuery({
    queryKey: sharedReportsKeys.byMe(),
    queryFn: () => sharedReportsApi.getSharedByMe(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const withMeQuery = useQuery({
    queryKey: sharedReportsKeys.withMe(),
    queryFn: () => sharedReportsApi.getSharedWithMe(),
    staleTime: 2 * 60 * 1000,
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const shareMutation = useMutation({
    mutationFn: (dto: ShareReportDto) => sharedReportsApi.shareReport(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sharedReportsKeys.byMe() });
    },
  });

  const markViewedMutation = useMutation({
    mutationFn: (shareId: string) => sharedReportsApi.markViewed(shareId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sharedReportsKeys.withMe() });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (shareId: string) => sharedReportsApi.revokeShare(shareId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sharedReportsKeys.byMe() });
    },
  });

  const updatePermissionMutation = useMutation({
    mutationFn: ({ shareId, permission }: { shareId: string; permission: SharePermission }) =>
      sharedReportsApi.updatePermission(shareId, permission),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sharedReportsKeys.byMe() });
    },
  });

  // ============================================================================
  // IMPERATIVE ACTIONS
  // ============================================================================

  const shareReport = useCallback(
    async (dto: ShareReportDto): Promise<SharedReportResponseDto> => {
      return shareMutation.mutateAsync(dto);
    },
    [shareMutation],
  );

  const markViewed = useCallback(
    async (shareId: string): Promise<void> => {
      await markViewedMutation.mutateAsync(shareId);
    },
    [markViewedMutation],
  );

  const revokeShare = useCallback(
    async (shareId: string): Promise<void> => {
      await revokeMutation.mutateAsync(shareId);
    },
    [revokeMutation],
  );

  const updatePermission = useCallback(
    async (shareId: string, permission: SharePermission): Promise<SharedReportResponseDto> => {
      return updatePermissionMutation.mutateAsync({ shareId, permission });
    },
    [updatePermissionMutation],
  );

  const refresh = useCallback(async (): Promise<void> => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: sharedReportsKeys.byMe() }),
      queryClient.invalidateQueries({ queryKey: sharedReportsKeys.withMe() }),
    ]);
  }, [queryClient]);

  // ============================================================================
  // RETURN
  // ============================================================================

  const loading = byMeQuery.isLoading || withMeQuery.isLoading;
  const error = byMeQuery.error ?? withMeQuery.error ?? null;

  return {
    sharedByMe: byMeQuery.data ?? [],
    sharedWithMe: withMeQuery.data ?? [],
    loading,
    loadingByMe: byMeQuery.isLoading,
    loadingWithMe: withMeQuery.isLoading,
    error,

    shareReport,
    isSharing: shareMutation.isPending,

    markViewed,

    revokeShare,
    isRevoking: revokeMutation.isPending,

    updatePermission,
    isUpdatingPermission: updatePermissionMutation.isPending,

    refresh,
  };
}
