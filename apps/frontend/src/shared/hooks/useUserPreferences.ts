/**
 * useUserPreferences Hook
 *
 * Custom hook for loading and managing user preferences from the backend.
 * Provides loading states and falls back to defaults if the API fails.
 *
 * @example
 * ```tsx
 * const { preferences, loading, error, refetch } = useUserPreferences();
 *
 * if (loading) return <Spinner />;
 * if (error) return <ErrorMessage />;
 *
 * return <div>Theme: {preferences.theme}</div>;
 * ```
 */

import { useState, useEffect } from 'react';
import { profileAPI } from '@/services/api/profileAPI';

/**
 * User preferences structure matching backend entity
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'es' | 'en';
  notifications_enabled: boolean;
  email_notifications: boolean;
  sound_enabled: boolean;
  tutorial_completed: boolean;
  preferences: Record<string, unknown>;
}

/**
 * Default preferences fallback
 */
const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  language: 'es',
  notifications_enabled: true,
  email_notifications: true,
  sound_enabled: true,
  tutorial_completed: false,
  preferences: {},
};

/**
 * Hook return type
 */
export interface UseUserPreferencesReturn {
  preferences: UserPreferences;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to load user preferences from backend
 *
 * @returns User preferences with loading state and refetch function
 */
export function useUserPreferences(): UseUserPreferencesReturn {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await profileAPI.getPreferences();

      // Merge backend preferences with defaults to ensure all fields exist
      const mergedPreferences: UserPreferences = {
        ...DEFAULT_PREFERENCES,
        ...response.preferences,
      };

      setPreferences(mergedPreferences);
    } catch (err) {
      console.error('Error fetching user preferences:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch preferences'));

      // Fall back to defaults on error
      setPreferences(DEFAULT_PREFERENCES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  return {
    preferences,
    loading,
    error,
    refetch: fetchPreferences,
  };
}
