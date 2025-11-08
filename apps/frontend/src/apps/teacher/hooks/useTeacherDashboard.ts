import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/services/api/apiConfig';
import type {
  DashboardClassroom,
  DashboardAssignment,
  DashboardSubmission,
  StudentAlert,
  TeacherStats,
  CreateClassroomData,
  CreateAssignmentData,
  GradeSubmissionData,
} from '../types';

interface UseTeacherDashboardResult {
  // Data
  classrooms: DashboardClassroom[];
  assignments: DashboardAssignment[];
  submissions: DashboardSubmission[];
  alerts: StudentAlert[];
  stats: TeacherStats;

  // State
  loading: boolean;
  error: string | null;

  // Actions
  createClassroom: (data: CreateClassroomData) => Promise<void>;
  updateClassroom: (id: string, data: Partial<CreateClassroomData>) => Promise<void>;
  deleteClassroom: (id: string) => Promise<void>;
  createAssignment: (data: CreateAssignmentData) => Promise<void>;
  updateAssignment: (id: string, data: Partial<CreateAssignmentData>) => Promise<void>;
  closeAssignment: (id: string) => Promise<void>;
  gradeSubmission: (data: GradeSubmissionData) => Promise<void>;
  dismissAlert: (id: string) => void;
  refresh: () => Promise<void>;
}

export const useTeacherDashboard = (): UseTeacherDashboardResult => {
  const [classrooms, setClassrooms] = useState<DashboardClassroom[]>([]);
  const [assignments, setAssignments] = useState<DashboardAssignment[]>([]);
  const [submissions, setSubmissions] = useState<DashboardSubmission[]>([]);
  const [alerts, setAlerts] = useState<StudentAlert[]>([]);
  const [stats, setStats] = useState<TeacherStats>({
    totalClassrooms: 0,
    totalStudents: 0,
    pendingSubmissions: 0,
    averagePerformance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [classroomsRes, assignmentsRes, submissionsRes] = await Promise.all([
        apiClient.get(API_ENDPOINTS.teacher.classrooms),
        apiClient.get(API_ENDPOINTS.teacher.assignments),
        apiClient.get(API_ENDPOINTS.teacher.pendingSubmissions),
      ]);

      const fetchedClassrooms = classroomsRes.data.data || classroomsRes.data;
      const fetchedAssignments = assignmentsRes.data.data || assignmentsRes.data;
      const fetchedSubmissions = submissionsRes.data.data || submissionsRes.data;

      // Calculate stats from fetched data
      const calculatedStats: TeacherStats = {
        totalClassrooms: fetchedClassrooms.length,
        totalStudents: fetchedClassrooms.reduce((sum: number, c: any) => sum + (c.student_count || 0), 0),
        pendingSubmissions: fetchedSubmissions.length,
        averagePerformance:
          fetchedClassrooms.length > 0
            ? fetchedClassrooms.reduce((sum: number, c: any) => sum + (c.average_score || 0), 0) /
              fetchedClassrooms.length
            : 0,
      };

      setClassrooms(fetchedClassrooms);
      setAssignments(fetchedAssignments);
      setSubmissions(fetchedSubmissions);
      setAlerts([]); // Alerts will be implemented later with backend support
      setStats(calculatedStats);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load dashboard data';
      setError(errorMessage);
      console.error('[useTeacherDashboard] Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Set up auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);

    return () => clearInterval(interval);
  }, [fetchData]);

  const createClassroom = async (data: CreateClassroomData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.teacher.createClassroom, data);
      const newClassroom = response.data.data || response.data;

      setClassrooms((prev) => [...prev, newClassroom]);
      setStats((prev) => ({
        ...prev,
        totalClassrooms: prev.totalClassrooms + 1,
      }));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create classroom';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateClassroom = async (id: string, data: Partial<CreateClassroomData>) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.teacher.updateClassroom(id), data);
      const updatedClassroom = response.data.data || response.data;

      setClassrooms((prev) =>
        prev.map((c) => (c.id === id ? updatedClassroom : c))
      );
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update classroom';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteClassroom = async (id: string) => {
    try {
      await apiClient.delete(API_ENDPOINTS.teacher.deleteClassroom(id));

      const classroom = classrooms.find((c) => c.id === id);
      if (classroom) {
        setClassrooms((prev) => prev.filter((c) => c.id !== id));
        setStats((prev) => ({
          ...prev,
          totalClassrooms: prev.totalClassrooms - 1,
          totalStudents: prev.totalStudents - (classroom.studentCount || 0),
        }));
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete classroom';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const createAssignment = async (data: CreateAssignmentData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.teacher.createAssignment, data);
      const newAssignment = response.data.data || response.data;

      setAssignments((prev) => [...prev, newAssignment]);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create assignment';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateAssignment = async (id: string, data: Partial<CreateAssignmentData>) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.teacher.updateAssignment(id), data);
      const updatedAssignment = response.data.data || response.data;

      setAssignments((prev) =>
        prev.map((a) => (a.id === id ? updatedAssignment : a))
      );
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update assignment';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const closeAssignment = async (id: string) => {
    try {
      await apiClient.delete(API_ENDPOINTS.teacher.deleteAssignment(id));

      setAssignments((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to close assignment';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const gradeSubmission = async (data: GradeSubmissionData) => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.teacher.gradeSubmission(data.submissionId),
        {
          score: data.score,
          grade: data.grade,
          feedback: data.feedback,
        }
      );
      const gradedSubmission = response.data.data || response.data;

      setSubmissions((prev) =>
        prev.map((s) => (s.id === data.submissionId ? gradedSubmission : s))
      );

      setStats((prev) => ({
        ...prev,
        pendingSubmissions: Math.max(0, prev.pendingSubmissions - 1),
      }));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to grade submission';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const refresh = async () => {
    await fetchData();
  };

  return {
    classrooms,
    assignments,
    submissions,
    alerts,
    stats,
    loading,
    error,
    createClassroom,
    updateClassroom,
    deleteClassroom,
    createAssignment,
    updateAssignment,
    closeAssignment,
    gradeSubmission,
    dismissAlert,
    refresh,
  };
};
