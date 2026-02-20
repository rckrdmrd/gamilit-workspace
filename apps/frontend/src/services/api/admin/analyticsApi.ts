/**
 * Admin Analytics API
 *
 * Functions for analytics overview, engagement, gamification, timeline, top users, and retention.
 * Split from adminAPI.ts monolith for modularity.
 */

import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';
import { handleAPIError } from '../apiErrorHandler';
import type {
  AnalyticsOverview,
  EngagementAnalytics,
  GamificationAnalytics,
  ActivityTimeline,
  TopUsers,
  RetentionAnalytics,
} from '../adminTypes';

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Get analytics overview
 *
 * Status: Backend IMPLEMENTED
 */
export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  try {
    const response = await apiClient.get<AnalyticsOverview>(API_ENDPOINTS.admin.analytics.overview);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch analytics overview');
  }
}

/**
 * Get engagement analytics
 *
 * Status: Backend IMPLEMENTED
 */
export async function getEngagementAnalytics(params?: {
  role?: string;
  date_from?: string;
  date_to?: string;
}): Promise<EngagementAnalytics> {
  try {
    const response = await apiClient.get<EngagementAnalytics>(
      API_ENDPOINTS.admin.analytics.engagement,
      { params },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch engagement analytics');
  }
}

/**
 * Get gamification analytics
 *
 * Status: Backend IMPLEMENTED
 */
export async function getGamificationAnalytics(): Promise<GamificationAnalytics> {
  try {
    const response = await apiClient.get<GamificationAnalytics>(
      API_ENDPOINTS.admin.analytics.gamification,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch gamification analytics');
  }
}

/**
 * Get activity timeline
 *
 * Status: Backend IMPLEMENTED
 */
export async function getActivityTimeline(params?: { days?: number }): Promise<ActivityTimeline> {
  try {
    const response = await apiClient.get<ActivityTimeline>(
      API_ENDPOINTS.admin.analytics.activityTimeline,
      { params },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch activity timeline');
  }
}

/**
 * Get top users
 *
 * Status: Backend IMPLEMENTED
 */
export async function getTopUsers(params?: {
  metric?: 'xp' | 'exercises' | 'streak';
  limit?: number;
  role?: string;
}): Promise<TopUsers> {
  try {
    const response = await apiClient.get<TopUsers>(API_ENDPOINTS.admin.analytics.topUsers, {
      params,
    });
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch top users');
  }
}

/**
 * Get retention analytics
 *
 * Status: Backend IMPLEMENTED
 */
export async function getRetentionAnalytics(): Promise<RetentionAnalytics> {
  try {
    const response = await apiClient.get<RetentionAnalytics>(
      API_ENDPOINTS.admin.analytics.retention,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch retention analytics');
  }
}

/**
 * Export analytics to CSV
 *
 * Status: Backend IMPLEMENTED
 */
export async function exportAnalyticsCSV(params: {
  type: 'overview' | 'users' | 'engagement' | 'gamification';
  format: 'csv';
}): Promise<Blob> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.admin.analytics.export, {
      params,
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to export analytics');
  }
}

/**
 * Analytics API namespace object
 */
export const analyticsApi = {
  getAnalyticsOverview,
  getEngagementAnalytics,
  getGamificationAnalytics,
  getActivityTimeline,
  getTopUsers,
  getRetentionAnalytics,
  exportAnalyticsCSV,
};
