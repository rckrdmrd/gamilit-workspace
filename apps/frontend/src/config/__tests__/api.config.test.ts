/**
 * API Configuration Tests — USE_PROXY branching
 *
 * Tests the dual-mode URL generation in api.config.ts:
 * - USE_PROXY=true  (API_HOST empty or 'proxy') -> relative URLs for Vite proxy
 * - USE_PROXY=false (API_HOST set to host:port)  -> absolute URLs for direct connection
 *
 * Strategy: Since api.config.ts reads import.meta.env at module load time and
 * exports top-level constants, we must reset modules between tests and set
 * import.meta.env BEFORE each dynamic import.
 *
 * @see apps/frontend/src/config/api.config.ts
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Type for the dynamically imported module
type ApiConfigModule = typeof import('../api.config');

/**
 * Helper: dynamically import api.config.ts after resetting module registry.
 * This ensures each test gets a fresh evaluation with the current import.meta.env values.
 */
async function loadApiConfig(): Promise<ApiConfigModule> {
  vi.resetModules();
  return import('../api.config');
}

/**
 * Helper: set import.meta.env variables for a test scenario.
 */
function setEnv(overrides: Record<string, string | undefined>) {
  // Clear all VITE_ env vars first to avoid leakage
  const keys = Object.keys(import.meta.env).filter((k) => k.startsWith('VITE_'));
  for (const key of keys) {
    delete (import.meta.env as any)[key];
  }
  // Apply overrides
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      delete (import.meta.env as any)[key];
    } else {
      (import.meta.env as any)[key] = value;
    }
  }
}

describe('api.config.ts — USE_PROXY branching', () => {
  // Save original env and restore after all tests
  const originalEnv = { ...import.meta.env };

  beforeEach(() => {
    // Restore original env before each test to avoid cross-contamination
    for (const key of Object.keys(import.meta.env)) {
      if (key.startsWith('VITE_')) {
        delete (import.meta.env as any)[key];
      }
    }
    // Suppress console.log from api.config.ts development logging
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    // Restore fully
    Object.assign(import.meta.env, originalEnv);
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // USE_PROXY=true (default / proxy mode)
  // ==========================================================================

  describe('USE_PROXY=true (proxy mode)', () => {
    it('should use proxy mode when VITE_API_HOST is empty string', async () => {
      setEnv({ VITE_API_HOST: '' });

      const { API_CONFIG } = await loadApiConfig();

      expect(API_CONFIG.useProxy).toBe(true);
    });

    it('should use proxy mode when VITE_API_HOST is not set at all', async () => {
      setEnv({});

      const { API_CONFIG } = await loadApiConfig();

      expect(API_CONFIG.useProxy).toBe(true);
    });

    it('should use proxy mode when VITE_API_HOST is "proxy"', async () => {
      setEnv({ VITE_API_HOST: 'proxy' });

      const { API_CONFIG } = await loadApiConfig();

      expect(API_CONFIG.useProxy).toBe(true);
    });

    it('should generate relative API_BASE_URL with default version', async () => {
      setEnv({ VITE_API_HOST: '' });

      const { API_BASE_URL } = await loadApiConfig();

      expect(API_BASE_URL).toBe('/api/v1');
    });

    it('should generate relative API_BASE_URL with custom version', async () => {
      setEnv({ VITE_API_HOST: '', VITE_API_VERSION: 'v2' });

      const { API_BASE_URL } = await loadApiConfig();

      expect(API_BASE_URL).toBe('/api/v2');
    });

    it('should NOT include protocol or host in API_BASE_URL', async () => {
      setEnv({ VITE_API_HOST: 'proxy', VITE_API_PROTOCOL: 'https' });

      const { API_BASE_URL } = await loadApiConfig();

      expect(API_BASE_URL).not.toContain('://');
      expect(API_BASE_URL).not.toContain('proxy');
      expect(API_BASE_URL).toBe('/api/v1');
    });

    it('should generate WS_BASE_URL using window.location.hostname in proxy mode', async () => {
      setEnv({ VITE_API_HOST: '' });

      const { WS_BASE_URL } = await loadApiConfig();

      // In proxy mode: ws://${window.location.hostname}:3006
      expect(WS_BASE_URL).toBe(`ws://${window.location.hostname}:3006`);
    });

    it('should use custom WS_PROTOCOL in proxy mode', async () => {
      setEnv({ VITE_API_HOST: '', VITE_WS_PROTOCOL: 'wss' });

      const { WS_BASE_URL } = await loadApiConfig();

      expect(WS_BASE_URL).toMatch(/^wss:\/\//);
    });
  });

  // ==========================================================================
  // USE_PROXY=false (direct connection mode)
  // ==========================================================================

  describe('USE_PROXY=false (direct connection mode)', () => {
    it('should NOT use proxy mode when VITE_API_HOST is set to a real host', async () => {
      setEnv({ VITE_API_HOST: 'localhost:3006' });

      const { API_CONFIG } = await loadApiConfig();

      expect(API_CONFIG.useProxy).toBe(false);
    });

    it('should generate absolute API_BASE_URL with host and port', async () => {
      setEnv({
        VITE_API_HOST: 'localhost:3006',
        VITE_API_PROTOCOL: 'http',
        VITE_API_VERSION: 'v1',
      });

      const { API_BASE_URL } = await loadApiConfig();

      expect(API_BASE_URL).toBe('http://localhost:3006/api/v1');
    });

    it('should generate absolute API_BASE_URL with https protocol', async () => {
      setEnv({
        VITE_API_HOST: '74.208.126.102',
        VITE_API_PROTOCOL: 'https',
      });

      const { API_BASE_URL } = await loadApiConfig();

      expect(API_BASE_URL).toBe('https://74.208.126.102/api/v1');
    });

    it('should generate absolute API_BASE_URL with custom version', async () => {
      setEnv({
        VITE_API_HOST: 'api.example.com',
        VITE_API_PROTOCOL: 'https',
        VITE_API_VERSION: 'v2',
      });

      const { API_BASE_URL } = await loadApiConfig();

      expect(API_BASE_URL).toBe('https://api.example.com/api/v2');
    });

    it('should generate WS_BASE_URL from WS_HOST when set', async () => {
      setEnv({
        VITE_API_HOST: 'localhost:3006',
        VITE_WS_HOST: 'localhost:3006',
        VITE_WS_PROTOCOL: 'ws',
      });

      const { WS_BASE_URL } = await loadApiConfig();

      expect(WS_BASE_URL).toBe('ws://localhost:3006');
    });

    it('should fall back WS_HOST to API_HOST when WS_HOST is not set', async () => {
      setEnv({
        VITE_API_HOST: 'myserver.com:3006',
        VITE_WS_PROTOCOL: 'wss',
      });

      const { WS_BASE_URL } = await loadApiConfig();

      expect(WS_BASE_URL).toBe('wss://myserver.com:3006');
    });

    it('should generate WS URL with wss protocol for production', async () => {
      setEnv({
        VITE_API_HOST: '74.208.126.102',
        VITE_WS_HOST: '74.208.126.102',
        VITE_WS_PROTOCOL: 'wss',
      });

      const { WS_BASE_URL } = await loadApiConfig();

      expect(WS_BASE_URL).toBe('wss://74.208.126.102');
    });
  });

  // ==========================================================================
  // API_CONFIG object
  // ==========================================================================

  describe('API_CONFIG object', () => {
    it('should contain all required fields in proxy mode', async () => {
      setEnv({ VITE_API_HOST: '' });

      const { API_CONFIG } = await loadApiConfig();

      expect(API_CONFIG).toHaveProperty('baseURL');
      expect(API_CONFIG).toHaveProperty('wsURL');
      expect(API_CONFIG).toHaveProperty('timeout');
      expect(API_CONFIG).toHaveProperty('version');
      expect(API_CONFIG).toHaveProperty('host');
      expect(API_CONFIG).toHaveProperty('protocol');
      expect(API_CONFIG).toHaveProperty('useProxy');
    });

    it('should contain all required fields in direct mode', async () => {
      setEnv({ VITE_API_HOST: 'localhost:3006' });

      const { API_CONFIG } = await loadApiConfig();

      expect(API_CONFIG).toHaveProperty('baseURL');
      expect(API_CONFIG).toHaveProperty('wsURL');
      expect(API_CONFIG).toHaveProperty('timeout');
      expect(API_CONFIG).toHaveProperty('version');
      expect(API_CONFIG).toHaveProperty('host');
      expect(API_CONFIG).toHaveProperty('protocol');
      expect(API_CONFIG).toHaveProperty('useProxy');
    });

    it('should set default timeout of 30000ms', async () => {
      setEnv({ VITE_API_HOST: '' });

      const { API_CONFIG } = await loadApiConfig();

      expect(API_CONFIG.timeout).toBe(30000);
    });

    it('should use custom timeout from env', async () => {
      setEnv({ VITE_API_HOST: '', VITE_API_TIMEOUT: '60000' });

      const { API_CONFIG } = await loadApiConfig();

      expect(API_CONFIG.timeout).toBe(60000);
    });

    it('should default to v1 when VITE_API_VERSION is not set', async () => {
      setEnv({ VITE_API_HOST: '' });

      const { API_CONFIG } = await loadApiConfig();

      expect(API_CONFIG.version).toBe('v1');
    });

    it('should default to http when VITE_API_PROTOCOL is not set', async () => {
      setEnv({ VITE_API_HOST: '' });

      const { API_CONFIG } = await loadApiConfig();

      expect(API_CONFIG.protocol).toBe('http');
    });

    it('should reflect consistent baseURL', async () => {
      setEnv({ VITE_API_HOST: 'localhost:3006', VITE_API_PROTOCOL: 'http' });

      const { API_CONFIG, API_BASE_URL } = await loadApiConfig();

      expect(API_CONFIG.baseURL).toBe(API_BASE_URL);
    });

    it('should reflect consistent wsURL', async () => {
      setEnv({ VITE_API_HOST: 'localhost:3006', VITE_WS_HOST: 'localhost:3006' });

      const { API_CONFIG, WS_BASE_URL } = await loadApiConfig();

      expect(API_CONFIG.wsURL).toBe(WS_BASE_URL);
    });
  });

  // ==========================================================================
  // API_ENDPOINTS structure
  // ==========================================================================

  describe('API_ENDPOINTS structure', () => {
    it('should define auth endpoints', async () => {
      setEnv({ VITE_API_HOST: '' });

      const { API_ENDPOINTS } = await loadApiConfig();

      expect(API_ENDPOINTS.auth.login).toBe('/auth/login');
      expect(API_ENDPOINTS.auth.register).toBe('/auth/register');
      expect(API_ENDPOINTS.auth.logout).toBe('/auth/logout');
      expect(API_ENDPOINTS.auth.refresh).toBe('/auth/refresh');
      expect(API_ENDPOINTS.auth.profile).toBe('/auth/profile');
    });

    it('should define educational endpoints with static and dynamic routes', async () => {
      setEnv({ VITE_API_HOST: '' });

      const { API_ENDPOINTS } = await loadApiConfig();

      expect(API_ENDPOINTS.educational.modules).toBe('/educational/modules');
      expect(API_ENDPOINTS.educational.module('mod-123')).toBe('/educational/modules/mod-123');
      expect(API_ENDPOINTS.educational.exercises).toBe('/educational/exercises');
    });

    it('should define gamification endpoints with parameterized functions', async () => {
      setEnv({ VITE_API_HOST: '' });

      const { API_ENDPOINTS } = await loadApiConfig();

      expect(API_ENDPOINTS.gamification.userSummary('user-1')).toBe(
        '/gamification/users/user-1/summary',
      );
      expect(API_ENDPOINTS.gamification.missions.daily).toBe('/gamification/missions/daily');
      expect(API_ENDPOINTS.gamification.missions.claim('m-1')).toBe(
        '/gamification/missions/m-1/claim',
      );
    });

    it('should define teacher endpoints', async () => {
      setEnv({ VITE_API_HOST: '' });

      const { API_ENDPOINTS } = await loadApiConfig();

      expect(API_ENDPOINTS.teacher.classrooms).toBe('/teacher/classrooms');
      expect(API_ENDPOINTS.teacher.classroom('cls-1')).toBe('/teacher/classrooms/cls-1');
      expect(API_ENDPOINTS.teacher.dashboard.stats).toBe('/teacher/dashboard/stats');
    });

    it('should define admin endpoints', async () => {
      setEnv({ VITE_API_HOST: '' });

      const { API_ENDPOINTS } = await loadApiConfig();

      expect(API_ENDPOINTS.admin.dashboard).toBe('/admin/dashboard');
      expect(API_ENDPOINTS.admin.users.list).toBe('/admin/users');
      expect(API_ENDPOINTS.admin.users.get('u-1')).toBe('/admin/users/u-1');
    });

    it('should define health endpoints', async () => {
      setEnv({ VITE_API_HOST: '' });

      const { API_ENDPOINTS } = await loadApiConfig();

      expect(API_ENDPOINTS.health.check).toBe('/health');
      expect(API_ENDPOINTS.health.live).toBe('/health/live');
      expect(API_ENDPOINTS.health.ready).toBe('/health/ready');
    });

    it('should define all top-level endpoint namespaces', async () => {
      setEnv({ VITE_API_HOST: '' });

      const { API_ENDPOINTS } = await loadApiConfig();

      const expectedNamespaces = [
        'auth',
        'gamification',
        'educational',
        'progress',
        'economy',
        'social',
        'notifications',
        'admin',
        'teacher',
        'media',
        'ranks',
        'leaderboardPosition',
        'achievements',
        'powerups',
        'leaderboards',
        'guilds',
        'friends',
        'mechanics',
        'ai',
        'users',
        'health',
      ];

      for (const ns of expectedNamespaces) {
        expect(API_ENDPOINTS).toHaveProperty(ns);
      }
    });
  });

  // ==========================================================================
  // buildApiUrl helper
  // ==========================================================================

  describe('buildApiUrl()', () => {
    it('should prepend API_BASE_URL to a string path in proxy mode', async () => {
      setEnv({ VITE_API_HOST: '' });

      const { buildApiUrl } = await loadApiConfig();

      const url = buildApiUrl('/auth/login');
      expect(url).toBe('/api/v1/auth/login');
    });

    it('should prepend API_BASE_URL to a string path in direct mode', async () => {
      setEnv({ VITE_API_HOST: 'localhost:3006', VITE_API_PROTOCOL: 'http' });

      const { buildApiUrl } = await loadApiConfig();

      const url = buildApiUrl('/auth/login');
      expect(url).toBe('http://localhost:3006/api/v1/auth/login');
    });

    it('should call a function path with provided args', async () => {
      setEnv({ VITE_API_HOST: '' });

      const { buildApiUrl } = await loadApiConfig();
      const pathFn = (id: string) => `/users/${id}`;

      const url = buildApiUrl(pathFn, 'user-42');
      expect(url).toBe('/api/v1/users/user-42');
    });

    it('should call a function path with multiple args', async () => {
      setEnv({ VITE_API_HOST: 'api.gamilit.com', VITE_API_PROTOCOL: 'https' });

      const { buildApiUrl } = await loadApiConfig();
      const pathFn = (userId: string, moduleId: string) =>
        `/progress/users/${userId}/modules/${moduleId}`;

      const url = buildApiUrl(pathFn, 'u-1', 'm-2');
      expect(url).toBe('https://api.gamilit.com/api/v1/progress/users/u-1/modules/m-2');
    });
  });

  // ==========================================================================
  // buildWsUrl helper
  // ==========================================================================

  describe('buildWsUrl()', () => {
    it('should return WS_BASE_URL when called with no path', async () => {
      setEnv({
        VITE_API_HOST: 'localhost:3006',
        VITE_WS_HOST: 'localhost:3006',
        VITE_WS_PROTOCOL: 'ws',
      });

      const { buildWsUrl, WS_BASE_URL } = await loadApiConfig();

      expect(buildWsUrl()).toBe(WS_BASE_URL);
    });

    it('should append path to WS_BASE_URL', async () => {
      setEnv({
        VITE_API_HOST: 'localhost:3006',
        VITE_WS_HOST: 'localhost:3006',
        VITE_WS_PROTOCOL: 'ws',
      });

      const { buildWsUrl } = await loadApiConfig();

      expect(buildWsUrl('/notifications')).toBe('ws://localhost:3006/notifications');
    });

    it('should work in proxy mode', async () => {
      setEnv({ VITE_API_HOST: '' });

      const { buildWsUrl } = await loadApiConfig();

      const url = buildWsUrl('/chat');
      expect(url).toBe(`ws://${window.location.hostname}:3006/chat`);
    });
  });

  // ==========================================================================
  // FEATURE_FLAGS
  // ==========================================================================

  describe('FEATURE_FLAGS', () => {
    it('should default USE_MOCK_DATA to false', async () => {
      setEnv({ VITE_API_HOST: '' });

      const { FEATURE_FLAGS } = await loadApiConfig();

      expect(FEATURE_FLAGS.USE_MOCK_DATA).toBe(false);
    });

    it('should set USE_MOCK_DATA to true when env is "true"', async () => {
      setEnv({ VITE_API_HOST: '', VITE_USE_MOCK_DATA: 'true' });

      const { FEATURE_FLAGS } = await loadApiConfig();

      expect(FEATURE_FLAGS.USE_MOCK_DATA).toBe(true);
    });

    it('should default ENABLE_WEBSOCKET to true (not false unless explicitly set)', async () => {
      setEnv({ VITE_API_HOST: '' });

      const { FEATURE_FLAGS } = await loadApiConfig();

      expect(FEATURE_FLAGS.ENABLE_WEBSOCKET).toBe(true);
    });

    it('should disable ENABLE_WEBSOCKET when set to "false"', async () => {
      setEnv({ VITE_API_HOST: '', VITE_ENABLE_WEBSOCKET: 'false' });

      const { FEATURE_FLAGS } = await loadApiConfig();

      expect(FEATURE_FLAGS.ENABLE_WEBSOCKET).toBe(false);
    });

    it('should have all expected flag keys', async () => {
      setEnv({ VITE_API_HOST: '' });

      const { FEATURE_FLAGS } = await loadApiConfig();

      const expectedFlags = [
        'USE_MOCK_DATA',
        'MOCK_API',
        'ENABLE_WEBSOCKET',
        'DEBUG_API',
        'ENABLE_AI',
        'ENABLE_ANALYTICS',
        'ENABLE_GAMIFICATION',
        'ENABLE_SOCIAL_FEATURES',
        'ENABLE_DEBUG',
        'SHOW_UNDER_CONSTRUCTION',
      ];

      for (const flag of expectedFlags) {
        expect(FEATURE_FLAGS).toHaveProperty(flag);
      }
    });
  });

  // ==========================================================================
  // HTTP_STATUS constants
  // ==========================================================================

  describe('HTTP_STATUS', () => {
    it('should define standard HTTP status codes', async () => {
      setEnv({ VITE_API_HOST: '' });

      const { HTTP_STATUS } = await loadApiConfig();

      expect(HTTP_STATUS.OK).toBe(200);
      expect(HTTP_STATUS.CREATED).toBe(201);
      expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
      expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
      expect(HTTP_STATUS.FORBIDDEN).toBe(403);
      expect(HTTP_STATUS.NOT_FOUND).toBe(404);
      expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
    });
  });

  // ==========================================================================
  // Edge cases
  // ==========================================================================

  describe('Edge cases', () => {
    it('should treat any non-empty, non-proxy host as direct mode', async () => {
      setEnv({ VITE_API_HOST: '0.0.0.0:3006' });

      const { API_CONFIG } = await loadApiConfig();

      expect(API_CONFIG.useProxy).toBe(false);
    });

    it('should handle host with only a domain (no port)', async () => {
      setEnv({
        VITE_API_HOST: 'api.gamilit.com',
        VITE_API_PROTOCOL: 'https',
      });

      const { API_BASE_URL } = await loadApiConfig();

      expect(API_BASE_URL).toBe('https://api.gamilit.com/api/v1');
    });

    it('should handle NaN timeout gracefully (parseInt returns NaN -> NaN)', async () => {
      setEnv({ VITE_API_HOST: '', VITE_API_TIMEOUT: 'not-a-number' });

      const { API_CONFIG } = await loadApiConfig();

      // parseInt('not-a-number') returns NaN
      expect(API_CONFIG.timeout).toBeNaN();
    });

    it('should use "http" as default protocol when not set', async () => {
      setEnv({ VITE_API_HOST: 'localhost:3006' });

      const { API_BASE_URL } = await loadApiConfig();

      expect(API_BASE_URL).toMatch(/^http:\/\//);
    });

    it('should use "ws" as default WS protocol when not set', async () => {
      setEnv({ VITE_API_HOST: 'localhost:3006' });

      const { WS_BASE_URL } = await loadApiConfig();

      expect(WS_BASE_URL).toMatch(/^ws:\/\//);
    });

    it('should handle "proxy" string case-sensitively (only lowercase matches)', async () => {
      setEnv({ VITE_API_HOST: 'Proxy' });

      const { API_CONFIG } = await loadApiConfig();

      // 'Proxy' !== 'proxy', so it should NOT be proxy mode
      expect(API_CONFIG.useProxy).toBe(false);
    });

    it('should produce correct URLs for the production server scenario', async () => {
      setEnv({
        VITE_API_HOST: '74.208.126.102',
        VITE_API_PROTOCOL: 'https',
        VITE_API_VERSION: 'v1',
        VITE_WS_HOST: '74.208.126.102',
        VITE_WS_PROTOCOL: 'wss',
      });

      const { API_BASE_URL, WS_BASE_URL, API_CONFIG } = await loadApiConfig();

      expect(API_CONFIG.useProxy).toBe(false);
      expect(API_BASE_URL).toBe('https://74.208.126.102/api/v1');
      expect(WS_BASE_URL).toBe('wss://74.208.126.102');
    });

    it('should produce correct URLs for the dev proxy scenario', async () => {
      setEnv({
        VITE_API_HOST: 'proxy',
        VITE_API_VERSION: 'v1',
        VITE_WS_PROTOCOL: 'ws',
      });

      const { API_BASE_URL, WS_BASE_URL, API_CONFIG } = await loadApiConfig();

      expect(API_CONFIG.useProxy).toBe(true);
      expect(API_BASE_URL).toBe('/api/v1');
      expect(WS_BASE_URL).toBe(`ws://${window.location.hostname}:3006`);
    });
  });
});
