/**
 * useStudentMonitoring Hook
 *
 * Legacy hook refactored to use classroomsApi service.
 * This hook is functional and provides backward compatibility with existing components.
 *
 * Fetches and monitors students in a classroom with optional filters.
 * Includes auto-refresh capability with configurable intervals.
 *
 * @param classroomId - ID of the classroom to monitor
 * @param filters - Optional filters for status, module, score range, and search
 * @param options - Configuration options for auto-refresh
 * @returns Object with students list, loading state, error state, auto-refresh control, and refresh function
 *
 * @example
 * ```typescript
 * const { students, loading, error, refreshInterval, setRefreshInterval, refresh, lastUpdate } =
 *   useStudentMonitoring(classroomId, { status: ['active'], search: 'John' }, { defaultInterval: 15000 });
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { classroomsApi } from '@services/api/teacher';
import type { GetClassroomStudentsQueryDto } from '@services/api/teacher';
import type { StudentMonitoring, StudentFilter } from '../types';

export type RefreshInterval = 0 | 15000 | 30000 | 60000; // 0 = manual, 15s, 30s, 60s

interface UseStudentMonitoringOptions {
  defaultInterval?: RefreshInterval;
}

export function useStudentMonitoring(
  classroomId: string,
  filters?: StudentFilter,
  options?: UseStudentMonitoringOptions,
) {
  const [students, setStudents] = useState<StudentMonitoring[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<RefreshInterval>(
    options?.defaultInterval ?? 30000,
  );
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStudents = useCallback(
    async (showLoadingState = true) => {
      if (!classroomId) return;

      try {
        if (showLoadingState) {
          setLoading(true);
        }
        setError(null);

        // Convert filters to API query parameters
        const query: GetClassroomStudentsQueryDto = {};

        // Note: The API currently supports status, sort_by, and sort_order
        // Additional filters (module_id, score_range, search) may need backend support
        if (filters?.status && filters.status.length > 0) {
          // API expects single status value, use first one for now
          query.status = filters.status[0] as 'active' | 'inactive';
        }

        const response = await classroomsApi.getClassroomStudents(classroomId, query);

        // Extract students from paginated response
        setStudents(response.data || []);
        setLastUpdate(new Date());
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.error('[useStudentMonitoring] Error fetching students:', err);
      } finally {
        if (showLoadingState) {
          setLoading(false);
        }
      }
    },
    [classroomId, filters],
  );

  // Initial fetch
  useEffect(() => {
    fetchStudents(true);
  }, [fetchStudents]);

  // Auto-refresh with configurable interval
  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Set up new interval if not manual (0)
    if (refreshInterval > 0 && classroomId) {
      intervalRef.current = setInterval(() => {
        fetchStudents(false); // Don't show loading state on auto-refresh
      }, refreshInterval);
    }

    // Cleanup on unmount or when interval changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [refreshInterval, classroomId, fetchStudents]);

  const refresh = useCallback(async () => {
    await fetchStudents(true);
  }, [fetchStudents]);

  return {
    students,
    loading,
    error,
    refreshInterval,
    setRefreshInterval,
    refresh,
    lastUpdate,
  };
}
