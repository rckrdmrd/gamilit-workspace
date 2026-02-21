/**
 * useProgress Hook
 *
 * Comprehensive hook for managing admin progress data.
 * Handles overview, classroom, student, module, and exercise progress.
 *
 * Migrated to React Query for automatic caching, deduplication,
 * and background refetching. Uses on-demand queries since each fetch
 * requires an explicit ID parameter.
 *
 * @author Frontend-Agent
 * @date 2025-11-24
 * @updated 2026-02-20 - Migrated to React Query
 */
import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/services/api/adminAPI';
import { STALE_TIMES } from '@/shared/constants/queryKeys';
import type {
  ProgressOverview,
  ClassroomProgress,
  StudentProgress,
  ModuleProgressStats,
  ExerciseStats,
} from '@/services/api/adminTypes';

// ============================================================================
// Filter/Param Types
// ============================================================================

interface ProgressStudentFilters {
  classroom_id?: string;
  module_id?: string;
}

interface ProgressModuleParams {
  classroom_id?: string;
}

// ============================================================================
// Query Key Factories
// ============================================================================

const progressKeys = {
  all: ['admin', 'progress'] as const,
  overview: () => ['admin', 'progress', 'overview'] as const,
  classroom: (id: string) => ['admin', 'progress', 'classroom', id] as const,
  student: (id: string, filters?: ProgressStudentFilters) => ['admin', 'progress', 'student', id, filters] as const,
  module: (id: string, params?: ProgressModuleParams) => ['admin', 'progress', 'module', id, params] as const,
  exercise: (id: string) => ['admin', 'progress', 'exercise', id] as const,
};

// ============================================================================
// Types (unchanged for backward compatibility)
// ============================================================================

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
  fetchStudentProgress: (studentId: string, filters?: ProgressStudentFilters) => Promise<void>;
  fetchModuleProgress: (moduleId: string, params?: ProgressModuleParams) => Promise<void>;
  fetchExerciseStats: (exerciseId: string) => Promise<void>;
  exportToCSV: (type: 'students' | 'classrooms' | 'modules', classroomId?: string) => Promise<void>;
  clearError: () => void;
}

// ============================================================================
// Hook
// ============================================================================

export function useProgress(): UseProgressResult {
  const queryClient = useQueryClient();

  // Track which sub-queries are active (needed for on-demand fetching)
  const [activeClassroomId, setActiveClassroomId] = useState<string | null>(null);
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [activeStudentFilters, setActiveStudentFilters] = useState<ProgressStudentFilters | undefined>(undefined);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [activeModuleParams, setActiveModuleParams] = useState<ProgressModuleParams | undefined>(undefined);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);

  // ============================================================================
  // QUERIES
  // ============================================================================

  const overviewQuery = useQuery({
    queryKey: progressKeys.overview(),
    queryFn: () => adminAPI.progress.getOverview(),
    staleTime: STALE_TIMES.DYNAMIC,
    enabled: false, // manual trigger
  });

  const classroomQuery = useQuery({
    queryKey: progressKeys.classroom(activeClassroomId ?? ''),
    queryFn: () => adminAPI.progress.getClassroomProgress(activeClassroomId!),
    staleTime: STALE_TIMES.DYNAMIC,
    enabled: !!activeClassroomId,
  });

  const studentQuery = useQuery({
    queryKey: progressKeys.student(activeStudentId ?? '', activeStudentFilters),
    queryFn: () => adminAPI.progress.getStudentProgress(activeStudentId!, activeStudentFilters),
    staleTime: STALE_TIMES.DYNAMIC,
    enabled: !!activeStudentId,
  });

  const moduleQuery = useQuery({
    queryKey: progressKeys.module(activeModuleId ?? '', activeModuleParams),
    queryFn: () => adminAPI.progress.getModuleProgress(activeModuleId!, activeModuleParams),
    staleTime: STALE_TIMES.DYNAMIC,
    enabled: !!activeModuleId,
  });

  const exerciseQuery = useQuery({
    queryKey: progressKeys.exercise(activeExerciseId ?? ''),
    queryFn: () => adminAPI.progress.getExerciseStats(activeExerciseId!),
    staleTime: STALE_TIMES.DYNAMIC,
    enabled: !!activeExerciseId,
  });

  // ============================================================================
  // COMBINED STATE
  // ============================================================================

  const isLoading =
    overviewQuery.isFetching ||
    classroomQuery.isFetching ||
    studentQuery.isFetching ||
    moduleQuery.isFetching ||
    exerciseQuery.isFetching;

  const firstError =
    overviewQuery.error ??
    classroomQuery.error ??
    studentQuery.error ??
    moduleQuery.error ??
    exerciseQuery.error;

  const error = firstError instanceof Error ? firstError.message : firstError ? String(firstError) : null;

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const fetchOverview = useCallback(async (): Promise<void> => {
    await overviewQuery.refetch();
  }, [overviewQuery]);

  const fetchClassroomProgress = useCallback(async (classroomId: string): Promise<void> => {
    setActiveClassroomId(classroomId);
    // The query will auto-run when activeClassroomId changes
  }, []);

  const fetchStudentProgress = useCallback(
    async (studentId: string, filters?: { classroom_id?: string; module_id?: string }): Promise<void> => {
      setActiveStudentId(studentId);
      setActiveStudentFilters(filters);
    },
    [],
  );

  const fetchModuleProgress = useCallback(
    async (moduleId: string, params?: { classroom_id?: string }): Promise<void> => {
      setActiveModuleId(moduleId);
      setActiveModuleParams(params);
    },
    [],
  );

  const fetchExerciseStats = useCallback(async (exerciseId: string): Promise<void> => {
    setActiveExerciseId(exerciseId);
  }, []);

  const exportToCSV = useCallback(
    async (type: 'students' | 'classrooms' | 'modules', classroomId?: string): Promise<void> => {
      try {
        const blob = await adminAPI.progress.exportCSV({
          type,
          classroom_id: classroomId,
          format: 'csv',
        });

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
        throw err;
      }
    },
    [],
  );

  const clearError = useCallback(() => {
    // Reset error states by removing failed queries from cache
    queryClient.resetQueries({ queryKey: progressKeys.all });
  }, [queryClient]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    overview: overviewQuery.data ?? null,
    classroomProgress: classroomQuery.data ?? null,
    studentProgress: studentQuery.data ?? null,
    moduleProgress: moduleQuery.data ?? null,
    exerciseStats: exerciseQuery.data ?? null,
    isLoading,
    error,
    fetchOverview,
    fetchClassroomProgress,
    fetchStudentProgress,
    fetchModuleProgress,
    fetchExerciseStats,
    exportToCSV,
    clearError,
  };
}
