/**
 * useAssignments Hook - Manage assignments and submissions
 *
 * UPDATED 2025-12-27: Added mapper to transform backend response to frontend interface
 * Backend returns: isPublished, dueDate, assignmentType
 * Frontend expects: status, end_date, module_id, module_name
 *
 * Migrated to React Query (@tanstack/react-query v5) for automatic caching,
 * deduplication, and background refetching. CRUD mutations auto-invalidate
 * the assignments list.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { assignmentsApi } from '@services/api/teacher';
import type { Assignment, Submission, Exercise } from '@apps/teacher/types';
import type {
  GetAssignmentsQueryDto,
  CreateAssignmentDto,
  UpdateAssignmentDto,
  GradeSubmissionDto,
} from '@services/api/teacher';

// ---------------------------------------------------------------------------
// Query Key Factory
// ---------------------------------------------------------------------------

const assignmentKeys = {
  all: ['assignments'] as const,
  lists: () => [...assignmentKeys.all, 'list'] as const,
  list: (filters?: GetAssignmentsQueryDto) => [...assignmentKeys.lists(), filters] as const,
  exercises: () => [...assignmentKeys.all, 'exercises'] as const,
};

// ---------------------------------------------------------------------------
// Backend-to-Frontend Mapper (unchanged)
// ---------------------------------------------------------------------------

/**
 * Backend Assignment response structure
 * @see apps/backend/src/modules/assignments/entities/assignment.entity.ts
 */
interface BackendAssignment {
  id: string;
  title: string;
  description?: string;
  isPublished?: boolean;
  is_published?: boolean; // Alternative snake_case from DB
  dueDate?: string;
  due_date?: string; // Alternative snake_case from DB
  assignmentType?: string;
  assignment_type?: string;
  totalPoints?: number;
  total_points?: number;
  teacherId?: string;
  teacher_id?: string;
  classroomId?: string;
  classroom_id?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  // May include these if relations are loaded
  module_id?: string;
  module_name?: string;
  exercise_ids?: string[];
  exercises?: { id: string }[];
  // Submission stats (may be populated by backend)
  pendingReviews?: number;
  pending_reviews?: number;
  totalSubmissions?: number;
  total_submissions?: number;
}

/**
 * Compute assignment status from backend fields
 * @param isPublished - Backend isPublished flag
 * @param dueDate - Backend due date
 * @returns Frontend status value
 */
function computeAssignmentStatus(
  isPublished: boolean | undefined,
  dueDate: string | undefined
): 'draft' | 'active' | 'completed' | 'expired' {
  if (!isPublished) {
    return 'draft';
  }
  if (dueDate) {
    const due = new Date(dueDate);
    const now = new Date();
    if (due < now) {
      return 'expired';
    }
  }
  return 'active';
}

/**
 * Map backend assignment to frontend Assignment interface
 * This ensures backward compatibility with existing components
 */
function mapBackendToAssignment(raw: BackendAssignment): Assignment {
  // Handle both camelCase and snake_case from backend
  const isPublished = raw.isPublished ?? raw.is_published ?? false;
  const dueDate = raw.dueDate ?? raw.due_date ?? '';
  const createdAt = raw.createdAt ?? raw.created_at ?? new Date().toISOString();
  const classroomId = raw.classroomId ?? raw.classroom_id;

  return {
    id: raw.id,
    title: raw.title,
    module_id: raw.module_id ?? '',
    module_name: raw.module_name ?? '',
    exercise_ids: raw.exercise_ids ?? raw.exercises?.map((e) => e.id) ?? [],
    start_date: createdAt,
    end_date: dueDate,
    max_attempts: 3, // Default if not provided by backend
    allow_powerups: true, // Default if not provided by backend
    custom_points: raw.totalPoints ?? raw.total_points ?? null,
    assigned_to: [], // Would need separate query to get students
    created_at: createdAt,
    status: computeAssignmentStatus(isPublished, dueDate),
    // Optional display fields
    classroomName: classroomId ? `Classroom ${classroomId}` : undefined,
    type: raw.assignmentType ?? raw.assignment_type,
    dueDate: dueDate,
    // FIX M-003: Map pendingReviews/totalSubmissions from backend if available
    pendingReviews: raw.pendingReviews ?? raw.pending_reviews ?? undefined,
    totalSubmissions: raw.totalSubmissions ?? raw.total_submissions ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Interfaces (unchanged -- backward compatible)
// ---------------------------------------------------------------------------

export interface SendReminderResult {
  notified: number;
  alreadySubmitted: number;
  message: string;
}

export interface UseAssignmentsReturn {
  assignments: Assignment[];
  exercises: Exercise[];
  loading: boolean;
  error: Error | null;
  getAssignmentById: (id: string) => Promise<Assignment>;
  createAssignment: (data: CreateAssignmentDto) => Promise<Assignment>;
  updateAssignment: (id: string, data: UpdateAssignmentDto) => Promise<Assignment>;
  deleteAssignment: (id: string) => Promise<void>;
  getSubmissions: (assignmentId: string) => Promise<Submission[]>;
  gradeSubmission: (submissionId: string, data: GradeSubmissionDto) => Promise<Submission>;
  sendReminder: (assignmentId: string) => Promise<SendReminderResult>;
  refresh: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// useAssignments
// ---------------------------------------------------------------------------

export function useAssignments(filters?: GetAssignmentsQueryDto): UseAssignmentsReturn {
  const queryClient = useQueryClient();

  // --- Queries ---------------------------------------------------------------

  const assignmentsQuery = useQuery({
    queryKey: assignmentKeys.list(filters),
    queryFn: async () => {
      const data = await assignmentsApi.getAssignments(filters);
      return (data as unknown as BackendAssignment[]).map(mapBackendToAssignment);
    },
    staleTime: 5 * 60 * 1000,
  });

  const exercisesQuery = useQuery({
    queryKey: assignmentKeys.exercises(),
    queryFn: () => assignmentsApi.getAvailableExercises(),
    staleTime: 10 * 60 * 1000,
  });

  // --- Mutations -------------------------------------------------------------

  const createMutation = useMutation({
    mutationFn: (data: CreateAssignmentDto) => assignmentsApi.createAssignment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAssignmentDto }) =>
      assignmentsApi.updateAssignment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => assignmentsApi.deleteAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
    },
  });

  // --- Imperative actions (plain async, not reactive data) -------------------

  const getAssignmentById = useCallback(async (id: string): Promise<Assignment> => {
    return assignmentsApi.getAssignmentById(id);
  }, []);

  const createAssignment = useCallback(
    async (data: CreateAssignmentDto): Promise<Assignment> => {
      return createMutation.mutateAsync(data);
    },
    [createMutation],
  );

  const updateAssignment = useCallback(
    async (id: string, data: UpdateAssignmentDto): Promise<Assignment> => {
      return updateMutation.mutateAsync({ id, data });
    },
    [updateMutation],
  );

  const deleteAssignment = useCallback(
    async (id: string): Promise<void> => {
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation],
  );

  const getSubmissions = useCallback(async (assignmentId: string): Promise<Submission[]> => {
    return assignmentsApi.getAssignmentSubmissions(assignmentId);
  }, []);

  const gradeSubmission = useCallback(
    async (submissionId: string, data: GradeSubmissionDto): Promise<Submission> => {
      return assignmentsApi.gradeSubmission(submissionId, data);
    },
    [],
  );

  const sendReminder = useCallback(async (assignmentId: string): Promise<SendReminderResult> => {
    return assignmentsApi.sendReminder(assignmentId);
  }, []);

  const refresh = useCallback(async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
  }, [queryClient]);

  // --- Return (backward-compatible interface) --------------------------------

  const loading = assignmentsQuery.isLoading || exercisesQuery.isLoading;
  const error = assignmentsQuery.error ?? exercisesQuery.error ?? null;

  return {
    assignments: assignmentsQuery.data ?? [],
    exercises: exercisesQuery.data ?? [],
    loading,
    error,
    getAssignmentById,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    getSubmissions,
    gradeSubmission,
    sendReminder,
    refresh,
  };
}
