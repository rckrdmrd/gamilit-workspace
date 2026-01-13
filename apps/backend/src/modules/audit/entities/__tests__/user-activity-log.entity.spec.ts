/**
 * UserActivityLog Entity Tests
 *
 * Tests for UserActivityLog entity structure and validation
 * Created: 2026-01-13
 */

import { UserActivityLog, ActivityType } from '../user-activity-log.entity';

describe('UserActivityLog Entity', () => {
  describe('Entity Instantiation', () => {
    it('should create a valid UserActivityLog instance', () => {
      const log = new UserActivityLog();

      log.id = 'log-123';
      log.userId = 'user-456';
      log.activityType = 'page_view';
      log.createdAt = new Date();

      expect(log).toBeInstanceOf(UserActivityLog);
      expect(log.id).toBe('log-123');
      expect(log.userId).toBe('user-456');
      expect(log.activityType).toBe('page_view');
    });

    it('should allow all activity types', () => {
      const validTypes: ActivityType[] = [
        'page_view',
        'exercise_start',
        'exercise_complete',
        'module_start',
        'module_complete',
        'achievement_view',
        'leaderboard_view',
        'profile_update',
        'settings_change',
        'login',
        'logout',
        'search',
        'click',
        'scroll',
        'hover',
        'focus',
        'blur',
        'error',
        'custom',
      ];

      validTypes.forEach((type) => {
        const log = new UserActivityLog();
        log.activityType = type;
        expect(log.activityType).toBe(type);
      });
    });
  });

  describe('Optional Fields', () => {
    it('should allow optional profileId', () => {
      const log = new UserActivityLog();
      log.userId = 'user-123';
      log.activityType = 'page_view';

      expect(log.profileId).toBeUndefined();

      log.profileId = 'profile-456';
      expect(log.profileId).toBe('profile-456');
    });

    it('should allow optional tenantId', () => {
      const log = new UserActivityLog();
      log.userId = 'user-123';
      log.activityType = 'page_view';

      expect(log.tenantId).toBeUndefined();

      log.tenantId = 'tenant-789';
      expect(log.tenantId).toBe('tenant-789');
    });

    it('should allow optional sessionId', () => {
      const log = new UserActivityLog();
      log.sessionId = 'session-abc';

      expect(log.sessionId).toBe('session-abc');
    });

    it('should allow optional metadata as JSON', () => {
      const log = new UserActivityLog();
      log.metadata = {
        browser: 'Chrome',
        version: '120.0',
        screenSize: '1920x1080',
      };

      expect(log.metadata).toEqual({
        browser: 'Chrome',
        version: '120.0',
        screenSize: '1920x1080',
      });
    });
  });

  describe('Page View Fields', () => {
    it('should set page view specific fields', () => {
      const log = new UserActivityLog();
      log.activityType = 'page_view';
      log.pageUrl = '/dashboard';
      log.pageTitle = 'Dashboard';
      log.referrerUrl = '/login';

      expect(log.pageUrl).toBe('/dashboard');
      expect(log.pageTitle).toBe('Dashboard');
      expect(log.referrerUrl).toBe('/login');
    });
  });

  describe('Exercise Fields', () => {
    it('should set exercise specific fields', () => {
      const log = new UserActivityLog();
      log.activityType = 'exercise_complete';
      log.exerciseId = 'exercise-123';
      log.moduleId = 'module-456';

      expect(log.exerciseId).toBe('exercise-123');
      expect(log.moduleId).toBe('module-456');
    });
  });

  describe('Interaction Fields', () => {
    it('should set interaction specific fields', () => {
      const log = new UserActivityLog();
      log.activityType = 'click';
      log.elementId = 'btn-submit';
      log.elementType = 'button';
      log.elementText = 'Submit Answer';

      expect(log.elementId).toBe('btn-submit');
      expect(log.elementType).toBe('button');
      expect(log.elementText).toBe('Submit Answer');
    });

    it('should set scroll position fields', () => {
      const log = new UserActivityLog();
      log.activityType = 'scroll';
      log.scrollPosition = 500;
      log.viewportHeight = 800;

      expect(log.scrollPosition).toBe(500);
      expect(log.viewportHeight).toBe(800);
    });
  });

  describe('Client Information', () => {
    it('should store client information', () => {
      const log = new UserActivityLog();
      log.ipAddress = '192.168.1.1';
      log.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
      log.deviceType = 'desktop';

      expect(log.ipAddress).toBe('192.168.1.1');
      expect(log.userAgent).toBe('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
      expect(log.deviceType).toBe('desktop');
    });
  });

  describe('Duration Tracking', () => {
    it('should track duration in milliseconds', () => {
      const log = new UserActivityLog();
      log.activityType = 'page_view';
      log.durationMs = 30000; // 30 seconds

      expect(log.durationMs).toBe(30000);
    });
  });

  describe('Timestamp', () => {
    it('should have createdAt timestamp', () => {
      const log = new UserActivityLog();
      const now = new Date();
      log.createdAt = now;

      expect(log.createdAt).toBe(now);
    });
  });
});
