/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { adminAPI } from '@/services/api/adminAPI';
import type { SystemConfig } from '@/services/api/adminTypes';

/**
 * Hook for managing system configuration by category
 *
 * @param category - Configuration category (general, email, notifications, security, maintenance)
 * @returns Configuration data, loading state, error, and update functions
 */
export function useSystemConfig(
  category?: 'general' | 'email' | 'notifications' | 'security' | 'maintenance',
) {
  const [config, setConfig] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch configuration (by category or full config)
   */
  const fetchConfig = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let data: any;
      if (category) {
        // Fetch by category
        data = await adminAPI.settings.getCategoryConfig(category);
      } else {
        // Fetch full config
        data = await adminAPI.settings.getConfig();
      }
      setConfig(data);
      return data;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch system configuration';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  /**
   * Update configuration (by category or full config)
   */
  const updateConfig = useCallback(
    async (values: Record<string, unknown>) => {
      setIsLoading(true);
      setError(null);
      try {
        let data: any;
        if (category) {
          // Update by category
          data = await adminAPI.settings.updateCategoryConfig(category, values);
        } else {
          // Update full config
          data = await adminAPI.settings.updateConfig(values as SystemConfig);
        }
        setConfig(data);
        return data;
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update system configuration';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [category],
  );

  /**
   * Reset local state
   */
  const reset = useCallback(() => {
    setConfig(null);
    setError(null);
  }, []);

  return {
    config,
    isLoading,
    error,
    fetchConfig,
    updateConfig,
    reset,
  };
}
