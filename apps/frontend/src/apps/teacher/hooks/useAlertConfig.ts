/**
 * useAlertConfig Hook
 *
 * Custom React hook for managing teacher alert configurations.
 * Provides state management and CRUD operations for alert settings.
 *
 * @module useAlertConfig
 * @since US-PM-007
 */

import { useState, useEffect, useCallback } from 'react';
import {
  alertConfigApi,
  AlertConfigResponse,
  AlertConfigDefaults,
  CreateAlertConfigDto,
  UpdateAlertConfigDto,
  AlertConfigType,
} from '../../../services/api/teacher/alertConfigApi';
import { useToast } from '@shared/components/base/Toast';

// ============================================================================
// TYPES
// ============================================================================

export interface UseAlertConfigReturn {
  /** List of configurations */
  configurations: AlertConfigResponse[];
  /** Default configuration values */
  defaults: AlertConfigDefaults[];
  /** Loading state */
  loading: boolean;
  /** Saving state */
  saving: boolean;
  /** Error state */
  error: Error | null;
  /** Fetch configurations */
  fetchConfigurations: (classroomId?: string) => Promise<void>;
  /** Create a new configuration */
  createConfiguration: (dto: CreateAlertConfigDto) => Promise<AlertConfigResponse>;
  /** Update a configuration */
  updateConfiguration: (id: string, dto: UpdateAlertConfigDto) => Promise<AlertConfigResponse>;
  /** Delete a configuration */
  deleteConfiguration: (id: string) => Promise<void>;
  /** Toggle configuration enabled state */
  toggleEnabled: (id: string, enabled: boolean) => Promise<void>;
  /** Initialize defaults for all alert types */
  initializeDefaults: (classroomId?: string) => Promise<void>;
  /** Refresh data */
  refresh: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Custom hook for managing alert configurations
 *
 * Features:
 * - Fetch configurations with optional classroom filter
 * - Create, update, delete configurations
 * - Toggle enabled state
 * - Initialize defaults
 * - Toast notifications for operations
 *
 * @param classroomId - Optional classroom filter
 * @returns Alert config state and action methods
 *
 * @example
 * ```tsx
 * const {
 *   configurations,
 *   defaults,
 *   loading,
 *   updateConfiguration,
 *   toggleEnabled
 * } = useAlertConfig();
 *
 * // Toggle an alert type
 * await toggleEnabled(configId, false);
 *
 * // Update threshold
 * await updateConfiguration(configId, { threshold_value: 5 });
 * ```
 */
export const useAlertConfig = (classroomId?: string): UseAlertConfigReturn => {
  const [configurations, setConfigurations] = useState<AlertConfigResponse[]>([]);
  const [defaults, setDefaults] = useState<AlertConfigDefaults[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { showToast } = useToast();

  /**
   * Fetch configurations from API
   */
  const fetchConfigurations = useCallback(
    async (filterClassroomId?: string) => {
      setLoading(true);
      setError(null);

      try {
        const [configsResponse, defaultsResponse] = await Promise.all([
          alertConfigApi.getConfigurations({
            classroom_id: filterClassroomId || classroomId,
          }),
          alertConfigApi.getDefaults(),
        ]);

        setConfigurations(configsResponse.data);
        setDefaults(defaultsResponse);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(new Error(errorMessage || 'Error al cargar configuraciones'));
        showToast({
          type: 'error',
          title: 'Error',
          message: 'No se pudieron cargar las configuraciones de alertas',
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    },
    [classroomId, showToast],
  );

  // Fetch on mount and when classroomId changes
  useEffect(() => {
    fetchConfigurations();
  }, [fetchConfigurations]);

  /**
   * Create a new configuration
   */
  const createConfiguration = useCallback(
    async (dto: CreateAlertConfigDto): Promise<AlertConfigResponse> => {
      setSaving(true);
      setError(null);

      try {
        const result = await alertConfigApi.createConfiguration(dto);
        setConfigurations((prev) => [...prev, result]);

        showToast({
          type: 'success',
          title: 'Configuracion creada',
          message: 'La configuracion de alerta se creo correctamente',
          duration: 3000,
        });

        return result;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(new Error(errorMessage));
        showToast({
          type: 'error',
          title: 'Error',
          message: errorMessage || 'No se pudo crear la configuracion',
          duration: 5000,
        });
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [showToast],
  );

  /**
   * Update a configuration
   */
  const updateConfiguration = useCallback(
    async (id: string, dto: UpdateAlertConfigDto): Promise<AlertConfigResponse> => {
      setSaving(true);
      setError(null);

      try {
        const result = await alertConfigApi.updateConfiguration(id, dto);

        // Update in local state
        setConfigurations((prev) =>
          prev.map((config) => (config.id === id ? result : config)),
        );

        showToast({
          type: 'success',
          title: 'Configuracion actualizada',
          message: 'Los cambios se guardaron correctamente',
          duration: 3000,
        });

        return result;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(new Error(errorMessage));
        showToast({
          type: 'error',
          title: 'Error',
          message: errorMessage || 'No se pudo actualizar la configuracion',
          duration: 5000,
        });
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [showToast],
  );

  /**
   * Delete a configuration
   */
  const deleteConfiguration = useCallback(
    async (id: string): Promise<void> => {
      setSaving(true);
      setError(null);

      try {
        await alertConfigApi.deleteConfiguration(id);

        // Remove from local state
        setConfigurations((prev) => prev.filter((config) => config.id !== id));

        showToast({
          type: 'success',
          title: 'Configuracion eliminada',
          message: 'La configuracion se elimino correctamente',
          duration: 3000,
        });
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(new Error(errorMessage));
        showToast({
          type: 'error',
          title: 'Error',
          message: errorMessage || 'No se pudo eliminar la configuracion',
          duration: 5000,
        });
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [showToast],
  );

  /**
   * Toggle enabled state
   */
  const toggleEnabled = useCallback(
    async (id: string, enabled: boolean): Promise<void> => {
      await updateConfiguration(id, { is_enabled: enabled });
    },
    [updateConfiguration],
  );

  /**
   * Initialize defaults for all alert types
   */
  const initializeDefaults = useCallback(
    async (initClassroomId?: string): Promise<void> => {
      setSaving(true);
      setError(null);

      try {
        const newConfigs = await alertConfigApi.initializeDefaults(
          initClassroomId || classroomId,
        );

        if (newConfigs.length > 0) {
          setConfigurations((prev) => [...prev, ...newConfigs]);
          showToast({
            type: 'success',
            title: 'Configuraciones inicializadas',
            message: `Se crearon ${newConfigs.length} configuraciones con valores por defecto`,
            duration: 3000,
          });
        } else {
          showToast({
            type: 'info',
            title: 'Sin cambios',
            message: 'Todas las configuraciones ya existen',
            duration: 3000,
          });
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(new Error(errorMessage));
        showToast({
          type: 'error',
          title: 'Error',
          message: errorMessage || 'No se pudieron inicializar las configuraciones',
          duration: 5000,
        });
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [classroomId, showToast],
  );

  /**
   * Refresh data
   */
  const refresh = useCallback(() => {
    fetchConfigurations();
  }, [fetchConfigurations]);

  return {
    configurations,
    defaults,
    loading,
    saving,
    error,
    fetchConfigurations,
    createConfiguration,
    updateConfiguration,
    deleteConfiguration,
    toggleEnabled,
    initializeDefaults,
    refresh,
  };
};

// Re-export types for convenience
export { AlertConfigType } from '../../../services/api/teacher/alertConfigApi';
export type {
  AlertConfigResponse,
  AlertConfigDefaults,
  CreateAlertConfigDto,
  UpdateAlertConfigDto,
} from '../../../services/api/teacher/alertConfigApi';
