/**
 * useClassrooms Hook - Manage classroom data and students
 */

import { useState, useEffect, useCallback } from 'react';
import { classroomsApi } from '@services/api/teacher';
import type { Classroom, StudentMonitoring } from '@apps/teacher/types';
import type { GetClassroomsQueryDto } from '@services/api/teacher';
import type { PaginationInfo } from '@shared/types/api-responses';

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

export function useClassrooms(filters?: GetClassroomsQueryDto): UseClassroomsReturn {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [students, setStudents] = useState<StudentMonitoring[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchClassrooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await classroomsApi.getClassrooms(filters);
      setClassrooms(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error('[useClassrooms] Error:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // CORR-2025-12-18: Agregado limit: 100 para obtener todos los estudiantes
  const fetchClassroomStudents = useCallback(async (classroomId: string) => {
    try {
      const response = await classroomsApi.getClassroomStudents(classroomId, { limit: 100 });
      setStudents(response.data);
    } catch (err) {
      console.error('[useClassrooms] Error fetching students:', err);
    }
  }, []);

  useEffect(() => {
    fetchClassrooms();
  }, [fetchClassrooms]);

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

  const createClassroom = useCallback(
    async (data: { name: string; subject: string; grade_level: string }) => {
      try {
        const newClassroom = await classroomsApi.createClassroom(data);
        await fetchClassrooms(); // Refresh list
        return newClassroom;
      } catch (err) {
        console.error('[useClassrooms] Error creating classroom:', err);
        throw err;
      }
    },
    [fetchClassrooms],
  );

  const updateClassroom = useCallback(
    async (id: string, data: Partial<{ name: string; subject: string; grade_level: string }>) => {
      try {
        const updatedClassroom = await classroomsApi.updateClassroom(id, data);
        await fetchClassrooms(); // Refresh list
        return updatedClassroom;
      } catch (err) {
        console.error('[useClassrooms] Error updating classroom:', err);
        throw err;
      }
    },
    [fetchClassrooms],
  );

  const deleteClassroom = useCallback(
    async (id: string) => {
      try {
        await classroomsApi.deleteClassroom(id);
        await fetchClassrooms(); // Refresh list
      } catch (err) {
        console.error('[useClassrooms] Error deleting classroom:', err);
        throw err;
      }
    },
    [fetchClassrooms],
  );

  return {
    classrooms,
    pagination,
    selectedClassroom,
    students,
    loading,
    error,
    selectClassroom,
    createClassroom,
    updateClassroom,
    deleteClassroom,
    refreshStudents,
    refresh: fetchClassrooms,
  };
}
