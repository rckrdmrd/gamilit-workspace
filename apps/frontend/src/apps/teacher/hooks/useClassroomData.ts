/**
 * useClassroomData Hook
 *
 * Legacy hook refactored to use classroomsApi service.
 * This hook is functional and provides backward compatibility with existing components.
 *
 * Fetches comprehensive classroom progress data including general stats and module progress.
 *
 * @param classroomId - ID of the classroom to fetch data for
 * @returns Object with classroom data, module progress, loading state, error state, and refresh function
 *
 * @example
 * ```typescript
 * const { data, moduleProgress, loading, error, refresh } = useClassroomData(classroomId);
 * ```
 */

import { useState, useEffect } from 'react';
import { classroomsApi } from '@services/api/teacher';
import type { ClassroomData, ModuleProgress, StudentMonitoring } from '../types';

export function useClassroomData(classroomId: string) {
  const [data, setData] = useState<ClassroomData | null>(null);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([]);
  const [students, setStudents] = useState<StudentMonitoring[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchClassroomData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch classroom progress data and students in parallel
        const [progressResponse, studentsResponse] = await Promise.all([
          classroomsApi.getClassroomProgress(classroomId),
          classroomsApi.getClassroomStudents(classroomId),
        ]);

        // Response structure: { classroomData: {...}, moduleProgress: [...] }
        const { classroomData, moduleProgress: modules } = progressResponse;

        setData(classroomData);
        setModuleProgress(modules || []);
        setStudents(studentsResponse.data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.error('[useClassroomData] Error fetching classroom data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (classroomId) {
      fetchClassroomData();
    }
  }, [classroomId]);

  const refresh = async () => {
    if (!classroomId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch classroom progress data and students in parallel
      const [progressResponse, studentsResponse] = await Promise.all([
        classroomsApi.getClassroomProgress(classroomId),
        classroomsApi.getClassroomStudents(classroomId),
      ]);

      const { classroomData, moduleProgress: modules } = progressResponse;

      setData(classroomData);
      setModuleProgress(modules || []);
      setStudents(studentsResponse.data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      console.error('[useClassroomData] Error refreshing classroom data:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    moduleProgress,
    students,
    loading,
    error,
    refresh,
  };
}
