/**
 * useScheduledReports Hook - Manage scheduled reports via React Query
 *
 * Provides queries and mutations for CRUD + pause/resume operations
 * on teacher scheduled reports. Auto-invalidates the list on mutations.
 *
 * @module apps/teacher/hooks/useScheduledReports
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  scheduledReportsApi,
  type ScheduledReportResponse,
  type CreateScheduledReportDto,
  type UpdateScheduledReportDto,
} from '@services/api/teacher/scheduledReportsApi';
import { STALE_TIMES } from '@shared/constants/queryKeys';

// ---------------------------------------------------------------------------
// Query Key Factory
// ---------------------------------------------------------------------------

export const scheduledReportKeys = {
  all: ['teacher', 'scheduled-reports'] as const,
  lists: () => [...scheduledReportKeys.all, 'list'] as const,
  detail: (id: string) => [...scheduledReportKeys.all, 'detail', id] as const,
};

// ---------------------------------------------------------------------------
// Return Type
// ---------------------------------------------------------------------------

export interface UseScheduledReportsReturn {
  /** List of scheduled reports */
  scheduledReports: ScheduledReportResponse[];
  /** Whether the list query is loading */
  loading: boolean;
  /** Query error if any */
  error: Error | null;
  /** Create a new scheduled report */
  createScheduledReport: (dto: CreateScheduledReportDto) => Promise<ScheduledReportResponse>;
  /** Update an existing scheduled report */
  updateScheduledReport: (id: string, dto: UpdateScheduledReportDto) => Promise<ScheduledReportResponse>;
  /** Delete a scheduled report */
  deleteScheduledReport: (id: string) => Promise<{ message: string }>;
  /** Pause a scheduled report */
  pauseScheduledReport: (id: string) => Promise<ScheduledReportResponse>;
  /** Resume a paused scheduled report */
  resumeScheduledReport: (id: string) => Promise<ScheduledReportResponse>;
  /** Whether any mutation is in progress */
  isMutating: boolean;
  /** Manually refresh the list */
  refresh: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// useScheduledReports
// ---------------------------------------------------------------------------

export function useScheduledReports(): UseScheduledReportsReturn {
  const queryClient = useQueryClient();

  // --- Query ----------------------------------------------------------------

  const listQuery = useQuery({
    queryKey: scheduledReportKeys.lists(),
    queryFn: () => scheduledReportsApi.getScheduledReports(),
    staleTime: STALE_TIMES.DYNAMIC,
  });

  // --- Mutations -------------------------------------------------------------

  const createMutation = useMutation({
    mutationFn: (dto: CreateScheduledReportDto) =>
      scheduledReportsApi.createScheduledReport(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduledReportKeys.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateScheduledReportDto }) =>
      scheduledReportsApi.updateScheduledReport(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduledReportKeys.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => scheduledReportsApi.deleteScheduledReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduledReportKeys.all });
    },
  });

  const pauseMutation = useMutation({
    mutationFn: (id: string) => scheduledReportsApi.pauseScheduledReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduledReportKeys.all });
    },
  });

  const resumeMutation = useMutation({
    mutationFn: (id: string) => scheduledReportsApi.resumeScheduledReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduledReportKeys.all });
    },
  });

  // --- Imperative actions ---------------------------------------------------

  const createScheduledReport = useCallback(
    async (dto: CreateScheduledReportDto): Promise<ScheduledReportResponse> => {
      return createMutation.mutateAsync(dto);
    },
    [createMutation],
  );

  const updateScheduledReport = useCallback(
    async (id: string, dto: UpdateScheduledReportDto): Promise<ScheduledReportResponse> => {
      return updateMutation.mutateAsync({ id, dto });
    },
    [updateMutation],
  );

  const deleteScheduledReport = useCallback(
    async (id: string): Promise<{ message: string }> => {
      return deleteMutation.mutateAsync(id);
    },
    [deleteMutation],
  );

  const pauseScheduledReport = useCallback(
    async (id: string): Promise<ScheduledReportResponse> => {
      return pauseMutation.mutateAsync(id);
    },
    [pauseMutation],
  );

  const resumeScheduledReport = useCallback(
    async (id: string): Promise<ScheduledReportResponse> => {
      return resumeMutation.mutateAsync(id);
    },
    [resumeMutation],
  );

  const refresh = useCallback(async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: scheduledReportKeys.all });
  }, [queryClient]);

  // --- Return ---------------------------------------------------------------

  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    pauseMutation.isPending ||
    resumeMutation.isPending;

  return {
    scheduledReports: listQuery.data ?? [],
    loading: listQuery.isLoading,
    error: listQuery.error ?? null,
    createScheduledReport,
    updateScheduledReport,
    deleteScheduledReport,
    pauseScheduledReport,
    resumeScheduledReport,
    isMutating,
    refresh,
  };
}
