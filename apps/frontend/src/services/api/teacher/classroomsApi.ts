/**
 * Classrooms API Service
 *
 * Provides methods to fetch classroom data and student lists.
 * Full CRUD operations will be implemented in Phase 2.
 *
 * Note: This is the Phase 1 (Quick Wins) version with basic read operations.
 * Create, Update, Delete operations will be added in Phase 2 (Core Functionality).
 *
 * @module services/api/teacher/classroomsApi
 */

import axiosInstance from '../axios.instance';
import { API_ENDPOINTS } from '@/config/api.config';
import type { Classroom, StudentMonitoring } from '@apps/teacher/types';
import type { PaginatedResponse } from '@shared/types/api-responses';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Query parameters for fetching classrooms
 */
export interface GetClassroomsQueryDto {
  teacher_id?: string;
  status?: 'active' | 'archived';
  grade_level?: string;
  subject?: string;
}

/**
 * Query parameters for fetching classroom students
 * CORR-2025-12-18: Agregados page, limit y search para paginacion completa
 */
export interface GetClassroomStudentsQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive';
  sort_by?: 'name' | 'progress' | 'score' | 'last_activity';
  sort_order?: 'asc' | 'desc';
}

/**
 * Classroom progress data
 */
export interface ClassroomProgressData {
  id: string;
  name: string;
  student_count: number;
  active_students: number;
  average_completion: number;
  average_score: number;
  total_exercises: number;
  completed_exercises: number;
}

/**
 * Module progress item
 */
export interface ModuleProgressItem {
  module_id: string;
  module_name: string;
  completion_percentage: number;
  average_score: number;
  students_completed: number;
  students_total: number;
  average_time_minutes: number;
}

/**
 * Response for classroom progress endpoint
 */
export interface ClassroomProgressResponse {
  classroomData: ClassroomProgressData;
  moduleProgress: ModuleProgressItem[];
}

// ============================================================================
// CLASSROOMS API CLASS
// ============================================================================

/**
 * Classrooms API Service
 *
 * Handles classroom-related API calls. Currently supports read operations.
 * Full CRUD will be available in Phase 2.
 */
class ClassroomsAPI {
  /**
   * Get all classrooms for the authenticated teacher
   *
   * Returns a paginated list of classrooms where the authenticated user is the teacher
   * or co-teacher. Supports filtering by status, grade level, and subject.
   *
   * @param query - Optional query parameters for filtering
   * @returns Promise<PaginatedResponse<Classroom>> Paginated list of classrooms
   * @throws Error if request fails
   *
   * @example
   * ```typescript
   * // Get all classrooms
   * const response = await classroomsApi.getClassrooms();
   * const classrooms = response.data;
   * const pagination = response.pagination;
   *
   * // Get only active classrooms
   * const active = await classroomsApi.getClassrooms({ status: 'active' });
   *
   * // Get classrooms for specific grade and subject
   * const filtered = await classroomsApi.getClassrooms({
   *   grade_level: '5',
   *   subject: 'Math'
   * });
   *
   * response.data.forEach(classroom => {
   *   console.log(`${classroom.name} - ${classroom.student_count} students`);
   * });
   * ```
   */
  async getClassrooms(query?: GetClassroomsQueryDto): Promise<PaginatedResponse<Classroom>> {
    try {
      const { data } = await axiosInstance.get<PaginatedResponse<Classroom>>(
        API_ENDPOINTS.teacher.classrooms,
        {
          params: query,
        },
      );
      return data;
    } catch (error) {
      console.error('[ClassroomsAPI] Error fetching classrooms:', error);
      throw error;
    }
  }

  /**
   * Get classroom by ID
   *
   * Returns detailed information about a specific classroom including
   * metadata, settings, and enrollment information.
   *
   * @param classroomId - ID of the classroom
   * @returns Promise<Classroom> Classroom details
   * @throws Error if request fails
   *
   * @example
   * ```typescript
   * const classroom = await classroomsApi.getClassroomById('classroom-123');
   *
   * console.log(`Name: ${classroom.name}`);
   * console.log(`Grade: ${classroom.grade_level}`);
   * console.log(`Students: ${classroom.student_count}`);
   * console.log(`Created: ${classroom.created_at}`);
   * ```
   */
  async getClassroomById(classroomId: string): Promise<Classroom> {
    try {
      const { data } = await axiosInstance.get<Classroom>(
        API_ENDPOINTS.teacher.classroom(classroomId),
      );
      return data;
    } catch (error) {
      console.error('[ClassroomsAPI] Error fetching classroom details:', error);
      throw error;
    }
  }

  /**
   * Get students in a classroom
   *
   * Returns a paginated list of students enrolled in the specified classroom with
   * monitoring data including current activity, progress, scores, and status.
   *
   * @param classroomId - ID of the classroom
   * @param query - Optional query parameters for filtering and sorting
   * @returns Promise<PaginatedResponse<StudentMonitoring>> Paginated list of students with monitoring data
   * @throws Error if request fails
   *
   * @example
   * ```typescript
   * // Get all students in classroom
   * const response = await classroomsApi.getClassroomStudents('classroom-123');
   * const students = response.data;
   *
   * // Get only active students, sorted by score
   * const activeStudents = await classroomsApi.getClassroomStudents('classroom-123', {
   *   status: 'active',
   *   sort_by: 'score',
   *   sort_order: 'desc'
   * });
   *
   * response.data.forEach(student => {
   *   console.log(`${student.full_name}: ${student.progress_percentage}% complete`);
   *   console.log(`Average score: ${student.score_average}%`);
   *   console.log(`Last activity: ${student.last_activity}`);
   * });
   * ```
   */
  async getClassroomStudents(
    classroomId: string,
    query?: GetClassroomStudentsQueryDto,
  ): Promise<PaginatedResponse<StudentMonitoring>> {
    try {
      const { data } = await axiosInstance.get<PaginatedResponse<StudentMonitoring>>(
        API_ENDPOINTS.teacher.classroomStudents(classroomId),
        { params: query },
      );
      return data;
    } catch (error) {
      console.error('[ClassroomsAPI] Error fetching classroom students:', error);
      throw error;
    }
  }

  /**
   * Get classroom statistics
   *
   * Returns aggregated statistics for a classroom including average scores,
   * completion rates, engagement metrics, and activity trends.
   *
   * @param classroomId - ID of the classroom
   * @returns Promise<ClassroomStats> Classroom statistics
   * @throws Error if request fails
   *
   * @example
   * ```typescript
   * const stats = await classroomsApi.getClassroomStats('classroom-123');
   *
   * console.log(`Average score: ${stats.average_score}%`);
   * console.log(`Completion rate: ${stats.completion_rate}%`);
   * console.log(`Active students: ${stats.active_students}/${stats.total_students}`);
   * ```
   */
  async getClassroomStats(classroomId: string): Promise<{
    classroom_id: string;
    total_students: number;
    active_students: number;
    average_score: number;
    completion_rate: number;
    engagement_rate: number;
    total_exercises: number;
    completed_exercises: number;
  }> {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.teacher.classroomStats(classroomId));
      return data;
    } catch (error) {
      console.error('[ClassroomsAPI] Error fetching classroom stats:', error);
      throw error;
    }
  }

  /**
   * Get classroom progress data
   *
   * Returns comprehensive progress data for a classroom including general statistics
   * and module-specific progress. Shows completion rates, average scores, active students,
   * and detailed module progress.
   *
   * @param classroomId - ID of the classroom
   * @returns Promise<ClassroomProgressResponse> Classroom data and module progress
   * @throws Error if request fails
   *
   * @example
   * ```typescript
   * const progress = await classroomsApi.getClassroomProgress('classroom-123');
   *
   * console.log(`Classroom: ${progress.classroomData.name}`);
   * console.log(`Active students: ${progress.classroomData.active_students}/${progress.classroomData.student_count}`);
   * console.log(`Average completion: ${progress.classroomData.average_completion}%`);
   * console.log(`Average score: ${progress.classroomData.average_score}%`);
   *
   * progress.moduleProgress.forEach(module => {
   *   console.log(`\nModule: ${module.module_name}`);
   *   console.log(`Completion: ${module.completion_percentage}%`);
   *   console.log(`Average score: ${module.average_score}%`);
   *   console.log(`Students completed: ${module.students_completed}/${module.students_total}`);
   * });
   * ```
   */
  async getClassroomProgress(classroomId: string): Promise<ClassroomProgressResponse> {
    try {
      const { data } = await axiosInstance.get<ClassroomProgressResponse>(
        `${API_ENDPOINTS.teacher.classroom(classroomId)}/progress`,
      );
      return data;
    } catch (error) {
      console.error('[ClassroomsAPI] Error fetching classroom progress:', error);
      throw error;
    }
  }

  // ============================================================================
  // CRUD METHODS (Implemented)
  // ============================================================================

  /**
   * Create a new classroom
   *
   * Creates a new classroom with the provided information.
   * The authenticated teacher becomes the owner of the classroom.
   *
   * @param data - Classroom creation data
   * @returns Promise<Classroom> Created classroom
   * @throws Error if request fails
   *
   * @example
   * ```typescript
   * const classroom = await classroomsApi.createClassroom({
   *   name: 'Math 101',
   *   subject: 'Mathematics',
   *   grade_level: '5th Grade'
   * });
   * ```
   */
  async createClassroom(data: {
    name: string;
    subject: string;
    grade_level: string;
  }): Promise<Classroom> {
    try {
      const { data: responseData } = await axiosInstance.post<Classroom>(
        API_ENDPOINTS.teacher.createClassroom,
        data,
      );
      return responseData;
    } catch (error) {
      console.error('[ClassroomsAPI] Error creating classroom:', error);
      throw error;
    }
  }

  /**
   * Update classroom information
   *
   * Updates an existing classroom's information.
   * Only the classroom owner can update it.
   *
   * @param id - Classroom ID
   * @param data - Partial classroom data to update
   * @returns Promise<Classroom> Updated classroom
   * @throws Error if request fails
   *
   * @example
   * ```typescript
   * const updated = await classroomsApi.updateClassroom('classroom-123', {
   *   name: 'Advanced Math 101'
   * });
   * ```
   */
  async updateClassroom(
    id: string,
    data: Partial<{
      name: string;
      subject: string;
      grade_level: string;
    }>,
  ): Promise<Classroom> {
    try {
      const { data: responseData } = await axiosInstance.put<Classroom>(
        API_ENDPOINTS.teacher.updateClassroom(id),
        data,
      );
      return responseData;
    } catch (error) {
      console.error('[ClassroomsAPI] Error updating classroom:', error);
      throw error;
    }
  }

  /**
   * Delete a classroom
   *
   * Deletes or archives a classroom.
   * Only the classroom owner can delete it.
   *
   * @param id - Classroom ID
   * @returns Promise<void>
   * @throws Error if request fails
   *
   * @example
   * ```typescript
   * await classroomsApi.deleteClassroom('classroom-123');
   * ```
   */
  async deleteClassroom(id: string): Promise<void> {
    try {
      await axiosInstance.delete(API_ENDPOINTS.teacher.deleteClassroom(id));
    } catch (error) {
      console.error('[ClassroomsAPI] Error deleting classroom:', error);
      throw error;
    }
  }

  /**
   * Enroll student in classroom (Phase 2)
   *
   * @todo Implement in Phase 2 - Core Functionality
   */
  // async enrollStudent(classroomId: string, studentId: string): Promise<void> { ... }

  /**
   * Remove student from classroom (Phase 2)
   *
   * @todo Implement in Phase 2 - Core Functionality
   */
  // async removeStudent(classroomId: string, studentId: string): Promise<void> { ... }

  /**
   * Bulk enroll students (Phase 2)
   *
   * @todo Implement in Phase 2 - Core Functionality
   */
  // async bulkEnrollStudents(classroomId: string, studentIds: string[]): Promise<void> { ... }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Singleton instance of ClassroomsAPI
 * Use this instance for all classroom-related API calls
 *
 * @example
 * ```typescript
 * import { classroomsApi } from '@services/api/teacher';
 *
 * const classrooms = await classroomsApi.getClassrooms();
 * const classroom = await classroomsApi.getClassroomById('classroom-123');
 * const students = await classroomsApi.getClassroomStudents('classroom-123');
 * const stats = await classroomsApi.getClassroomStats('classroom-123');
 * ```
 */
export const classroomsApi = new ClassroomsAPI();

/**
 * Export the class for testing purposes
 */
export { ClassroomsAPI };
