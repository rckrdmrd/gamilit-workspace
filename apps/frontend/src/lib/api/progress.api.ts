/**
 * Progress API
 * API client for Progress Module endpoints
 *
 * Endpoints:
 * - getUserProgress: Get all module progress for a user
 * - getModuleProgress: Get progress for a specific module
 * - getUserProgressSummary: Get overall progress summary
 * - getInProgressModules: Get modules currently in progress
 * - getLearningSessions: Get learning sessions for a user
 * - getSessionStats: Get session statistics
 * - getExerciseAttempts: Get attempts for an exercise
 * - getSubmissionStats: Get submission statistics
 */

import apiClient from './client';
import type {
  ModuleProgress,
  ProgressSummary,
  LearningSession,
  SessionStats,
  ExerciseAttempt,
  SubmissionStats,
} from '@/shared/types/progress.types';

/**
 * Pending Activity interface (matches backend DTO)
 */
export interface PendingActivity {
  id: string;
  type: 'exercise' | 'lesson' | 'assessment' | 'assignment';
  title: string;
  module_name: string;
  module_id: string;
  difficulty: string;
  estimated_minutes: number;
  due_date?: Date;
  priority: 'low' | 'medium' | 'high';
  xp_reward: number;
  ml_coins_reward: number;
  progress_percentage?: number;
}

/**
 * Activity Action Type Enum (matches backend)
 */
export enum ActivityAction {
  STARTED_MODULE = 'started_module',
  COMPLETED_EXERCISE = 'completed_exercise',
  EARNED_ACHIEVEMENT = 'earned_achievement',
  LEVELED_UP = 'leveled_up',
  EARNED_COINS = 'earned_coins',
  COMPLETED_MODULE = 'completed_module',
  STARTED_SESSION = 'started_session',
}

/**
 * Recent Activity interface (matches backend DTO)
 */
export interface RecentActivity {
  id: string;
  user_id: string;
  action: ActivityAction;
  description: string;
  entity_type: 'module' | 'exercise' | 'achievement' | 'level' | 'session';
  entity_id: string;
  entity_name: string;
  metadata?: Record<string, any>;
  created_at: string | Date;
}

/**
 * Get all module progress for a user
 * @param userId - User ID
 * @returns Array of ModuleProgress
 */
export const getUserProgress = async (userId: string): Promise<ModuleProgress[]> => {
  const { data } = await apiClient.get(`/progress/users/${userId}`);
  return data;
};

/**
 * Get progress for a specific module
 * @param userId - User ID
 * @param moduleId - Module ID
 * @returns ModuleProgress
 */
export const getModuleProgress = async (
  userId: string,
  moduleId: string
): Promise<ModuleProgress> => {
  const { data } = await apiClient.get(`/progress/users/${userId}/modules/${moduleId}`);
  return data;
};

/**
 * Get overall progress summary for a user
 * @param userId - User ID
 * @returns ProgressSummary
 */
export const getUserProgressSummary = async (userId: string): Promise<ProgressSummary> => {
  const { data } = await apiClient.get(`/progress/users/${userId}/summary`);
  return data;
};

/**
 * Get modules currently in progress
 * @param userId - User ID
 * @returns Array of ModuleProgress (in_progress status only)
 */
export const getInProgressModules = async (userId: string): Promise<ModuleProgress[]> => {
  const { data } = await apiClient.get(`/progress/users/${userId}/in-progress`);
  return data;
};

/**
 * Get learning sessions for a user
 * @param userId - User ID
 * @param params - Optional query params (moduleId, exerciseId, limit, offset)
 * @returns Array of LearningSession
 */
export const getLearningSessions = async (
  userId: string,
  params?: {
    moduleId?: string;
    exerciseId?: string;
    limit?: number;
    offset?: number;
  }
): Promise<LearningSession[]> => {
  const { data } = await apiClient.get(`/progress/sessions/users/${userId}`, { params });
  return data;
};

/**
 * Get session statistics for a period
 * @param userId - User ID
 * @param period - Time period (daily, weekly, monthly)
 * @returns SessionStats
 */
export const getSessionStats = async (
  userId: string,
  period: 'daily' | 'weekly' | 'monthly'
): Promise<SessionStats> => {
  const { data } = await apiClient.get(`/progress/sessions/users/${userId}/stats`, {
    params: { period },
  });
  return data;
};

/**
 * Get all attempts for a specific exercise
 * @param userId - User ID
 * @param exerciseId - Exercise ID
 * @returns Array of ExerciseAttempt
 */
export const getExerciseAttempts = async (
  userId: string,
  exerciseId: string
): Promise<ExerciseAttempt[]> => {
  const { data } = await apiClient.get(
    `/progress/attempts/users/${userId}/exercises/${exerciseId}`
  );
  return data;
};

/**
 * Get submission statistics for a user
 * @param userId - User ID
 * @returns SubmissionStats
 */
export const getSubmissionStats = async (userId: string): Promise<SubmissionStats> => {
  const { data } = await apiClient.get(`/progress/submissions/users/${userId}/stats`);
  return data;
};

/**
 * Start a new learning session
 * @param userId - User ID
 * @param moduleId - Module ID
 * @param exerciseId - Exercise ID (optional)
 * @returns LearningSession
 */
export const startLearningSession = async (
  userId: string,
  moduleId: string,
  exerciseId?: string
): Promise<LearningSession> => {
  const { data } = await apiClient.post('/progress/sessions', {
    userId,
    moduleId,
    exerciseId,
  });
  return data;
};

/**
 * End a learning session
 * @param sessionId - Session ID
 * @returns LearningSession
 */
export const endLearningSession = async (sessionId: string): Promise<LearningSession> => {
  const { data } = await apiClient.patch(`/progress/sessions/${sessionId}/end`);
  return data;
};

/**
 * Submit an exercise attempt
 * @param userId - User ID
 * @param exerciseId - Exercise ID
 * @param submissionData - Exercise submission data
 * @returns ExerciseAttempt
 */
export const submitExerciseAttempt = async (
  userId: string,
  exerciseId: string,
  submissionData: Record<string, any>
): Promise<ExerciseAttempt> => {
  const { data } = await apiClient.post('/progress/attempts', {
    userId,
    exerciseId,
    submissionData,
  });
  return data;
};

/**
 * Get pending activities for a user
 * @param userId - User ID
 * @param params - Optional query params (type, priority, limit)
 * @returns Array of PendingActivity
 */
export const getPendingActivities = async (
  userId: string,
  params?: {
    type?: 'exercise' | 'lesson' | 'assessment' | 'assignment';
    priority?: 'low' | 'medium' | 'high';
    limit?: number;
  }
): Promise<PendingActivity[]> => {
  const { data } = await apiClient.get(`/progress/users/${userId}/pending-activities`, { params });
  return data;
};

/**
 * Get recent activities for a user
 * @param userId - User ID
 * @param params - Optional query params (limit, offset)
 * @returns Array of RecentActivity
 */
export const getRecentActivities = async (
  userId: string,
  params?: {
    limit?: number;
    offset?: number;
  }
): Promise<RecentActivity[]> => {
  const { data } = await apiClient.get(`/progress/users/${userId}/recent-activities`, { params });
  return data;
};

// Export all as progressApi object
export const progressApi = {
  getUserProgress,
  getModuleProgress,
  getUserProgressSummary,
  getInProgressModules,
  getLearningSessions,
  getSessionStats,
  getExerciseAttempts,
  getSubmissionStats,
  startLearningSession,
  endLearningSession,
  submitExerciseAttempt,
  getPendingActivities,
  getRecentActivities,
};

export default progressApi;
