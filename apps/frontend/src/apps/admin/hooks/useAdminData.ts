/**
 * useAdminData Hooks
 *
 * Provides user activity tracking, error tracking, and CSV export utilities
 * for the admin portal.
 *
 * Migrated to React Query for automatic caching, deduplication,
 * and background refetching.
 *
 * Original: 2025-11-19
 * Updated: 2026-02-20 - Migrated to React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';
import { STALE_TIMES } from '@/shared/constants/queryKeys';

export interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ErrorLog {
  id: string;
  type: string;
  message: string;
  endpoint: string;
  stackTrace?: string;
  affectedUsers: number;
  frequency: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  resolved: boolean;
}

// ============================================================================
// Query Key Factories
// ============================================================================

const adminDataKeys = {
  activity: (filters?: Record<string, string | undefined>) =>
    ['admin', 'activity', filters] as const,
  errors: (filters?: Record<string, string | boolean | undefined>) =>
    ['admin', 'errors', filters] as const,
};

// ============================================================================
// useUserActivity
// ============================================================================

export function useUserActivity(filters?: { role?: string; dateFrom?: string; action?: string }) {
  const query = useQuery({
    queryKey: adminDataKeys.activity(filters as Record<string, string | undefined>),
    queryFn: async () => {
      const params = new URLSearchParams(filters as Record<string, string>);
      const response = await apiClient.get(`${API_ENDPOINTS.admin.activity}?${params}`);
      const data = response.data.success ? response.data.data : response.data;

      return {
        activities: (data.activities || []) as UserActivity[],
        onlineUsers: (data.onlineUsers || 0) as number,
        activeSessions: (data.activeSessions || 0) as number,
      };
    },
    staleTime: STALE_TIMES.REALTIME,
    refetchInterval: 30000, // Refresh every 30 seconds (replaces setInterval)
  });

  return {
    activities: query.data?.activities ?? [],
    onlineUsers: query.data?.onlineUsers ?? 0,
    activeSessions: query.data?.activeSessions ?? 0,
    loading: query.isLoading,
  };
}

// ============================================================================
// useErrorTracking
// ============================================================================

export function useErrorTracking(filters?: { severity?: string; resolved?: boolean }) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: adminDataKeys.errors(filters as Record<string, string | boolean | undefined>),
    queryFn: async () => {
      const params = new URLSearchParams(filters as Record<string, string>);
      const response = await apiClient.get(`${API_ENDPOINTS.admin.errors.list}?${params}`);
      const data = response.data.success ? response.data.data : response.data;
      return (data.errors || []) as ErrorLog[];
    },
    staleTime: STALE_TIMES.DYNAMIC,
  });

  const resolveMutation = useMutation({
    mutationFn: (errorId: string) =>
      apiClient.patch(API_ENDPOINTS.admin.errors.resolve(errorId)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminDataKeys.errors(filters as Record<string, string | boolean | undefined>),
      });
    },
  });

  const markAsResolved = async (errorId: string) => {
    await resolveMutation.mutateAsync(errorId);
  };

  const refresh = async () => {
    await query.refetch();
  };

  return {
    errors: query.data ?? [],
    loading: query.isLoading,
    markAsResolved,
    refresh,
  };
}

// ============================================================================
// useExportData (no API calls - pure utility, unchanged)
// ============================================================================

export function useExportData() {
  const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map((row) => headers.map((header) => JSON.stringify(row[header] || '')).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return { exportToCSV };
}
