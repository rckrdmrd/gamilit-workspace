/**
 * useStudentMonitoring Hook
 *
 * Hook para monitoreo de estudiantes con paginacion server-side.
 * Permite al usuario controlar la cantidad de registros por pagina
 * y navegar entre paginas de resultados.
 *
 * CORR-2025-12-18: Implementacion de paginacion completa server-side
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

import { useState, useEffect, useCallback, useRef } from 'react';
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
        const mappedStudents: StudentMonitoring[] = (response.data || []).map((student) => ({
          ...student,
          // Mapear user_id a id (el backend devuelve user_id, frontend espera id)
          id: (student as any).user_id || student.id,
          user_id: (student as any).user_id,
        }));

        // Actualizar estados
        setStudents(mappedStudents);
        setPagination(response.pagination);
        setLastUpdate(new Date());
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.error('[useStudentMonitoring] Error fetching students:', err);
      } finally {
        if (showLoadingState) {
          setLoading(false);
        }
      }
    },
    [classroomId, page, limit, filters],
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
   */
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setPage(1);
  }, [filters]);

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
