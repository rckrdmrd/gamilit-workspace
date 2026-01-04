/**
 * useAdminAssignments Hook
 *
 * React Query hook for admin assignments management.
 * Provides access to all 5 assignment endpoints with caching and mutations.
 *
 * Created: 2025-11-29 - US-AE-009
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';

// ============================================================================
// TYPES
// ============================================================================

export interface AdminAssignment {
  id: string;
  title: string;
  description: string;
  classroom_id: string;
  classroom_name: string;
  teacher_id: string;
  teacher_name: string;
  created_at: string;
  due_date: string;
  status: 'active' | 'closed' | 'draft';
  total_students: number;
  submissions_count: number;
  graded_count: number;
  late_count: number;
  average_grade: number | null;
}

export interface AssignmentExercise {
  id: string;
  title: string;
  type: string;
  order: number;
}

export interface AssignmentSubmission {
  student_id: string;
  student_name: string;
  submitted_at: string | null;
  status: 'pending' | 'submitted' | 'graded' | 'late';
  grade: number | null;
  feedback: string | null;
  graded_by: string | null;
  graded_at: string | null;
}

export interface GradeDistribution {
  excellent: number; // 90-100
  good: number; // 75-89
  average: number; // 60-74
  needs_improvement: number; // 0-59
}

export interface AdminAssignmentDetail extends AdminAssignment {
  exercises: AssignmentExercise[];
  submissions: AssignmentSubmission[];
  grade_distribution: GradeDistribution;
  engagement_metrics: {
    started_count: number;
    completed_count: number;
    average_time_spent: number;
  };
}

export interface AssignmentsStats {
  total_assignments: number;
  active_assignments: number;
  pending_submissions: number;
  graded_submissions: number;
  late_submissions: number;
  average_grade: number;
  completion_rate: number;
  by_classroom: Array<{
    classroom_id: string;
    classroom_name: string;
    assignment_count: number;
    completion_rate: number;
  }>;
}

export interface ClassroomAssignmentsOverview {
  classroom_id: string;
  classroom_name: string;
  assignments: AdminAssignment[];
  stats: {
    total_assignments: number;
    active_count: number;
    completion_rate: number;
    average_grade: number;
  };
}

export interface AssignmentFilters {
  classroom_id?: string;
  teacher_id?: string;
  student_id?: string;
  status?: 'active' | 'closed' | 'draft';
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedAssignments {
  items: AdminAssignment[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * GET /api/admin/assignments - List all assignments with filters
 */
async function fetchAssignments(filters: AssignmentFilters = {}): Promise<PaginatedAssignments> {
  const params = new URLSearchParams();

  if (filters.classroom_id) params.append('classroom_id', filters.classroom_id);
  if (filters.teacher_id) params.append('teacher_id', filters.teacher_id);
  if (filters.student_id) params.append('student_id', filters.student_id);
  if (filters.status) params.append('status', filters.status);
  if (filters.date_from) params.append('date_from', filters.date_from);
  if (filters.date_to) params.append('date_to', filters.date_to);

  params.append('page', String(filters.page || 1));
  params.append('limit', String(filters.limit || 20));

  const response = await apiClient.get<PaginatedAssignments>(
    `/admin/assignments?${params.toString()}`,
  );

  return response.data;
}

/**
 * GET /api/admin/assignments/:id - Get assignment detail
 */
async function fetchAssignmentDetail(assignmentId: string): Promise<AdminAssignmentDetail> {
  const response = await apiClient.get<AdminAssignmentDetail>(`/admin/assignments/${assignmentId}`);

  return response.data;
}

/**
 * GET /api/admin/assignments/stats - Get global stats
 */
async function fetchAssignmentsStats(): Promise<AssignmentsStats> {
  const response = await apiClient.get<AssignmentsStats>('/admin/assignments/stats');

  return response.data;
}

/**
 * GET /api/admin/assignments/classrooms/:classroomId - Get assignments by classroom
 */
async function fetchClassroomAssignments(
  classroomId: string,
): Promise<ClassroomAssignmentsOverview> {
  const response = await apiClient.get<ClassroomAssignmentsOverview>(
    `/admin/assignments/classrooms/${classroomId}`,
  );

  return response.data;
}

/**
 * GET /api/admin/assignments/export - Export assignments to CSV
 */
async function exportAssignments(filters: AssignmentFilters = {}): Promise<Blob> {
  const params = new URLSearchParams();

  if (filters.classroom_id) params.append('classroom_id', filters.classroom_id);
  if (filters.teacher_id) params.append('teacher_id', filters.teacher_id);
  if (filters.student_id) params.append('student_id', filters.student_id);
  if (filters.status) params.append('status', filters.status);
  if (filters.date_from) params.append('date_from', filters.date_from);
  if (filters.date_to) params.append('date_to', filters.date_to);

  const response = await apiClient.get(`${API_ENDPOINTS.admin.assignments.export}?${params.toString()}`, {
    responseType: 'blob',
  });

  return response.data;
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

/**
 * Hook to fetch paginated assignments list
 */
export function useAssignments(filters: AssignmentFilters = {}) {
  return useQuery({
    queryKey: ['admin', 'assignments', filters],
    queryFn: () => fetchAssignments(filters),
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch single assignment detail
 */
export function useAssignmentDetail(assignmentId: string | null) {
  return useQuery({
    queryKey: ['admin', 'assignments', assignmentId],
    queryFn: () => fetchAssignmentDetail(assignmentId!),
    enabled: !!assignmentId,
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to fetch global assignments stats
 */
export function useAssignmentsStats() {
  return useQuery({
    queryKey: ['admin', 'assignments', 'stats'],
    queryFn: fetchAssignmentsStats,
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Hook to fetch classroom-specific assignments
 */
export function useClassroomAssignments(classroomId: string | null) {
  return useQuery({
    queryKey: ['admin', 'assignments', 'classroom', classroomId],
    queryFn: () => fetchClassroomAssignments(classroomId!),
    enabled: !!classroomId,
    staleTime: 60000,
  });
}

/**
 * Export assignments to CSV
 * This is not a query but a utility function
 */
export async function downloadAssignmentsCSV(filters: AssignmentFilters = {}): Promise<void> {
  try {
    const blob = await exportAssignments(filters);

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `assignments-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export assignments:', error);
    throw error;
  }
}

// ============================================================================
// EXPORT DEFAULT HOOK
// ============================================================================

/**
 * Main hook that combines all assignment queries
 */
export function useAdminAssignments() {
  return {
    useAssignments,
    useAssignmentDetail,
    useAssignmentsStats,
    useClassroomAssignments,
    downloadAssignmentsCSV,
  };
}

export default useAdminAssignments;
