/**
 * Notifications API
 *
 * API client for notifications endpoints.
 * Phase 4 implementation.
 */

import { apiClient } from './apiClient';

export interface Notification {
  id: string;
  userId: string;
  type:
    | 'achievement_unlocked'
    | 'rank_promoted'
    | 'mission_completed'
    | 'mission_expired'
    | 'friend_request'
    | 'friend_accepted'
    | 'assignment_created'
    | 'assignment_graded'
    | 'module_unlocked'
    | 'coins_received'
    | 'system_announcement';
  title: string;
  message: string;
  data?: Record<string, any>;
  status: 'unread' | 'read';
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export const notificationsAPI = {
  /**
   * Get user notifications with optional filters
   */
  getNotifications: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: 'unread' | 'read' | 'all';
  }): Promise<NotificationsResponse> => {
    const response = await apiClient.get('/notifications', { params });
    return response.data.data;
  },

  /**
   * Get count of unread notifications
   */
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data.data.count;
  },

  /**
   * Mark specific notification as read
   */
  markAsRead: async (id: string): Promise<void> => {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<number> => {
    const response = await apiClient.post('/notifications/read-all');
    return response.data.data.marked;
  },

  /**
   * Delete specific notification
   */
  deleteNotification: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },

  /**
   * Clear all notifications
   */
  clearAll: async (): Promise<number> => {
    const response = await apiClient.delete('/notifications/clear-all');
    return response.data.data.deleted;
  },
};
