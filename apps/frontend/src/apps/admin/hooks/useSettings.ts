/**
 * useSettings Hook
 *
 * @deprecated This hook is not currently in use.
 * AdminSettingsPage components (GeneralSettings, SecuritySettings) use
 * useSystemConfig hook instead, which provides simpler category-based config management.
 *
 * This hook was initially designed with additional features (sendTestEmail, createBackup, etc.)
 * but those features are not yet implemented in the backend.
 *
 * Manages system settings and configuration.
 * Updated: 2025-11-28 - Marked as deprecated, use useSystemConfig instead
 * Created: 2025-11-19 - Created for AdminSettingsPage integration (FE-059)
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useCallback } from 'react';
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
  sessionDuration: number; // minutes
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
  updateSettings: (category: SettingsCategory, data: any) => Promise<void>;
  resetToDefaults: (category: SettingsCategory) => Promise<void>;
  sendTestEmail: () => Promise<void>;
  enableMaintenanceMode: () => Promise<void>;
  createBackup: () => Promise<void>;
  clearCache: () => Promise<void>;
}

export function useSettings(initialSection: SettingsCategory = 'general'): UseSettingsResult {
  // State
  const [settings, setSettings] = useState<Partial<SystemSettings>>({});
  const [activeSection, setActiveSection] = useState<SettingsCategory>(initialSection);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * Fetch settings for a specific category
   */
  const fetchSettings = useCallback(async (category: SettingsCategory): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminAPI.settings.getCategoryConfig(category);
      setSettings((prev) => ({
        ...prev,
        [category]: data,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar configuración';
      setError(message);
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update settings for a specific category
   */
  const updateSettings = useCallback(
    async (category: SettingsCategory, data: any): Promise<void> => {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);
      try {
        await adminAPI.settings.updateCategoryConfig(category, data);

        // Update local state
        setSettings((prev) => ({
          ...prev,
          [category]: data,
        }));

        setSuccessMessage('Configuración guardada correctamente');

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al guardar configuración';
        setError(message);
        console.error('Failed to update settings:', err);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  /**
   * Reset settings to defaults for a category
   */
  const resetToDefaults = useCallback(async (category: SettingsCategory): Promise<void> => {
    setSaving(true);
    setError(null);
    try {
      // Note: resetDefaults endpoint not available in adminAPI yet
      // Using getCategoryConfig to reload defaults as temporary workaround
      const defaults = await adminAPI.settings.getCategoryConfig(category);

      // Update local state
      setSettings((prev) => ({
        ...prev,
        [category]: defaults,
      }));

      setSuccessMessage('Configuración restablecida a valores por defecto');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al restablecer configuración';
      setError(message);
      console.error('Failed to reset settings:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  /**
   * Send test email (SMTP verification)
   */
  const sendTestEmail = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      // TODO: Add endpoint to adminAPI when available
      // await adminAPI.settings.testEmail();

      // Temporary mock
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccessMessage('Email de prueba enviado correctamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al enviar email de prueba';
      setError(message);
      console.error('Failed to send test email:', err);
      throw err;
    }
  }, []);

  /**
   * Enable maintenance mode
   */
  const enableMaintenanceMode = useCallback(async (): Promise<void> => {
    setSaving(true);
    setError(null);
    try {
      // TODO: Add specific endpoint when available
      await updateSettings('maintenance', {
        ...settings.maintenance,
        maintenanceMode: true,
      });

      setSuccessMessage('Modo mantenimiento activado');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al activar modo mantenimiento';
      setError(message);
      console.error('Failed to enable maintenance mode:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [settings.maintenance, updateSettings]);

  /**
   * Create database backup
   */
  const createBackup = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      // TODO: Add endpoint to adminAPI when available
      // await adminAPI.maintenance.createBackup();

      // Temporary mock
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update maintenance settings with new backup time
      const now = new Date().toISOString();
      setSettings((prev) => ({
        ...prev,
        maintenance: {
          ...(prev.maintenance as MaintenanceSettings),
          lastBackup: now,
        },
      }));

      setSuccessMessage('Respaldo de base de datos creado correctamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear respaldo';
      setError(message);
      console.error('Failed to create backup:', err);
      throw err;
    }
  }, []);

  /**
   * Clear system cache
   */
  const clearCache = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      // TODO: Add endpoint to adminAPI when available
      // await adminAPI.maintenance.clearCache();

      // Temporary mock
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccessMessage('Caché del sistema limpiada correctamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al limpiar caché';
      setError(message);
      console.error('Failed to clear cache:', err);
      throw err;
    }
  }, []);

  return {
    // Data
    settings,
    activeSection,

    // State
    loading,
    saving,
    error,
    successMessage,

    // Actions
    setActiveSection,
    fetchSettings,
    updateSettings,
    resetToDefaults,
    sendTestEmail,
    enableMaintenanceMode,
    createBackup,
    clearCache,
  };
}
