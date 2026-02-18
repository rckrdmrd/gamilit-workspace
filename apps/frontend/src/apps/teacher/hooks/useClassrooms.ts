/**
 * useClassrooms Hook - Manage classroom data and students
 *
 * Migrated from useState+useEffect to React Query (TanStack Query v5)
 * for automatic caching, deduplication, and background refetching.
 *
 * Backward-compatible: return interface unchanged for 7 consumers.
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classroomsApi } from '@services/api/teacher';
import type { Classroom, StudentMonitoring } from '@apps/teacher/types';
import type { GetClassroomsQueryDto } from '@services/api/teacher';
import type { PaginationInfo } from '@shared/types/api-responses';

// ============================================================================
// QUERY KEY FACTORY
// ============================================================================

/**
 * Query key factory for classroom-related queries.
 * Exported for external invalidation (e.g., from useAssignments or other hooks).
 */
export const classroomKeys = {
  all: ['classrooms'] as const,
  lists: () => [...classroomKeys.all, 'list'] as const,
  list: (filters?: GetClassroomsQueryDto) => [...classroomKeys.lists(), filters] as const,
  details: () => [...classroomKeys.all, 'detail'] as const,
  detail: (id: string) => [...classroomKeys.details(), id] as const,
  students: (id: string) => [...classroomKeys.detail(id), 'students'] as const,
};

// ============================================================================
// TYPES
// ============================================================================

export interface UseClassroomsReturn {
  classrooms: Classroom[];
  pagination: PaginationInfo | null;
  selectedClassroom: Classroom | null;
  students: StudentMonitoring[];
  loading: boolean;
  error: Error | null;
  selectClassroom: (id: string | null) => Promise<void>;
  createClassroom: (data: {
    name: string;
    subject: string;
    grade_level: string;
  }) => Promise<Classroom>;
  updateClassroom: (
    id: string,
    data: Partial<{ name: string; subject: string; grade_level: string }>,
  ) => Promise<Classroom>;
  deleteClassroom: (id: string) => Promise<void>;
  refreshStudents: () => Promise<void>;
  refresh: () => Promise<void>;
}

// ============================================================================
// HOOK
// ============================================================================

export function useClassrooms(filters?: GetClassroomsQueryDto): UseClassroomsReturn {
  const queryClient = useQueryClient();

  // Local state for user-driven selection (not pure server state)
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [students, setStudents] = useState<StudentMonitoring[]>([]);

  // ---------------------------------------------------------------------------
  // QUERIES
  // ---------------------------------------------------------------------------

  /**
   * Main classrooms list query — replaces fetchClassrooms + useEffect
   */
  const classroomsQuery = useQuery({
    queryKey: classroomKeys.list(filters),
    queryFn: () => classroomsApi.getClassrooms(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // ---------------------------------------------------------------------------
  // MUTATIONS
  // ---------------------------------------------------------------------------

  const createMutation = useMutation({
    mutationFn: (data: { name: string; subject: string; grade_level: string }) =>
      classroomsApi.createClassroom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classroomKeys.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{ name: string; subject: string; grade_level: string }>;
    }) => classroomsApi.updateClassroom(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classroomKeys.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => classroomsApi.deleteClassroom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classroomKeys.all });
    },
  });

  // ---------------------------------------------------------------------------
  // ACTIONS (maintain original signatures for backward compatibility)
  // ---------------------------------------------------------------------------

  // CORR-2025-12-18: Agregado limit: 100 para obtener todos los estudiantes
  const fetchClassroomStudents = useCallback(async (classroomId: string) => {
    try {
      const response = await classroomsApi.getClassroomStudents(classroomId, { limit: 100 });
      setStudents(response.data);
    } catch (err) {
      console.error('[useClassrooms] Error fetching students:', err);
    }
  }, []);

  const selectClassroom = useCallback(
    async (id: string | null) => {
      if (!id) {
        setSelectedClassroom(null);
        setStudents([]);
        return;
      }

      try {
        const classroom = await classroomsApi.getClassroomById(id);
        setSelectedClassroom(classroom);
        await fetchClassroomStudents(id);
      } catch (err) {
        console.error('[useClassrooms] Error selecting classroom:', err);
      }
    },
    [fetchClassroomStudents],
  );

  const refreshStudents = useCallback(async () => {
    if (selectedClassroom) {
      await fetchClassroomStudents(selectedClassroom.id);
    }
  }, [selectedClassroom, fetchClassroomStudents]);

  /**
   * Adapter: wraps createMutation.mutateAsync to match the original
   * `(data) => Promise<Classroom>` signature.
   */
  const createClassroom = useCallback(
    async (data: { name: string; subject: string; grade_level: string }): Promise<Classroom> => {
      return createMutation.mutateAsync(data);
    },
    [createMutation],
  );

  /**
   * Adapter: wraps updateMutation.mutateAsync to match the original
   * `(id, data) => Promise<Classroom>` signature.
   */
  const updateClassroom = useCallback(
    async (
      id: string,
      data: Partial<{ name: string; subject: string; grade_level: string }>,
    ): Promise<Classroom> => {
      return updateMutation.mutateAsync({ id, data });
    },
    [updateMutation],
  );

  /**
   * Adapter: wraps deleteMutation.mutateAsync to match the original
   * `(id) => Promise<void>` signature.
   */
  const deleteClassroom = useCallback(
    async (id: string): Promise<void> => {
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation],
  );

  /**
   * refresh: invalidates the classrooms list and waits for refetch.
   * Maps to the original `fetchClassrooms` behavior.
   */
  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: classroomKeys.all });
  }, [queryClient]);

  // ---------------------------------------------------------------------------
  // RETURN — exact same interface as before
  // ---------------------------------------------------------------------------

  return {
    classrooms: classroomsQuery.data?.data ?? [],
    pagination: classroomsQuery.data?.pagination ?? null,
    selectedClassroom,
    students,
    loading: classroomsQuery.isLoading,
    error: classroomsQuery.error ?? null,
    selectClassroom,
    createClassroom,
    updateClassroom,
    deleteClassroom,
    refreshStudents,
    refresh,
  };
}
