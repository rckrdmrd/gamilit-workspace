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

import { FEATURE_FLAGS } from '@/config/api.config';

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

const MOCK_STUDENTS: StudentEconomy[] = [
  { id: '1', name: 'Ana Silva', balance: 1250, earned_this_week: 350, spent_this_week: 100, rank: 'Detective Novato', level: 3 },
  { id: '2', name: 'Carlos Ruiz', balance: 980, earned_this_week: 200, spent_this_week: 50, rank: 'Detective Novato', level: 2 },
  { id: '3', name: 'Maria Gonzalez', balance: 1540, earned_this_week: 450, spent_this_week: 200, rank: 'Detective Intermedio', level: 4 },
  { id: '4', name: 'Juan Lopez', balance: 800, earned_this_week: 150, spent_this_week: 0, rank: 'Cadete', level: 1 },
  { id: '5', name: 'Sofia Herrera', balance: 2100, earned_this_week: 600, spent_this_week: 300, rank: 'Detective Avanzado', level: 5 },
  { id: '6', name: 'Miguel Angel', balance: 450, earned_this_week: 50, spent_this_week: 0, rank: 'Cadete', level: 1 },
  { id: '7', name: 'Lucia Fernandez', balance: 1800, earned_this_week: 500, spent_this_week: 150, rank: 'Detective Intermedio', level: 4 },
  { id: '8', name: 'Diego Torres', balance: 3200, earned_this_week: 800, spent_this_week: 50, rank: 'Detective Maestro', level: 7 },
];

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

    // Use mock data if enabled
    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      setTimeout(() => {
        setStudents(MOCK_STUDENTS);
        setTotal(MOCK_STUDENTS.length);
        setLoading(false);
      }, 800);
      return;
    }

    try {
      const query: GetEconomyAnalyticsDto = {};
      if (classroomId) {
        query.classroom_id = classroomId;
      }

      const result = await analyticsApi.getStudentsEconomy(query);
      setStudents(result.students);
      setTotal(result.total);
    } catch (err: unknown) {
      console.error('[useStudentsEconomy] Error:', err);

      const errorMessage =
        err instanceof Error ? err.message : 'Error al obtener datos de estudiantes';
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
