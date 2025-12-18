/**
 * useClassroomsList Hook
 *
 * Fetches list of classrooms for admin progress page selectors.
 * Replaces MOCK_CLASSROOMS with real data from API.
 *
 * @module apps/admin/hooks/useClassroomsList
 * @created 2025-12-14
 */

import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '@/services/api/adminAPI';
import type { ClassroomBasic } from '@/services/api/adminTypes';

export interface UseClassroomsListParams {
  schoolId?: string;
  enabled?: boolean;
}

export interface UseClassroomsListReturn {
  classrooms: ClassroomBasic[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch list of classrooms for admin selectors
 *
 * @param params - Optional parameters for filtering
 * @returns Classrooms list with loading and error states
 *
 * @example
 * ```tsx
 * const { classrooms, isLoading, error } = useClassroomsList();
 *
 * if (isLoading) return <Spinner />;
 *
 * return (
 *   <ClassroomSelector
 *     classrooms={classrooms}
 *     onSelect={setSelectedClassroom}
 *   />
 * );
 * ```
 */
export function useClassroomsList(params: UseClassroomsListParams = {}): UseClassroomsListReturn {
  const { schoolId, enabled = true } = params;

  const {
    data: classrooms = [],
    isLoading,
    error,
    refetch,
  } = useQuery<ClassroomBasic[], Error>({
    queryKey: ['admin', 'classrooms', schoolId],
    queryFn: () => adminAPI.classrooms.getAll({ schoolId }),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
    gcTime: 10 * 60 * 1000, // 10 minutes - cache garbage collection
    refetchOnWindowFocus: false,
    retry: 2,
  });

  return {
    classrooms,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
