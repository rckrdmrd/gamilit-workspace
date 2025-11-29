import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SessionManagementService } from '../services/session-management.service';
import { UserSession } from '../entities';
import { CreateUserSessionDto } from '../dto';
import { DeviceTypeEnum } from '@/shared/constants';

describe('SessionManagementService', () => {
  let service: SessionManagementService;
  let sessionRepository: Repository<UserSession>;

  const mockSessionRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionManagementService,
        {
          provide: getRepositoryToken(UserSession, 'auth'),
          useValue: mockSessionRepository,
        },
      ],
    }).compile();

    service = module.get<SessionManagementService>(SessionManagementService);
    sessionRepository = module.get(getRepositoryToken(UserSession, 'auth'));

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createSession', () => {
    const createSessionDto: CreateUserSessionDto = {
      user_id: 'user-1',
      tenant_id: 'tenant-1',
      session_token: 'session-token-123',
      refresh_token: 'refresh-token-123',
      ip_address: '127.0.0.1',
      user_agent: 'Mozilla/5.0',
      device_type: DeviceTypeEnum.DESKTOP,
      browser: 'Chrome',
      os: 'Windows',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const mockSession = {
      id: 'session-1',
      ...createSessionDto,
      refresh_token: 'hashed-refresh-token',
      created_at: new Date(),
      last_activity_at: new Date(),
      is_active: true,
    };

    it('should create a new session successfully', async () => {
      // Arrange
      mockSessionRepository.delete.mockResolvedValue({ affected: 0 });
      mockSessionRepository.count.mockResolvedValue(0);
      mockSessionRepository.create.mockReturnValue(mockSession);
      mockSessionRepository.save.mockResolvedValue(mockSession);

      // Act
      const result = await service.createSession(createSessionDto);

      // Assert
      expect(result).toBeDefined();
      expect(result!.id).toBe('session-1');
      expect(mockSessionRepository.create).toHaveBeenCalled();
      expect(mockSessionRepository.save).toHaveBeenCalled();
    });

    it('should delete expired sessions before creating new one', async () => {
      // Arrange
      mockSessionRepository.delete.mockResolvedValue({ affected: 2 }); // 2 expired sessions deleted
      mockSessionRepository.count.mockResolvedValue(0);
      mockSessionRepository.create.mockReturnValue(mockSession);
      mockSessionRepository.save.mockResolvedValue(mockSession);

      // Act
      await service.createSession(createSessionDto);

      // Assert
      expect(mockSessionRepository.delete).toHaveBeenCalledWith({
        user_id: createSessionDto.user_id,
        expires_at: expect.anything(),
      });
    });

    it('should delete oldest session when user has 5+ active sessions', async () => {
      // Arrange
      mockSessionRepository.delete.mockResolvedValue({ affected: 0 });
      mockSessionRepository.count.mockResolvedValue(5); // 5 active sessions
      mockSessionRepository.findOne.mockResolvedValue(
        { id: 'oldest-session', created_at: new Date('2023-01-01') },
      );
      mockSessionRepository.create.mockReturnValue(mockSession);
      mockSessionRepository.save.mockResolvedValue(mockSession);

      // Act
      await service.createSession(createSessionDto);

      // Assert - service uses findOne to get oldest session, not find
      expect(mockSessionRepository.count).toHaveBeenCalled();
      expect(mockSessionRepository.findOne).toHaveBeenCalled();
      expect(mockSessionRepository.delete).toHaveBeenCalledWith({ id: 'oldest-session' });
    });

    it('should hash refresh token with SHA256', async () => {
      // Arrange
      mockSessionRepository.delete.mockResolvedValue({ affected: 0 });
      mockSessionRepository.count.mockResolvedValue(0);
      mockSessionRepository.create.mockReturnValue(mockSession);
      mockSessionRepository.save.mockResolvedValue(mockSession);

      // Act
      await service.createSession(createSessionDto);

      // Assert
      expect(mockSessionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          refresh_token: expect.not.stringContaining(createSessionDto.refresh_token || ''),
        }),
      );
    });

    it('should enforce max 5 sessions per user', async () => {
      // Arrange
      mockSessionRepository.delete.mockResolvedValue({ affected: 0 });
      mockSessionRepository.count.mockResolvedValue(6); // 6 active sessions
      mockSessionRepository.find.mockResolvedValue([
        { id: 'oldest-1', created_at: new Date('2023-01-01') },
        { id: 'oldest-2', created_at: new Date('2023-01-02') },
      ]);
      mockSessionRepository.create.mockReturnValue(mockSession);
      mockSessionRepository.save.mockResolvedValue(mockSession);

      // Act
      await service.createSession(createSessionDto);

      // Assert
      expect(mockSessionRepository.delete).toHaveBeenCalled();
    });
  });

  describe('validateSession', () => {
    const mockSession = {
      id: 'session-1',
      user_id: 'user-1',
      session_token: 'session-token-123',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days in future
      last_activity_at: new Date(),
      is_active: true,
    };

    it('should validate and return active session', async () => {
      // Arrange
      mockSessionRepository.findOne.mockResolvedValue(mockSession);
      mockSessionRepository.save.mockResolvedValue({ ...mockSession, last_activity_at: new Date() });

      // Act
      const result = await service.validateSession('session-1');

      // Assert
      expect(result).toBeDefined();
      expect(result!.id).toBe('session-1');
      expect(mockSessionRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'session-1' },
      });
      expect(mockSessionRepository.save).toHaveBeenCalled();
    });

    it('should return null if session does not exist', async () => {
      // Arrange
      mockSessionRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.validateSession('non-existent-session');

      // Assert
      expect(result).toBeNull();
      expect(mockSessionRepository.save).not.toHaveBeenCalled();
    });

    it('should delete and return null if session is expired', async () => {
      // Arrange
      const expiredSession = {
        ...mockSession,
        expires_at: new Date(Date.now() - 1000), // Expired 1 second ago
      };
      mockSessionRepository.findOne.mockResolvedValue(expiredSession);
      mockSessionRepository.delete.mockResolvedValue({ affected: 1 });

      // Act
      const result = await service.validateSession('session-1');

      // Assert
      expect(result).toBeNull();
      expect(mockSessionRepository.delete).toHaveBeenCalledWith({ id: 'session-1' });
    });

    it('should update last_activity_at on validation', async () => {
      // Arrange
      const oldActivityDate = new Date('2023-01-01');
      const sessionWithOldActivity = {
        ...mockSession,
        last_activity_at: oldActivityDate,
      };
      mockSessionRepository.findOne.mockResolvedValue(sessionWithOldActivity);
      mockSessionRepository.save.mockResolvedValue({
        ...sessionWithOldActivity,
        last_activity_at: new Date(),
      });

      // Act
      const result = await service.validateSession('session-1');

      // Assert
      expect(result).not.toBeNull();
      expect(result!.last_activity_at).not.toEqual(oldActivityDate);
      expect(mockSessionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          last_activity_at: expect.any(Date),
        }),
      );
    });
  });

  describe('revokeSession', () => {
    const mockSession = {
      id: 'session-1',
      user_id: 'user-1',
      session_token: 'session-token-123',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      last_activity_at: new Date(),
      is_active: true,
      revoked_at: null,
    };

    it('should revoke session successfully', async () => {
      // Arrange
      mockSessionRepository.findOne.mockResolvedValue(mockSession);
      mockSessionRepository.save.mockResolvedValue({ ...mockSession, is_active: false, revoked_at: new Date() });

      // Act
      const result = await service.revokeSession('session-1', 'user-1');

      // Assert
      expect(result).toEqual({ message: 'Sesión cerrada correctamente' });
      expect(mockSessionRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'session-1', user_id: 'user-1' },
      });
      expect(mockSessionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          is_active: false,
          revoked_at: expect.any(Date),
        }),
      );
    });

    it('should throw NotFoundException if session does not exist', async () => {
      // Arrange
      mockSessionRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.revokeSession('non-existent-session', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should validate session ownership', async () => {
      // Arrange
      mockSessionRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.revokeSession('session-1', 'different-user')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('revokeAllSessions', () => {
    const mockSessions = [
      {
        id: 'session-1',
        user_id: 'user-1',
        is_active: true,
        revoked_at: null,
      },
      {
        id: 'session-2',
        user_id: 'user-1',
        is_active: true,
        revoked_at: null,
      },
      {
        id: 'current-session',
        user_id: 'user-1',
        is_active: true,
        revoked_at: null,
      },
    ];

    it('should revoke all sessions except current one', async () => {
      // Arrange
      mockSessionRepository.find.mockResolvedValue(mockSessions);
      mockSessionRepository.save.mockResolvedValue([]);

      // Act
      const result = await service.revokeAllSessions('user-1', 'current-session');

      // Assert
      expect(result).toEqual({
        message: 'Sesiones cerradas correctamente',
        count: 2,
      });
      expect(mockSessionRepository.find).toHaveBeenCalledWith({
        where: {
          user_id: 'user-1',
          is_active: true,
        },
      });
      expect(mockSessionRepository.save).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 'session-1', is_active: false }),
          expect.objectContaining({ id: 'session-2', is_active: false }),
        ]),
      );
    });

    it('should handle user with no sessions', async () => {
      // Arrange
      mockSessionRepository.find.mockResolvedValue([]);
      mockSessionRepository.save.mockResolvedValue([]);

      // Act
      const result = await service.revokeAllSessions('user-1', 'current-session');

      // Assert
      expect(result).toEqual({
        message: 'Sesiones cerradas correctamente',
        count: 0,
      });
    });

    it('should not revoke current session', async () => {
      // Arrange
      mockSessionRepository.find.mockResolvedValue(mockSessions);
      mockSessionRepository.save.mockImplementation((sessions) => Promise.resolve(sessions));

      // Act
      await service.revokeAllSessions('user-1', 'current-session');

      // Assert
      expect(mockSessionRepository.save).toHaveBeenCalledWith(
        expect.not.arrayContaining([
          expect.objectContaining({ id: 'current-session' }),
        ]),
      );
    });
  });

  describe('getSessions', () => {
    const mockSessions = [
      {
        id: 'session-1',
        device_type: DeviceTypeEnum.DESKTOP,
        browser: 'Chrome',
        os: 'Windows',
        ip_address: '127.0.0.1',
        user_agent: 'Mozilla/5.0',
        last_activity_at: new Date(),
        created_at: new Date(),
        country: 'US',
        city: 'New York',
      },
      {
        id: 'session-2',
        device_type: DeviceTypeEnum.MOBILE,
        browser: 'Safari',
        os: 'iOS',
        ip_address: '192.168.1.1',
        user_agent: 'Safari/15.0',
        last_activity_at: new Date(),
        created_at: new Date(),
        country: 'US',
        city: 'Los Angeles',
      },
    ];

    it('should return only active sessions for user', async () => {
      // Arrange
      mockSessionRepository.find.mockResolvedValue(mockSessions);

      // Act
      const result = await service.getSessions('user-1');

      // Assert
      expect(result).toHaveLength(2);
      expect(mockSessionRepository.find).toHaveBeenCalledWith({
        where: {
          user_id: 'user-1',
          is_active: true,
        },
        order: { last_activity_at: 'DESC' },
        select: ['id', 'device_type', 'browser', 'os', 'ip_address', 'user_agent', 'created_at', 'last_activity_at', 'country', 'city'],
      });
    });

    it('should return empty array if user has no active sessions', async () => {
      // Arrange
      mockSessionRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.getSessions('user-1');

      // Assert
      expect(result).toHaveLength(0);
    });

    it('should order sessions by last_activity_at descending', async () => {
      // Arrange
      mockSessionRepository.find.mockResolvedValue(mockSessions);

      // Act
      await service.getSessions('user-1');

      // Assert
      expect(mockSessionRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { last_activity_at: 'DESC' },
        }),
      );
    });

    it('should include device information in response', async () => {
      // Arrange
      mockSessionRepository.find.mockResolvedValue(mockSessions);

      // Act
      const result = await service.getSessions('user-1');

      // Assert
      expect(result[0]).toHaveProperty('device_type');
      expect(result[0]).toHaveProperty('browser');
      expect(result[0]).toHaveProperty('os');
      expect(result[0]).toHaveProperty('ip_address');
      expect(result[0]).toHaveProperty('user_agent');
    });
  });

  describe('cleanExpiredSessions', () => {
    it('should delete all expired sessions', async () => {
      // Arrange
      mockSessionRepository.delete.mockResolvedValue({ affected: 10 }); // 10 expired sessions

      // Act
      const result = await service.cleanExpiredSessions();

      // Assert
      expect(result).toBe(10);
      expect(mockSessionRepository.delete).toHaveBeenCalledWith({
        expires_at: expect.anything(), // Less than now
      });
    });

    it('should return 0 if no expired sessions', async () => {
      // Arrange
      mockSessionRepository.delete.mockResolvedValue({ affected: 0 });

      // Act
      const result = await service.cleanExpiredSessions();

      // Assert
      expect(result).toBe(0);
    });
  });
});
