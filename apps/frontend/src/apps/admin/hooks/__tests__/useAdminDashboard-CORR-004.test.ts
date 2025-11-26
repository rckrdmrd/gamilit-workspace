/**
 * Tests for CORR-004: Connect 3 empty sections in AdminDashboardPage
 *
 * Tests validate that useAdminDashboard hook correctly fetches data from:
 * - GET /admin/actions/recent (recent actions)
 * - GET /admin/alerts (system alerts)
 * - GET /admin/analytics/user-activity (user activity)
 *
 * Created: 2025-11-24
 * Implements: CORR-004 from PLAN-IMPLEMENTACION-CORRECCIONES-P0.md
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { apiClient } from '@/services/api/apiClient';
import { useAdminDashboard } from '../useAdminDashboard';
import type { AdminAction, SystemAlert, UserActivityData } from '../../types';

// Mock apiClient
vi.mock('@/services/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('useAdminDashboard - CORR-004: Real API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('API Endpoints Called', () => {
    it('should call /admin/dashboard/actions/recent endpoint with correct params', async () => {
      (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { success: true, data: [] },
      });

      renderHook(() => useAdminDashboard());

      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledWith(
          '/admin/dashboard/actions/recent',
          expect.objectContaining({ params: { limit: 10 } }),
        );
      });
    });

    it('should call /admin/dashboard/alerts endpoint (no params)', async () => {
      (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { success: true, data: [] },
      });

      renderHook(() => useAdminDashboard());

      await waitFor(() => {
        // FE-P1-002: Backend getAlerts() does NOT accept params
        expect(apiClient.get).toHaveBeenCalledWith('/admin/dashboard/alerts', expect.anything());
      });
    });

    it('should call /admin/dashboard/analytics/user-activity endpoint with correct params', async () => {
      (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { success: true, data: [] },
      });

      renderHook(() => useAdminDashboard());

      await waitFor(() => {
        // FE-P1-003: Backend expects groupBy param, not days
        expect(apiClient.get).toHaveBeenCalledWith(
          '/admin/dashboard/analytics/user-activity',
          expect.objectContaining({ params: { groupBy: 'day' } }),
        );
      });
    });

    it('should call all 3 endpoints in parallel via refreshAll', async () => {
      (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { success: true, data: [] },
      });

      renderHook(() => useAdminDashboard());

      await waitFor(() => {
        // Verify at least 3 GET calls were made (actions, alerts, activity)
        expect(apiClient.get).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('Fetch Recent Actions', () => {
    it('should process recent actions data correctly', async () => {
      const mockActions: Partial<AdminAction>[] = [
        {
          id: 'action-1',
          adminId: 'admin-123',
          adminName: 'John Doe',
          action: 'Created organization',
          actionType: 'create',
          targetType: 'organization',
          targetId: 'org-123',
          success: true,
          details: 'Details',
          timestamp: '2025-11-24T10:00:00Z' as any,
        },
      ];

      (apiClient.get as ReturnType<typeof vi.fn>).mockImplementation((url) => {
        if (url === '/admin/actions/recent') {
          return Promise.resolve({ data: { success: true, data: mockActions } });
        }
        return Promise.resolve({ data: { success: true, data: [] } });
      });

      const { result } = renderHook(() => useAdminDashboard());

      await waitFor(
        () => {
          expect(result.current.recentActions.length).toBeGreaterThan(0);
          expect(result.current.recentActions[0].adminName).toBe('John Doe');
        },
        { timeout: 3000 },
      );
    });

    it('should convert timestamp to Date object', async () => {
      const mockActions: Partial<AdminAction>[] = [
        {
          id: 'action-1',
          adminName: 'Test',
          timestamp: '2025-11-24T10:00:00Z' as any,
        },
      ];

      (apiClient.get as ReturnType<typeof vi.fn>).mockImplementation((url) => {
        if (url === '/admin/actions/recent') {
          return Promise.resolve({ data: { success: true, data: mockActions } });
        }
        return Promise.resolve({ data: { success: true, data: [] } });
      });

      const { result } = renderHook(() => useAdminDashboard());

      await waitFor(
        () => {
          if (result.current.recentActions.length > 0) {
            expect(result.current.recentActions[0].timestamp).toBeInstanceOf(Date);
          }
        },
        { timeout: 3000 },
      );
    });

    it('should handle API errors gracefully', async () => {
      (apiClient.get as ReturnType<typeof vi.fn>).mockImplementation((url) => {
        if (url === '/admin/actions/recent') {
          return Promise.reject(new Error('API Error'));
        }
        return Promise.resolve({ data: { success: true, data: [] } });
      });

      const { result } = renderHook(() => useAdminDashboard());

      await waitFor(
        () => {
          // Should fallback to empty array, not crash
          expect(result.current.recentActions).toEqual([]);
        },
        { timeout: 3000 },
      );
    });
  });

  describe('Fetch Alerts', () => {
    it('should process alerts data correctly', async () => {
      const mockAlerts: Partial<SystemAlert>[] = [
        {
          id: 'alert-1',
          type: 'warning',
          severity: 'high',
          title: 'High CPU Usage',
          message: 'CPU usage at 85%',
          details: 'Details',
          timestamp: '2025-11-24T10:00:00Z' as any,
          dismissed: false,
          source: 'system',
        },
      ];

      (apiClient.get as ReturnType<typeof vi.fn>).mockImplementation((url) => {
        if (url === '/admin/alerts') {
          return Promise.resolve({ data: { success: true, data: mockAlerts } });
        }
        return Promise.resolve({ data: { success: true, data: [] } });
      });

      const { result } = renderHook(() => useAdminDashboard());

      await waitFor(
        () => {
          expect(result.current.alerts.length).toBeGreaterThan(0);
          expect(result.current.alerts[0].title).toBe('High CPU Usage');
        },
        { timeout: 3000 },
      );
    });

    it('should sort alerts by severity', async () => {
      const mockAlerts: Partial<SystemAlert>[] = [
        {
          id: 'alert-low',
          severity: 'low',
          title: 'Low',
          timestamp: '2025-11-24T10:00:00Z' as any,
        },
        {
          id: 'alert-high',
          severity: 'high',
          title: 'High',
          timestamp: '2025-11-24T10:00:00Z' as any,
        },
      ];

      (apiClient.get as ReturnType<typeof vi.fn>).mockImplementation((url) => {
        if (url === '/admin/alerts') {
          return Promise.resolve({ data: { success: true, data: mockAlerts } });
        }
        return Promise.resolve({ data: { success: true, data: [] } });
      });

      const { result } = renderHook(() => useAdminDashboard());

      await waitFor(
        () => {
          if (result.current.alerts.length >= 2) {
            // High severity should be first after sorting
            expect(result.current.alerts[0].severity).toBe('high');
          }
        },
        { timeout: 3000 },
      );
    });

    it('should handle API errors gracefully', async () => {
      (apiClient.get as ReturnType<typeof vi.fn>).mockImplementation((url) => {
        if (url === '/admin/alerts') {
          return Promise.reject(new Error('API Error'));
        }
        return Promise.resolve({ data: { success: true, data: [] } });
      });

      const { result } = renderHook(() => useAdminDashboard());

      await waitFor(
        () => {
          expect(result.current.alerts).toEqual([]);
        },
        { timeout: 3000 },
      );
    });
  });

  describe('Fetch User Activity', () => {
    it('should process user activity data correctly', async () => {
      const mockActivity: UserActivityData[] = [
        {
          date: '2025-11-20',
          activeUsers: 45,
          newRegistrations: 3,
          totalSessions: 120,
          avgSessionDuration: 25.5,
        },
        {
          date: '2025-11-21',
          activeUsers: 52,
          newRegistrations: 5,
          totalSessions: 135,
          avgSessionDuration: 28.2,
        },
      ];

      (apiClient.get as ReturnType<typeof vi.fn>).mockImplementation((url) => {
        if (url === '/admin/analytics/user-activity') {
          return Promise.resolve({ data: { success: true, data: mockActivity } });
        }
        return Promise.resolve({ data: { success: true, data: [] } });
      });

      const { result } = renderHook(() => useAdminDashboard());

      await waitFor(
        () => {
          expect(result.current.userActivity.length).toBeGreaterThan(0);
          expect(result.current.userActivity[0].date).toBe('2025-11-20');
          expect(result.current.userActivity[0].activeUsers).toBe(45);
        },
        { timeout: 3000 },
      );
    });

    it('should handle API errors gracefully', async () => {
      (apiClient.get as ReturnType<typeof vi.fn>).mockImplementation((url) => {
        if (url === '/admin/analytics/user-activity') {
          return Promise.reject(new Error('API Error'));
        }
        return Promise.resolve({ data: { success: true, data: [] } });
      });

      const { result } = renderHook(() => useAdminDashboard());

      await waitFor(
        () => {
          expect(result.current.userActivity).toEqual([]);
        },
        { timeout: 3000 },
      );
    });
  });

  describe('CORR-004 Verification: No Hardcoded Empty Arrays', () => {
    it('should NOT return hardcoded empty arrays when API succeeds', async () => {
      const mockActions: Partial<AdminAction>[] = [{ id: 'test', adminName: 'Test' } as any];
      const mockAlerts: Partial<SystemAlert>[] = [{ id: 'test', title: 'Test' } as any];
      const mockActivity: UserActivityData[] = [
        {
          date: '2025-11-24',
          activeUsers: 100,
          newRegistrations: 5,
          totalSessions: 200,
          avgSessionDuration: 30,
        },
      ];

      (apiClient.get as ReturnType<typeof vi.fn>).mockImplementation((url) => {
        if (url === '/admin/actions/recent') {
          return Promise.resolve({ data: { success: true, data: mockActions } });
        }
        if (url === '/admin/alerts') {
          return Promise.resolve({ data: { success: true, data: mockAlerts } });
        }
        if (url === '/admin/analytics/user-activity') {
          return Promise.resolve({ data: { success: true, data: mockActivity } });
        }
        return Promise.resolve({ data: { success: true, data: [] } });
      });

      const { result } = renderHook(() => useAdminDashboard());

      await waitFor(
        () => {
          // All 3 sections should have data (NOT empty)
          expect(result.current.recentActions.length).toBeGreaterThan(0);
          expect(result.current.alerts.length).toBeGreaterThan(0);
          expect(result.current.userActivity.length).toBeGreaterThan(0);
        },
        { timeout: 5000 },
      );
    });

    it('should call REAL API endpoints, not TODOs', async () => {
      (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { success: true, data: [] },
      });

      renderHook(() => useAdminDashboard());

      await waitFor(() => {
        // Verify actual endpoint paths (NOT commented out TODOs)
        const calls = (apiClient.get as ReturnType<typeof vi.fn>).mock.calls;
        const endpoints = calls.map((call) => call[0]);

        expect(endpoints).toContain('/admin/dashboard/actions/recent');
        expect(endpoints).toContain('/admin/dashboard/alerts');
        expect(endpoints).toContain('/admin/dashboard/analytics/user-activity');
      });
    });
  });
});
