/**
 * useUserModules Hook
 *
 * Custom hook for fetching user-specific modules data with progress
 * from the educational API.
 */

import { useState, useEffect, useCallback } from 'react';
import { getUserModules } from '@/services/api/educationalAPI';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { Module } from '@shared/types';

export interface UserModuleData {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'in_progress' | 'available' | 'locked';
  progress: number; // 0-100
  totalExercises: number;
  completedExercises: number;
  estimatedTime: number; // minutos
  xpReward: number;
  icon: string;
  category: string;
  mlCoinsReward?: number;
}

interface UseUserModulesReturn {
  modules: UserModuleData[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  isRefreshing: boolean;
}

/**
 * Hook to fetch user-specific modules with progress
 */
export function useUserModules(): UseUserModulesReturn {
  const { user, isAuthenticated } = useAuth();
  const [modules, setModules] = useState<UserModuleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchUserModules = useCallback(async (isRefresh = false) => {
    // Don't fetch if no user is authenticated
    if (!isAuthenticated || !user?.id) {
      setLoading(false);
      return;
    }

    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const data = await getUserModules(user.id);

      // Transform the data to match the expected UserModuleData interface
      const transformedData: UserModuleData[] = data.map((module: any) => ({
        id: module.id,
        title: module.title,
        description: module.description,
        difficulty: module.difficulty || 'medium',
        status: module.status || 'available',
        progress: module.progress || 0,
        totalExercises: module.totalExercises || 0,
        completedExercises: module.completedExercises || 0,
        estimatedTime: module.estimatedTime || 60,
        xpReward: module.xpReward || 100,
        icon: module.icon || '📚',
        category: module.category || 'science',
        mlCoinsReward: module.mlCoinsReward || 50,
      }));

      setModules(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch user modules'));
      console.error('Error fetching user modules:', err);
      // Set empty array on error instead of using mock data
      setModules([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    fetchUserModules();
  }, [fetchUserModules]);

  const refresh = useCallback(() => {
    return fetchUserModules(true);
  }, [fetchUserModules]);

  return {
    modules,
    loading,
    error,
    refresh,
    isRefreshing,
  };
}
