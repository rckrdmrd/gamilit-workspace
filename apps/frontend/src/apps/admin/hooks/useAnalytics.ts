/**
 * useAnalytics Hook
 *
 * Custom hook for managing analytics data in the Admin Portal.
 * Provides state management and data fetching for all analytics endpoints.
 *
 * Features:
 * - Fetches overview, engagement, gamification, activity, top users, and retention data
 * - Manages loading and error states
 * - Provides refresh functionality
 * - CSV export capability
 *
 * @author Frontend-Developer Agent
 * @date 2025-11-24
 */

import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '@/services/api/adminAPI';
import type {
  AnalyticsOverview,
  EngagementAnalytics,
  GamificationAnalytics,
  RetentionAnalytics,
  DailyActivity,
  TopUser,
} from '@/services/api/adminTypes';

/**
 * Analytics Hook State Interface
 */
interface UseAnalyticsReturn {
  // Data
  overview: AnalyticsOverview | null;
  engagement: EngagementAnalytics | null;
  gamification: GamificationAnalytics | null;
  activityTimeline: DailyActivity[];
  topUsers: TopUser[];
  retention: RetentionAnalytics | null;

  // State
  isLoading: boolean;
  error: string | null;

  // Actions
  refresh: () => Promise<void>;
  exportToCSV: () => Promise<void>;
}

/**
 * useAnalytics Hook
 *
 * Fetches and manages all analytics data for the admin dashboard.
 */
export function useAnalytics(): UseAnalyticsReturn {
  // State
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [engagement, setEngagement] = useState<EngagementAnalytics | null>(null);
  const [gamification, setGamification] = useState<GamificationAnalytics | null>(null);
  const [activityTimeline, setActivityTimeline] = useState<DailyActivity[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [retention, setRetention] = useState<RetentionAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch overview analytics
   */
  const fetchOverview = useCallback(async () => {
    try {
      const response = await adminAPI.analytics.getOverview();
      setOverview(response);
    } catch (err: unknown) {
      console.error('Error fetching overview:', err);
      // Don't set global error for individual fetch failures
    }
  }, []);

  /**
   * Fetch engagement analytics
   */
  const fetchEngagement = useCallback(async () => {
    try {
      const response = await adminAPI.analytics.getEngagement({});
      setEngagement(response);
    } catch (err: unknown) {
      console.error('Error fetching engagement:', err);
    }
  }, []);

  /**
   * Fetch gamification analytics
   */
  const fetchGamification = useCallback(async () => {
    try {
      const response = await adminAPI.analytics.getGamification();
      setGamification(response);
    } catch (err: unknown) {
      console.error('Error fetching gamification:', err);
    }
  }, []);

  /**
   * Fetch activity timeline
   */
  const fetchActivityTimeline = useCallback(async () => {
    try {
      const response = await adminAPI.analytics.getActivityTimeline({ days: 30 });
      setActivityTimeline(response.timeline || []);
    } catch (err: unknown) {
      console.error('Error fetching activity timeline:', err);
    }
  }, []);

  /**
   * Fetch top users
   */
  const fetchTopUsers = useCallback(async () => {
    try {
      const response = await adminAPI.analytics.getTopUsers({
        metric: 'xp',
        limit: 10,
      });
      setTopUsers(response.users || []);
    } catch (err: unknown) {
      console.error('Error fetching top users:', err);
    }
  }, []);

  /**
   * Fetch retention analytics
   */
  const fetchRetention = useCallback(async () => {
    try {
      const response = await adminAPI.analytics.getRetention();
      setRetention(response);
    } catch (err: unknown) {
      console.error('Error fetching retention:', err);
    }
  }, []);

  /**
   * Fetch all analytics data
   */
  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchOverview(),
        fetchEngagement(),
        fetchGamification(),
        fetchActivityTimeline(),
        fetchTopUsers(),
        fetchRetention(),
      ]);
    } catch (err: unknown) {
      setError(err.message || 'Error al cargar analíticas');
      console.error('Error fetching analytics:', err);
    } finally {
      setIsLoading(false);
    }
  }, [
    fetchOverview,
    fetchEngagement,
    fetchGamification,
    fetchActivityTimeline,
    fetchTopUsers,
    fetchRetention,
  ]);

  /**
   * Refresh all data
   */
  const refresh = useCallback(() => {
    return fetchAll();
  }, [fetchAll]);

  /**
   * Export analytics to CSV
   */
  const exportToCSV = useCallback(async () => {
    try {
      const response = await adminAPI.analytics.exportCSV({
        type: 'overview',
        format: 'csv',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-overview-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      console.error('Error exporting CSV:', err);
      throw err;
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    overview,
    engagement,
    gamification,
    activityTimeline,
    topUsers,
    retention,
    isLoading,
    error,
    refresh,
    exportToCSV,
  };
}
