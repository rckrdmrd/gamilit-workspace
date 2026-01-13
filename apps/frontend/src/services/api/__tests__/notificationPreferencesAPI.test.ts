/**
 * Notification Preferences API Tests
 *
 * Tests for notificationPreferencesAPI functions
 * Created: 2026-01-13
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getPreferences,
  updatePreferences,
  toggleCategoryChannel,
  resetPreferences,
  getDevices,
  registerDevice,
  unregisterDevice,
  testPushNotification,
} from '../notificationPreferencesAPI';
import { apiClient } from '@/services/api/apiClient';

// Mock apiClient
vi.mock('../apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock error handler
vi.mock('../apiErrorHandler', () => ({
  handleAPIError: vi.fn((_error, message) => {
    throw new Error(message);
  }),
}));

describe('notificationPreferencesAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPreferences', () => {
    it('should fetch all notification preferences', async () => {
      const mockPreferences = {
        global_enabled: true,
        email_enabled: true,
        push_enabled: false,
        in_app_enabled: true,
        categories: [
          {
            category: 'achievements',
            email: true,
            push: true,
            in_app: true,
          },
          {
            category: 'social',
            email: false,
            push: true,
            in_app: true,
          },
        ],
        quiet_hours: {
          enabled: true,
          start: '22:00',
          end: '08:00',
        },
      };

      (apiClient.get as any).mockResolvedValue({ data: mockPreferences });

      const result = await getPreferences();

      expect(apiClient.get).toHaveBeenCalledWith('/notifications/preferences');
      expect(result.global_enabled).toBe(true);
      expect(result.categories).toHaveLength(2);
    });

    it('should return default preferences for new user', async () => {
      const mockDefaults = {
        global_enabled: true,
        email_enabled: true,
        push_enabled: false,
        in_app_enabled: true,
        categories: [],
      };

      (apiClient.get as any).mockResolvedValue({ data: mockDefaults });

      const result = await getPreferences();

      expect(result.categories).toEqual([]);
    });
  });

  describe('updatePreferences', () => {
    it('should update global preferences', async () => {
      const mockUpdated = {
        global_enabled: true,
        email_enabled: false,
        push_enabled: true,
        in_app_enabled: true,
      };

      (apiClient.patch as any).mockResolvedValue({ data: mockUpdated });

      const result = await updatePreferences({
        email_enabled: false,
        push_enabled: true,
      });

      expect(apiClient.patch).toHaveBeenCalledWith('/notifications/preferences', {
        email_enabled: false,
        push_enabled: true,
      });
      expect(result.email_enabled).toBe(false);
      expect(result.push_enabled).toBe(true);
    });

    it('should update quiet hours', async () => {
      const mockUpdated = {
        quiet_hours: {
          enabled: true,
          start: '23:00',
          end: '07:00',
        },
      };

      (apiClient.patch as any).mockResolvedValue({ data: mockUpdated });

      await updatePreferences({
        quiet_hours: {
          enabled: true,
          start: '23:00',
          end: '07:00',
        },
      });

      expect(apiClient.patch).toHaveBeenCalledWith('/notifications/preferences', {
        quiet_hours: {
          enabled: true,
          start: '23:00',
          end: '07:00',
        },
      });
    });
  });

  describe('toggleCategoryChannel', () => {
    it('should toggle email for a category', async () => {
      const mockResult = {
        global_enabled: true,
        categories: [
          { category: 'achievements', email: false, push: true, in_app: true },
        ],
      };

      (apiClient.patch as any).mockResolvedValue({ data: mockResult });

      const result = await toggleCategoryChannel('achievements', 'email', false);

      expect(apiClient.patch).toHaveBeenCalledWith(
        '/notifications/preferences/category/achievements/channel/email',
        { enabled: false },
      );
      expect(result.categories[0].email).toBe(false);
    });

    it('should toggle push for a category', async () => {
      const mockResult = {
        global_enabled: true,
        categories: [
          { category: 'social', push: true },
        ],
      };

      (apiClient.patch as any).mockResolvedValue({ data: mockResult });

      await toggleCategoryChannel('social', 'push', true);

      expect(apiClient.patch).toHaveBeenCalledWith(
        '/notifications/preferences/category/social/channel/push',
        { enabled: true },
      );
    });
  });

  describe('resetPreferences', () => {
    it('should reset to default preferences', async () => {
      const mockDefaults = {
        global_enabled: true,
        email_enabled: true,
        push_enabled: false,
        in_app_enabled: true,
        categories: [],
        message: 'Preferences reset to defaults',
      };

      (apiClient.post as any).mockResolvedValue({ data: mockDefaults });

      const result = await resetPreferences();

      expect(apiClient.post).toHaveBeenCalledWith('/notifications/preferences/reset');
      expect(result.email_enabled).toBe(true);
    });
  });

  describe('getDevices', () => {
    it('should fetch registered devices', async () => {
      const mockDevices = [
        {
          id: 'device-1',
          name: 'iPhone 15',
          type: 'ios',
          push_token: 'token-abc',
          last_used_at: '2026-01-13T10:00:00Z',
        },
        {
          id: 'device-2',
          name: 'Chrome Browser',
          type: 'web',
          push_token: 'token-xyz',
          last_used_at: '2026-01-12T15:00:00Z',
        },
      ];

      (apiClient.get as any).mockResolvedValue({ data: mockDevices });

      const result = await getDevices();

      expect(apiClient.get).toHaveBeenCalledWith('/notifications/devices');
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('ios');
    });

    it('should handle no registered devices', async () => {
      (apiClient.get as any).mockResolvedValue({ data: [] });

      const result = await getDevices();

      expect(result).toEqual([]);
    });
  });

  describe('registerDevice', () => {
    it('should register a new device', async () => {
      const mockDevice = {
        id: 'new-device',
        name: 'Android Phone',
        type: 'android',
        push_token: 'fcm-token',
        created_at: '2026-01-13T11:00:00Z',
      };

      (apiClient.post as any).mockResolvedValue({ data: mockDevice });

      const result = await registerDevice({
        name: 'Android Phone',
        type: 'android',
        push_token: 'fcm-token',
      });

      expect(apiClient.post).toHaveBeenCalledWith('/notifications/devices', {
        name: 'Android Phone',
        type: 'android',
        push_token: 'fcm-token',
      });
      expect(result.id).toBe('new-device');
    });

    it('should update existing device token', async () => {
      const mockDevice = {
        id: 'existing-device',
        push_token: 'new-token',
        updated_at: '2026-01-13T11:00:00Z',
      };

      (apiClient.post as any).mockResolvedValue({ data: mockDevice });

      await registerDevice({
        name: 'My Phone',
        type: 'ios',
        push_token: 'new-token',
      });

      expect(apiClient.post).toHaveBeenCalled();
    });
  });

  describe('unregisterDevice', () => {
    it('should unregister a device', async () => {
      (apiClient.delete as any).mockResolvedValue({ data: { success: true } });

      await unregisterDevice('device-to-remove');

      expect(apiClient.delete).toHaveBeenCalledWith('/notifications/devices/device-to-remove');
    });

    it('should handle non-existent device', async () => {
      (apiClient.delete as any).mockRejectedValue(new Error('Not found'));

      await expect(unregisterDevice('invalid')).rejects.toThrow('Failed to unregister device');
    });
  });

  describe('testPushNotification', () => {
    it('should send test notification to device', async () => {
      const mockResult = {
        sent: true,
        device_id: 'device-123',
        message: 'Test notification sent',
      };

      (apiClient.post as any).mockResolvedValue({ data: mockResult });

      const result = await testPushNotification('device-123');

      expect(apiClient.post).toHaveBeenCalledWith('/notifications/devices/device-123/test');
      expect(result.sent).toBe(true);
    });

    it('should handle failed test notification', async () => {
      (apiClient.post as any).mockRejectedValue(new Error('Push failed'));

      await expect(testPushNotification('device-123')).rejects.toThrow(
        'Failed to send test notification',
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle network errors', async () => {
      (apiClient.get as any).mockRejectedValue(new Error('Network error'));

      await expect(getPreferences()).rejects.toThrow('Failed to fetch notification preferences');
    });

    it('should handle empty category list', async () => {
      const mockPrefs = {
        global_enabled: true,
        categories: [],
      };

      (apiClient.get as any).mockResolvedValue({ data: mockPrefs });

      const result = await getPreferences();

      expect(result.categories).toEqual([]);
    });
  });
});
