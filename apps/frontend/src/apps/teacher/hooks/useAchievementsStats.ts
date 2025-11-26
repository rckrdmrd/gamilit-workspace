/**
 * useAchievementsStats Hook
 *
 * @description Hook para obtener estadísticas de achievements para el portal teacher.
 * Consume el endpoint GET /teacher/analytics/achievements.
 *
 * @see GAP-ST-007 - Achievements stats endpoint
 */

import { useState, useEffect, useCallback } from 'react';
import {
  analyticsApi,
  AchievementStats,
  GetEconomyAnalyticsDto,
} from '@services/api/teacher/analyticsApi';

interface UseAchievementsStatsReturn {
  /** Achievements with stats */
  achievements: AchievementStats[];
  /** Total achievements count */
  totalAchievements: number;
  /** Total unlocks across all students */
  totalUnlocks: number;
  /** Loading state */
  loading: boolean;
  /** Error message if any */
  error: Error | null;
  /** Refetch data */
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch achievements stats
 *
 * @param classroomId - Optional classroom ID to filter by
 * @returns Achievements stats data, loading state, error, and refetch function
 *
 * @example
 * ```tsx
 * const { achievements, totalUnlocks, loading, error } = useAchievementsStats();
 *
 * if (loading) return <Spinner />;
 * if (error) return <Error message={error} />;
 *
 * return (
 *   <ul>
 *     {achievements.map(a => (
 *       <li key={a.id}>{a.name}: {a.unlocked_count} students</li>
 *     ))}
 *   </ul>
 * );
 * ```
 */
export function useAchievementsStats(classroomId?: string): UseAchievementsStatsReturn {
  const [achievements, setAchievements] = useState<AchievementStats[]>([]);
  const [totalAchievements, setTotalAchievements] = useState<number>(0);
  const [totalUnlocks, setTotalUnlocks] = useState<number>(0);
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

      const result = await analyticsApi.getAchievementsStats(query);
      setAchievements(result.achievements);
      setTotalAchievements(result.total_achievements);
      setTotalUnlocks(result.total_unlocks);
    } catch (err: any) {
      console.error('[useAchievementsStats] Error:', err);
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Error al obtener estadísticas de logros';
      setError(new Error(errorMessage));
      setAchievements([]);
      setTotalAchievements(0);
      setTotalUnlocks(0);
    } finally {
      setLoading(false);
    }
  }, [classroomId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    achievements,
    totalAchievements,
    totalUnlocks,
    loading,
    error,
    refetch: fetchData,
  };
}

export default useAchievementsStats;
