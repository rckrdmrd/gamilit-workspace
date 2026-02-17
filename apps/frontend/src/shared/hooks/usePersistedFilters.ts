/**
 * usePersistedFilters Hook
 *
 * Manages filter persistence with versioning and schema validation.
 * Provides a robust solution for storing user filter preferences in localStorage
 * with automatic cleanup of obsolete data.
 *
 * @features
 * - Schema versioning to invalidate obsolete filters
 * - Type-safe filter state management
 * - Automatic migration/cleanup on version changes
 * - Reusable across different pages/components
 * - Error handling and fallback to defaults
 *
 * @example
 * ```typescript
 * interface MyFilters {
 *   category: string;
 *   status: 'all' | 'active' | 'inactive';
 *   sortBy: string;
 * }
 *
 * const defaultFilters: MyFilters = {
 *   category: 'all',
 *   status: 'all',
 *   sortBy: 'date'
 * };
 *
 * const { filters, updateFilters, resetFilters } = usePersistedFilters({
 *   storageKey: 'my-page-filters',
 *   defaultFilters,
 *   version: '1.0.0'
 * });
 * ```
 *
 * @todo Future enhancement: Integrate with backend user preferences API
 * @see /apps/backend/src/modules/auth/controllers/users.controller.ts (lines 108-163)
 * @see /apps/backend/src/modules/auth/entities/user-preferences.entity.ts
 *
 * @created 2025-11-28
 * @issue P2-002 - Local Filter Storage Without Synchronization
 */

import { useState, useEffect, useCallback } from 'react';
import { storage } from '@/shared/utils/storage.util';

interface PersistedFiltersOptions<T> {
  /**
   * Unique key for localStorage
   * @example 'achievements-filters', 'leaderboard-filters'
   */
  storageKey: string;

  /**
   * Default filter values
   */
  defaultFilters: T;

  /**
   * Schema version string
   * Increment this when filter structure changes to invalidate old data
   * @example '1.0.0', '1.1.0', '2.0.0'
   */
  version: string;

  /**
   * Optional validator function to verify filter integrity
   * Returns true if filters are valid, false otherwise
   */
  validator?: (filters: T) => boolean;

  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean;
}

interface PersistedData<T> {
  filters: T;
  version: string;
  timestamp: number;
}

/**
 * Hook for managing persisted filters with versioning
 */
export function usePersistedFilters<T extends object>({
  storageKey,
  defaultFilters,
  version,
  validator,
  debug = false,
}: PersistedFiltersOptions<T>) {
  const [filters, setFilters] = useState<T>(defaultFilters);
  const [isLoaded, setIsLoaded] = useState(false);

  const log = useCallback(
    (message: string, data?: unknown) => {
      if (debug) {
        console.log(`[usePersistedFilters:${storageKey}] ${message}`, data || '');
      }
    },
    [debug, storageKey],
  );

  // Load filters from localStorage on mount
  useEffect(() => {
    const loadFilters = () => {
      try {
        const stored = storage.getItem<PersistedData<T>>(storageKey);

        if (!stored) {
          log('No stored filters found, using defaults');
          setFilters(defaultFilters);
          setIsLoaded(true);
          return;
        }

        // Version check
        if (stored.version !== version) {
          log('Version mismatch, clearing old filters', {
            stored: stored.version,
            current: version,
          });
          storage.removeItem(storageKey);
          setFilters(defaultFilters);
          setIsLoaded(true);
          return;
        }

        // Validate filters if validator is provided
        if (validator && !validator(stored.filters)) {
          log('Validation failed, using defaults');
          storage.removeItem(storageKey);
          setFilters(defaultFilters);
          setIsLoaded(true);
          return;
        }

        // Check if stored filters have all required keys from defaultFilters
        const missingKeys = Object.keys(defaultFilters).filter((key) => !(key in stored.filters));

        if (missingKeys.length > 0) {
          log('Missing keys in stored filters, merging with defaults', { missingKeys });
          // Merge with defaults to add any new keys
          const mergedFilters = { ...defaultFilters, ...stored.filters };
          setFilters(mergedFilters);
          setIsLoaded(true);
          return;
        }

        log('Loaded filters successfully', stored.filters);
        setFilters(stored.filters);
        setIsLoaded(true);
      } catch (error) {
        console.error(`[usePersistedFilters:${storageKey}] Error loading filters:`, error);
        setFilters(defaultFilters);
        setIsLoaded(true);
      }
    };

    loadFilters();
  }, [storageKey, defaultFilters, version, validator, log]);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    // Don't save before initial load to avoid overwriting with defaults
    if (!isLoaded) return;

    try {
      const dataToStore: PersistedData<T> = {
        filters,
        version,
        timestamp: Date.now(),
      };

      storage.setItem(storageKey, dataToStore);
      log('Saved filters', filters);
    } catch (error) {
      console.error(`[usePersistedFilters:${storageKey}] Error saving filters:`, error);
    }
  }, [filters, storageKey, version, isLoaded, log]);

  /**
   * Update a single filter field
   */
  const updateFilter = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  /**
   * Update multiple filter fields at once
   */
  const updateFilters = useCallback((updates: Partial<T>) => {
    setFilters((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  /**
   * Reset filters to default values
   */
  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
    log('Reset filters to defaults');
  }, [defaultFilters, log]);

  /**
   * Clear persisted data from localStorage
   */
  const clearPersistedData = useCallback(() => {
    storage.removeItem(storageKey);
    log('Cleared persisted data');
  }, [storageKey, log]);

  /**
   * Manually save current filters (useful for explicit save actions)
   */
  const saveFilters = useCallback(() => {
    const dataToStore: PersistedData<T> = {
      filters,
      version,
      timestamp: Date.now(),
    };
    storage.setItem(storageKey, dataToStore);
    log('Manually saved filters', filters);
  }, [filters, storageKey, version, log]);

  return {
    /** Current filter values */
    filters,

    /** Update a single filter field */
    updateFilter,

    /** Update multiple filter fields at once */
    updateFilters,

    /** Reset filters to default values */
    resetFilters,

    /** Clear persisted data from localStorage */
    clearPersistedData,

    /** Manually save current filters */
    saveFilters,

    /** Whether filters have been loaded from storage */
    isLoaded,
  };
}

/**
 * Utility to clean up all persisted filters (for logout/reset scenarios)
 *
 * @param prefix - Optional prefix to match keys (e.g., 'filters-')
 */
export function clearAllPersistedFilters(prefix?: string): void {
  try {
    const keys = Object.keys(localStorage);
    const keysToRemove = prefix
      ? keys.filter((key) => key.includes(prefix))
      : keys.filter((key) => key.includes('filters'));

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    console.log(`[usePersistedFilters] Cleared ${keysToRemove.length} persisted filter keys`);
  } catch (error) {
    console.error('[usePersistedFilters] Error clearing persisted filters:', error);
  }
}
