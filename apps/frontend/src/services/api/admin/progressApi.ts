/**
 * Admin Progress API
 *
 * Functions for progress overview, classroom/student/module/exercise progress, and CSV export.
 * Split from adminAPI.ts monolith for modularity.
 */

import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';
import { handleAPIError } from '../apiErrorHandler';
import type {
  ProgressOverview,
  ClassroomProgress,
  StudentProgress,
  ModuleProgressStats,
  ExerciseStats,
  ClassroomBasic,
} from '../adminTypes';

// ============================================================================
// PROGRESS
// ============================================================================

/**
 * Get progress overview
 *
 * Status: Backend IMPLEMENTED
 */
export async function getProgressOverview(): Promise<ProgressOverview> {
  try {
    const response = await apiClient.get<ProgressOverview>(
      API_ENDPOINTS.admin.progress.overview,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch progress overview');
  }
}

/**
 * Get classroom progress
 *
 * Status: Backend IMPLEMENTED
 */
export async function getClassroomProgress(
  classroomId: string,
): Promise<ClassroomProgress> {
  try {
    const response = await apiClient.get<ClassroomProgress>(
      API_ENDPOINTS.admin.progress.classroom(classroomId),
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to fetch classroom progress for ${classroomId}`);
  }
}

/**
 * Get student progress
 *
 * Status: Backend IMPLEMENTED
 */
export async function getStudentProgress(
  studentId: string,
  filters?: { classroom_id?: string; module_id?: string },
): Promise<StudentProgress> {
  try {
    const response = await apiClient.get<StudentProgress>(
      API_ENDPOINTS.admin.progress.student(studentId),
      { params: filters },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to fetch student progress for ${studentId}`);
  }
}

/**
 * Get module progress stats
 *
 * Status: Backend IMPLEMENTED
 */
export async function getModuleProgress(
  moduleId: string,
  params?: { classroom_id?: string },
): Promise<ModuleProgressStats> {
  try {
    const response = await apiClient.get<ModuleProgressStats>(
      API_ENDPOINTS.admin.progress.module(moduleId),
      { params },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to fetch module progress for ${moduleId}`);
  }
}

/**
 * Get exercise statistics
 *
 * Status: Backend IMPLEMENTED
 */
export async function getExerciseStats(
  exerciseId: string,
): Promise<ExerciseStats> {
  try {
    const response = await apiClient.get<ExerciseStats>(
      API_ENDPOINTS.admin.progress.exercise(exerciseId),
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to fetch exercise stats for ${exerciseId}`);
  }
}

/**
 * Export progress to CSV
 *
 * Status: Backend IMPLEMENTED
 */
export async function exportProgressCSV(params: {
  type: 'students' | 'classrooms' | 'modules';
  classroom_id?: string;
  format?: 'csv';
}): Promise<Blob> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.admin.progress.export, {
      params: { ...params, format: 'csv' },
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to export progress data');
  }
}

/**
 * Get all classrooms for admin selectors
 * Uses social classrooms endpoint
 */
export async function getAllClassrooms(params?: { schoolId?: string }): Promise<ClassroomBasic[]> {
  try {
    const response = await apiClient.get<ClassroomBasic[]>(
      '/social/classrooms',
      { params },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch classrooms');
  }
}

/**
 * Progress API namespace object
 */
export const progressApi = {
  getProgressOverview,
  getClassroomProgress,
  getStudentProgress,
  getModuleProgress,
  getExerciseStats,
  exportProgressCSV,
  getAllClassrooms,
};
