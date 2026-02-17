/**
 * useStudentMonitoring Hook
 *
 * Hook para monitoreo de estudiantes con paginacion server-side.
 * Permite al usuario controlar la cantidad de registros por pagina
 * y navegar entre paginas de resultados.
 *
 * CORR-2025-12-18: Implementacion de paginacion completa server-side
 * FIX-2026-01-08: Corregido problema de loops infinitos en useEffect
 *   - Uso de filtersKey (JSON.stringify) para comparación estable de filtros
 *   - Contador de errores consecutivos para pausar auto-refresh automáticamente
 *   - Prevención de re-renders innecesarios por cambios de referencia de objetos
 *
 * @param classroomId - ID of the classroom to monitor
 * @param filters - Optional filters for status, module, score range, and search
 * @param options - Configuration options for auto-refresh and pagination
 * @returns Object with students, pagination controls, loading state, and refresh functions
 *
 * @example
 * ```typescript
 * const {
 *   students,
 *   loading,
 *   error,
 *   page,
 *   limit,
 *   pagination,
 *   setPage,
 *   setPageLimit,
 *   refresh,
 * } = useStudentMonitoring(classroomId, { status: ['active'] });
 * ```
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { classroomsApi } from '@services/api/teacher';
import type { GetClassroomStudentsQueryDto } from '@services/api/teacher';
import type { PaginationInfo } from '@shared/types/api-responses';
import type { StudentMonitoring, StudentFilter } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export type RefreshInterval = 0 | 15000 | 30000 | 60000; // 0 = manual, 15s, 30s, 60s

interface UseStudentMonitoringOptions {
  /** Intervalo de auto-refresh (default: 30000ms) */
  defaultInterval?: RefreshInterval;
  /** Limite inicial por pagina (default: 25) */
  defaultLimit?: number;
}

interface UseStudentMonitoringReturn {
  /** Lista de estudiantes de la pagina actual */
  students: StudentMonitoring[];
  /** Estado de carga */
  loading: boolean;
  /** Error si ocurrio alguno */
  error: Error | null;
  /** Pagina actual (1-indexed) */
  page: number;
  /** Limite de registros por pagina */
  limit: number;
  /** Informacion de paginacion del servidor */
  pagination: PaginationInfo | null;
  /** Cambiar a una pagina especifica */
  setPage: (page: number) => void;
  /** Cambiar limite por pagina (resetea a pagina 1) */
  setPageLimit: (limit: number) => void;
  /** Intervalo de auto-refresh actual */
  refreshInterval: RefreshInterval;
  /** Cambiar intervalo de auto-refresh */
  setRefreshInterval: (interval: RefreshInterval) => void;
  /** Forzar refresh manual */
  refresh: () => Promise<void>;
  /** Ultima actualizacion */
  lastUpdate: Date | null;
}

// ============================================================================
// HOOK
// ============================================================================

export function useStudentMonitoring(
  classroomId: string,
  filters?: StudentFilter,
  options?: UseStudentMonitoringOptions,
): UseStudentMonitoringReturn {
  // Estados de datos
  const [students, setStudents] = useState<StudentMonitoring[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Estados de paginacion
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(options?.defaultLimit ?? 25);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  // Estados de auto-refresh
  const [refreshInterval, setRefreshInterval] = useState<RefreshInterval>(
    options?.defaultInterval ?? 30000,
  );
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Ref para trackear si es el primer render
  const isFirstRender = useRef(true);

  // FIX-2026-01-08: Ref para contar errores consecutivos y evitar loops infinitos
  const consecutiveErrorsRef = useRef(0);
  const MAX_CONSECUTIVE_ERRORS = 3;

  // FIX-2026-01-08: Memoizar filters como string para evitar re-renders innecesarios
  // Esto previene que cambios de referencia del objeto filters disparen re-fetches
  const filtersKey = useMemo(() => JSON.stringify(filters ?? {}), [filters]);

  /**
   * Fetch students from API with pagination
   */
  const fetchStudents = useCallback(
    async (showLoadingState = true) => {
      if (!classroomId) return;

      try {
        if (showLoadingState) {
          setLoading(true);
        }
        setError(null);

        // Construir query con paginacion
        const query: GetClassroomStudentsQueryDto = {
          page,
          limit,
        };

        // Agregar filtros si existen
        // CORR-2025-12-18: Solo enviar filtro de status cuando hay exactamente uno seleccionado
        // Si hay múltiples status seleccionados, no enviamos filtro para obtener todos los estudiantes
        // (el backend actual no soporta múltiples status en un solo request)
        if (filters?.status && filters.status.length === 1) {
          query.status = filters.status[0] as 'active' | 'inactive';
        }

        // Agregar busqueda si existe
        if (filters?.search) {
          query.search = filters.search;
        }

        const response = await classroomsApi.getClassroomStudents(classroomId, query);

        // CORR-2025-12-18: Mapear user_id a id
        // El backend devuelve user_id pero el frontend espera id para React keys
        // FIX-2026-01-25: Añadir valores por defecto para campos que pueden ser null/undefined
        const mappedStudents: StudentMonitoring[] = (response.data || []).map((student, index) => {
          const studentRecord = student as unknown as Record<string, unknown>;
          const userId = (studentRecord.user_id as string) || student.id;

          if (!userId) {
            console.warn('[useStudentMonitoring] Student without ID detected at index:', index, student);
          }

          return {
            ...student,
            // Mapear user_id a id (el backend devuelve user_id, frontend espera id)
            // Fallback único si no hay ID para evitar errores de React keys
            id: userId || `unknown-${Date.now()}-${index}`,
            user_id: studentRecord.user_id as string,
            // Asegurar valores por defecto para campos que pueden venir null/undefined
            progress_percentage: student.progress_percentage ?? 0,
            score_average: student.score_average ?? 0,
            time_spent_minutes: student.time_spent_minutes ?? 0,
            exercises_completed: student.exercises_completed ?? 0,
            exercises_total: student.exercises_total ?? 0,
            // last_activity puede ser null - lo dejamos tal cual para que el componente lo maneje
            last_activity: student.last_activity ?? null,
          };
        });

        // Actualizar estados
        setStudents(mappedStudents);
        setPagination(response.pagination);
        setLastUpdate(new Date());

        // FIX-2026-01-08: Resetear contador de errores en caso de éxito
        consecutiveErrorsRef.current = 0;
      } catch (err) {
        // FIX-2026-01-08: Incrementar contador de errores consecutivos
        consecutiveErrorsRef.current += 1;

        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.error('[useStudentMonitoring] Error fetching students:', err);

        // FIX-2026-01-08: Pausar auto-refresh después de múltiples errores consecutivos
        // para evitar loops infinitos y sobrecarga del servidor
        if (consecutiveErrorsRef.current >= MAX_CONSECUTIVE_ERRORS && refreshInterval > 0) {
          console.warn(
            `[useStudentMonitoring] Pausando auto-refresh después de ${MAX_CONSECUTIVE_ERRORS} errores consecutivos`,
          );
          setRefreshInterval(0);
        }
      } finally {
        if (showLoadingState) {
          setLoading(false);
        }
      }
    },
    // FIX-2026-01-08: Usar filtersKey (string) en lugar de filters (object)
    // para evitar re-renders cuando la referencia del objeto cambia pero el contenido es igual
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [classroomId, page, limit, filtersKey, refreshInterval],
  );

  /**
   * Cambiar limite y resetear a pagina 1
   */
  const setPageLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Siempre volver a pagina 1 al cambiar limite
  }, []);

  /**
   * Resetear a pagina 1 cuando cambian los filtros
   * FIX-2026-01-08: Usar filtersKey para comparación estable
   */
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setPage(1);
    // FIX-2026-01-08: Resetear contador de errores al cambiar filtros
    consecutiveErrorsRef.current = 0;
  }, [filtersKey]);

  /**
   * Fetch inicial y cuando cambian dependencias
   */
  useEffect(() => {
    fetchStudents(true);
  }, [fetchStudents]);

  /**
   * Auto-refresh con intervalo configurable
   */
  useEffect(() => {
    // Limpiar intervalo existente
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Configurar nuevo intervalo si no es manual (0)
    if (refreshInterval > 0 && classroomId) {
      intervalRef.current = setInterval(() => {
        fetchStudents(false); // No mostrar loading en auto-refresh
      }, refreshInterval);
    }

    // Cleanup al desmontar o cambiar intervalo
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [refreshInterval, classroomId, fetchStudents]);

  /**
   * Refresh manual
   */
  const refresh = useCallback(async () => {
    await fetchStudents(true);
  }, [fetchStudents]);

  return {
    students,
    loading,
    error,
    page,
    limit,
    pagination,
    setPage,
    setPageLimit,
    refreshInterval,
    setRefreshInterval,
    refresh,
    lastUpdate,
  };
}
