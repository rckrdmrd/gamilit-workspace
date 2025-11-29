/**
 * useEconomyAnalytics Hook
 *
 * @description Hook para obtener analytics de economía ML Coins para el portal teacher.
 * Consume el endpoint GET /teacher/analytics/economy.
 *
 * @see GAP-ST-005 - Endpoint /teacher/analytics/economy
 */

import { useState, useEffect, useCallback } from 'react';
import {
  analyticsApi,
  EconomyAnalytics,
  GetEconomyAnalyticsDto,
} from '@services/api/teacher/analyticsApi';

interface UseEconomyAnalyticsReturn {
  /** Economy analytics data */
  data: EconomyAnalytics | null;
  /** Loading state */
  loading: boolean;
  /** Error message if any */
  error: Error | null;
  /** Refetch data */
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch ML Coins economy analytics
 *
 * @param classroomId - Optional classroom ID to filter by
 * @returns Economy analytics data, loading state, error, and refetch function
 *
 * @example
 * ```tsx
 * const { data, loading, error, refetch } = useEconomyAnalytics();
 *
 * if (loading) return <Spinner />;
 * if (error) return <Error message={error} />;
 *
 * return (
 *   <div>
 *     <h1>Total: {data?.total_circulation} ML Coins</h1>
 *     <h2>Average: {data?.average_balance} ML</h2>
 *   </div>
 * );
 * ```
 */
export function useEconomyAnalytics(classroomId?: string): UseEconomyAnalyticsReturn {
  const [data, setData] = useState<EconomyAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const query: GetEconomyAnalyticsDto = {};
      if (classroomId) {
        query.classroom_id = classroomId;
      }

      const result = await analyticsApi.getEconomyAnalytics(query);
      setData(result);
    } catch (err: unknown) {
      console.error('[useEconomyAnalytics] Error:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Error al obtener analytics de economía';
      setError(new Error(errorMessage));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [classroomId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

export default useEconomyAnalytics;
