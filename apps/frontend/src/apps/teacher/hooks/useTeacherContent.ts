/**
 * useTeacherContent Hook
 *
 * Custom hook para gestionar el contenido educativo del portal Teacher.
 * Provee estado, filtros, paginación y métodos para crear/editar/eliminar contenido.
 *
 * @module apps/teacher/hooks/useTeacherContent
 */

import { useState, useEffect, useCallback } from 'react';
import {
  teacherContentApi,
  TeacherContent,
  ContentListResponse,
  GetContentParams,
  CreateContentData,
  UpdateContentData,
  CloneContentData,
  TeacherContentType,
  TeacherContentStatus,
  TeacherContentVisibility,
} from '../../../services/api/teacher/teacherContentApi';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Filtros para búsqueda de contenido
 */
export interface ContentFilters {
  contentType?: TeacherContentType;
  status?: TeacherContentStatus;
  visibility?: TeacherContentVisibility;
  search?: string;
  subjectArea?: string;
  gradeLevel?: string;
}

/**
 * Estado de paginación
 */
export interface PaginationState {
  limit: number;
  offset: number;
}

/**
 * Valor de retorno del hook
 */
export interface UseTeacherContentReturn {
  // Estado
  content: TeacherContent[];
  total: number;
  loading: boolean;
  error: Error | null;
  filters: ContentFilters;
  pagination: PaginationState;

  // Métodos CRUD
  fetchContent: () => Promise<void>;
  createContent: (data: CreateContentData) => Promise<TeacherContent>;
  updateContent: (id: string, data: UpdateContentData) => Promise<TeacherContent>;
  deleteContent: (id: string) => Promise<void>;
  cloneContent: (id: string, newTitle?: string) => Promise<TeacherContent>;
  publishContent: (id: string) => Promise<TeacherContent>;

  // Métodos de navegación
  updateFilters: (newFilters: Partial<ContentFilters>) => void;
  nextPage: () => void;
  prevPage: () => void;
  refresh: () => void;
  clearError: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook para gestionar contenido educativo del portal Teacher
 *
 * @param initialFilters - Filtros iniciales opcionales
 * @returns Objeto con estado y métodos para gestionar contenido
 *
 * @example
 * ```typescript
 * const {
 *   content,
 *   loading,
 *   createContent,
 *   updateContent,
 *   updateFilters
 * } = useTeacherContent({ status: TeacherContentStatus.PUBLISHED });
 *
 * // Crear contenido
 * await createContent({
 *   title: 'Nuevo ejercicio',
 *   contentType: TeacherContentType.CUSTOM_EXERCISE,
 *   visibility: TeacherContentVisibility.CLASSROOM
 * });
 *
 * // Actualizar filtros
 * updateFilters({ contentType: TeacherContentType.QUIZ });
 * ```
 */
export const useTeacherContent = (initialFilters: ContentFilters = {}): UseTeacherContentReturn => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [content, setContent] = useState<TeacherContent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<ContentFilters>(initialFilters);
  const [pagination, setPagination] = useState<PaginationState>({ limit: 20, offset: 0 });

  // ============================================================================
  // FETCH FUNCTIONS
  // ============================================================================

  /**
   * Obtiene lista de contenidos con filtros y paginación actuales
   */
  const fetchContent = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: GetContentParams = {
        ...filters,
        ...pagination,
      };

      const response: ContentListResponse = await teacherContentApi.getContent(params);

      setContent(response.data);
      setTotal(response.total);
    } catch (err: unknown) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Error al cargar contenidos';
      setError(new Error(errorMessage));
      console.error('[useTeacherContent] Error fetching content:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Efecto principal: carga datos iniciales cuando cambian filtros/paginación
   */
  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // ============================================================================
  // CRUD METHODS
  // ============================================================================

  /**
   * Crea un nuevo contenido educativo
   *
   * @param data - Datos del contenido
   * @returns Promise con el contenido creado
   */
  const createContent = async (data: CreateContentData): Promise<TeacherContent> => {
    try {
      const newContent = await teacherContentApi.createContent(data);

      // Actualización optimista: agregar al inicio de la lista
      setContent((prev) => [newContent, ...prev]);
      setTotal((prev) => prev + 1);

      return newContent;
    } catch (err: unknown) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al crear contenido';
      setError(new Error(errorMessage));
      throw err;
    }
  };

  /**
   * Actualiza un contenido existente
   *
   * @param id - ID del contenido
   * @param data - Datos a actualizar
   * @returns Promise con el contenido actualizado
   */
  const updateContent = async (id: string, data: UpdateContentData): Promise<TeacherContent> => {
    try {
      const updatedContent = await teacherContentApi.updateContent(id, data);

      // Actualizar en la lista local
      setContent((prev) => prev.map((item) => (item.id === id ? updatedContent : item)));

      return updatedContent;
    } catch (err: unknown) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Error al actualizar contenido';
      setError(new Error(errorMessage));
      throw err;
    }
  };

  /**
   * Elimina un contenido (soft delete)
   *
   * @param id - ID del contenido
   */
  const deleteContent = async (id: string): Promise<void> => {
    try {
      await teacherContentApi.deleteContent(id);

      // Remover de la lista local
      setContent((prev) => prev.filter((item) => item.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (err: unknown) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Error al eliminar contenido';
      setError(new Error(errorMessage));
      throw err;
    }
  };

  /**
   * Clona un contenido existente
   *
   * @param id - ID del contenido a clonar
   * @param newTitle - Título opcional para el clon
   * @returns Promise con el contenido clonado
   */
  const cloneContent = async (id: string, newTitle?: string): Promise<TeacherContent> => {
    try {
      const cloneData: CloneContentData = newTitle ? { newTitle } : {};
      const clonedContent = await teacherContentApi.cloneContent(id, cloneData);

      // Actualización optimista: agregar al inicio de la lista
      setContent((prev) => [clonedContent, ...prev]);
      setTotal((prev) => prev + 1);

      return clonedContent;
    } catch (err: unknown) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Error al clonar contenido';
      setError(new Error(errorMessage));
      throw err;
    }
  };

  /**
   * Publica un contenido (cambia estado a PUBLISHED)
   *
   * @param id - ID del contenido
   * @returns Promise con el contenido publicado
   */
  const publishContent = async (id: string): Promise<TeacherContent> => {
    try {
      const publishedContent = await teacherContentApi.publishContent(id);

      // Actualizar en la lista local
      setContent((prev) => prev.map((item) => (item.id === id ? publishedContent : item)));

      return publishedContent;
    } catch (err: unknown) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Error al publicar contenido';
      setError(new Error(errorMessage));
      throw err;
    }
  };

  // ============================================================================
  // FILTER & PAGINATION METHODS
  // ============================================================================

  /**
   * Actualiza los filtros de búsqueda
   *
   * @param newFilters - Filtros parciales a actualizar
   */
  const updateFilters = (newFilters: Partial<ContentFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    // Reset paginación al cambiar filtros
    setPagination({ limit: 20, offset: 0 });
  };

  /**
   * Avanza a la siguiente página
   */
  const nextPage = () => {
    setPagination((prev) => ({ ...prev, offset: prev.offset + prev.limit }));
  };

  /**
   * Retrocede a la página anterior
   */
  const prevPage = () => {
    setPagination((prev) => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }));
  };

  /**
   * Recarga todos los datos
   */
  const refresh = () => {
    fetchContent();
  };

  /**
   * Limpia el mensaje de error
   */
  const clearError = () => {
    setError(null);
  };

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Estado
    content,
    total,
    loading,
    error,
    filters,
    pagination,

    // Métodos CRUD
    fetchContent,
    createContent,
    updateContent,
    deleteContent,
    cloneContent,
    publishContent,

    // Métodos de navegación
    updateFilters,
    nextPage,
    prevPage,
    refresh,
    clearError,
  };
};
