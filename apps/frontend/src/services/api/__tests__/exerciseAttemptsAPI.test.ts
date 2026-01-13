/**
 * Exercise Attempts API Tests
 *
 * Tests for exerciseAttemptsAPI functions
 * Created: 2026-01-13
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  startAttempt,
  getAttemptById,
  getUserAttempts,
  getMyAttempts,
  submitAttempt,
  abandonAttempt,
  getAttemptAnalytics,
  getMyAnalytics,
  exportAttempts,
} from '../exerciseAttemptsAPI';
import { apiClient } from '@/services/api/apiClient';

// Mock apiClient
vi.mock('../apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Mock error handler
vi.mock('../apiErrorHandler', () => ({
  handleAPIError: vi.fn((_error, message) => {
    throw new Error(message);
  }),
}));

// Mock API config
vi.mock('@/config/api.config', () => ({
  API_ENDPOINTS: {
    educational: {
      exerciseAttempts: (userId: string) => `/progress/attempts/users/${userId}`,
    },
  },
}));

describe('exerciseAttemptsAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('startAttempt', () => {
    it('should start a new attempt successfully', async () => {
      const mockAttempt = {
        id: 'attempt-123',
        user_id: 'user-456',
        exercise_id: 'exercise-789',
        status: 'in_progress',
        started_at: '2026-01-13T10:00:00Z',
        created_at: '2026-01-13T10:00:00Z',
      };

      (apiClient.post as any).mockResolvedValue({ data: mockAttempt });

      const result = await startAttempt({
        exercise_id: 'exercise-789',
        module_id: 'module-001',
      });

      expect(apiClient.post).toHaveBeenCalledWith('/progress/attempts', {
        exercise_id: 'exercise-789',
        module_id: 'module-001',
      });
      expect(result.id).toBe('attempt-123');
      expect(result.status).toBe('in_progress');
    });

    it('should throw error on failure', async () => {
      (apiClient.post as any).mockRejectedValue(new Error('Network error'));

      await expect(startAttempt({ exercise_id: 'ex-1' })).rejects.toThrow(
        'Failed to start exercise attempt',
      );
    });
  });

  describe('getAttemptById', () => {
    it('should fetch attempt by ID', async () => {
      const mockAttempt = {
        id: 'attempt-123',
        user_id: 'user-456',
        exercise_id: 'exercise-789',
        status: 'completed',
        score: 85,
        percentage: 85,
        is_correct: true,
      };

      (apiClient.get as any).mockResolvedValue({ data: mockAttempt });

      const result = await getAttemptById('attempt-123');

      expect(apiClient.get).toHaveBeenCalledWith('/progress/attempts/attempt-123');
      expect(result.id).toBe('attempt-123');
      expect(result.score).toBe(85);
    });

    it('should throw error when attempt not found', async () => {
      (apiClient.get as any).mockRejectedValue(new Error('Not found'));

      await expect(getAttemptById('invalid-id')).rejects.toThrow('Failed to fetch attempt');
    });
  });

  describe('getUserAttempts', () => {
    it('should fetch attempts for a user', async () => {
      const mockAttempts = [
        { id: 'attempt-1', user_id: 'user-123', exercise_id: 'ex-1', status: 'completed' },
        { id: 'attempt-2', user_id: 'user-123', exercise_id: 'ex-2', status: 'completed' },
      ];

      (apiClient.get as any).mockResolvedValue({ data: mockAttempts });

      const result = await getUserAttempts('user-123');

      expect(apiClient.get).toHaveBeenCalledWith('/progress/attempts/users/user-123', {
        params: undefined,
      });
      expect(result).toHaveLength(2);
    });

    it('should apply filters correctly', async () => {
      const mockAttempts = [
        { id: 'attempt-1', user_id: 'user-123', exercise_id: 'ex-specific', status: 'completed' },
      ];

      (apiClient.get as any).mockResolvedValue({ data: mockAttempts });

      const filters = {
        exercise_id: 'ex-specific',
        status: 'completed' as const,
        limit: 10,
      };

      await getUserAttempts('user-123', filters);

      expect(apiClient.get).toHaveBeenCalledWith('/progress/attempts/users/user-123', {
        params: filters,
      });
    });
  });

  describe('getMyAttempts', () => {
    it('should fetch current user attempts', async () => {
      const mockAttempts = [
        { id: 'attempt-1', status: 'completed', score: 90 },
        { id: 'attempt-2', status: 'completed', score: 75 },
      ];

      (apiClient.get as any).mockResolvedValue({ data: mockAttempts });

      const result = await getMyAttempts();

      expect(apiClient.get).toHaveBeenCalledWith('/progress/attempts/me', { params: undefined });
      expect(result).toHaveLength(2);
    });

    it('should apply filters for current user', async () => {
      (apiClient.get as any).mockResolvedValue({ data: [] });

      const filters = { module_id: 'module-1' };
      await getMyAttempts(filters);

      expect(apiClient.get).toHaveBeenCalledWith('/progress/attempts/me', { params: filters });
    });
  });

  describe('submitAttempt', () => {
    it('should submit attempt with answers', async () => {
      const mockResult = {
        id: 'attempt-123',
        status: 'completed',
        score: 100,
        is_correct: true,
        xp_earned: 50,
        ml_coins_earned: 10,
      };

      (apiClient.post as any).mockResolvedValue({ data: mockResult });

      const result = await submitAttempt('attempt-123', {
        answers: { question1: 'answer1' },
        time_spent: 45,
      });

      expect(apiClient.post).toHaveBeenCalledWith('/progress/attempts/attempt-123/submit', {
        answers: { question1: 'answer1' },
        time_spent: 45,
      });
      expect(result.is_correct).toBe(true);
      expect(result.xp_earned).toBe(50);
    });

    it('should handle incorrect submission', async () => {
      const mockResult = {
        id: 'attempt-123',
        status: 'completed',
        score: 0,
        is_correct: false,
        xp_earned: 0,
        ml_coins_earned: 0,
      };

      (apiClient.post as any).mockResolvedValue({ data: mockResult });

      const result = await submitAttempt('attempt-123', {
        answers: { question1: 'wrong_answer' },
      });

      expect(result.is_correct).toBe(false);
      expect(result.xp_earned).toBe(0);
    });
  });

  describe('abandonAttempt', () => {
    it('should abandon an in-progress attempt', async () => {
      const mockResult = {
        id: 'attempt-123',
        status: 'abandoned',
      };

      (apiClient.post as any).mockResolvedValue({ data: mockResult });

      const result = await abandonAttempt('attempt-123');

      expect(apiClient.post).toHaveBeenCalledWith('/progress/attempts/attempt-123/abandon');
      expect(result.status).toBe('abandoned');
    });
  });

  describe('getAttemptAnalytics', () => {
    it('should fetch analytics for a user', async () => {
      const mockAnalytics = {
        user_id: 'user-123',
        total_attempts: 50,
        completed_attempts: 45,
        correct_attempts: 40,
        average_score: 88.5,
        accuracy_rate: 88.89,
        completion_rate: 90,
        improvement_trend: 5.2,
      };

      (apiClient.get as any).mockResolvedValue({ data: mockAnalytics });

      const result = await getAttemptAnalytics('user-123');

      expect(apiClient.get).toHaveBeenCalledWith('/progress/attempts/users/user-123/analytics');
      expect(result.total_attempts).toBe(50);
      expect(result.accuracy_rate).toBe(88.89);
    });
  });

  describe('getMyAnalytics', () => {
    it('should fetch current user analytics', async () => {
      const mockAnalytics = {
        user_id: 'current-user',
        total_attempts: 100,
        completed_attempts: 95,
        average_score: 92.3,
        strongest_modules: ['module-1', 'module-3'],
        weakest_modules: ['module-2'],
      };

      (apiClient.get as any).mockResolvedValue({ data: mockAnalytics });

      const result = await getMyAnalytics();

      expect(apiClient.get).toHaveBeenCalledWith('/progress/attempts/me/analytics');
      expect(result.strongest_modules).toContain('module-1');
    });
  });

  describe('exportAttempts', () => {
    it('should export attempts as blob', async () => {
      const mockBlob = new Blob(['csv,data'], { type: 'text/csv' });

      (apiClient.get as any).mockResolvedValue({ data: mockBlob });

      const result = await exportAttempts('user-123');

      expect(apiClient.get).toHaveBeenCalledWith('/progress/attempts/users/user-123/export', {
        params: undefined,
        responseType: 'blob',
      });
      expect(result).toBeInstanceOf(Blob);
    });

    it('should apply date filters for export', async () => {
      const mockBlob = new Blob(['csv,data'], { type: 'text/csv' });

      (apiClient.get as any).mockResolvedValue({ data: mockBlob });

      const filters = {
        from_date: '2026-01-01',
        to_date: '2026-01-13',
      };

      await exportAttempts('user-123', filters);

      expect(apiClient.get).toHaveBeenCalledWith('/progress/attempts/users/user-123/export', {
        params: filters,
        responseType: 'blob',
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty attempts array', async () => {
      (apiClient.get as any).mockResolvedValue({ data: [] });

      const result = await getUserAttempts('user-with-no-attempts');

      expect(result).toEqual([]);
    });

    it('should handle analytics with zero attempts', async () => {
      const mockAnalytics = {
        user_id: 'new-user',
        total_attempts: 0,
        completed_attempts: 0,
        correct_attempts: 0,
        average_score: 0,
        accuracy_rate: 0,
        completion_rate: 0,
        improvement_trend: 0,
        strongest_modules: [],
        weakest_modules: [],
        recent_performance: [],
      };

      (apiClient.get as any).mockResolvedValue({ data: mockAnalytics });

      const result = await getMyAnalytics();

      expect(result.total_attempts).toBe(0);
      expect(result.strongest_modules).toEqual([]);
    });
  });
});
