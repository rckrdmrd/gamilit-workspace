// apps/frontend/src/services/api/admin/classroomTeacherApi.ts

import { apiClient } from '@/services/api/apiClient';
import type {
  ClassroomTeacherAssignment,
  AssignTeacherToClassroomDto,
  AssignClassroomsToTeacherDto,
  BulkAssignDto,
  ClassroomWithTeachers,
  TeacherWithClassrooms,
} from '@/types/admin/classroom-teacher.types';

const BASE_URL = '/api/admin';

export const classroomTeacherApi = {
  /**
   * Obtiene teachers de un classroom
   */
  async getClassroomTeachers(classroomId: string): Promise<ClassroomWithTeachers> {
    const response = await apiClient.get(`${BASE_URL}/classrooms/${classroomId}/teachers`);
    return response.data;
  },

  /**
   * Asigna teacher a classroom
   */
  async assignTeacherToClassroom(
    classroomId: string,
    data: AssignTeacherToClassroomDto,
  ): Promise<ClassroomTeacherAssignment> {
    const response = await apiClient.post(`${BASE_URL}/classrooms/${classroomId}/teachers`, data);
    return response.data;
  },

  /**
   * Remueve teacher de classroom
   */
  async removeTeacherFromClassroom(classroomId: string, teacherId: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/classrooms/${classroomId}/teachers/${teacherId}`);
  },

  /**
   * Obtiene classrooms de un teacher
   */
  async getTeacherClassrooms(teacherId: string): Promise<TeacherWithClassrooms> {
    const response = await apiClient.get(`${BASE_URL}/teachers/${teacherId}/classrooms`);
    return response.data;
  },

  /**
   * Asigna classrooms a teacher
   */
  async assignClassroomsToTeacher(
    teacherId: string,
    data: AssignClassroomsToTeacherDto,
  ): Promise<{ assigned: number }> {
    const response = await apiClient.post(`${BASE_URL}/teachers/${teacherId}/classrooms`, data);
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
    const response = await apiClient.get(`${BASE_URL}/classroom-teachers`, {
      params: query,
    });
    return response.data;
  },

  /**
   * Asignación masiva
   */
  async bulkAssign(data: BulkAssignDto): Promise<{ assigned: number }> {
    const response = await apiClient.post(`${BASE_URL}/classroom-teachers/bulk`, data);
    return response.data;
  },
};
