/**
 * useProgress Hook
 *
 * Comprehensive hook for managing admin progress data.
 * Handles overview, classroom, student, module, and exercise progress.
 *
 * Features:
 * - Data fetching for all progress endpoints
 * - Loading and error states
 * - CSV export functionality
 * - Refetch capabilities
 *
 * @author Frontend-Agent
 * @date 2025-11-24
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useCallback } from 'react';
import { adminAPI } from '@/services/api/adminAPI';
import type {
  ProgressOverview,
  ClassroomProgress,
  StudentProgress,
  ModuleProgressStats,
  ExerciseStats,
} from '@/services/api/adminTypes';

export interface UseProgressResult {
  // Data
  overview: ProgressOverview | null;
  classroomProgress: ClassroomProgress | null;
  studentProgress: StudentProgress | null;
  moduleProgress: ModuleProgressStats | null;
  exerciseStats: ExerciseStats | null;

  // State
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchOverview: () => Promise<void>;
  fetchClassroomProgress: (classroomId: string) => Promise<void>;
  fetchStudentProgress: (studentId: string, filters?: any) => Promise<void>;
  fetchModuleProgress: (moduleId: string, params?: any) => Promise<void>;
  fetchExerciseStats: (exerciseId: string) => Promise<void>;
  exportToCSV: (type: 'students' | 'classrooms' | 'modules', classroomId?: string) => Promise<void>;
  clearError: () => void;
}

export function useProgress(): UseProgressResult {
  // State
  const [overview, setOverview] = useState<ProgressOverview | null>(null);
  const [classroomProgress, setClassroomProgress] = useState<ClassroomProgress | null>(null);
  const [studentProgress, setStudentProgress] = useState<StudentProgress | null>(null);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgressStats | null>(null);
  const [exerciseStats, setExerciseStats] = useState<ExerciseStats | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // FETCH FUNCTIONS
  // ============================================================================

  /**
   * Fetch progress overview
   */
  const fetchOverview = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminAPI.progress.getOverview();
      setOverview(data);
    } catch (err: unknown) {
      console.error('Error fetching progress overview:', err);
      setError(err.message || 'Error al cargar resumen de progreso');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch classroom progress
   */
  const fetchClassroomProgress = useCallback(async (classroomId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminAPI.progress.getClassroomProgress(classroomId);
      setClassroomProgress(data);
    } catch (err: unknown) {
      console.error('Error fetching classroom progress:', err);
      setError(err.message || 'Error al cargar progreso de aula');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch student progress
   */
  const fetchStudentProgress = useCallback(
    async (
      studentId: string,
      filters?: { classroom_id?: string; module_id?: string },
    ): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await adminAPI.progress.getStudentProgress(studentId, filters);
        setStudentProgress(data);
      } catch (err: unknown) {
        console.error('Error fetching student progress:', err);
        setError(err.message || 'Error al cargar progreso de estudiante');
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Fetch module progress
   */
  const fetchModuleProgress = useCallback(
    async (moduleId: string, params?: { classroom_id?: string }): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await adminAPI.progress.getModuleProgress(moduleId, params);
        setModuleProgress(data);
      } catch (err: unknown) {
        console.error('Error fetching module progress:', err);
        setError(err.message || 'Error al cargar progreso de módulo');
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Fetch exercise stats
   */
  const fetchExerciseStats = useCallback(async (exerciseId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminAPI.progress.getExerciseStats(exerciseId);
      setExerciseStats(data);
    } catch (err: unknown) {
      console.error('Error fetching exercise stats:', err);
      setError(err.message || 'Error al cargar estadísticas de ejercicio');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Export progress to CSV
   */
  const exportToCSV = useCallback(
    async (type: 'students' | 'classrooms' | 'modules', classroomId?: string): Promise<void> => {
      try {
        const blob = await adminAPI.progress.exportCSV({
          type,
          classroom_id: classroomId,
          format: 'csv',
        });

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `progress-${type}-${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (err: unknown) {
        console.error('Error exporting CSV:', err);
        setError(err.message || 'Error al exportar CSV');
        throw err;
      }
    },
    [],
  );

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Data
    overview,
    classroomProgress,
    studentProgress,
    moduleProgress,
    exerciseStats,

    // State
    isLoading,
    error,

    // Actions
    fetchOverview,
    fetchClassroomProgress,
    fetchStudentProgress,
    fetchModuleProgress,
    fetchExerciseStats,
    exportToCSV,
    clearError,
  };
}
