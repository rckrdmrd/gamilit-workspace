/**
 * useAssignments Hook - Manage assignments and submissions
 *
 * UPDATED 2025-12-27: Added mapper to transform backend response to frontend interface
 * Backend returns: isPublished, dueDate, assignmentType
 * Frontend expects: status, end_date, module_id, module_name
 */

import { useState, useEffect, useCallback } from 'react';
import { assignmentsApi } from '@services/api/teacher';
import type { Assignment, Submission, Exercise } from '@apps/teacher/types';
import type {
  GetAssignmentsQueryDto,
  CreateAssignmentDto,
  UpdateAssignmentDto,
  GradeSubmissionDto,
} from '@services/api/teacher';

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
  };
}

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

export function useAssignments(filters?: GetAssignmentsQueryDto): UseAssignmentsReturn {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [assignmentsData, exercisesData] = await Promise.all([
        assignmentsApi.getAssignments(filters),
        assignmentsApi.getAvailableExercises(),
      ]);

      // Map backend response to frontend interface for compatibility
      const mappedAssignments = (assignmentsData as unknown as BackendAssignment[]).map(
        mapBackendToAssignment
      );

      setAssignments(mappedAssignments);
      setExercises(exercisesData);
    } catch (err) {
      console.error('[useAssignments] Error:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const getAssignmentById = useCallback(async (id: string) => {
    return await assignmentsApi.getAssignmentById(id);
  }, []);

  const createAssignment = useCallback(
    async (data: CreateAssignmentDto) => {
      try {
        const newAssignment = await assignmentsApi.createAssignment(data);
        await fetchAssignments(); // Refresh list
        return newAssignment;
      } catch (err) {
        console.error('[useAssignments] Error creating assignment:', err);
        throw err;
      }
    },
    [fetchAssignments]
  );

  const updateAssignment = useCallback(
    async (id: string, data: UpdateAssignmentDto) => {
      try {
        const updatedAssignment = await assignmentsApi.updateAssignment(id, data);
        await fetchAssignments(); // Refresh list
        return updatedAssignment;
      } catch (err) {
        console.error('[useAssignments] Error updating assignment:', err);
        throw err;
      }
    },
    [fetchAssignments]
  );

  const deleteAssignment = useCallback(
    async (id: string) => {
      try {
        await assignmentsApi.deleteAssignment(id);
        await fetchAssignments(); // Refresh list
      } catch (err) {
        console.error('[useAssignments] Error deleting assignment:', err);
        throw err;
      }
    },
    [fetchAssignments]
  );

  const getSubmissions = useCallback(async (assignmentId: string) => {
    try {
      return await assignmentsApi.getAssignmentSubmissions(assignmentId);
    } catch (err) {
      console.error('[useAssignments] Error fetching submissions:', err);
      throw err;
    }
  }, []);

  const gradeSubmission = useCallback(
    async (submissionId: string, data: GradeSubmissionDto) => {
      try {
        return await assignmentsApi.gradeSubmission(submissionId, data);
      } catch (err) {
        console.error('[useAssignments] Error grading submission:', err);
        throw err;
      }
    },
    []
  );

  const sendReminder = useCallback(async (assignmentId: string) => {
    try {
      return await assignmentsApi.sendReminder(assignmentId);
    } catch (err) {
      console.error('[useAssignments] Error sending reminder:', err);
      throw err;
    }
  }, []);

  return {
    assignments,
    exercises,
    loading,
    error,
    getAssignmentById,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    getSubmissions,
    gradeSubmission,
    sendReminder,
    refresh: fetchAssignments,
  };
}
