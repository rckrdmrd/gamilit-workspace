/**
 * Tests for useAnalytics Hook
 *
 * Tests validate that useAnalytics hook correctly:
 * - Fetches all 6 analytics endpoints in parallel
 * - Manages loading and error states
 * - Provides refresh functionality
 * - Handles CSV export
 *
 * Created: 2026-01-10
 * Part of: H-006 - Tests Frontend M07/M09
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { adminAPI } from '@/services/api/adminAPI';
import { useAnalytics } from '../useAnalytics';
import type {
  AnalyticsOverview,
  EngagementAnalytics,
  GamificationAnalytics,
  RetentionAnalytics,
  DailyActivity,
  TopUser,
} from '@/services/api/adminTypes';

// Mock adminAPI
vi.mock('@/services/api/adminAPI', () => ({
  adminAPI: {
    analytics: {
      getOverview: vi.fn(),
      getEngagement: vi.fn(),
      getGamification: vi.fn(),
      getActivityTimeline: vi.fn(),
      getTopUsers: vi.fn(),
      getRetention: vi.fn(),
      exportCSV: vi.fn(),
    },
  },
}));

// Mock window methods for CSV export
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();

describe('useAnalytics', () => {
  // Mock data
  const mockOverview: AnalyticsOverview = {
    total_users: 150,
    total_students: 120,
    total_teachers: 30,
    active_users: 100,
    avg_xp: 1500.5,
    avg_exercises_completed: 25.5,
    avg_engagement_score: 0.75,
    inactive_users: 20,
    beginner_users: 40,
    intermediate_users: 60,
    advanced_users: 30,
  };

  const mockEngagement: EngagementAnalytics = {
    by_segment: [
      {
        user_segment: 'advanced',
        users_count: 30,
        avg_engagement_score: 0.95,
        avg_exercises_completed: 50.5,
        avg_streak: 15.2,
        active_last_7d: 28,
        active_last_30d: 30,
      },
    ],
  };

  const mockGamification: GamificationAnalytics = {
    xp_distribution: [
      { xp_range: '0 XP', users_count: 10 },
      { xp_range: '1-100 XP', users_count: 25 },
    ],
    ranks_distribution: [
      { current_rank: 'Master', users_count: 5, avg_xp: 8500, avg_exercises: 100.5 },
    ],
    levels_distribution: [
      { current_level: 1, users_count: 20 },
      { current_level: 2, users_count: 35 },
    ],
  };

  const mockTimeline: DailyActivity[] = [
    {
      activity_date: '2026-01-10',
      unique_users: 85,
      total_activities: 350,
      exercises_completed: 120,
      modules_completed: 15,
      logins: 150,
    },
    {
      activity_date: '2026-01-09',
      unique_users: 78,
      total_activities: 320,
      exercises_completed: 110,
      modules_completed: 12,
      logins: 140,
    },
  ];

  const mockTopUsers: TopUser[] = [
    {
      user_id: 'user-1',
      display_name: 'Top User 1',
      email: 'top1@example.com',
      role: 'student',
      total_xp: 9500,
      exercises_completed: 150,
      current_streak: 45,
      current_rank: 'Master',
      current_level: 10,
      engagement_score: 0.98,
    },
    {
      user_id: 'user-2',
      display_name: 'Top User 2',
      email: 'top2@example.com',
      role: 'student',
      total_xp: 8500,
      exercises_completed: 130,
      current_streak: 38,
      current_rank: 'Expert',
      current_level: 9,
      engagement_score: 0.92,
    },
  ];

  const mockRetention: RetentionAnalytics = {
    cohorts: [
      {
        cohort_month: '2026-01-01',
        cohort_size: 50,
        retained_users: 45,
        retention_rate: 90,
      },
      {
        cohort_month: '2025-12-01',
        cohort_size: 40,
        retained_users: 32,
        retention_rate: 80,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup window mocks
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;
    mockCreateObjectURL.mockReturnValue('blob:mock-url');

    // Setup default success responses
    (adminAPI.analytics.getOverview as ReturnType<typeof vi.fn>).mockResolvedValue(mockOverview);
    (adminAPI.analytics.getEngagement as ReturnType<typeof vi.fn>).mockResolvedValue(mockEngagement);
    (adminAPI.analytics.getGamification as ReturnType<typeof vi.fn>).mockResolvedValue(mockGamification);
    (adminAPI.analytics.getActivityTimeline as ReturnType<typeof vi.fn>).mockResolvedValue({
      timeline: mockTimeline,
    });
    (adminAPI.analytics.getTopUsers as ReturnType<typeof vi.fn>).mockResolvedValue({
      users: mockTopUsers,
    });
    (adminAPI.analytics.getRetention as ReturnType<typeof vi.fn>).mockResolvedValue(mockRetention);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial Data Fetching', () => {
    it('should fetch all analytics data on mount', async () => {
      const { result } = renderHook(() => useAnalytics());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(adminAPI.analytics.getOverview).toHaveBeenCalledTimes(1);
      expect(adminAPI.analytics.getEngagement).toHaveBeenCalledWith({});
      expect(adminAPI.analytics.getGamification).toHaveBeenCalledTimes(1);
      expect(adminAPI.analytics.getActivityTimeline).toHaveBeenCalledWith({ days: 30 });
      expect(adminAPI.analytics.getTopUsers).toHaveBeenCalledWith({ metric: 'xp', limit: 10 });
      expect(adminAPI.analytics.getRetention).toHaveBeenCalledTimes(1);
    });

    it('should set isLoading true during fetch', async () => {
      // Delay responses to test loading state
      (adminAPI.analytics.getOverview as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockOverview), 100)),
      );

      const { result } = renderHook(() => useAnalytics());

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should populate all data fields after successful fetch', async () => {
      const { result } = renderHook(() => useAnalytics());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.overview).toEqual(mockOverview);
      expect(result.current.engagement).toEqual(mockEngagement);
      expect(result.current.gamification).toEqual(mockGamification);
      expect(result.current.activityTimeline).toEqual(mockTimeline);
      expect(result.current.topUsers).toEqual(mockTopUsers);
      expect(result.current.retention).toEqual(mockRetention);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle individual fetch errors gracefully', async () => {
      // Only overview fails
      (adminAPI.analytics.getOverview as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Overview API Error'),
      );

      const { result } = renderHook(() => useAnalytics());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Other data should still be populated
      expect(result.current.engagement).toEqual(mockEngagement);
      expect(result.current.gamification).toEqual(mockGamification);
      // Overview should be null (failed to fetch)
      expect(result.current.overview).toBeNull();
    });

    it('should handle all fetches failing', async () => {
      (adminAPI.analytics.getOverview as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('API Error'),
      );
      (adminAPI.analytics.getEngagement as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('API Error'),
      );
      (adminAPI.analytics.getGamification as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('API Error'),
      );
      (adminAPI.analytics.getActivityTimeline as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('API Error'),
      );
      (adminAPI.analytics.getTopUsers as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('API Error'),
      );
      (adminAPI.analytics.getRetention as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('API Error'),
      );

      const { result } = renderHook(() => useAnalytics());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // All data should be null/empty
      expect(result.current.overview).toBeNull();
      expect(result.current.engagement).toBeNull();
      expect(result.current.gamification).toBeNull();
      expect(result.current.activityTimeline).toEqual([]);
      expect(result.current.topUsers).toEqual([]);
      expect(result.current.retention).toBeNull();
    });

    it('should handle missing timeline in response', async () => {
      (adminAPI.analytics.getActivityTimeline as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const { result } = renderHook(() => useAnalytics());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.activityTimeline).toEqual([]);
    });

    it('should handle missing users in response', async () => {
      (adminAPI.analytics.getTopUsers as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const { result } = renderHook(() => useAnalytics());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.topUsers).toEqual([]);
    });
  });

  describe('Refresh Functionality', () => {
    it('should refetch all data when refresh is called', async () => {
      const { result } = renderHook(() => useAnalytics());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Clear mocks to check refresh calls
      vi.clearAllMocks();

      // Call refresh
      await act(async () => {
        await result.current.refresh();
      });

      expect(adminAPI.analytics.getOverview).toHaveBeenCalledTimes(1);
      expect(adminAPI.analytics.getEngagement).toHaveBeenCalledTimes(1);
      expect(adminAPI.analytics.getGamification).toHaveBeenCalledTimes(1);
      expect(adminAPI.analytics.getActivityTimeline).toHaveBeenCalledTimes(1);
      expect(adminAPI.analytics.getTopUsers).toHaveBeenCalledTimes(1);
      expect(adminAPI.analytics.getRetention).toHaveBeenCalledTimes(1);
    });

    it('should return a promise from refresh', async () => {
      const { result } = renderHook(() => useAnalytics());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Clear mocks
      vi.clearAllMocks();

      // Verify refresh returns a promise
      await act(async () => {
        const refreshResult = result.current.refresh();
        expect(refreshResult).toBeInstanceOf(Promise);
        await refreshResult;
      });

      // Verify data was refetched
      expect(adminAPI.analytics.getOverview).toHaveBeenCalled();
    });
  });

  describe('CSV Export', () => {
    it('should call exportCSV with correct parameters', async () => {
      const mockCSVData = 'Metric,Value\nTotal Users,150\nActive Users,100';
      (adminAPI.analytics.exportCSV as ReturnType<typeof vi.fn>).mockResolvedValue(mockCSVData);

      const { result } = renderHook(() => useAnalytics());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.exportToCSV();
      });

      expect(adminAPI.analytics.exportCSV).toHaveBeenCalledWith({
        type: 'overview',
        format: 'csv',
      });
    });

    it('should create blob URL for CSV download', async () => {
      const mockCSVData = 'Metric,Value\nTotal Users,150';
      (adminAPI.analytics.exportCSV as ReturnType<typeof vi.fn>).mockResolvedValue(mockCSVData);

      const { result } = renderHook(() => useAnalytics());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock document methods needed for download
      const mockLink = {
        href: '',
        setAttribute: vi.fn(),
        click: vi.fn(),
        remove: vi.fn(),
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);

      await act(async () => {
        await result.current.exportToCSV();
      });

      // Verify URL was created and revoked
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.remove).toHaveBeenCalled();
    });

    it('should throw error when export fails', async () => {
      (adminAPI.analytics.exportCSV as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Export failed'),
      );

      const { result } = renderHook(() => useAnalytics());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.exportToCSV();
        }),
      ).rejects.toThrow('Export failed');
    });
  });

  describe('Data Processing', () => {
    it('should correctly parse overview data', async () => {
      const { result } = renderHook(() => useAnalytics());

      await waitFor(() => {
        expect(result.current.overview?.total_users).toBe(150);
        expect(result.current.overview?.avg_xp).toBe(1500.5);
        expect(result.current.overview?.avg_engagement_score).toBe(0.75);
      });
    });

    it('should correctly parse engagement segments', async () => {
      const { result } = renderHook(() => useAnalytics());

      await waitFor(() => {
        expect(result.current.engagement?.by_segment).toHaveLength(1);
        expect(result.current.engagement?.by_segment[0].user_segment).toBe('advanced');
        expect(result.current.engagement?.by_segment[0].avg_engagement_score).toBe(0.95);
      });
    });

    it('should correctly parse gamification distributions', async () => {
      const { result } = renderHook(() => useAnalytics());

      await waitFor(() => {
        expect(result.current.gamification?.xp_distribution).toHaveLength(2);
        expect(result.current.gamification?.ranks_distribution[0].current_rank).toBe('Master');
        expect(result.current.gamification?.levels_distribution).toHaveLength(2);
      });
    });

    it('should correctly parse activity timeline', async () => {
      const { result } = renderHook(() => useAnalytics());

      await waitFor(() => {
        expect(result.current.activityTimeline).toHaveLength(2);
        expect(result.current.activityTimeline[0].activity_date).toBe('2026-01-10');
        expect(result.current.activityTimeline[0].unique_users).toBe(85);
      });
    });

    it('should correctly parse top users', async () => {
      const { result } = renderHook(() => useAnalytics());

      await waitFor(() => {
        expect(result.current.topUsers).toHaveLength(2);
        expect(result.current.topUsers[0].display_name).toBe('Top User 1');
        expect(result.current.topUsers[0].total_xp).toBe(9500);
      });
    });

    it('should correctly parse retention cohorts', async () => {
      const { result } = renderHook(() => useAnalytics());

      await waitFor(() => {
        expect(result.current.retention?.cohorts).toHaveLength(2);
        expect(result.current.retention?.cohorts[0].retention_rate).toBe(90);
      });
    });
  });

  describe('Parallel Fetching', () => {
    it('should call all 6 analytics endpoints', async () => {
      renderHook(() => useAnalytics());

      await waitFor(() => {
        // All 6 endpoints should be called
        expect(adminAPI.analytics.getOverview).toHaveBeenCalled();
        expect(adminAPI.analytics.getEngagement).toHaveBeenCalled();
        expect(adminAPI.analytics.getGamification).toHaveBeenCalled();
        expect(adminAPI.analytics.getActivityTimeline).toHaveBeenCalled();
        expect(adminAPI.analytics.getTopUsers).toHaveBeenCalled();
        expect(adminAPI.analytics.getRetention).toHaveBeenCalled();
      });
    });
  });
});
