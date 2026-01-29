/**
 * useUserModules Hook
 *
 * @description Fetches user-specific modules data with progress using React Query.
 * Replaces useState + useEffect pattern with proper server state management.
 *
 * @endpoint GET /api/v1/educational/users/:userId/modules
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getUserModules } from '@/services/api/educationalAPI';
import { useAuth } from '@/features/auth/hooks/useAuth';

// ============================================================================
// Query Keys Factory
// ============================================================================

export const userModulesKeys = {
  all: ['userModules'] as const,
  user: (userId: string) => [...userModulesKeys.all, userId] as const,
  byClassroom: (userId: string, classroomId?: string) =>
    [...userModulesKeys.user(userId), 'classroom', classroomId ?? 'all'] as const,
};

// ============================================================================
// Types
// ============================================================================

export interface UserModuleData {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'in_progress' | 'available' | 'locked' | 'backlog';
  progress: number; // 0-100
  totalExercises: number;
  completedExercises: number;
  estimatedTime: number; // minutos
  xpReward: number;
  icon: string;
  category: string;
  mlCoinsReward?: number;
}

interface UseUserModulesParams {
  classroomId?: string;
}

interface UseUserModulesReturn {
  modules: UserModuleData[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  isRefreshing: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

function mapDifficulty(backendDifficulty: string): 'easy' | 'medium' | 'hard' {
  const difficultyMap: Record<string, 'easy' | 'medium' | 'hard'> = {
    beginner: 'easy',
    intermediate: 'medium',
    advanced: 'hard',
    easy: 'easy',
    medium: 'medium',
    hard: 'hard',
  };
  return difficultyMap[backendDifficulty] || 'medium';
}

function transformModuleData(module: Record<string, unknown>): UserModuleData {
  return {
    id: module.id as string,
    title: module.title as string,
    description: module.description as string,
    difficulty: mapDifficulty((module.difficulty as string) || 'medium'),
    status: (module.status as UserModuleData['status']) || 'available',
    progress: (module.progress as number) || 0,
    totalExercises: (module.totalExercises as number) || 0,
    completedExercises: (module.completedExercises as number) || 0,
    estimatedTime: (module.estimatedTime as number) || 60,
    xpReward: (module.xpReward as number) || 100,
    icon: (module.icon as string) || '📚',
    category: Array.isArray(module.category)
      ? (module.category as string[]).join(', ')
      : (module.category as string) || 'science',
    mlCoinsReward: (module.mlCoinsReward as number) || 50,
  };
}

// ============================================================================
// API Fetch Function
// ============================================================================

async function fetchUserModules(userId: string, classroomId?: string): Promise<UserModuleData[]> {
  console.log(
    '🔍 [useUserModules] Fetching modules for userId:',
    userId,
    'classroomId:',
    classroomId,
  );

  const data = await getUserModules(userId, classroomId);

  console.log('✅ [useUserModules] API response received:', {
    modulesCount: data.length,
    firstModule: data[0],
  });

  const transformedData = data.map(transformModuleData);

  console.log('✅ [useUserModules] Data transformed:', transformedData.length, 'modules');

  return transformedData;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to fetch user-specific modules with progress
 * @param params - Optional parameters including classroomId to filter modules
 */
export function useUserModules(params?: UseUserModulesParams): UseUserModulesReturn {
  const { user, isAuthenticated } = useAuth();
  const _queryClient = useQueryClient();
  const userId = user?.id;

  const {
    data: modules = [],
    isLoading: loading,
    error,
    isFetching,
    refetch,
  } = useQuery<UserModuleData[], Error>({
    queryKey: userModulesKeys.byClassroom(userId || '', params?.classroomId),
    queryFn: () => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      return fetchUserModules(userId, params?.classroomId);
    },
    enabled: isAuthenticated && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
    gcTime: 10 * 60 * 1000, // 10 minutes - cache garbage collection
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Maintain backward compatibility with existing API
  const refresh = async () => {
    await refetch();
  };

  return {
    modules,
    loading,
    error: error ?? null,
    refresh,
    isRefreshing: isFetching && !loading,
  };
}
