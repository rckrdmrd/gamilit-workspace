/**
 * useModules Hook
 * Custom hook for fetching module and exercise data from the API
 *
 * FIX 2026-01-13: Usar educationalAPI en lugar de apiClient directo
 * para respetar FEATURE_FLAGS.USE_MOCK_DATA
 */

import { useState, useEffect } from 'react';
import { getModule, getModuleExercises } from '@/services/api/educationalAPI';
import { apiClient } from '@/services/api/apiClient';

interface Module {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  estimated_duration_minutes: number;
  xp_reward: number;
  ml_coins_reward: number;
  total_exercises?: number;
  completed_exercises?: number;
  progress?: number;
  completed?: boolean;
  [key: string]: any;
}

interface Exercise {
  id: string;
  module_id: string;
  title: string;
  description: string;
  exercise_type: string;
  difficulty_level: string;
  max_points: number;
  xp_reward: number;
  ml_coins_reward: number;
  order_index: number;
  completed?: boolean;
  [key: string]: any;
}

interface ModuleProgress {
  id: string;
  user_id: string;
  module_id: string;
  status: string;
  progress_percentage: number;
  completed_exercises: number;
  total_exercises: number;
  total_xp_earned: number;
  total_ml_coins_earned: number;
}

interface UseModuleDetailReturn {
  module: Module | null;
  exercises: Exercise[];
  progress: ModuleProgress | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch a specific module, its exercises, and user progress
 * @param moduleId - The ID of the module to fetch
 * @param userId - Optional user ID to fetch progress for
 * @returns Object containing module, exercises, progress, loading state, and error
 */
export function useModuleDetail(moduleId: string, userId?: string): UseModuleDetailReturn {
  const [module, setModule] = useState<Module | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [progress, setProgress] = useState<ModuleProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Guard against undefined, empty string, or literal "undefined" string
    if (!moduleId || moduleId === 'undefined') {
      setLoading(false);
      return;
    }

    const fetchModuleDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        // FIX 2026-01-13: Usar educationalAPI para respetar FEATURE_FLAGS.USE_MOCK_DATA
        // Esto permite usar mock data cuando VITE_USE_MOCK_DATA=true
        console.log(`[useModuleDetail] Fetching module: ${moduleId}`);
        const moduleData = await getModule(moduleId);
        setModule(moduleData as Module);

        // Fetch exercises for this specific module
        console.log(`[useModuleDetail] Fetching exercises for module: ${moduleId}`);
        const moduleExercises = await getModuleExercises(moduleId);
        console.log(`[useModuleDetail] Module exercises:`, moduleExercises);

        // Sort by order_index (backend should already sort, but ensure order)
        // Cast to local Exercise type for compatibility
        const sortedExercises = Array.isArray(moduleExercises)
          ? (moduleExercises as unknown as Exercise[]).sort((a, b) => a.order_index - b.order_index)
          : [];

        console.log(
          `[useModuleDetail] Final sorted exercises (${sortedExercises.length}):`,
          sortedExercises,
        );
        setExercises(sortedExercises);

        // ✅ FIX: Fetch user progress for this module if userId is provided
        if (userId) {
          try {
            const progressResponse = await apiClient.get(
              `/progress/users/${userId}/modules/${moduleId}`,
            );
            setProgress(progressResponse.data);
            console.log('[useModuleDetail] Progress fetched:', progressResponse.data);
          } catch (progressErr) {
            // Progress not found is ok - user hasn't started module yet
            console.log('[useModuleDetail] No progress found for module:', moduleId);
            setProgress(null);
          }
        }
      } catch (err) {
        console.error('Error fetching module detail:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchModuleDetail();
  }, [moduleId, userId]);

  return {
    module,
    exercises,
    progress,
    loading,
    error,
  };
}
