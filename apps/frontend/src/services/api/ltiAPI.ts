/**
 * LTI API Service
 *
 * @description API service for LTI (Learning Tools Interoperability) integration
 * @created 2026-01-27 - P1-001 Frontend Coverage Gap Fix
 * @module lti
 */

import { apiClient } from './apiClient';

// ============================================================================
// TYPES
// ============================================================================

export interface LTIConsumer {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  consumerKey: string;
  consumerSecret?: string; // Only returned on creation
  launchUrl: string;
  platform: 'blackboard' | 'canvas' | 'moodle' | 'other';
  isActive: boolean;
  isVerified: boolean;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LTIConsumerStats {
  total: number;
  active: number;
  verified: number;
  byPlatform: Record<string, number>;
}

export interface LTIGradePassback {
  id: string;
  consumerId: string;
  userId: string;
  resourceLinkId: string;
  score: number;
  maxScore: number;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: string;
  errorMessage?: string;
}

export interface LTISession {
  id: string;
  consumerId: string;
  userId: string;
  resourceLinkId: string;
  contextId: string;
  launchParams: Record<string, string>;
  expiresAt: string;
  createdAt: string;
}

// ============================================================================
// CONSUMERS API
// ============================================================================

export const consumersAPI = {
  getAll: async (): Promise<LTIConsumer[]> => {
    const response = await apiClient.get('/api/v1/lti/consumers');
    return response.data;
  },

  getStats: async (): Promise<LTIConsumerStats> => {
    const response = await apiClient.get('/api/v1/lti/consumers/stats');
    return response.data;
  },

  getById: async (id: string): Promise<LTIConsumer> => {
    const response = await apiClient.get(`/api/v1/lti/consumers/${id}`);
    return response.data;
  },

  getByTenant: async (tenantId: string): Promise<LTIConsumer[]> => {
    const response = await apiClient.get(`/api/v1/lti/consumers/tenant/${tenantId}`);
    return response.data;
  },

  create: async (data: Partial<LTIConsumer>): Promise<LTIConsumer> => {
    const response = await apiClient.post('/api/v1/lti/consumers', data);
    return response.data;
  },

  update: async (id: string, data: Partial<LTIConsumer>): Promise<LTIConsumer> => {
    const response = await apiClient.patch(`/api/v1/lti/consumers/${id}`, data);
    return response.data;
  },

  verify: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(`/api/v1/lti/consumers/${id}/verify`);
    return response.data;
  },

  activate: async (id: string): Promise<LTIConsumer> => {
    const response = await apiClient.post(`/api/v1/lti/consumers/${id}/activate`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/lti/consumers/${id}`);
  }
};

// ============================================================================
// GRADE PASSBACKS API
// ============================================================================

export const gradePassbacksAPI = {
  send: async (data: {
    consumerId: string;
    userId: string;
    resourceLinkId: string;
    score: number;
    maxScore: number;
  }): Promise<LTIGradePassback> => {
    const response = await apiClient.post('/lti/grade-passbacks', data);
    return response.data;
  },

  getAll: async (filters?: { consumerId?: string; status?: string }): Promise<LTIGradePassback[]> => {
    const response = await apiClient.get('/lti/grade-passbacks', { params: filters });
    return response.data;
  },

  getById: async (id: string): Promise<LTIGradePassback> => {
    const response = await apiClient.get(`/lti/grade-passbacks/${id}`);
    return response.data;
  },

  retry: async (id: string): Promise<LTIGradePassback> => {
    const response = await apiClient.post(`/lti/grade-passbacks/${id}/retry`);
    return response.data;
  }
};

// ============================================================================
// SESSIONS API
// ============================================================================

export const sessionsAPI = {
  create: async (data: {
    consumerId: string;
    launchParams: Record<string, string>;
  }): Promise<LTISession> => {
    const response = await apiClient.post('/lti/sessions', data);
    return response.data;
  },

  getById: async (id: string): Promise<LTISession> => {
    const response = await apiClient.get(`/lti/sessions/${id}`);
    return response.data;
  },

  validate: async (id: string): Promise<{ valid: boolean; session?: LTISession }> => {
    const response = await apiClient.get(`/lti/sessions/${id}/validate`);
    return response.data;
  }
};

// ============================================================================
// UNIFIED LTI API
// ============================================================================

export const ltiAPI = {
  consumers: consumersAPI,
  gradePassbacks: gradePassbacksAPI,
  sessions: sessionsAPI
};

export default ltiAPI;
