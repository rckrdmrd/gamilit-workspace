/**
 * Teacher Content API Client
 *
 * API Service para gestión de contenido educativo del portal Teacher.
 * Endpoints para crear, editar, clonar, eliminar y publicar contenido personalizado.
 *
 * @module services/api/teacher/teacherContentApi
 */

import { apiClient } from '@/services/api/apiClient';

// ============================================================================
// TYPES & ENUMS
// ============================================================================

/**
 * Tipos de contenido que un teacher puede crear
 */
export enum TeacherContentType {
  CUSTOM_EXERCISE = 'custom_exercise',
  WORKSHEET = 'worksheet',
  READING_MATERIAL = 'reading_material',
  VIDEO_LESSON = 'video_lesson',
  PRESENTATION = 'presentation',
  QUIZ = 'quiz',
  ASSIGNMENT = 'assignment',
  RESOURCE_PACK = 'resource_pack',
}

/**
 * Estados del contenido
 */
export enum TeacherContentStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

/**
 * Visibilidad del contenido
 */
export enum TeacherContentVisibility {
  PRIVATE = 'private',
  CLASSROOM = 'classroom',
  SCHOOL = 'school',
  PUBLIC = 'public',
}

/**
 * Contenido educativo completo
 */
export interface TeacherContent {
  id: string;
  teacherId: string;
  title: string;
  description?: string;
  contentType: TeacherContentType;
  contentData?: Record<string, unknown>;
  instructions?: string;
  subjectArea?: string;
  gradeLevel?: string;
  difficultyLevel?: string;
  estimatedDurationMinutes?: number;
  visibility: TeacherContentVisibility;
  status: TeacherContentStatus;
  isActive: boolean;
  pointsValue?: number;
  mlCoinsReward?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Respuesta paginada de contenidos
 */
export interface ContentListResponse {
  data: TeacherContent[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Parámetros para obtener contenidos (filtros)
 */
export interface GetContentParams {
  contentType?: TeacherContentType;
  status?: TeacherContentStatus;
  visibility?: TeacherContentVisibility;
  search?: string;
  subjectArea?: string;
  gradeLevel?: string;
  limit?: number;
  offset?: number;
}

/**
 * Datos para crear contenido
 */
export interface CreateContentData {
  title: string;
  description?: string;
  contentType: TeacherContentType;
  contentData?: Record<string, unknown>;
  instructions?: string;
  subjectArea?: string;
  gradeLevel?: string;
  difficultyLevel?: string;
  estimatedDurationMinutes?: number;
  visibility?: TeacherContentVisibility;
  pointsValue?: number;
  mlCoinsReward?: number;
}

/**
 * Datos para actualizar contenido
 */
export interface UpdateContentData {
  title?: string;
  description?: string;
  contentData?: Record<string, unknown>;
  instructions?: string;
  subjectArea?: string;
  gradeLevel?: string;
  difficultyLevel?: string;
  estimatedDurationMinutes?: number;
  visibility?: TeacherContentVisibility;
  status?: TeacherContentStatus;
  pointsValue?: number;
  mlCoinsReward?: number;
}

/**
 * Datos para clonar contenido
 */
export interface CloneContentData {
  newTitle?: string;
}

/**
 * Respuesta genérica de éxito
 */
export interface SuccessResponse {
  message: string;
}

// ============================================================================
// API CLIENT
// ============================================================================

/**
 * API Client para Teacher Content
 *
 * Provee métodos para interactuar con el sistema de gestión de contenido:
 * - Listar contenidos con filtros
 * - Obtener detalle de contenido
 * - Crear contenido nuevo
 * - Actualizar contenido existente
 * - Eliminar contenido (soft delete)
 * - Clonar contenido
 * - Publicar contenido
 */
export const teacherContentApi = {
  /**
   * Obtiene lista de contenidos con filtros opcionales
   *
   * @param params - Parámetros de filtrado y paginación
   * @returns Promise con lista paginada de contenidos
   *
   * @example
   * ```typescript
   * const { data, total } = await teacherContentApi.getContent({
   *   contentType: TeacherContentType.CUSTOM_EXERCISE,
   *   status: TeacherContentStatus.PUBLISHED,
   *   limit: 20,
   *   offset: 0
   * });
   * ```
   */
  getContent: async (params: GetContentParams = {}): Promise<ContentListResponse> => {
    const response = await apiClient.get('/teacher/content', { params });
    return response.data;
  },

  /**
   * Obtiene un contenido específico por ID
   *
   * @param contentId - ID del contenido
   * @returns Promise con el contenido completo
   *
   * @example
   * ```typescript
   * const content = await teacherContentApi.getContentById('content-123');
   * ```
   */
  getContentById: async (contentId: string): Promise<TeacherContent> => {
    const response = await apiClient.get(`/teacher/content/${contentId}`);
    return response.data;
  },

  /**
   * Crea un nuevo contenido educativo
   *
   * @param data - Datos del contenido a crear
   * @returns Promise con el contenido creado
   *
   * @example
   * ```typescript
   * const content = await teacherContentApi.createContent({
   *   title: 'Ejercicio de Maya',
   *   contentType: TeacherContentType.CUSTOM_EXERCISE,
   *   description: 'Ejercicio sobre números mayas',
   *   visibility: TeacherContentVisibility.CLASSROOM,
   *   pointsValue: 100
   * });
   * ```
   */
  createContent: async (data: CreateContentData): Promise<TeacherContent> => {
    const response = await apiClient.post('/teacher/content', data);
    return response.data;
  },

  /**
   * Actualiza un contenido existente
   *
   * @param contentId - ID del contenido
   * @param data - Datos a actualizar
   * @returns Promise con el contenido actualizado
   *
   * @example
   * ```typescript
   * const updated = await teacherContentApi.updateContent('content-123', {
   *   title: 'Nuevo título',
   *   status: TeacherContentStatus.PUBLISHED
   * });
   * ```
   */
  updateContent: async (contentId: string, data: UpdateContentData): Promise<TeacherContent> => {
    const response = await apiClient.put(`/teacher/content/${contentId}`, data);
    return response.data;
  },

  /**
   * Elimina un contenido (soft delete)
   *
   * @param contentId - ID del contenido a eliminar
   * @returns Promise con respuesta de éxito
   *
   * @example
   * ```typescript
   * await teacherContentApi.deleteContent('content-123');
   * ```
   */
  deleteContent: async (contentId: string): Promise<SuccessResponse> => {
    const response = await apiClient.delete(`/teacher/content/${contentId}`);
    return response.data;
  },

  /**
   * Clona un contenido existente
   *
   * @param contentId - ID del contenido a clonar
   * @param data - Datos opcionales para el clon (ej: nuevo título)
   * @returns Promise con el contenido clonado
   *
   * @example
   * ```typescript
   * const clone = await teacherContentApi.cloneContent('content-123', {
   *   newTitle: 'Copia del ejercicio original'
   * });
   * ```
   */
  cloneContent: async (contentId: string, data?: CloneContentData): Promise<TeacherContent> => {
    const response = await apiClient.post(`/teacher/content/${contentId}/clone`, data || {});
    return response.data;
  },

  /**
   * Publica un contenido (cambia estado a PUBLISHED)
   *
   * @param contentId - ID del contenido a publicar
   * @returns Promise con el contenido publicado
   *
   * @example
   * ```typescript
   * const published = await teacherContentApi.publishContent('content-123');
   * ```
   */
  publishContent: async (contentId: string): Promise<TeacherContent> => {
    const response = await apiClient.patch(`/teacher/content/${contentId}/publish`);
    return response.data;
  },
};
