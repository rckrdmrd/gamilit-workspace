/**
 * Student Assignments API Integration
 *
 * API client for student assignments - view assigned tasks and grades.
 * Created as part of P1-002 gap fix.
 *
 * @created 2025-11-29
 */

import { apiClient } from '@/services/api/apiClient';
import { handleAPIError } from './apiErrorHandler';
import type { ApiResponse } from './apiTypes';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Assignment summary for list view
 */
export interface StudentAssignment {
  id: string;
  assignment: {
    id: string;
    title: string;
    description: string;
    assignmentType: 'homework' | 'quiz' | 'exam' | 'project';
    dueDate: string | null;
    totalPoints: number;
  };
  status: 'assigned' | 'in_progress' | 'submitted' | 'graded' | 'late';
  assignedAt: string;
  score: number | null;
  feedback: string | null;
}

/**
 * Assignment detail with exercises
 */
export interface StudentAssignmentDetail extends StudentAssignment {
  exercises: Array<{
    id: string;
    exerciseId: string;
    orderIndex: number;
    pointsOverride: number | null;
    isRequired: boolean;
  }>;
  submission: {
    id: string;
    status: string;
    submittedAt: string | null;
    score: number | null;
    feedback: string | null;
    gradedAt: string | null;
  } | null;
}

/**
 * Grades summary
 */
export interface GradesSummary {
  totalAssignments: number;
  completed: number;
  pending: number;
  averageScore: number;
  grades: Array<{
    assignmentTitle: string;
    score: number;
    maxScore: number;
    gradedAt: string;
    feedback: string | null;
  }>;
}

/**
 * Filters for assignments list
 */
export interface AssignmentFilters {
  status?: 'assigned' | 'in_progress' | 'submitted' | 'graded' | 'late';
  classroomId?: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get all assignments for the authenticated student
 */
export const getMyAssignments = async (
  filters?: AssignmentFilters,
): Promise<StudentAssignment[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.classroomId) params.append('classroomId', filters.classroomId);

    const queryString = params.toString();
    const url = `/student/assignments${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<ApiResponse<StudentAssignment[]>>(url);
    return response.data as unknown as StudentAssignment[];
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Get assignment details by ID
 */
export const getAssignmentDetail = async (
  assignmentStudentId: string,
): Promise<StudentAssignmentDetail> => {
  try {
    const response = await apiClient.get<ApiResponse<StudentAssignmentDetail>>(
      `/student/assignments/${assignmentStudentId}`,
    );
    return response.data as unknown as StudentAssignmentDetail;
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Get grades summary for the authenticated student
 */
export const getGradesSummary = async (): Promise<GradesSummary> => {
  try {
    const response = await apiClient.get<ApiResponse<GradesSummary>>(
      '/student/assignments/grades/summary',
    );
    return response.data as unknown as GradesSummary;
  } catch (error) {
    throw handleAPIError(error);
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

export const studentAssignmentsAPI = {
  getMyAssignments,
  getAssignmentDetail,
  getGradesSummary,
};

export default studentAssignmentsAPI;
