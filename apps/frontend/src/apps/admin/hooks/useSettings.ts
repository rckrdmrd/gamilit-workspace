/**
 * useSettings Hook
 *
 * @deprecated This hook is not currently in use.
 * AdminSettingsPage components (GeneralSettings, SecuritySettings) use
 * useSystemConfig hook instead, which provides simpler category-based config management.
 *
 * Migrated to React Query for consistency with other admin hooks.
 *
 * Manages system settings and configuration.
 * Updated: 2025-11-28 - Marked as deprecated, use useSystemConfig instead
 * Updated: 2026-02-20 - Migrated to React Query
 */
import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/services/api/adminAPI';

export type SettingsCategory = 'general' | 'email' | 'notifications' | 'security' | 'maintenance';

export interface GeneralSettings {
  platformName: string;
  platformUrl: string;
  logoUrl: string;
  defaultLanguage: string;
  timezone: string;
}

export interface EmailSettings {
  smtpServer: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword?: string;
  useTLS: boolean;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  systemNotifications: boolean;
}

export interface SecuritySettings {
  sessionDuration: number;
  maxLoginAttempts: number;
  require2FA: boolean;
}

export interface MaintenanceSettings {
  maintenanceMode: boolean;
  lastBackup?: string;
}

export interface SystemSettings {
  general: GeneralSettings;
  email: EmailSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  maintenance: MaintenanceSettings;
}

export interface UseSettingsResult {
  // Data
  settings: Partial<SystemSettings>;
  activeSection: SettingsCategory;

  // State
  loading: boolean;
  saving: boolean;
  error: string | null;
  successMessage: string | null;

  // Actions
  setActiveSection: (section: SettingsCategory) => void;
  fetchSettings: (category: SettingsCategory) => Promise<void>;
  updateSettings: (category: SettingsCategory, data: Record<string, unknown>) => Promise<void>;
  resetToDefaults: (category: SettingsCategory) => Promise<void>;
  enableMaintenanceMode: () => Promise<void>;
}

// ============================================================================
// Query Key Factories
// ============================================================================

const settingsKeys = {
  all: ['admin', 'settings'] as const,
  category: (cat: SettingsCategory) => ['admin', 'settings', cat] as const,
};

export function useSettings(initialSection: SettingsCategory = 'general'): UseSettingsResult {
  const queryClient = useQueryClient();

  // Client-side state
  const [settings, setSettings] = useState<Partial<SystemSettings>>({});
  const [activeSection, setActiveSection] = useState<SettingsCategory>(initialSection);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const updateMutation = useMutation({
    mutationFn: async ({ category, data }: { category: SettingsCategory; data: Record<string, unknown> }) => {
      await adminAPI.settings.updateCategoryConfig(category, data);
      return { category, data };
    },
    onSuccess: ({ category, data }) => {
      setSettings((prev) => ({ ...prev, [category]: data }));
      queryClient.invalidateQueries({ queryKey: settingsKeys.category(category) });
      setSuccessMessage('Configuracion guardada correctamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const fetchSettings = useCallback(async (category: SettingsCategory): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminAPI.settings.getCategoryConfig(category);
      setSettings((prev) => ({ ...prev, [category]: data }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar configuracion';
      setError(message);
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(
    async (category: SettingsCategory, data: Record<string, unknown>): Promise<void> => {
      setError(null);
      setSuccessMessage(null);
      try {
        await updateMutation.mutateAsync({ category, data });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al guardar configuracion';
        setError(message);
        throw err;
      }
    },
    [updateMutation],
  );

  const resetToDefaults = useCallback(async (category: SettingsCategory): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const defaults = await adminAPI.settings.getCategoryConfig(category);
      setSettings((prev) => ({ ...prev, [category]: defaults }));
      setSuccessMessage('Configuracion restablecida a valores por defecto');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al restablecer configuracion';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const enableMaintenanceMode = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      await updateSettings('maintenance', {
        ...settings.maintenance,
        maintenanceMode: true,
      });
      setSuccessMessage('Modo mantenimiento activado');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al activar modo mantenimiento';
      setError(message);
      throw err;
    }
  }, [settings.maintenance, updateSettings]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    settings,
    activeSection,
    loading: loading || updateMutation.isPending,
    saving: updateMutation.isPending,
    error,
    successMessage,
    setActiveSection,
    fetchSettings,
    updateSettings,
    resetToDefaults,
    enableMaintenanceMode,
  };
}
