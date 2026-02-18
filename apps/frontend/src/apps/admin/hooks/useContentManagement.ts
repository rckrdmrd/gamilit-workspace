/**
 * useContentManagement Hook - Backward Compatibility Layer
 *
 * This file re-exports React Query hooks from useContentQueries.ts
 * to maintain backward compatibility with existing consumers.
 *
 * Original file contained 5 manual hooks (626 lines) using useState + useEffect.
 * All hooks have been migrated to React Query in useContentQueries.ts.
 *
 * Consumers:
 * - AdminContentPage.tsx -> usePendingExercises
 * - ContentApprovalQueue.tsx -> useApprovals
 * - ExerciseContentEditor.tsx -> useExercises (+ Exercise type)
 * - MediaLibraryManager.tsx -> useMediaLibrary
 * - hooks/index.ts -> useExercises, usePendingExercises, useMediaLibrary, useContentVersions
 *
 * Migration path:
 * - Import directly from './useContentQueries' for the new React Query hooks
 * - This file will be removed in a future release once all consumers are updated
 *
 * Sprint 1 - Admin Portal Refactor
 * Updated: 2026-02-18 - Migrated to React Query via useContentQueries.ts
 * Original: 2025-11-19 - Integrated with adminAPI.ts (FE-059)
 */

import type { PendingContent } from '@/services/api/adminTypes';
import type { MediaItem, ContentVersion } from '../types';
import {
  usePendingExercisesQuery,
  useMediaLibraryQuery,
  useContentVersionsQuery,
  useApprovalsQuery,
  useLegacyExercises,
  type Exercise,
  type ApprovalItem,
} from './useContentQueries';

// ============================================================================
// TYPE RE-EXPORTS (for backward compatibility)
// ============================================================================

export type { Exercise, ApprovalItem };

export interface UsePendingExercisesResult {
  pendingExercises: PendingContent[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  pageSize: number;
  fetchPendingExercises: (page?: number, pageSize?: number) => Promise<void>;
  approveExercise: (id: string) => Promise<void>;
  rejectExercise: (id: string, reason: string) => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
}

export interface UseMediaLibraryResult {
  media: MediaItem[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  pageSize: number;
  storageUsed: number;
  storageLimit: number;
  fetchMedia: (page?: number, pageSize?: number) => Promise<void>;
  uploadFile: (file: File, tags?: string[]) => Promise<MediaItem>;
  deleteMedia: (id: string) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  updateFile?: (id: string, updates: Partial<MediaItem>) => Promise<MediaItem>;
}

export interface UseContentVersionsResult {
  versions: ContentVersion[];
  loading: boolean;
  error: string | null;
  fetchVersions: (contentId?: string) => Promise<void>;
  createVersion: (contentId: string, changes: string) => Promise<void>;
}

export interface UseApprovalsResult {
  approvals: ApprovalItem[];
  loading: boolean;
  error: string | null;
  approve: (id: string) => Promise<void>;
  reject: (id: string, reason: string) => Promise<void>;
  refresh: () => Promise<void>;
}

// ============================================================================
// HOOK RE-EXPORTS (wrapping React Query hooks for backward compatibility)
// ============================================================================

/**
 * Fetches pending exercises for review.
 * Now powered by React Query (useQuery + useMutation).
 */
export function usePendingExercises(): UsePendingExercisesResult {
  const result = usePendingExercisesQuery();
  return {
    pendingExercises: result.pendingExercises,
    loading: result.loading,
    error: result.error_message,
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    fetchPendingExercises: result.fetchPendingExercises,
    approveExercise: result.approveExercise,
    rejectExercise: result.rejectExercise,
    setPage: result.setPage,
    setPageSize: result.setPageSize,
  };
}

/**
 * Fetches media files for the media library.
 * Now powered by React Query (useQuery + useMutation).
 */
export function useMediaLibrary(): UseMediaLibraryResult {
  const result = useMediaLibraryQuery();
  return {
    media: result.media,
    loading: result.loading,
    error: result.error_message,
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    storageUsed: result.storageUsed,
    storageLimit: result.storageLimit,
    fetchMedia: result.fetchMedia,
    uploadFile: result.uploadFile,
    deleteMedia: result.deleteMedia,
    deleteFile: result.deleteFile,
    bulkDelete: result.bulkDelete,
    setPage: result.setPage,
    setPageSize: result.setPageSize,
    updateFile: result.updateFile,
  };
}

/**
 * Fetches content versions / approval history.
 * Now powered by React Query (useQuery + useMutation).
 */
export function useContentVersions(): UseContentVersionsResult {
  const result = useContentVersionsQuery();
  return {
    versions: result.versions,
    loading: result.loading,
    error: result.error_message,
    fetchVersions: result.fetchVersions,
    createVersion: result.createVersion,
  };
}

/**
 * @deprecated Use usePendingExercises instead.
 * This hook now uses React Query internally via useApprovalsQuery.
 * The old manual implementation with incorrect routes has been replaced.
 *
 * @see usePendingExercises for the preferred alternative
 */
export function useApprovals(): UseApprovalsResult {
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      '[DEPRECATED] useApprovals hook is deprecated. Use usePendingExercises instead. ' +
        'This hook now uses React Query internally. See useContentQueries.ts.',
    );
  }
  return useApprovalsQuery();
}

/**
 * @deprecated Use React Query pattern directly (useLegacyExercises from useContentQueries).
 * Legacy hook for exercise CRUD operations.
 * Now powered by React Query internally.
 */
export function useExercises() {
  return useLegacyExercises();
}
