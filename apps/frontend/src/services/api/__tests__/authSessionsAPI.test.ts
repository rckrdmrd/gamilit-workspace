/**
 * Auth Sessions API Tests
 *
 * Tests for authSessionsAPI functions
 * Created: 2026-01-13
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getSessions,
  getSessionById,
  getCurrentSession,
  getSessionSummary,
  revokeSession,
  revokeAllOtherSessions,
  revokeSessionsByDevice,
} from '../authSessionsAPI';
import { apiClient } from '@/services/api/apiClient';

// Mock apiClient
vi.mock('../apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock error handler
vi.mock('../apiErrorHandler', () => ({
  handleAPIError: vi.fn((_error, message) => {
    throw new Error(message);
  }),
}));

describe('authSessionsAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSessions', () => {
    it('should fetch all user sessions', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          device_name: 'Chrome on Windows',
          ip_address: '192.168.1.1',
          is_current: true,
          last_activity_at: '2026-01-13T10:00:00Z',
          created_at: '2026-01-01T00:00:00Z',
        },
        {
          id: 'session-2',
          device_name: 'Safari on iPhone',
          ip_address: '192.168.1.2',
          is_current: false,
          last_activity_at: '2026-01-12T15:00:00Z',
          created_at: '2026-01-05T00:00:00Z',
        },
      ];

      (apiClient.get as any).mockResolvedValue({ data: mockSessions });

      const result = await getSessions();

      expect(apiClient.get).toHaveBeenCalledWith('/auth/sessions');
      expect(result).toHaveLength(2);
      expect(result[0].is_current).toBe(true);
    });

    it('should handle empty sessions', async () => {
      (apiClient.get as any).mockResolvedValue({ data: [] });

      const result = await getSessions();

      expect(result).toEqual([]);
    });
  });

  describe('getSessionById', () => {
    it('should fetch specific session', async () => {
      const mockSession = {
        id: 'session-123',
        device_name: 'Firefox on Linux',
        ip_address: '10.0.0.1',
        user_agent: 'Mozilla/5.0 (X11; Linux x86_64)',
        is_current: false,
        last_activity_at: '2026-01-13T09:00:00Z',
      };

      (apiClient.get as any).mockResolvedValue({ data: mockSession });

      const result = await getSessionById('session-123');

      expect(apiClient.get).toHaveBeenCalledWith('/auth/sessions/session-123');
      expect(result.device_name).toBe('Firefox on Linux');
    });

    it('should throw error for invalid session', async () => {
      (apiClient.get as any).mockRejectedValue(new Error('Not found'));

      await expect(getSessionById('invalid')).rejects.toThrow('Failed to fetch session');
    });
  });

  describe('getCurrentSession', () => {
    it('should fetch current session', async () => {
      const mockSession = {
        id: 'current-session',
        device_name: 'Current Browser',
        is_current: true,
        ip_address: '127.0.0.1',
      };

      (apiClient.get as any).mockResolvedValue({ data: mockSession });

      const result = await getCurrentSession();

      expect(apiClient.get).toHaveBeenCalledWith('/auth/sessions/current');
      expect(result.is_current).toBe(true);
    });
  });

  describe('getSessionSummary', () => {
    it('should fetch session summary', async () => {
      const mockSummary = {
        total_sessions: 5,
        active_sessions: 3,
        devices: [
          { type: 'desktop', count: 2 },
          { type: 'mobile', count: 1 },
        ],
        locations: [
          { country: 'Mexico', count: 3 },
        ],
        last_activity: '2026-01-13T10:30:00Z',
      };

      (apiClient.get as any).mockResolvedValue({ data: mockSummary });

      const result = await getSessionSummary();

      expect(apiClient.get).toHaveBeenCalledWith('/auth/sessions/summary');
      expect(result.total_sessions).toBe(5);
      expect(result.devices).toHaveLength(2);
    });
  });

  describe('revokeSession', () => {
    it('should revoke a specific session', async () => {
      (apiClient.delete as any).mockResolvedValue({ data: { success: true } });

      await revokeSession('session-to-revoke');

      expect(apiClient.delete).toHaveBeenCalledWith('/auth/sessions/session-to-revoke');
    });

    it('should throw error when revoking current session', async () => {
      (apiClient.delete as any).mockRejectedValue(new Error('Cannot revoke current'));

      await expect(revokeSession('current-session')).rejects.toThrow('Failed to revoke session');
    });
  });

  describe('revokeAllOtherSessions', () => {
    it('should revoke all sessions except current', async () => {
      const mockResult = {
        revoked_count: 4,
      };

      (apiClient.delete as any).mockResolvedValue({ data: mockResult });

      const result = await revokeAllOtherSessions();

      expect(apiClient.delete).toHaveBeenCalledWith('/auth/sessions');
      expect(result.revoked_count).toBe(4);
    });

    it('should handle case with only one session', async () => {
      const mockResult = {
        revoked_count: 0,
      };

      (apiClient.delete as any).mockResolvedValue({ data: mockResult });

      const result = await revokeAllOtherSessions();

      expect(result.revoked_count).toBe(0);
    });
  });

  describe('revokeSessionsByDevice', () => {
    it('should revoke sessions by device type', async () => {
      const mockResult = {
        revoked_count: 2,
      };

      (apiClient.delete as any).mockResolvedValue({ data: mockResult });

      const result = await revokeSessionsByDevice('mobile');

      expect(apiClient.delete).toHaveBeenCalledWith('/auth/sessions/device/mobile');
      expect(result.revoked_count).toBe(2);
    });

    it('should handle no matching devices', async () => {
      const mockResult = {
        revoked_count: 0,
      };

      (apiClient.delete as any).mockResolvedValue({ data: mockResult });

      const result = await revokeSessionsByDevice('tablet');

      expect(result.revoked_count).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      (apiClient.get as any).mockRejectedValue(new Error('Network error'));

      await expect(getSessions()).rejects.toThrow('Failed to fetch sessions');
    });

    it('should handle unauthorized access', async () => {
      (apiClient.get as any).mockRejectedValue({ response: { status: 401 } });

      await expect(getCurrentSession()).rejects.toThrow('Failed to fetch current session');
    });
  });
});
