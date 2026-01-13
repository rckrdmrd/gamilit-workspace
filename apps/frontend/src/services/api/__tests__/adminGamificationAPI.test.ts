/**
 * Admin Gamification API Tests
 *
 * Tests for adminGamificationAPI functions
 * Created: 2026-01-13
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getParameters,
  updateParameters,
  getMayaRanks,
  updateMayaRank,
  previewChanges,
  restoreDefaults,
  getSettings,
} from '../adminGamificationAPI';
import { apiClient } from '@/services/api/apiClient';

// Mock apiClient
vi.mock('../apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
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
    admin: {
      gamification: {
        previewChanges: '/admin/gamification/preview-changes',
        restoreDefaults: '/admin/gamification/restore-defaults',
        settings: '/admin/gamification/settings',
      },
    },
  },
}));

describe('adminGamificationAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getParameters', () => {
    it('should fetch all gamification parameters', async () => {
      const mockParams = {
        id: 'params-1',
        xp: {
          base_xp_per_exercise: 50,
          streak_multiplier: 1.5,
        },
        coins: {
          base_coins_per_exercise: 5,
        },
        updated_at: '2026-01-13T10:00:00Z',
      };

      (apiClient.get as any).mockResolvedValue({ data: mockParams });

      const result = await getParameters();

      expect(apiClient.get).toHaveBeenCalledWith('/admin/gamification/parameters');
      expect(result.xp.base_xp_per_exercise).toBe(50);
      expect(result.xp.streak_multiplier).toBe(1.5);
    });
  });

  describe('updateParameters', () => {
    it('should update specific parameters', async () => {
      const mockUpdated = {
        xp: { base_xp_per_exercise: 75 },
        updated_at: '2026-01-13T10:00:00Z',
      };

      (apiClient.put as any).mockResolvedValue({ data: mockUpdated });

      const result = await updateParameters({ xp: { base_xp_per_exercise: 75 } });

      expect(apiClient.put).toHaveBeenCalledWith('/admin/gamification/parameters', {
        xp: { base_xp_per_exercise: 75 },
      });
      expect(result.xp.base_xp_per_exercise).toBe(75);
    });

    it('should update multiple parameter categories', async () => {
      const mockUpdated = {
        xp: { base_xp_per_exercise: 60 },
        coins: { base_coins_per_exercise: 8 },
      };

      (apiClient.put as any).mockResolvedValue({ data: mockUpdated });

      await updateParameters({
        xp: { base_xp_per_exercise: 60 },
        coins: { base_coins_per_exercise: 8 },
      });

      expect(apiClient.put).toHaveBeenCalledWith('/admin/gamification/parameters', {
        xp: { base_xp_per_exercise: 60 },
        coins: { base_coins_per_exercise: 8 },
      });
    });
  });

  describe('getMayaRanks', () => {
    it('should fetch all Maya ranks', async () => {
      const mockRanks = [
        {
          name: 'ajaw',
          display_name: 'Ajaw',
          min_xp: 0,
          max_xp: 999,
          color: '#bronze',
        },
        {
          name: 'kuhul_ajaw',
          display_name: "K'uhul Ajaw",
          min_xp: 1000,
          max_xp: 4999,
          color: '#silver',
        },
      ];

      (apiClient.get as any).mockResolvedValue({ data: mockRanks });

      const result = await getMayaRanks();

      expect(apiClient.get).toHaveBeenCalledWith('/admin/gamification/maya-ranks');
      expect(result).toHaveLength(2);
      expect(result[0].display_name).toBe('Ajaw');
    });
  });

  describe('updateMayaRank', () => {
    it('should update a Maya rank', async () => {
      const mockUpdated = {
        name: 'kuhul_ajaw',
        display_name: "K'uhul Ajaw",
        max_xp: 5999,
      };

      (apiClient.put as any).mockResolvedValue({ data: mockUpdated });

      const result = await updateMayaRank('kuhul_ajaw', { max_xp: 5999 });

      expect(apiClient.put).toHaveBeenCalledWith('/admin/gamification/maya-ranks/kuhul_ajaw', {
        max_xp: 5999,
      });
      expect(result.max_xp).toBe(5999);
    });

    it('should update rank display name and color', async () => {
      const mockUpdated = {
        name: 'ajaw',
        display_name: 'Novato',
        color: '#green',
      };

      (apiClient.put as any).mockResolvedValue({ data: mockUpdated });

      await updateMayaRank('ajaw', { display_name: 'Novato', color: '#green' });

      expect(apiClient.put).toHaveBeenCalledWith('/admin/gamification/maya-ranks/ajaw', {
        display_name: 'Novato',
        color: '#green',
      });
    });
  });

  describe('previewChanges', () => {
    it('should preview parameter changes impact', async () => {
      const mockPreview = {
        affected_users: 150,
        rank_changes: [],
        economy_impact: {
          total_xp_change: 1000,
          total_coins_change: 200,
        },
      };

      (apiClient.post as any).mockResolvedValue({ data: mockPreview });

      const result = await previewChanges({ xp: { base_xp_per_exercise: 75 } });

      expect(apiClient.post).toHaveBeenCalledWith('/admin/gamification/preview-changes', {
        xp: { base_xp_per_exercise: 75 },
      });
      expect(result.affected_users).toBe(150);
    });
  });

  describe('restoreDefaults', () => {
    it('should restore all parameters to defaults', async () => {
      const mockDefaults = {
        id: 'params-1',
        xp: { base_xp_per_exercise: 50 },
        coins: { base_coins_per_exercise: 5 },
        updated_at: '2026-01-13T10:00:00Z',
      };

      (apiClient.post as any).mockResolvedValue({ data: mockDefaults });

      const result = await restoreDefaults();

      expect(apiClient.post).toHaveBeenCalledWith('/admin/gamification/restore-defaults');
      expect(result.xp.base_xp_per_exercise).toBe(50);
    });
  });

  describe('getSettings', () => {
    it('should fetch gamification settings', async () => {
      const mockSettings = {
        id: 'settings-1',
        achievements: { enabled: true },
        missions: { daily_count: 3 },
        leaderboard: { refresh_interval: 60 },
      };

      (apiClient.get as any).mockResolvedValue({ data: mockSettings });

      const result = await getSettings();

      expect(apiClient.get).toHaveBeenCalledWith('/admin/gamification/settings');
      expect(result.achievements.enabled).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle unauthorized access', async () => {
      (apiClient.get as any).mockRejectedValue({ response: { status: 403 } });

      await expect(getParameters()).rejects.toThrow('Failed to fetch gamification parameters');
    });

    it('should handle validation errors on update', async () => {
      (apiClient.put as any).mockRejectedValue({
        response: { status: 400, data: { message: 'Invalid value' } },
      });

      await expect(updateParameters({ xp: { base_xp_per_exercise: -10 } })).rejects.toThrow(
        'Failed to update gamification parameters',
      );
    });

    it('should handle network errors', async () => {
      (apiClient.get as any).mockRejectedValue(new Error('Network error'));

      await expect(getMayaRanks()).rejects.toThrow('Failed to fetch Maya ranks');
    });
  });
});
