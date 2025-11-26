/**
 * useStudentsEconomy Hook
 *
 * @description Hook para obtener datos de economía de estudiantes para el portal teacher.
 * Consume el endpoint GET /teacher/analytics/students-economy.
 *
 * @see GAP-ST-006 - Students economy endpoint
 */

import { useState, useEffect, useCallback } from 'react';
import {
  analyticsApi,
  StudentEconomy,
  GetEconomyAnalyticsDto,
} from '@services/api/teacher/analyticsApi';

interface UseStudentsEconomyReturn {
  /** Students economy data */
  students: StudentEconomy[];
  /** Total count */
  total: number;
  /** Loading state */
  loading: boolean;
  /** Error message if any */
  error: Error | null;
  /** Refetch data */
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch students economy data
 *
 * @param classroomId - Optional classroom ID to filter by
 * @returns Students economy data, loading state, error, and refetch function
 *
 * @example
 * ```tsx
 * const { students, loading, error, refetch } = useStudentsEconomy();
 *
 * if (loading) return <Spinner />;
 * if (error) return <Error message={error} />;
 *
 * return (
 *   <ul>
 *     {students.map(s => (
 *       <li key={s.id}>{s.name}: {s.balance} ML</li>
 *     ))}
 *   </ul>
 * );
 * ```
 */
export function useStudentsEconomy(classroomId?: string): UseStudentsEconomyReturn {
  const [students, setStudents] = useState<StudentEconomy[]>([]);
  const [total, setTotal] = useState<number>(0);
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

      const result = await analyticsApi.getStudentsEconomy(query);
      setStudents(result.students);
      setTotal(result.total);
    } catch (err: any) {
      console.error('[useStudentsEconomy] Error:', err);
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Error al obtener datos de estudiantes';
      setError(new Error(errorMessage));
      setStudents([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [classroomId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    students,
    total,
    loading,
    error,
    refetch: fetchData,
  };
}

export default useStudentsEconomy;
