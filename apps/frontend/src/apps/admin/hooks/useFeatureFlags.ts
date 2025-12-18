/**
 * useFeatureFlags Hook
 *
 * Hook for managing feature flags with CRUD operations.
 *
 * Features:
 * - List, create, update, delete feature flags
 * - Toggle flags on/off
 * - Filter flags by status
 * - Error handling and loading states
 *
 * Backend Endpoints:
 * - GET /admin/feature-flags
 * - POST /admin/feature-flags
 * - PUT /admin/feature-flags/:key
 * - DELETE /admin/feature-flags/:key
 *
 * Note: Backend endpoints NOT YET IMPLEMENTED
 * Currently uses mock data for development
 *
 * Created: 2025-12-05 - FE-ADMIN-011-016 (Sprint P2-B)
 */

import { useState, useCallback } from 'react';
import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';
import type { FeatureFlag, CreateFlagDto, UpdateFlagDto } from '../types';

export interface UseFeatureFlagsResult {
  flags: FeatureFlag[];
  loading: boolean;
  error: string | null;
  createFlag: (data: CreateFlagDto) => Promise<void>;
  updateFlag: (key: string, data: UpdateFlagDto) => Promise<void>;
  deleteFlag: (key: string) => Promise<void>;
  toggleFlag: (key: string) => Promise<void>;
  fetchFlags: () => Promise<void>;
}

// Mock data for development until backend is implemented
const MOCK_FLAGS: FeatureFlag[] = [
  {
    id: '1',
    key: 'ai_assistant_beta',
    name: 'AI Assistant Beta',
    description: 'Enable AI-powered learning assistant for selected users',
    isEnabled: true,
    rolloutPercentage: 25,
    targetRoles: ['admin_teacher'],
    targetUsers: [],
    createdAt: '2024-09-01T00:00:00Z',
    updatedAt: '2024-10-15T10:30:00Z',
    createdBy: 'admin@gamilit.com',
    lastModifiedBy: 'admin@gamilit.com',
  },
  {
    id: '2',
    key: 'new_dashboard_ui',
    name: 'New Dashboard UI',
    description: 'Redesigned student dashboard with improved UX',
    isEnabled: false,
    rolloutPercentage: 0,
    targetRoles: [],
    targetUsers: ['user1@test.com', 'user2@test.com'],
    createdAt: '2024-10-01T00:00:00Z',
    updatedAt: '2024-10-10T14:20:00Z',
    createdBy: 'admin@gamilit.com',
    lastModifiedBy: 'admin@gamilit.com',
  },
  {
    id: '3',
    key: 'gamification_v2',
    name: 'Gamification V2',
    description: 'Enhanced gamification system with new achievements',
    isEnabled: true,
    rolloutPercentage: 100,
    targetRoles: ['student', 'admin_teacher'],
    targetUsers: [],
    createdAt: '2024-08-15T00:00:00Z',
    updatedAt: '2024-09-30T09:00:00Z',
    createdBy: 'admin@gamilit.com',
    lastModifiedBy: 'admin@gamilit.com',
  },
];

const USE_MOCK_DATA = true; // Set to false when backend is ready

export function useFeatureFlags(): UseFeatureFlagsResult {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all feature flags
   */
  const fetchFlags = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        setFlags(MOCK_FLAGS);
        return;
      }

      const response = await apiClient.get<FeatureFlag[]>(
        `${API_ENDPOINTS.admin.base}/feature-flags`,
      );
      setFlags(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch feature flags';
      setError(message);
      console.error('[useFeatureFlags] fetchFlags error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new feature flag
   */
  const createFlag = useCallback(
    async (data: CreateFlagDto) => {
      setLoading(true);
      setError(null);

      try {
        if (USE_MOCK_DATA) {
          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 500));

          const newFlag: FeatureFlag = {
            id: Date.now().toString(),
            key: data.key,
            name: data.name,
            description: data.description,
            isEnabled: data.isEnabled ?? false,
            rolloutPercentage: data.rolloutPercentage ?? 0,
            targetRoles: data.targetRoles ?? [],
            targetUsers: data.targetUsers ?? [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'admin@gamilit.com',
            lastModifiedBy: 'admin@gamilit.com',
          };

          setFlags((prev) => [...prev, newFlag]);
          return;
        }

        const response = await apiClient.post<FeatureFlag>(
          `${API_ENDPOINTS.admin.base}/feature-flags`,
          data,
        );
        setFlags((prev) => [...prev, response.data]);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create feature flag';
        setError(message);
        console.error('[useFeatureFlags] createFlag error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Update an existing feature flag
   */
  const updateFlag = useCallback(
    async (key: string, data: UpdateFlagDto) => {
      setLoading(true);
      setError(null);

      try {
        if (USE_MOCK_DATA) {
          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 500));

          setFlags((prev) =>
            prev.map((flag) =>
              flag.key === key
                ? {
                    ...flag,
                    ...data,
                    updatedAt: new Date().toISOString(),
                    lastModifiedBy: 'admin@gamilit.com',
                  }
                : flag,
            ),
          );
          return;
        }

        const response = await apiClient.put<FeatureFlag>(
          `${API_ENDPOINTS.admin.base}/feature-flags/${key}`,
          data,
        );
        setFlags((prev) => prev.map((flag) => (flag.key === key ? response.data : flag)));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update feature flag';
        setError(message);
        console.error('[useFeatureFlags] updateFlag error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Delete a feature flag
   */
  const deleteFlag = useCallback(
    async (key: string) => {
      setLoading(true);
      setError(null);

      try {
        if (USE_MOCK_DATA) {
          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 500));
          setFlags((prev) => prev.filter((flag) => flag.key !== key));
          return;
        }

        await apiClient.delete(`${API_ENDPOINTS.admin.base}/feature-flags/${key}`);
        setFlags((prev) => prev.filter((flag) => flag.key !== key));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete feature flag';
        setError(message);
        console.error('[useFeatureFlags] deleteFlag error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Toggle a feature flag on/off
   */
  const toggleFlag = useCallback(
    async (key: string) => {
      const flag = flags.find((f) => f.key === key);
      if (!flag) {
        setError(`Flag with key "${key}" not found`);
        return;
      }

      await updateFlag(key, { isEnabled: !flag.isEnabled });
    },
    [flags, updateFlag],
  );

  return {
    flags,
    loading,
    error,
    createFlag,
    updateFlag,
    deleteFlag,
    toggleFlag,
    fetchFlags,
  };
}
