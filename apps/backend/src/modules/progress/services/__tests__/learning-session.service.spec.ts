/**
 * LearningSessionService Unit Tests
 *
 * @description Tests for learning session tracking service covering:
 * - Session creation and lifecycle management
 * - Active session tracking
 * - Session completion with duration calculation
 * - Engagement metrics updates (clicks, page views, etc.)
 * - Session statistics by period (daily, weekly, monthly)
 * - Time calculation and formatting
 *
 * Sprint 1 - P1-021: Increase coverage to 50%
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Between } from 'typeorm';
import { LearningSessionService } from '../learning-session.service';
import { LearningSession } from '../../entities';
import { createMockRepository } from '@/__mocks__/repositories.mock';
import { TestDataFactory } from '@/__mocks__/services.mock';

describe('LearningSessionService', () => {
  let service: LearningSessionService;
  let sessionRepo: ReturnType<typeof createMockRepository>;

  // Test data
  const mockUserId = TestDataFactory.createUuid('user');
  const mockSessionId = TestDataFactory.createUuid('session');
  const mockModuleId = TestDataFactory.createUuid('module');

  const mockSession = {
    id: mockSessionId,
    user_id: mockUserId,
    module_id: mockModuleId,
    started_at: new Date('2025-01-10T10:00:00'),
    ended_at: null,
    is_active: true,
    completion_status: 'ongoing',
    duration: null,
    active_time: null,
    idle_time: null,
    exercises_attempted: 2,
    exercises_completed: 1,
    content_viewed: 5,
    total_score: 85,
    total_xp_earned: 50,
    total_ml_coins_earned: 10,
    clicks_count: 25,
    page_views: 8,
    resource_downloads: 2,
    errors_encountered: 0,
    device_info: { type: 'desktop', os: 'Windows' },
    browser_info: { name: 'Chrome', version: '120' },
    metadata: {},
    created_at: new Date('2025-01-10T10:00:00'),
    updated_at: new Date('2025-01-10T10:00:00'),
  };

  beforeEach(async () => {
    sessionRepo = createMockRepository<LearningSession>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LearningSessionService,
        {
          provide: getRepositoryToken(LearningSession, 'progress'),
          useValue: sessionRepo,
        },
      ],
    }).compile();

    service = module.get<LearningSessionService>(LearningSessionService);
    jest.clearAllMocks();
  });

  describe('Service Definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  // =========================================================================
  // CREATE OPERATION
  // =========================================================================

  describe('create', () => {
    const createDto = {
      user_id: mockUserId,
      module_id: mockModuleId,
      device_info: { type: 'mobile', os: 'iOS' },
      browser_info: { name: 'Safari', version: '17' },
    };

    beforeEach(() => {
      sessionRepo.create.mockReturnValue(mockSession as any);
      sessionRepo.save.mockResolvedValue(mockSession as any);
    });

    it('should create new learning session successfully', async () => {
      const result = await service.create(createDto);

      expect(result).toEqual(mockSession);
      expect(sessionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: createDto.user_id,
          module_id: createDto.module_id,
          is_active: true,
          completion_status: 'ongoing',
          exercises_attempted: 0,
          exercises_completed: 0,
          content_viewed: 0,
          total_score: 0,
        }),
      );
      expect(sessionRepo.save).toHaveBeenCalled();
    });

    it('should initialize session with default values', async () => {
      await service.create(createDto);

      expect(sessionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          is_active: true,
          completion_status: 'ongoing',
          exercises_attempted: 0,
          exercises_completed: 0,
          content_viewed: 0,
          total_score: 0,
          total_xp_earned: 0,
          total_ml_coins_earned: 0,
          clicks_count: 0,
          page_views: 0,
          resource_downloads: 0,
          errors_encountered: 0,
        }),
      );
    });

    it('should set started_at to current time', async () => {
      const beforeCreate = new Date();
      await service.create(createDto);
      const afterCreate = new Date();

      const callArgs = sessionRepo.create.mock.calls[0][0];
      expect(callArgs.started_at).toBeInstanceOf(Date);
      expect(callArgs.started_at.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(callArgs.started_at.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });
  });

  // =========================================================================
  // FIND OPERATIONS
  // =========================================================================

  describe('findByUserId', () => {
    it('should return all sessions for a user', async () => {
      const mockSessions = [mockSession, { ...mockSession, id: 'another-session' }];
      sessionRepo.find.mockResolvedValue(mockSessions as any);

      const result = await service.findByUserId(mockUserId);

      expect(result).toEqual(mockSessions);
      expect(sessionRepo.find).toHaveBeenCalledWith({
        where: { user_id: mockUserId },
        order: { started_at: 'DESC' },
      });
    });

    it('should return empty array if user has no sessions', async () => {
      sessionRepo.find.mockResolvedValue([]);

      const result = await service.findByUserId(mockUserId);

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return session by ID', async () => {
      sessionRepo.findOne.mockResolvedValue(mockSession as any);

      const result = await service.findById(mockSessionId);

      expect(result).toEqual(mockSession);
      expect(sessionRepo.findOne).toHaveBeenCalledWith({ where: { id: mockSessionId } });
    });

    it('should throw NotFoundException if session not found', async () => {
      sessionRepo.findOne.mockResolvedValue(null);

      await expect(service.findById(mockSessionId)).rejects.toThrow(NotFoundException);
      await expect(service.findById(mockSessionId)).rejects.toThrow(
        `Learning session with ID ${mockSessionId} not found`,
      );
    });
  });

  describe('getActiveSession', () => {
    it('should return active session for user', async () => {
      sessionRepo.findOne.mockResolvedValue(mockSession as any);

      const result = await service.getActiveSession(mockUserId);

      expect(result).toEqual(mockSession);
      expect(sessionRepo.findOne).toHaveBeenCalledWith({
        where: {
          user_id: mockUserId,
          is_active: true,
        },
        order: { started_at: 'DESC' },
      });
    });

    it('should return null if no active session exists', async () => {
      sessionRepo.findOne.mockResolvedValue(null);

      const result = await service.getActiveSession(mockUserId);

      expect(result).toBeNull();
    });
  });

  describe('findByDateRange', () => {
    it('should return sessions within date range', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      const mockSessions = [mockSession];
      sessionRepo.find.mockResolvedValue(mockSessions as any);

      const result = await service.findByDateRange(mockUserId, startDate, endDate);

      expect(result).toEqual(mockSessions);
      expect(sessionRepo.find).toHaveBeenCalledWith({
        where: {
          user_id: mockUserId,
          started_at: Between(startDate, endDate),
        },
        order: { started_at: 'DESC' },
      });
    });
  });

  // =========================================================================
  // SESSION COMPLETION
  // =========================================================================

  describe('endSession', () => {
    beforeEach(() => {
      const freshSession = { ...mockSession, started_at: new Date(Date.now() - 3600_000) };
      sessionRepo.findOne.mockResolvedValue(freshSession as any);
      sessionRepo.save.mockImplementation((s) => Promise.resolve(s));
    });

    it('should end session and calculate duration', async () => {
      const result = await service.endSession(mockSessionId);

      expect(result.is_active).toBe(false);
      expect(result.completion_status).toBe('completed');
      expect(result.ended_at).toBeInstanceOf(Date);
      expect(result.duration).toMatch(/^\d{2}:\d{2}:\d{2}$/);
      expect(sessionRepo.save).toHaveBeenCalled();
    });

    it('should format duration correctly (HH:MM:SS)', async () => {
      const startTime = new Date(Date.now() - 7200_000); // 2 hours ago
      const sessionWithStart = { ...mockSession, started_at: startTime };
      sessionRepo.findOne.mockResolvedValue(sessionWithStart as any);

      const result = await service.endSession(mockSessionId);

      // Just verify duration exists and has correct format
      expect(result.duration).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });

    it('should set active_time if not defined', async () => {
      const sessionNoActiveTime = { ...mockSession, started_at: new Date(Date.now() - 3600_000), active_time: null };
      sessionRepo.findOne.mockResolvedValue(sessionNoActiveTime as any);

      const result = await service.endSession(mockSessionId);

      expect(result.active_time).toBe(result.duration);
      expect(result.idle_time).toBe('00:00:00');
    });

    it('should throw BadRequestException if session already ended', async () => {
      const endedSession = { ...mockSession, is_active: false };
      sessionRepo.findOne.mockResolvedValue(endedSession as any);

      await expect(service.endSession(mockSessionId)).rejects.toThrow(BadRequestException);
      await expect(service.endSession(mockSessionId)).rejects.toThrow(
        'Session is already ended',
      );
    });

    it('should throw NotFoundException if session not found', async () => {
      sessionRepo.findOne.mockResolvedValue(null);

      await expect(service.endSession(mockSessionId)).rejects.toThrow(NotFoundException);
    });
  });

  // =========================================================================
  // ENGAGEMENT UPDATES
  // =========================================================================

  describe('updateEngagement', () => {
    beforeEach(() => {
      sessionRepo.findOne.mockResolvedValue(mockSession as any);
      sessionRepo.save.mockResolvedValue(mockSession as any);
    });

    it('should update engagement metrics', async () => {
      const metrics = {
        clicks_count: 50,
        page_views: 15,
        resource_downloads: 3,
        exercises_attempted: 5,
        exercises_completed: 4,
      };

      const result = await service.updateEngagement(mockSessionId, metrics);

      expect(result).toMatchObject(metrics);
      expect(sessionRepo.save).toHaveBeenCalled();
    });

    it('should update active and idle time', async () => {
      const metrics = {
        active_time: '00:45:30',
        idle_time: '00:05:15',
      };

      const result = await service.updateEngagement(mockSessionId, metrics);

      expect(result.active_time).toBe('00:45:30');
      expect(result.idle_time).toBe('00:05:15');
    });

    it('should throw NotFoundException if session not found', async () => {
      sessionRepo.findOne.mockResolvedValue(null);

      await expect(service.updateEngagement(mockSessionId, {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // =========================================================================
  // SESSION STATISTICS
  // =========================================================================

  describe('getSessionStats', () => {
    const mockSessionList = [
      {
        ...mockSession,
        duration: '01:30:00',
        exercises_completed: 5,
        total_xp_earned: 100,
        total_ml_coins_earned: 20,
      },
      {
        ...mockSession,
        duration: '00:45:30',
        exercises_completed: 3,
        total_xp_earned: 60,
        total_ml_coins_earned: 12,
      },
    ];

    it('should return daily session stats', async () => {
      sessionRepo.find.mockResolvedValue(mockSessionList as any);

      const result = await service.getSessionStats(mockUserId, 'daily');

      expect(result).toEqual({
        total_sessions: 2,
        total_time_spent: '02:15:30',
        average_session_duration: '01:07:45',
        exercises_completed: 8,
        total_xp_earned: 160,
        total_ml_coins_earned: 32,
      });
      expect(sessionRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            user_id: mockUserId,
            started_at: expect.any(Object),
          }),
        }),
      );
    });

    it('should return weekly session stats', async () => {
      sessionRepo.find.mockResolvedValue(mockSessionList as any);

      const result = await service.getSessionStats(mockUserId, 'weekly');

      expect(result.total_sessions).toBe(2);
      expect(result.total_xp_earned).toBe(160);
    });

    it('should return monthly session stats', async () => {
      sessionRepo.find.mockResolvedValue(mockSessionList as any);

      const result = await service.getSessionStats(mockUserId, 'monthly');

      expect(result.total_sessions).toBe(2);
    });

    it('should handle sessions with no duration', async () => {
      const sessionsNoDuration = [
        { ...mockSession, duration: null },
        { ...mockSession, duration: null },
      ];
      sessionRepo.find.mockResolvedValue(sessionsNoDuration as any);

      const result = await service.getSessionStats(mockUserId, 'daily');

      expect(result.total_time_spent).toBe('00:00:00');
      expect(result.average_session_duration).toBe('00:00:00');
    });

    it('should return zero stats if no sessions exist', async () => {
      sessionRepo.find.mockResolvedValue([]);

      const result = await service.getSessionStats(mockUserId, 'daily');

      expect(result).toEqual({
        total_sessions: 0,
        total_time_spent: '00:00:00',
        average_session_duration: '00:00:00',
        exercises_completed: 0,
        total_xp_earned: 0,
        total_ml_coins_earned: 0,
      });
    });

    it('should correctly format time with hours over 24', async () => {
      const longSessions = [
        { ...mockSession, duration: '25:00:00', exercises_completed: 10, total_xp_earned: 200, total_ml_coins_earned: 40 },
        { ...mockSession, duration: '15:30:00', exercises_completed: 8, total_xp_earned: 150, total_ml_coins_earned: 30 },
      ];
      sessionRepo.find.mockResolvedValue(longSessions as any);

      const result = await service.getSessionStats(mockUserId, 'weekly');

      expect(result.total_time_spent).toBe('40:30:00');
    });
  });
});
