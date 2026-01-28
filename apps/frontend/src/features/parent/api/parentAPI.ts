/**
 * Parent Portal API
 *
 * EXT-011 Parent Portal - API Client
 *
 * @description API functions for parent portal endpoints.
 * @see ET-PAR-001-parent-authentication.md
 * @see ET-PAR-002-portal-dashboard.md
 * @created 2026-01-27
 */

import { apiClient } from '@/services/api/apiClient';
import { handleAPIError } from '@/services/api/apiErrorHandler';
import type {
  ParentAccount,
  ParentAuthResponse,
  ParentAuthTokens,
  LinkedStudent,
  ParentDashboard,
  StudentProgressSummary,
  RecentActivity,
  UpcomingAssignment,
  ParentNotification,
  WeeklyReport,
  ParentLoginCredentials,
  ParentRegisterData,
  LinkStudentData,
  VerifyLinkData,
} from '../types/parent.types';

// ============================================================================
// API ENDPOINTS
// ============================================================================

const PARENT_ENDPOINTS = {
  auth: {
    register: '/parent-portal/auth/register',
    login: '/parent-portal/auth/login',
    refresh: '/parent-portal/auth/refresh',
    forgotPassword: '/parent-portal/auth/forgot-password',
    verifyEmail: '/parent-portal/auth/verify-email',
  },
  portal: {
    dashboard: '/parent-portal/dashboard',
    students: '/parent-portal/students',
    linkStudent: '/parent-portal/students/link',
    verifyLink: '/parent-portal/students/verify',
    studentProgress: (studentId: string) => `/parent-portal/students/${studentId}/progress`,
    studentActivities: (studentId: string) => `/parent-portal/students/${studentId}/activities`,
    studentAssignments: (studentId: string) => `/parent-portal/students/${studentId}/assignments`,
    weeklyReports: '/parent-portal/reports/weekly',
    generateReport: (studentId: string) => `/parent-portal/reports/weekly/${studentId}`,
    notifications: '/parent-portal/notifications',
    markNotificationRead: (id: string) => `/parent-portal/notifications/${id}/read`,
    unreadCount: '/parent-portal/notifications/unread-count',
  },
};

// ============================================================================
// AUTH API FUNCTIONS
// ============================================================================

/**
 * Register parent account
 */
export const register = async (data: ParentRegisterData): Promise<ParentAuthResponse> => {
  try {
    const response = await apiClient.post<ParentAuthResponse>(
      PARENT_ENDPOINTS.auth.register,
      data,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Login to parent account
 */
export const login = async (credentials: ParentLoginCredentials): Promise<ParentAuthResponse> => {
  try {
    const response = await apiClient.post<ParentAuthResponse>(
      PARENT_ENDPOINTS.auth.login,
      credentials,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (refreshToken: string): Promise<ParentAuthTokens> => {
  try {
    const response = await apiClient.post<ParentAuthTokens>(
      PARENT_ENDPOINTS.auth.refresh,
      { refreshToken },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (email: string): Promise<void> => {
  try {
    await apiClient.post(PARENT_ENDPOINTS.auth.forgotPassword, { email });
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Verify email
 */
export const verifyEmail = async (token: string): Promise<void> => {
  try {
    await apiClient.post(PARENT_ENDPOINTS.auth.verifyEmail, { token });
  } catch (error) {
    throw handleAPIError(error);
  }
};

// ============================================================================
// DASHBOARD API FUNCTIONS
// ============================================================================

/**
 * Get parent dashboard data
 */
export const getDashboard = async (): Promise<ParentDashboard> => {
  try {
    const response = await apiClient.get<ParentDashboard>(
      PARENT_ENDPOINTS.portal.dashboard,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Get linked students
 */
export const getLinkedStudents = async (): Promise<LinkedStudent[]> => {
  try {
    const response = await apiClient.get<LinkedStudent[]>(
      PARENT_ENDPOINTS.portal.students,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Link a student to parent account
 */
export const linkStudent = async (data: LinkStudentData): Promise<{ id: string; status: string }> => {
  try {
    const response = await apiClient.post<{ id: string; status: string }>(
      PARENT_ENDPOINTS.portal.linkStudent,
      data,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Verify student link with code
 */
export const verifyStudentLink = async (data: VerifyLinkData): Promise<LinkedStudent> => {
  try {
    const response = await apiClient.post<LinkedStudent>(
      PARENT_ENDPOINTS.portal.verifyLink,
      data,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

// ============================================================================
// PROGRESS API FUNCTIONS
// ============================================================================

/**
 * Get detailed progress for a student
 */
export const getStudentProgress = async (studentId: string): Promise<StudentProgressSummary> => {
  try {
    const response = await apiClient.get<StudentProgressSummary>(
      PARENT_ENDPOINTS.portal.studentProgress(studentId),
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Get recent activities for a student
 */
export const getStudentActivities = async (
  studentId: string,
  limit?: number,
): Promise<RecentActivity[]> => {
  try {
    const response = await apiClient.get<RecentActivity[]>(
      PARENT_ENDPOINTS.portal.studentActivities(studentId),
      { params: { limit } },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Get upcoming assignments for a student
 */
export const getStudentAssignments = async (
  studentId: string,
  limit?: number,
): Promise<UpcomingAssignment[]> => {
  try {
    const response = await apiClient.get<UpcomingAssignment[]>(
      PARENT_ENDPOINTS.portal.studentAssignments(studentId),
      { params: { limit } },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

// ============================================================================
// REPORTS API FUNCTIONS
// ============================================================================

/**
 * Get weekly report history
 */
export const getWeeklyReports = async (limit?: number): Promise<WeeklyReport[]> => {
  try {
    const response = await apiClient.get<WeeklyReport[]>(
      PARENT_ENDPOINTS.portal.weeklyReports,
      { params: { limit } },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Generate a new weekly report for a student
 */
export const generateWeeklyReport = async (studentId: string): Promise<WeeklyReport> => {
  try {
    const response = await apiClient.post<WeeklyReport>(
      PARENT_ENDPOINTS.portal.generateReport(studentId),
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

// ============================================================================
// NOTIFICATIONS API FUNCTIONS
// ============================================================================

/**
 * Get notifications
 */
export const getNotifications = async (params?: {
  studentId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<ParentNotification[]> => {
  try {
    const response = await apiClient.get<ParentNotification[]>(
      PARENT_ENDPOINTS.portal.notifications,
      { params },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Mark notification as read
 */
export const markNotificationRead = async (notificationId: string): Promise<void> => {
  try {
    await apiClient.patch(PARENT_ENDPOINTS.portal.markNotificationRead(notificationId));
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Get unread notification count
 */
export const getUnreadNotificationCount = async (): Promise<number> => {
  try {
    const response = await apiClient.get<{ count: number }>(
      PARENT_ENDPOINTS.portal.unreadCount,
    );
    return response.data.count;
  } catch (error) {
    throw handleAPIError(error);
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

export const parentAPI = {
  // Auth
  register,
  login,
  refreshToken,
  requestPasswordReset,
  verifyEmail,
  // Dashboard
  getDashboard,
  getLinkedStudents,
  linkStudent,
  verifyStudentLink,
  // Progress
  getStudentProgress,
  getStudentActivities,
  getStudentAssignments,
  // Reports
  getWeeklyReports,
  generateWeeklyReport,
  // Notifications
  getNotifications,
  markNotificationRead,
  getUnreadNotificationCount,
};

export default parentAPI;
