/**
 * useStudentBlocking Hook
 *
 * Custom React hook for managing student blocking/unblocking operations.
 * Provides state management and actions for blocking students in classrooms.
 *
 * @module useStudentBlocking
 * @since US-PM-006
 */

import { useState, useCallback } from 'react';
import {
  classroomsApi,
  BlockStudentDto,
  BlockType,
  StudentPermissionsResponse,
} from '../../../services/api/teacher/classroomsApi';
import { useToast } from '@shared/components/base/Toast';

// ============================================================================
// TYPES
// ============================================================================

export interface UseStudentBlockingReturn {
  /** Current loading state */
  loading: boolean;
  /** Current error if any */
  error: Error | null;
  /** Current permissions data for selected student */
  permissions: StudentPermissionsResponse | null;
  /** Block a student in a classroom */
  blockStudent: (
    classroomId: string,
    studentId: string,
    data: BlockStudentDto,
  ) => Promise<StudentPermissionsResponse>;
  /** Unblock a student in a classroom */
  unblockStudent: (
    classroomId: string,
    studentId: string,
  ) => Promise<StudentPermissionsResponse>;
  /** Fetch current permissions for a student */
  fetchPermissions: (
    classroomId: string,
    studentId: string,
  ) => Promise<StudentPermissionsResponse>;
  /** Clear any current error */
  clearError: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Custom hook for managing student blocking operations
 *
 * Features:
 * - Block students with full or partial restrictions
 * - Unblock students to restore access
 * - Fetch current student permissions
 * - Toast notifications for success/error states
 * - Loading and error state management
 *
 * @returns Student blocking state and action methods
 *
 * @example
 * ```tsx
 * const { blockStudent, unblockStudent, loading } = useStudentBlocking();
 *
 * // Block a student
 * await blockStudent('classroom-123', 'student-456', {
 *   reason: 'Comportamiento inapropiado',
 *   block_type: BlockType.FULL
 * });
 *
 * // Unblock a student
 * await unblockStudent('classroom-123', 'student-456');
 * ```
 */
export const useStudentBlocking = (): UseStudentBlockingReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [permissions, setPermissions] = useState<StudentPermissionsResponse | null>(null);
  const { showToast } = useToast();

  /**
   * Block a student in a classroom
   */
  const blockStudent = useCallback(
    async (
      classroomId: string,
      studentId: string,
      data: BlockStudentDto,
    ): Promise<StudentPermissionsResponse> => {
      setLoading(true);
      setError(null);

      try {
        const result = await classroomsApi.blockStudent(classroomId, studentId, data);
        setPermissions(result);

        const blockTypeLabel = data.block_type === BlockType.FULL ? 'completo' : 'parcial';
        showToast({
          type: 'success',
          title: 'Estudiante bloqueado',
          message: `Bloqueo ${blockTypeLabel} aplicado correctamente`,
          duration: 4000,
        });

        return result;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        const newError = new Error(errorMessage || 'Error al bloquear estudiante');
        setError(newError);

        showToast({
          type: 'error',
          title: 'Error al bloquear',
          message: errorMessage || 'No se pudo bloquear al estudiante',
          duration: 5000,
        });

        throw newError;
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  /**
   * Unblock a student in a classroom
   */
  const unblockStudent = useCallback(
    async (classroomId: string, studentId: string): Promise<StudentPermissionsResponse> => {
      setLoading(true);
      setError(null);

      try {
        const result = await classroomsApi.unblockStudent(classroomId, studentId);
        setPermissions(result);

        showToast({
          type: 'success',
          title: 'Estudiante desbloqueado',
          message: 'El estudiante puede acceder nuevamente al aula',
          duration: 4000,
        });

        return result;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        const newError = new Error(errorMessage || 'Error al desbloquear estudiante');
        setError(newError);

        showToast({
          type: 'error',
          title: 'Error al desbloquear',
          message: errorMessage || 'No se pudo desbloquear al estudiante',
          duration: 5000,
        });

        throw newError;
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  /**
   * Fetch current permissions for a student
   */
  const fetchPermissions = useCallback(
    async (classroomId: string, studentId: string): Promise<StudentPermissionsResponse> => {
      setLoading(true);
      setError(null);

      try {
        const result = await classroomsApi.getStudentPermissions(classroomId, studentId);
        setPermissions(result);
        return result;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        const newError = new Error(errorMessage || 'Error al obtener permisos');
        setError(newError);
        throw newError;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Clear current error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    permissions,
    blockStudent,
    unblockStudent,
    fetchPermissions,
    clearError,
  };
};

// Re-export types for convenience
export { BlockType } from '../../../services/api/teacher/classroomsApi';
export type { BlockStudentDto, StudentPermissionsResponse } from '../../../services/api/teacher/classroomsApi';
