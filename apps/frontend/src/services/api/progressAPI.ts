/**
 * Progress API Service
 *
 * @description API service for progress tracking, certificates, and exercise attempts
 * @created 2026-01-27 - P1-001 Frontend Coverage Gap Fix
 * @module progress
 */

import { apiClient } from './apiClient';

// ============================================================================
// TYPES
// ============================================================================

export interface Certificate {
  id: string;
  userId: string;
  moduleId: string;
  code: string;
  issuedAt: string;
  expiresAt?: string;
  status: 'valid' | 'revoked' | 'expired';
  downloadUrl?: string;
}

export interface CertificateStats {
  total: number;
  valid: number;
  revoked: number;
  expired: number;
}

export interface ExerciseAttempt {
  id: string;
  userId: string;
  exerciseId: string;
  attemptNumber: number;
  startedAt: string;
  submittedAt?: string;
  score?: number;
  maxScore?: number;
  status: 'in_progress' | 'submitted' | 'graded';
  comodinesUsed?: string[];
}

export interface AttemptStats {
  totalAttempts: number;
  averageScore: number;
  completionRate: number;
  timeSpent: number;
}

export interface ExerciseSubmission {
  id: string;
  attemptId: string;
  exerciseId: string;
  userId: string;
  answers: Record<string, unknown>;
  score?: number;
  feedback?: string;
  submittedAt: string;
}

// ============================================================================
// CERTIFICATES API
// ============================================================================

export const certificatesAPI = {
  generate: async (userId: string, moduleId: string): Promise<Certificate> => {
    const response = await apiClient.post('/certificates/generate', { userId, moduleId });
    return response.data;
  },

  verify: async (code: string): Promise<{ valid: boolean; certificate?: Certificate }> => {
    const response = await apiClient.get(`/certificates/verify/${code}`);
    return response.data;
  },

  getUserCertificates: async (userId: string): Promise<Certificate[]> => {
    const response = await apiClient.get(`/certificates/users/${userId}`);
    return response.data;
  },

  getById: async (id: string): Promise<Certificate> => {
    const response = await apiClient.get(`/certificates/${id}`);
    return response.data;
  },

  download: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/certificates/${id}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  revoke: async (id: string, reason: string): Promise<Certificate> => {
    const response = await apiClient.post(`/certificates/${id}/revoke`, { reason });
    return response.data;
  },

  getTenantStats: async (tenantId: string): Promise<CertificateStats> => {
    const response = await apiClient.get(`/certificates/tenant/${tenantId}/stats`);
    return response.data;
  }
};

// ============================================================================
// EXERCISE ATTEMPTS API
// ============================================================================

export const attemptsAPI = {
  create: async (exerciseId: string, data?: Partial<ExerciseAttempt>): Promise<ExerciseAttempt> => {
    const response = await apiClient.post('/progress/attempts', { exerciseId, ...data });
    return response.data;
  },

  getUserAttempts: async (userId: string): Promise<ExerciseAttempt[]> => {
    const response = await apiClient.get(`/progress/attempts/users/${userId}`);
    return response.data;
  },

  getExerciseAttempts: async (exerciseId: string): Promise<ExerciseAttempt[]> => {
    const response = await apiClient.get(`/progress/attempts/exercises/${exerciseId}`);
    return response.data;
  },

  getUserExerciseAttempts: async (userId: string, exerciseId: string): Promise<ExerciseAttempt[]> => {
    const response = await apiClient.get(`/progress/attempts/users/${userId}/exercises/${exerciseId}`);
    return response.data;
  },

  getNextAttemptNumber: async (userId: string, exerciseId: string): Promise<number> => {
    const response = await apiClient.get(`/progress/attempts/users/${userId}/exercises/${exerciseId}/next-number`);
    return response.data.nextNumber;
  },

  submit: async (attemptId: string, answers: Record<string, unknown>): Promise<ExerciseAttempt> => {
    const response = await apiClient.post(`/progress/attempts/${attemptId}/submit`, { answers });
    return response.data;
  },

  getStats: async (userId: string): Promise<AttemptStats> => {
    const response = await apiClient.get(`/progress/attempts/users/${userId}/stats`);
    return response.data;
  },

  getBestAttempt: async (userId: string, exerciseId: string): Promise<ExerciseAttempt | null> => {
    const response = await apiClient.get(`/progress/attempts/users/${userId}/exercises/${exerciseId}/best`);
    return response.data;
  },

  registerComodinUsage: async (attemptId: string, comodinIds: string[]): Promise<ExerciseAttempt> => {
    const response = await apiClient.patch(`/progress/attempts/${attemptId}/comodines`, { comodinIds });
    return response.data;
  }
};

// ============================================================================
// EXERCISE SUBMISSIONS API
// ============================================================================

export const submissionsAPI = {
  create: async (data: Partial<ExerciseSubmission>): Promise<ExerciseSubmission> => {
    const response = await apiClient.post('/submissions', data);
    return response.data;
  },

  getById: async (id: string): Promise<ExerciseSubmission> => {
    const response = await apiClient.get(`/submissions/${id}`);
    return response.data;
  },

  getByExercise: async (exerciseId: string): Promise<ExerciseSubmission[]> => {
    const response = await apiClient.get(`/submissions/exercise/${exerciseId}`);
    return response.data;
  },

  getByUser: async (userId: string): Promise<ExerciseSubmission[]> => {
    const response = await apiClient.get(`/submissions/user/${userId}`);
    return response.data;
  }
};

// ============================================================================
// UNIFIED PROGRESS API
// ============================================================================

export const progressAPI = {
  certificates: certificatesAPI,
  attempts: attemptsAPI,
  submissions: submissionsAPI
};

export default progressAPI;
