/**
 * useModules Hook
 *
 * Custom hook for managing modules data from the educational API
 */

import { useState, useEffect, useCallback } from 'react';
import { getModules, getModule, getModuleExercises } from '@/services/api/educationalAPI';
import type { Module, Exercise } from '@shared/types';

interface UseModulesReturn {
  modules: Module[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  isRefreshing: boolean;
}

/**
 * Hook to fetch all modules
 */
export function useModules(): UseModulesReturn {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchModules = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const data = await getModules();
      setModules(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch modules'));
      console.error('Error fetching modules:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const refresh = useCallback(() => {
    return fetchModules(true);
  }, [fetchModules]);

  return {
    modules,
    loading,
    error,
    refresh,
    isRefreshing,
  };
}

interface UseModuleDetailReturn {
  module: Module | null;
  exercises: Exercise[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch a single module with its exercises
 */
export function useModuleDetail(moduleId: string): UseModuleDetailReturn {
  const [module, setModule] = useState<Module | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchModuleDetail = useCallback(async () => {
    console.log('📡 [useModuleDetail] fetchModuleDetail called', { moduleId });
    setLoading(true);
    setError(null);

    try {
      console.log('📡 [useModuleDetail] Fetching module and exercises...');
      const [moduleData, exercisesData] = await Promise.all([
        getModule(moduleId),
        getModuleExercises(moduleId),
      ]);

      console.log('✅ [useModuleDetail] Data received:', {
        hasModule: !!moduleData,
        moduleTitle: moduleData?.title,
        exercisesCount: exercisesData?.length,
      });

      setModule(moduleData);
      setExercises(exercisesData);
    } catch (err) {
      console.error('❌ [useModuleDetail] Error fetching module detail:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch module'));
    } finally {
      setLoading(false);
      console.log('🏁 [useModuleDetail] Fetch completed');
    }
  }, [moduleId]);

  useEffect(() => {
    if (moduleId) {
      fetchModuleDetail();
    }
  }, [moduleId, fetchModuleDetail]);

  return {
    module,
    exercises,
    loading,
    error,
    refresh: fetchModuleDetail,
  };
}
