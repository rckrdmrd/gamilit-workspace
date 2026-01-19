/**
 * useManualReviewConfig Hook
 *
 * TASK-2026-01-18-009: Hook para obtener configuración de ejercicios con revisión manual
 *
 * Consume el endpoint /teacher/reviews/config/exercises para obtener:
 * - Módulos que tienen ejercicios con revisión manual
 * - Ejercicios que requieren revisión manual (requires_manual_grading = true)
 *
 * Este hook REEMPLAZA los datos hardcodeados de:
 * - manualReviewExercises.ts (MANUAL_REVIEW_MODULES, MANUAL_REVIEW_EXERCISES)
 *
 * @module apps/teacher/hooks/useManualReviewConfig
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import apiClient from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Módulo con ejercicios de revisión manual
 */
export interface ManualReviewModule {
  id: string;
  name: string;
  number: number;
}

/**
 * Ejercicio que requiere revisión manual
 */
export interface ManualReviewExercise {
  id: string;
  title: string;
  exerciseType: string;
  moduleId: string;
  moduleName: string;
  moduleNumber: number;
}

/**
 * Configuración completa de revisión manual
 */
export interface ManualReviewConfig {
  modules: ManualReviewModule[];
  exercises: ManualReviewExercise[];
}

// ============================================================================
// QUERY KEYS
// ============================================================================

export const manualReviewConfigKeys = {
  all: ['teacher', 'manualReviewConfig'] as const,
  config: () => [...manualReviewConfigKeys.all, 'config'] as const,
};

// ============================================================================
// API FUNCTION
// ============================================================================

/**
 * Fetch manual review configuration from API
 */
const fetchManualReviewConfig = async (): Promise<ManualReviewConfig> => {
  const { data } = await apiClient.get<ManualReviewConfig>(
    API_ENDPOINTS.teacher.reviews.config
  );
  return data;
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook para obtener configuración de ejercicios con revisión manual
 *
 * @returns React Query result con módulos y ejercicios
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useManualReviewConfig();
 *
 * if (isLoading) return <Spinner />;
 *
 * return (
 *   <select>
 *     {data?.modules.map(m => (
 *       <option key={m.id} value={m.id}>
 *         Módulo {m.number} - {m.name}
 *       </option>
 *     ))}
 *   </select>
 * );
 * ```
 */
export function useManualReviewConfig(): UseQueryResult<ManualReviewConfig, Error> {
  return useQuery<ManualReviewConfig, Error>({
    queryKey: manualReviewConfigKeys.config(),
    queryFn: fetchManualReviewConfig,
    staleTime: 10 * 60 * 1000, // 10 minutes - config data changes rarely
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
  });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Filtrar ejercicios por módulo
 *
 * @param exercises - Lista de ejercicios
 * @param moduleId - ID del módulo (vacío = todos)
 * @returns Ejercicios filtrados
 */
export const filterExercisesByModule = (
  exercises: ManualReviewExercise[],
  moduleId: string
): ManualReviewExercise[] => {
  if (!moduleId) return exercises;
  return exercises.filter((ex) => ex.moduleId === moduleId);
};

/**
 * Obtener ejercicio por ID
 *
 * @param exercises - Lista de ejercicios
 * @param exerciseId - ID del ejercicio
 * @returns Ejercicio encontrado o undefined
 */
export const getExerciseById = (
  exercises: ManualReviewExercise[],
  exerciseId: string
): ManualReviewExercise | undefined => {
  return exercises.find((ex) => ex.id === exerciseId);
};

// ============================================================================
// EXPORTS
// ============================================================================

export default useManualReviewConfig;
