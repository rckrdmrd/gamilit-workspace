/**
 * Student Assignments Store
 *
 * Zustand store for managing student assignments state.
 * Created as part of P1-002 gap fix.
 *
 * @created 2025-11-29
 */

import { create } from 'zustand';
import {
  studentAssignmentsAPI,
  StudentAssignment,
  StudentAssignmentDetail,
  GradesSummary,
  AssignmentFilters,
} from '@/services/api/studentAssignmentsAPI';

// ============================================================================
// STATE INTERFACE
// ============================================================================

interface StudentAssignmentsState {
  // Data
  assignments: StudentAssignment[];
  selectedAssignment: StudentAssignmentDetail | null;
  gradesSummary: GradesSummary | null;

  // UI State
  isLoading: boolean;
  isLoadingDetail: boolean;
  isLoadingGrades: boolean;
  error: string | null;
  filters: AssignmentFilters;

  // Actions
  fetchAssignments: (filters?: AssignmentFilters) => Promise<void>;
  fetchAssignmentDetail: (id: string) => Promise<void>;
  fetchGradesSummary: () => Promise<void>;
  setFilters: (filters: AssignmentFilters) => void;
  clearSelectedAssignment: () => void;
  clearError: () => void;
}

// ============================================================================
// STORE
// ============================================================================

export const useStudentAssignmentsStore = create<StudentAssignmentsState>((set, get) => ({
  // Initial state
  assignments: [],
  selectedAssignment: null,
  gradesSummary: null,
  isLoading: false,
  isLoadingDetail: false,
  isLoadingGrades: false,
  error: null,
  filters: {},

  // Fetch all assignments for the student
  fetchAssignments: async (filters?: AssignmentFilters) => {
    const appliedFilters = filters || get().filters;
    set({ isLoading: true, error: null });

    try {
      const assignments = await studentAssignmentsAPI.getMyAssignments(appliedFilters);
      set({ assignments, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error loading assignments';
      set({ error: message, isLoading: false });
    }
  },

  // Fetch assignment detail
  fetchAssignmentDetail: async (id: string) => {
    set({ isLoadingDetail: true, error: null });

    try {
      const detail = await studentAssignmentsAPI.getAssignmentDetail(id);
      set({ selectedAssignment: detail, isLoadingDetail: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error loading assignment detail';
      set({ error: message, isLoadingDetail: false });
    }
  },

  // Fetch grades summary
  fetchGradesSummary: async () => {
    set({ isLoadingGrades: true, error: null });

    try {
      const summary = await studentAssignmentsAPI.getGradesSummary();
      set({ gradesSummary: summary, isLoadingGrades: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error loading grades';
      set({ error: message, isLoadingGrades: false });
    }
  },

  // Update filters
  setFilters: (filters: AssignmentFilters) => {
    set({ filters });
    get().fetchAssignments(filters);
  },

  // Clear selected assignment
  clearSelectedAssignment: () => {
    set({ selectedAssignment: null });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));

export default useStudentAssignmentsStore;
