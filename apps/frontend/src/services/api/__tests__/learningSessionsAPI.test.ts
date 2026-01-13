/**
 * Learning Sessions API Tests
 *
 * Tests for learning sessions API integration
 * Created: 2026-01-13
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../apiClient';
import {
  learningSessionsAPI,
  createSession,
  getSessionById,
  getUserSessions,
  getActiveSession,
  endSession,
  updateEngagement,
  getSessionStats,
  getSessionsByDateRange,
  type LearningSession,
  type SessionStats,
} from '../learningSessionsAPI';

// Mock the API client
vi.mock('../apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

// Mock the error handler
vi.mock('../apiErrorHandler', () => ({
  handleAPIError: (error: unknown, message: string) => {
    const err = new Error(message);
    (err as Error & { originalError: unknown }).originalError = error;
    return err;
  },
}));

describe('learningSessionsAPI', () => {
  const mockSession: LearningSession = {
    id: 'session-123',
    user_id: 'user-456',
    module_id: 'module-789',
    started_at: '2026-01-13T10:00:00Z',
    is_active: true,
    exercises_completed: 5,
    exercises_attempted: 7,
    xp_earned: 100,
    ml_coins_earned: 20,
    engagement_score: 85,
    device_type: 'desktop',
    created_at: '2026-01-13T10:00:00Z',
  };

  const mockCompletedSession: LearningSession = {
    ...mockSession,
    id: 'session-completed',
    is_active: false,
    ended_at: '2026-01-13T11:30:00Z',
    duration: 'PT1H30M',
  };

  const mockStats: SessionStats = {
    user_id: 'user-456',
    period: 'weekly',
    total_sessions: 10,
    total_time: 'PT15H',
    average_duration: 'PT1H30M',
    total_exercises_completed: 50,
    total_xp_earned: 500,
    total_ml_coins_earned: 100,
    average_engagement: 78,
    sessions_per_day: 1.4,
    most_active_day: 'Monday',
    most_active_time: '14:00',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // Session Creation
  // ==========================================================================

  describe('createSession', () => {
    it('should create a new learning session', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockSession });

      const result = await createSession({
        user_id: 'user-456',
        module_id: 'module-789',
        device_type: 'desktop',
      });

      expect(apiClient.post).toHaveBeenCalledWith('/progress/sessions', {
        user_id: 'user-456',
        module_id: 'module-789',
        device_type: 'desktop',
      });
      expect(result).toEqual(mockSession);
    });

    it('should create session without optional fields', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockSession });

      await createSession({ user_id: 'user-456' });

      expect(apiClient.post).toHaveBeenCalledWith('/progress/sessions', {
        user_id: 'user-456',
      });
    });

    it('should throw error on creation failure', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Network error'));

      await expect(createSession({ user_id: 'user-456' })).rejects.toThrow(
        'Failed to create learning session',
      );
    });

    it('should work via namespace', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockSession });

      const result = await learningSessionsAPI.create({
        user_id: 'user-456',
        device_type: 'mobile',
      });

      expect(result).toEqual(mockSession);
    });
  });

  // ==========================================================================
  // Session Retrieval
  // ==========================================================================

  describe('getSessionById', () => {
    it('should fetch session by ID', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockSession });

      const result = await getSessionById('session-123');

      expect(apiClient.get).toHaveBeenCalledWith('/progress/sessions/session-123');
      expect(result).toEqual(mockSession);
    });

    it('should throw error if session not found', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Not found'));

      await expect(getSessionById('invalid-id')).rejects.toThrow('Failed to fetch session');
    });

    it('should work via namespace', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockSession });

      const result = await learningSessionsAPI.getById('session-123');

      expect(result).toEqual(mockSession);
    });
  });

  describe('getUserSessions', () => {
    it('should fetch all sessions for a user', async () => {
      const sessions = [mockSession, mockCompletedSession];
      vi.mocked(apiClient.get).mockResolvedValue({ data: sessions });

      const result = await getUserSessions('user-456');

      expect(apiClient.get).toHaveBeenCalledWith('/progress/sessions/users/user-456');
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockSession);
    });

    it('should return empty array if no sessions', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [] });

      const result = await getUserSessions('user-new');

      expect(result).toHaveLength(0);
    });

    it('should throw error on failure', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Server error'));

      await expect(getUserSessions('user-456')).rejects.toThrow('Failed to fetch user sessions');
    });
  });

  describe('getActiveSession', () => {
    it('should fetch active session for user', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockSession });

      const result = await getActiveSession('user-456');

      expect(apiClient.get).toHaveBeenCalledWith('/progress/sessions/users/user-456/active');
      expect(result).toEqual(mockSession);
      expect(result?.is_active).toBe(true);
    });

    it('should return null if no active session', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: null });

      const result = await getActiveSession('user-456');

      expect(result).toBeNull();
    });

    it('should work via namespace', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockSession });

      const result = await learningSessionsAPI.getActive('user-456');

      expect(result).toEqual(mockSession);
    });
  });

  // ==========================================================================
  // Session Lifecycle
  // ==========================================================================

  describe('endSession', () => {
    it('should end an active session', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockCompletedSession });

      const result = await endSession('session-123');

      expect(apiClient.post).toHaveBeenCalledWith('/progress/sessions/session-123/end');
      expect(result.is_active).toBe(false);
      expect(result.ended_at).toBeDefined();
    });

    it('should throw error if session cannot be ended', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Session already ended'));

      await expect(endSession('session-123')).rejects.toThrow('Failed to end session');
    });

    it('should work via namespace', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockCompletedSession });

      const result = await learningSessionsAPI.end('session-123');

      expect(result.is_active).toBe(false);
    });
  });

  // ==========================================================================
  // Engagement Updates
  // ==========================================================================

  describe('updateEngagement', () => {
    it('should update session engagement metrics', async () => {
      const updatedSession = { ...mockSession, engagement_score: 90 };
      vi.mocked(apiClient.patch).mockResolvedValue({ data: updatedSession });

      const result = await updateEngagement('session-123', {
        clicks_count: 50,
        page_views: 10,
        exercises_completed: 3,
      });

      expect(apiClient.patch).toHaveBeenCalledWith('/progress/sessions/session-123/engagement', {
        clicks_count: 50,
        page_views: 10,
        exercises_completed: 3,
      });
      expect(result.engagement_score).toBe(90);
    });

    it('should update with time metrics', async () => {
      vi.mocked(apiClient.patch).mockResolvedValue({ data: mockSession });

      await updateEngagement('session-123', {
        active_time: 'PT30M',
        idle_time: 'PT5M',
      });

      expect(apiClient.patch).toHaveBeenCalledWith('/progress/sessions/session-123/engagement', {
        active_time: 'PT30M',
        idle_time: 'PT5M',
      });
    });

    it('should throw error on update failure', async () => {
      vi.mocked(apiClient.patch).mockRejectedValue(new Error('Invalid data'));

      await expect(
        updateEngagement('session-123', { clicks_count: -1 }),
      ).rejects.toThrow('Failed to update engagement');
    });
  });

  // ==========================================================================
  // Statistics
  // ==========================================================================

  describe('getSessionStats', () => {
    it('should fetch weekly statistics by default', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockStats });

      const result = await getSessionStats('user-456');

      expect(apiClient.get).toHaveBeenCalledWith('/progress/sessions/users/user-456/stats', {
        params: { period: 'daily' },
      });
      expect(result).toEqual(mockStats);
    });

    it('should fetch statistics for specified period', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockStats });

      await getSessionStats('user-456', 'monthly');

      expect(apiClient.get).toHaveBeenCalledWith('/progress/sessions/users/user-456/stats', {
        params: { period: 'monthly' },
      });
    });

    it('should work via namespace', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockStats });

      const result = await learningSessionsAPI.getStats('user-456', 'weekly');

      expect(apiClient.get).toHaveBeenCalledWith('/progress/sessions/users/user-456/stats', {
        params: { period: 'weekly' },
      });
      expect(result).toEqual(mockStats);
    });

    it('should throw error on failure', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Server error'));

      await expect(getSessionStats('user-456')).rejects.toThrow(
        'Failed to fetch session statistics',
      );
    });
  });

  // ==========================================================================
  // Date Range Queries
  // ==========================================================================

  describe('getSessionsByDateRange', () => {
    it('should fetch sessions within date range', async () => {
      const sessions = [mockSession, mockCompletedSession];
      vi.mocked(apiClient.get).mockResolvedValue({ data: sessions });

      const result = await getSessionsByDateRange(
        'user-456',
        '2026-01-01T00:00:00Z',
        '2026-01-13T23:59:59Z',
      );

      expect(apiClient.get).toHaveBeenCalledWith('/progress/sessions/users/user-456/range', {
        params: {
          startDate: '2026-01-01T00:00:00Z',
          endDate: '2026-01-13T23:59:59Z',
        },
      });
      expect(result).toHaveLength(2);
    });

    it('should return empty array for range with no sessions', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [] });

      const result = await getSessionsByDateRange(
        'user-456',
        '2025-01-01T00:00:00Z',
        '2025-01-31T23:59:59Z',
      );

      expect(result).toHaveLength(0);
    });

    it('should work via namespace', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [mockSession] });

      const result = await learningSessionsAPI.getByDateRange(
        'user-456',
        '2026-01-01',
        '2026-01-13',
      );

      expect(result).toHaveLength(1);
    });

    it('should throw error on failure', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Invalid dates'));

      await expect(
        getSessionsByDateRange('user-456', 'invalid', 'invalid'),
      ).rejects.toThrow('Failed to fetch sessions by date range');
    });
  });

  // ==========================================================================
  // Namespace Export
  // ==========================================================================

  describe('learningSessionsAPI namespace', () => {
    it('should expose all methods', () => {
      expect(learningSessionsAPI.create).toBeDefined();
      expect(learningSessionsAPI.getById).toBeDefined();
      expect(learningSessionsAPI.end).toBeDefined();
      expect(learningSessionsAPI.getUserSessions).toBeDefined();
      expect(learningSessionsAPI.getActive).toBeDefined();
      expect(learningSessionsAPI.getByDateRange).toBeDefined();
      expect(learningSessionsAPI.updateEngagement).toBeDefined();
      expect(learningSessionsAPI.getStats).toBeDefined();
    });
  });
});
