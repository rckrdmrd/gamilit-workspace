// apps/frontend/src/services/api/admin/classroomTeacherApi.ts

import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';
import type {
  ClassroomTeacherAssignment,
  AssignTeacherToClassroomDto,
  AssignClassroomsToTeacherDto,
  BulkAssignDto,
  ClassroomWithTeachers,
  TeacherWithClassrooms,
} from '@/types/admin/classroom-teacher.types';

export const classroomTeacherApi = {
  /**
   * Obtiene teachers de un classroom
   */
  async getClassroomTeachers(classroomId: string): Promise<ClassroomWithTeachers> {
    const response = await apiClient.get(
      API_ENDPOINTS.admin.classroomTeachers.byClassroom(classroomId),
    );
    return response.data;
  },

  /**
   * Asigna teacher a classroom
   */
  async assignTeacherToClassroom(
    classroomId: string,
    data: AssignTeacherToClassroomDto,
  ): Promise<ClassroomTeacherAssignment> {
    const response = await apiClient.post(
      API_ENDPOINTS.admin.classroomTeachers.byClassroom(classroomId),
      data,
    );
    return response.data;
  },

  /**
   * Remueve teacher de classroom
   */
  async removeTeacherFromClassroom(classroomId: string, teacherId: string): Promise<void> {
    await apiClient.delete(
      `${API_ENDPOINTS.admin.classroomTeachers.byClassroom(classroomId)}/${teacherId}`,
    );
  },

  /**
   * Obtiene classrooms de un teacher
   */
  async getTeacherClassrooms(teacherId: string): Promise<TeacherWithClassrooms> {
    const response = await apiClient.get(
      API_ENDPOINTS.admin.classroomTeachers.byTeacher(teacherId),
    );
    return response.data;
  },

  /**
   * Asigna classrooms a teacher
   */
  async assignClassroomsToTeacher(
    teacherId: string,
    data: AssignClassroomsToTeacherDto,
  ): Promise<{ assigned: number }> {
    const response = await apiClient.post(
      API_ENDPOINTS.admin.classroomTeachers.byTeacher(teacherId),
      data,
    );
    return response.data;
  },

  /**
   * Lista todas las asignaciones
   */
  async listAllAssignments(query?: { schoolId?: string; page?: number; limit?: number }): Promise<{
    data: ClassroomTeacherAssignment[];
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await apiClient.get(API_ENDPOINTS.admin.classroomTeachers.list, {
      params: query,
    });
    return response.data;
  },

  /**
   * Asignación masiva
   */
  async bulkAssign(data: BulkAssignDto): Promise<{ assigned: number }> {
    const response = await apiClient.post(API_ENDPOINTS.admin.classroomTeachers.bulk, data);
    return response.data;
  },

  /**
   * Lista de classrooms para dropdown
   */
  async listClassroomsForDropdown(query?: {
    search?: string;
    limit?: number;
    schoolId?: string;
  }): Promise<ClassroomListItem[]> {
    const response = await apiClient.get(API_ENDPOINTS.admin.classroomTeachers.classroomsList, {
      params: query,
    });
    return response.data;
  },

  /**
   * Lista de teachers para dropdown
   */
  async listTeachersForDropdown(query?: {
    search?: string;
    limit?: number;
    schoolId?: string;
  }): Promise<TeacherListItem[]> {
    const response = await apiClient.get(API_ENDPOINTS.admin.classroomTeachers.teachersList, {
      params: query,
    });
    return response.data;
  },
};

// Types for dropdown lists
export interface ClassroomListItem {
  id: string;
  name: string;
  grade?: string;
  section?: string;
  student_count?: number;
}

export interface TeacherListItem {
  id: string;
  display_name: string;
  email: string;
  role?: string;
}
