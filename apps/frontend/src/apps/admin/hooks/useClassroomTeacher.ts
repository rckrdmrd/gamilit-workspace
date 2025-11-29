// apps/frontend/src/apps/admin/hooks/useClassroomTeacher.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classroomTeacherApi } from '@/services/api/admin/classroomTeacherApi';
import type {
  AssignTeacherToClassroomDto,
  AssignClassroomsToTeacherDto,
  BulkAssignDto,
} from '@/types/admin/classroom-teacher.types';
import toast from 'react-hot-toast';

const QUERY_KEYS = {
  classroomTeachers: (classroomId: string) => ['classroom-teachers', 'classroom', classroomId],
  teacherClassrooms: (teacherId: string) => ['classroom-teachers', 'teacher', teacherId],
  allAssignments: (query?: any) => ['classroom-teachers', 'all', query],
  classroomsList: (search?: string) => ['classrooms-list', search],
  teachersList: (search?: string) => ['teachers-list', search],
};

export function useClassroomTeacher() {
  const queryClient = useQueryClient();

  // ========================================
  // QUERIES
  // ========================================

  const useClassroomTeachers = (classroomId: string, enabled = true) => {
    return useQuery({
      queryKey: QUERY_KEYS.classroomTeachers(classroomId),
      queryFn: () => classroomTeacherApi.getClassroomTeachers(classroomId),
      enabled,
      staleTime: 1000 * 60 * 5, // 5 min
    });
  };

  const useTeacherClassrooms = (teacherId: string, enabled = true) => {
    return useQuery({
      queryKey: QUERY_KEYS.teacherClassrooms(teacherId),
      queryFn: () => classroomTeacherApi.getTeacherClassrooms(teacherId),
      enabled,
      staleTime: 1000 * 60 * 5, // 5 min
    });
  };

  const useAllAssignments = (query?: any) => {
    return useQuery({
      queryKey: QUERY_KEYS.allAssignments(query),
      queryFn: () => classroomTeacherApi.listAllAssignments(query),
      staleTime: 1000 * 60 * 2, // 2 min
    });
  };

  const useClassroomsList = (search?: string) => {
    return useQuery({
      queryKey: QUERY_KEYS.classroomsList(search),
      queryFn: () => classroomTeacherApi.listClassroomsForDropdown({ search, limit: 50 }),
      staleTime: 1000 * 60 * 5, // 5 min
    });
  };

  const useTeachersList = (search?: string) => {
    return useQuery({
      queryKey: QUERY_KEYS.teachersList(search),
      queryFn: () => classroomTeacherApi.listTeachersForDropdown({ search, limit: 50 }),
      staleTime: 1000 * 60 * 5, // 5 min
    });
  };

  // ========================================
  // MUTATIONS
  // ========================================

  const assignTeacherToClassroom = useMutation({
    mutationFn: ({
      classroomId,
      data,
    }: {
      classroomId: string;
      data: AssignTeacherToClassroomDto;
    }) => classroomTeacherApi.assignTeacherToClassroom(classroomId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.classroomTeachers(variables.classroomId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.teacherClassrooms(variables.data.teacherId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allAssignments() });
      toast.success('Teacher asignado correctamente');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al asignar teacher');
    },
  });

  const removeTeacherFromClassroom = useMutation({
    mutationFn: ({ classroomId, teacherId }: { classroomId: string; teacherId: string }) =>
      classroomTeacherApi.removeTeacherFromClassroom(classroomId, teacherId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.classroomTeachers(variables.classroomId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.teacherClassrooms(variables.teacherId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allAssignments() });
      toast.success('Teacher removido correctamente');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al remover teacher');
    },
  });

  const assignClassroomsToTeacher = useMutation({
    mutationFn: ({ teacherId, data }: { teacherId: string; data: AssignClassroomsToTeacherDto }) =>
      classroomTeacherApi.assignClassroomsToTeacher(teacherId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.teacherClassrooms(variables.teacherId),
      });
      variables.data.classroomIds.forEach((classroomId) => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.classroomTeachers(classroomId) });
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allAssignments() });
      toast.success('Classrooms asignados correctamente');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al asignar classrooms');
    },
  });

  const bulkAssign = useMutation({
    mutationFn: (data: BulkAssignDto) => classroomTeacherApi.bulkAssign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classroom-teachers'] });
      toast.success('Asignación masiva completada');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error en asignación masiva');
    },
  });

  return {
    // Queries
    useClassroomTeachers,
    useTeacherClassrooms,
    useAllAssignments,
    useClassroomsList,
    useTeachersList,
    // Mutations
    assignTeacherToClassroom,
    removeTeacherFromClassroom,
    assignClassroomsToTeacher,
    bulkAssign,
  };
}
