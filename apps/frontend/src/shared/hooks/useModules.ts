/**
 * useModules Hook
 * Custom hook for fetching module and exercise data from the API
 */

import { useState, useEffect } from 'react';
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
    if (!moduleId) {
      setLoading(false);
      return;
    }

    const fetchModuleDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch module details using apiClient
        const moduleResponse = await apiClient.get(`/educational/modules/${moduleId}`);

        // apiClient unwraps the response automatically
        // Backend sends: { success: true, data: {...}, ... }
        // apiClient extracts: {...}
        setModule(moduleResponse.data);

        // Fetch all exercises (with completed field) using apiClient
        const exercisesResponse = await apiClient.get('/educational/exercises');

        // apiClient unwraps the response automatically
        // Backend sends: { success: true, data: [...], ... }
        // apiClient extracts: [...]
        const allExercises = exercisesResponse.data;

        // Filter exercises for this module and sort by order_index
        const moduleExercises = allExercises
          .filter((ex: Exercise) => ex.module_id === moduleId)
          .sort((a: Exercise, b: Exercise) => a.order_index - b.order_index);

        setExercises(moduleExercises);

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
