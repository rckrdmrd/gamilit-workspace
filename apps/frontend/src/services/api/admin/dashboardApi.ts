/**
 * Admin Dashboard API
 *
 * Functions for admin dashboard data, recent actions, alerts, and user activity.
 * Split from adminAPI.ts monolith for modularity.
 */

import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';
import { handleAPIError } from '../apiErrorHandler';
import type {
  DashboardData,
  MayaRankConfig,
} from '../adminTypes';

// Import types from admin types for dashboard functions
import type { AdminAction, SystemAlert, UserActivityData } from '@/apps/admin/types';

// ============================================================================
// DASHBOARD
// ============================================================================

/**
 * Get admin dashboard data
 * Includes: stats, recent activity, growth data
 */
export async function getAdminDashboard(): Promise<DashboardData> {
  try {
    const response = await apiClient.get<DashboardData>(API_ENDPOINTS.admin.dashboard);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch admin dashboard');
  }
}

/**
 * Get recent admin actions
 * Backend: GET /admin/dashboard/actions/recent
 * Status: IMPLEMENTED (Phase 2)
 */
export async function getRecentActions(limit: number = 10): Promise<AdminAction[]> {
  try {
    const response = await apiClient.get<AdminAction[]>(
      `${API_ENDPOINTS.admin.dashboard}/actions/recent`,
      { params: { limit } },
    );

    const actions = response.data;

    // Defensive: Handle when backend doesn't return data
    if (!actions || !Array.isArray(actions)) {
      console.warn('[adminAPI] getRecentActions: Backend returned no data, returning empty array');
      return [];
    }

    // Transform snake_case to camelCase if needed and ensure Date objects
    return actions.map((action) => ({
      ...action,
      timestamp: action.timestamp instanceof Date ? action.timestamp : new Date(action.timestamp),
    }));
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch recent actions');
  }
}

/**
 * Get system alerts
 * Backend: GET /admin/dashboard/alerts
 * Status: IMPLEMENTED (Phase 2)
 */
export async function getAlerts(): Promise<SystemAlert[]> {
  try {
    const response = await apiClient.get<SystemAlert[]>(`${API_ENDPOINTS.admin.dashboard}/alerts`);

    const alerts = response.data;

    // Defensive: Handle when backend doesn't return data
    if (!alerts || !Array.isArray(alerts)) {
      console.warn('[adminAPI] getAlerts: Backend returned no data, returning empty array');
      return [];
    }

    // Ensure Date objects
    return alerts.map((alert) => ({
      ...alert,
      timestamp: alert.timestamp instanceof Date ? alert.timestamp : new Date(alert.timestamp),
    }));
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch alerts');
  }
}

/**
 * Get user activity analytics
 * Backend: GET /admin/dashboard/analytics/user-activity
 * Status: IMPLEMENTED (Phase 2)
 */
export async function getUserActivity(params?: {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
}): Promise<UserActivityData[]> {
  try {
    const response = await apiClient.get<{
      labels: string[];
      data: number[];
      tableData: UserActivityData[];
    }>(`${API_ENDPOINTS.admin.dashboard}/analytics/user-activity`, { params });

    // Backend returns dual format: {labels, data, tableData}
    // Frontend needs tableData for the table display
    return response.data.tableData;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch user activity');
  }
}

/**
 * Get Maya ranks configuration
 * Backend: GET /admin/gamification-config/maya-ranks
 * Status: IMPLEMENTED (Phase 2)
 *
 * @returns MayaRankConfig[] - Array of rank configurations
 * @see MayaRankConfig - Interface for rank config (not to confuse with MayaRank enum)
 */
export async function getMayaRanks(): Promise<MayaRankConfig[]> {
  try {
    const response = await apiClient.get<MayaRankConfig[]>(
      `${API_ENDPOINTS.admin.gamification}/maya-ranks`,
    );

    const ranks = response.data;

    // Transform snake_case keys to camelCase if needed
    return ranks.map((rank) => {
      const r = rank as unknown as Record<string, unknown>;
      return {
        id: rank.id,
        name: rank.name,
        level: (r.level as number) || 0,
        minXP: (r.min_xp as number) || (r.minXp as number) || rank.minXP,
        maxXP: (r.max_xp as number) || (r.maxXp as number) || rank.maxXP,
        multiplierXp: (r.multiplier_xp as number) || (r.multiplierXp as number) || 1.0,
        multiplierMlCoins:
          (r.multiplier_ml_coins as number) || (r.multiplierMlCoins as number) || 1.0,
        bonusMlCoins: (r.bonus_ml_coins as number) || (r.bonusMlCoins as number) || 0,
        color: rank.color || '#6B7280',
        icon: rank.icon,
        description: (r.description as string) || '',
        perks: (r.perks as string[]) || [],
        isActive:
          r.is_active !== undefined
            ? (r.is_active as boolean)
            : r.isActive !== undefined
              ? (r.isActive as boolean)
              : true,
        order:
          r.order !== undefined ? (r.order as number) : (r.display_order as number) || 0,
      };
    });
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch Maya ranks');
  }
}

/**
 * Dashboard API namespace object
 */
export const dashboardApi = {
  getAdminDashboard,
  getRecentActions,
  getAlerts,
  getUserActivity,
  getMayaRanks,
};
