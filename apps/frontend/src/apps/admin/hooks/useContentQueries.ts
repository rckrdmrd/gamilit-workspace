/**
 * useContentQueries - React Query hooks for content management
 *
 * Replaces manual useState + useEffect + useCallback patterns from useContentManagement.ts
 * with proper React Query patterns (useQuery + useMutation).
 *
 * Pattern follows useGamificationConfig.ts as the canonical model.
 *
 * Sprint 1 - Admin Portal Refactor
 * Created: 2026-02-18
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';
import * as adminAPI from '@/services/api/adminAPI';
import type { MediaItem, ContentVersion } from '../types';
import toast from 'react-hot-toast';

// ============================================================================
// TYPES
// ============================================================================

export interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'facil' | 'medio' | 'dificil' | 'experto';
  points: number;
  type: string;
  instructions: string;
  content: Record<string, unknown>;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ApprovalItem {
  id: string;
  type: 'exercise' | 'content' | 'media';
  title: string;
  submittedBy: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  content?: Record<string, unknown>;
}

// ============================================================================
// QUERY KEYS
// ============================================================================

const CONTENT_QUERY_KEYS = {
  pendingExercises: (page?: number, pageSize?: number) =>
    ['admin', 'content', 'pending-exercises', { page, pageSize }] as const,
  allPending: () => ['admin', 'content', 'pending-exercises'] as const,
  mediaLibrary: (page?: number, pageSize?: number) =>
    ['admin', 'content', 'media-library', { page, pageSize }] as const,
  allMedia: () => ['admin', 'content', 'media-library'] as const,
  contentVersions: (contentId?: string) =>
    ['admin', 'content', 'versions', { contentId }] as const,
  allVersions: () => ['admin', 'content', 'versions'] as const,
  approvals: () => ['admin', 'content', 'approvals'] as const,
  exercises: () => ['admin', 'content', 'exercises'] as const,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Normalizes backend response to expected frontend format
 * Backend returns: {data: T[], total, page, limit, total_pages}
 * Frontend expects: {items: T[], pagination: {page, totalPages, totalItems, limit}}
 */
function normalizeResponse<T>(response: any): { items: T[]; pagination: any } {
  if (response.items && response.pagination) {
    return response;
  }

  if (response.data && Array.isArray(response.data)) {
    return {
      items: response.data,
      pagination: {
        page: response.page || 1,
        totalPages:
          response.total_pages || Math.ceil((response.total || 0) / (response.limit || 20)),
        totalItems: response.total || 0,
        limit: response.limit || 20,
      },
    };
  }

  if (Array.isArray(response)) {
    return {
      items: response,
      pagination: {
        page: 1,
        totalPages: 1,
        totalItems: response.length,
        limit: response.length,
      },
    };
  }

  return { items: [], pagination: { page: 1, totalPages: 0, totalItems: 0, limit: 20 } };
}

// ============================================================================
// usePendingExercisesQuery
// ============================================================================

export interface UsePendingExercisesQueryOptions {
  enabled?: boolean;
  initialPage?: number;
  initialPageSize?: number;
}

export function usePendingExercisesQuery(options: UsePendingExercisesQueryOptions = {}) {
  const { enabled = true, initialPage = 1, initialPageSize = 20 } = options;
  const queryClient = useQueryClient();
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const query = useQuery({
    queryKey: CONTENT_QUERY_KEYS.pendingExercises(page, pageSize),
    queryFn: async () => {
      const response = await adminAPI.getPendingContent({
        page,
        limit: pageSize,
      });
      return response;
    },
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 1,
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (id: string) => adminAPI.approveContent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEYS.allPending() });
      toast.success('Ejercicio aprobado correctamente');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al aprobar ejercicio');
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminAPI.rejectContent(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEYS.allPending() });
      toast.success('Ejercicio rechazado');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al rechazar ejercicio');
    },
  });

  // Backward-compatible interface
  return {
    // React Query standard interface
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,

    // Backward-compatible interface for existing consumers
    pendingExercises: query.data?.items ?? [],
    loading: query.isLoading || approveMutation.isPending || rejectMutation.isPending,
    error_message: query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null,
    total: query.data?.pagination?.totalItems ?? 0,
    page,
    pageSize,
    setPage,
    setPageSize,
    fetchPendingExercises: async (newPage?: number, newPageSize?: number) => {
      if (newPage) setPage(newPage);
      if (newPageSize) setPageSize(newPageSize);
      await query.refetch();
    },
    approveExercise: async (id: string) => {
      await approveMutation.mutateAsync(id);
    },
    rejectExercise: async (id: string, reason: string) => {
      await rejectMutation.mutateAsync({ id, reason });
    },

    // Mutations exposed directly
    approveMutation,
    rejectMutation,
  };
}

// ============================================================================
// useMediaLibraryQuery
// ============================================================================

export interface UseMediaLibraryQueryOptions {
  enabled?: boolean;
  initialPage?: number;
  initialPageSize?: number;
}

export function useMediaLibraryQuery(options: UseMediaLibraryQueryOptions = {}) {
  const { enabled = true, initialPage = 1, initialPageSize = 20 } = options;
  const queryClient = useQueryClient();
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const query = useQuery({
    queryKey: CONTENT_QUERY_KEYS.mediaLibrary(page, pageSize),
    queryFn: async () => {
      const response = await apiClient.get<any>(API_ENDPOINTS.admin.content.mediaLibrary, {
        params: {
          page,
          limit: pageSize,
        },
      });

      // Handle different response wrappers
      let rawData = response.data;
      if (response.data.success && response.data.data) {
        rawData = response.data.data;
      }

      const normalized = normalizeResponse<MediaItem>(rawData);

      // Extract storage info
      const storageUsed = rawData.storageUsed || rawData.storage_used || 0;
      const storageLimit = rawData.storageLimit || rawData.storage_limit || 0;

      return {
        ...normalized,
        storageUsed,
        storageLimit,
      };
    },
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 1,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ file, tags = [] }: { file: File; tags?: string[] }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tags', JSON.stringify(tags));

      const response = await apiClient.post<{ success: boolean; data: MediaItem }>(
        API_ENDPOINTS.admin.content.mediaLibrary,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );

      return response.data.success
        ? response.data.data
        : (response.data as unknown as MediaItem);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEYS.allMedia() });
      toast.success('Archivo subido correctamente');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al subir archivo');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(API_ENDPOINTS.admin.content.deleteMedia(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEYS.allMedia() });
      toast.success('Archivo eliminado');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al eliminar archivo');
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) =>
      Promise.all(
        ids.map((id) => apiClient.delete(API_ENDPOINTS.admin.content.deleteMedia(id))),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEYS.allMedia() });
      toast.success('Archivos eliminados');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al eliminar archivos');
    },
  });

  // Backward-compatible interface
  return {
    // React Query standard interface
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,

    // Backward-compatible interface
    media: query.data?.items ?? [],
    loading:
      query.isLoading ||
      uploadMutation.isPending ||
      deleteMutation.isPending ||
      bulkDeleteMutation.isPending,
    error_message: query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null,
    total: query.data?.pagination?.totalItems ?? 0,
    page,
    pageSize,
    storageUsed: query.data?.storageUsed ?? 0,
    storageLimit: query.data?.storageLimit ?? 0,
    setPage,
    setPageSize,
    fetchMedia: async (newPage?: number, newPageSize?: number) => {
      if (newPage) setPage(newPage);
      if (newPageSize) setPageSize(newPageSize);
      await query.refetch();
    },
    uploadFile: async (file: File, tags: string[] = []): Promise<MediaItem> => {
      return uploadMutation.mutateAsync({ file, tags });
    },
    deleteMedia: async (id: string) => {
      await deleteMutation.mutateAsync(id);
    },
    deleteFile: async (id: string) => {
      await deleteMutation.mutateAsync(id);
    },
    bulkDelete: async (ids: string[]) => {
      await bulkDeleteMutation.mutateAsync(ids);
    },
    updateFile: undefined as ((id: string, updates: Partial<MediaItem>) => Promise<MediaItem>) | undefined,

    // Mutations exposed directly
    uploadMutation,
    deleteMutation,
    bulkDeleteMutation,
  };
}

// ============================================================================
// useContentVersionsQuery
// ============================================================================

export interface UseContentVersionsQueryOptions {
  contentId?: string;
  enabled?: boolean;
}

export function useContentVersionsQuery(options: UseContentVersionsQueryOptions = {}) {
  const { contentId, enabled = true } = options;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: CONTENT_QUERY_KEYS.contentVersions(contentId),
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: ContentVersion[] }>(
        API_ENDPOINTS.admin.content.createVersion,
        {
          params: contentId ? { contentId } : undefined,
        },
      );

      const data = response.data.success
        ? response.data.data
        : (response.data as unknown as ContentVersion[]);
      return data;
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  // Create version mutation
  const createVersionMutation = useMutation({
    mutationFn: async ({ contentId: cId, changes }: { contentId: string; changes: string }) => {
      const response = await apiClient.post<{ success: boolean; data: ContentVersion }>(
        API_ENDPOINTS.admin.content.createVersion,
        { contentId: cId, changes },
      );

      return response.data.success
        ? response.data.data
        : (response.data as unknown as ContentVersion);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEYS.allVersions() });
      toast.success('Version creada correctamente');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al crear version');
    },
  });

  // Backward-compatible interface
  return {
    // React Query standard interface
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,

    // Backward-compatible interface
    versions: query.data ?? [],
    loading: query.isLoading || createVersionMutation.isPending,
    error_message: query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null,
    fetchVersions: async (newContentId?: string) => {
      // If a new contentId is provided, we need to refetch
      // Note: The caller should manage contentId via options for proper caching
      if (newContentId) {
        await queryClient.fetchQuery({
          queryKey: CONTENT_QUERY_KEYS.contentVersions(newContentId),
          queryFn: async () => {
            const response = await apiClient.get<{ success: boolean; data: ContentVersion[] }>(
              API_ENDPOINTS.admin.content.createVersion,
              { params: { contentId: newContentId } },
            );
            return response.data.success
              ? response.data.data
              : (response.data as unknown as ContentVersion[]);
          },
        });
      } else {
        await query.refetch();
      }
    },
    createVersion: async (cId: string, changes: string) => {
      await createVersionMutation.mutateAsync({ contentId: cId, changes });
    },

    // Mutations exposed directly
    createVersionMutation,
  };
}

// ============================================================================
// useApprovalsQuery (replaces deprecated useApprovals)
// ============================================================================

export interface UseApprovalsQueryOptions {
  enabled?: boolean;
}

/**
 * React Query replacement for the deprecated useApprovals hook.
 * Uses the correct pending content endpoint instead of the non-existent /admin/approvals.
 */
export function useApprovalsQuery(options: UseApprovalsQueryOptions = {}) {
  const { enabled = true } = options;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: CONTENT_QUERY_KEYS.approvals(),
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.admin.content.pending);
      const data = response.data.success ? response.data.data : response.data;

      // Map PendingContent to ApprovalItem format for backward compatibility
      const items = data.approvals || data.items || (Array.isArray(data) ? data : []);
      return items as ApprovalItem[];
    },
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 1,
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(API_ENDPOINTS.admin.content.approve(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEYS.approvals() });
      queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEYS.allPending() });
      toast.success('Elemento aprobado');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al aprobar elemento');
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiClient.post(API_ENDPOINTS.admin.content.reject(id), { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEYS.approvals() });
      queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEYS.allPending() });
      toast.success('Elemento rechazado');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al rechazar elemento');
    },
  });

  // Backward-compatible interface matching UseApprovalsResult
  return {
    approvals: query.data ?? [],
    loading: query.isLoading || approveMutation.isPending || rejectMutation.isPending,
    error: query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null,
    approve: async (id: string) => {
      await approveMutation.mutateAsync(id);
    },
    reject: async (id: string, reason: string) => {
      await rejectMutation.mutateAsync({ id, reason });
    },
    refresh: async () => {
      await query.refetch();
    },
  };
}

// ============================================================================
// useLegacyExercises (replaces useExercises with React Query)
// ============================================================================

export interface UseLegacyExercisesOptions {
  enabled?: boolean;
}

/**
 * React Query replacement for the legacy useExercises hook.
 * Maintains the same return interface for backward compatibility with ExerciseContentEditor.tsx.
 */
export function useLegacyExercises(options: UseLegacyExercisesOptions = {}) {
  const { enabled = true } = options;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: CONTENT_QUERY_KEYS.exercises(),
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.educational.exercises);
      const data = response.data.success ? response.data.data : response.data;
      return (data.exercises || data || []) as Exercise[];
    },
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 1,
  });

  // Create exercise mutation
  const createMutation = useMutation({
    mutationFn: async (exercise: Partial<Exercise>) => {
      const response = await apiClient.post(API_ENDPOINTS.educational.exercises, exercise);
      return response.data.success ? response.data.data : response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEYS.exercises() });
      toast.success('Ejercicio creado correctamente');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al crear ejercicio');
    },
  });

  // Update exercise mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Exercise> }) => {
      await apiClient.patch(API_ENDPOINTS.educational.exercise(id), updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEYS.exercises() });
      toast.success('Ejercicio actualizado correctamente');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al actualizar ejercicio');
    },
  });

  // Delete exercise mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(API_ENDPOINTS.educational.exercise(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEYS.exercises() });
      toast.success('Ejercicio eliminado');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al eliminar ejercicio');
    },
  });

  const exercises = query.data ?? [];

  // Backward-compatible interface matching useExercises return type
  return {
    exercises,
    loading: query.isLoading,
    createExercise: async (exercise: Partial<Exercise>) => {
      return createMutation.mutateAsync(exercise);
    },
    updateExercise: async (id: string, updates: Partial<Exercise>) => {
      await updateMutation.mutateAsync({ id, updates });
    },
    deleteExercise: async (id: string) => {
      await deleteMutation.mutateAsync(id);
    },
    duplicateExercise: async (id: string) => {
      const exercise = exercises.find((e) => e.id === id);
      if (!exercise) return;

      const duplicate = { ...exercise, title: `${exercise.title} (Copy)`, id: undefined };
      await createMutation.mutateAsync(duplicate);
    },
    refresh: async () => {
      await query.refetch();
    },
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export { CONTENT_QUERY_KEYS };
