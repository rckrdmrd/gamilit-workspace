/**
 * AuthService Unit Tests
 *
 * @description Tests for authentication service covering:
 * - User registration (happy path + edge cases)
 * - User login (success + failure scenarios)
 * - Token refresh
 * - Password management
 * - Profile updates
 * - User statistics
 *
 * Sprint 0 - P0-008: Increase coverage to 30%+
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  EmailAlreadyExistsError,
  InvalidCredentialsError,
  InactiveUserError,
  InvalidRefreshTokenError,
  SessionExpiredError,
  UserNotFoundError,
  InvalidPasswordError,
  WeakPasswordError,
  SamePasswordError,
} from '../../errors/auth.errors';
import { AuthService } from '../auth.service';
import { User, Profile, Tenant, UserSession, AuthAttempt } from '../../entities';
import { UserStats } from '@/modules/gamification/entities/user-stats.entity';
import { UserRank } from '@/modules/gamification/entities/user-rank.entity';
import { UserAchievement } from '@/modules/gamification/entities/user-achievement.entity';
import { Achievement } from '@/modules/gamification/entities/achievement.entity';
import { MLCoinsTransaction } from '@/modules/gamification/entities/ml-coins-transaction.entity';
import { ExerciseSubmission } from '@/modules/progress/entities/exercise-submission.entity';
import { InventoryService } from '@/modules/gamification/services/inventory.service';
import { createMockRepository } from '@/__mocks__/repositories.mock';
import { createMockJwtService, TestDataFactory } from '@/__mocks__/services.mock';

// Mock bcrypt
jest.mock('bcrypt');
const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: ReturnType<typeof createMockRepository>;
  let profileRepository: ReturnType<typeof createMockRepository>;
  let tenantRepository: ReturnType<typeof createMockRepository>;
  let sessionRepository: ReturnType<typeof createMockRepository>;
  let attemptRepository: ReturnType<typeof createMockRepository>;
  let userStatsRepository: ReturnType<typeof createMockRepository>;
  let userRanksRepository: ReturnType<typeof createMockRepository>;
  let userAchievementsRepository: ReturnType<typeof createMockRepository>;
  let achievementsRepository: ReturnType<typeof createMockRepository>;
  let _mlCoinsTransactionsRepository: ReturnType<typeof createMockRepository>;
  let _exerciseSubmissionsRepository: ReturnType<typeof createMockRepository>;
  let _inventoryService: { initializeUserInventory: jest.Mock; getEquippedItems: jest.Mock; getEquippedItemsMap: jest.Mock; equipItem: jest.Mock; unequipItem: jest.Mock };
  let jwtService: ReturnType<typeof createMockJwtService>;

  // Test data
  const mockUser = TestDataFactory.createUser();
  const mockProfile = TestDataFactory.createProfile({ user_id: mockUser.id });
  const mockTenant = TestDataFactory.createTenant();

  beforeEach(async () => {
    // Create mock repositories
    userRepository = createMockRepository<User>();
    profileRepository = createMockRepository<Profile>();
    tenantRepository = createMockRepository<Tenant>();
    sessionRepository = createMockRepository<UserSession>();
    attemptRepository = createMockRepository<AuthAttempt>();
    userStatsRepository = createMockRepository<UserStats>();
    userRanksRepository = createMockRepository<UserRank>();
    userAchievementsRepository = createMockRepository<UserAchievement>();
    achievementsRepository = createMockRepository<Achievement>();
    _mlCoinsTransactionsRepository = createMockRepository<MLCoinsTransaction>();
    _exerciseSubmissionsRepository = createMockRepository<ExerciseSubmission>();
    _inventoryService = { initializeUserInventory: jest.fn(), getEquippedItems: jest.fn(), getEquippedItemsMap: jest.fn().mockResolvedValue({}), equipItem: jest.fn(), unequipItem: jest.fn() };
    jwtService = createMockJwtService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User, 'auth'), useValue: userRepository },
        { provide: getRepositoryToken(Profile, 'auth'), useValue: profileRepository },
        { provide: getRepositoryToken(Tenant, 'auth'), useValue: tenantRepository },
        { provide: getRepositoryToken(UserSession, 'auth'), useValue: sessionRepository },
        { provide: getRepositoryToken(AuthAttempt, 'auth'), useValue: attemptRepository },
        { provide: getRepositoryToken(UserStats, 'gamification'), useValue: userStatsRepository },
        { provide: getRepositoryToken(UserRank, 'gamification'), useValue: userRanksRepository },
        { provide: getRepositoryToken(UserAchievement, 'gamification'), useValue: userAchievementsRepository },
        { provide: getRepositoryToken(Achievement, 'gamification'), useValue: achievementsRepository },
        { provide: getRepositoryToken(MLCoinsTransaction, 'gamification'), useValue: _mlCoinsTransactionsRepository },
        { provide: getRepositoryToken(ExerciseSubmission, 'progress'), useValue: _exerciseSubmissionsRepository },
        { provide: InventoryService, useValue: _inventoryService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Service Definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  // =========================================================================
  // REGISTRATION TESTS
  // =========================================================================

  describe('register', () => {
    const registerDto = {
      email: 'newuser@test.com',
      password: 'Test123!@#',
      first_name: 'New',
      last_name: 'User',
    };

    beforeEach(() => {
      bcryptMock.hash.mockResolvedValue('$2b$10$hashedpassword' as never);
      jwtService.sign.mockReturnValue('mock.jwt.token');
      userRepository.findOne.mockResolvedValue(null);
      tenantRepository.findOne.mockResolvedValue(mockTenant);
      userRepository.create.mockReturnValue(mockUser as any);
      userRepository.save.mockResolvedValue(mockUser as any);
      profileRepository.create.mockReturnValue(mockProfile as any);
      profileRepository.save.mockResolvedValue(mockProfile as any);
      sessionRepository.create.mockReturnValue({} as any);
      sessionRepository.save.mockResolvedValue({} as any);
      attemptRepository.create.mockReturnValue({} as any);
      attemptRepository.save.mockResolvedValue({} as any);
    });

    it('should successfully register a new user', async () => {
      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(userRepository.save).toHaveBeenCalled();
      expect(profileRepository.save).toHaveBeenCalled();
    });

    it('should throw EmailAlreadyExistsError if email already exists', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockUser as any);

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(EmailAlreadyExistsError);
      await expect(service.register(registerDto)).rejects.toThrow('ya registrado');
    });

    it('should throw error if no active tenant exists', async () => {
      // Arrange
      tenantRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(
        'No hay tenants activos en el sistema',
      );
    });

    it('should create profile with correct tenant_id', async () => {
      // Act
      await service.register(registerDto);

      // Assert
      // register() uses user.email (from saved user), not registerDto.email directly
      expect(profileRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tenant_id: mockTenant.id,
          email: mockUser.email,
        }),
      );
    });

    it('should log successful auth attempt', async () => {
      // Act
      await service.register(registerDto);

      // Assert
      expect(attemptRepository.create).toHaveBeenCalled();
      expect(attemptRepository.save).toHaveBeenCalled();
    });

    it('should create session with hashed refresh token', async () => {
      // Act
      await service.register(registerDto);

      // Assert
      expect(sessionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: expect.any(String),
          tenant_id: expect.any(String),
          is_active: true,
        }),
      );
    });
  });

  // =========================================================================
  // LOGIN TESTS
  // =========================================================================

  describe('login', () => {
    const loginEmail = 'test@example.com';
    const loginPassword = 'Test123!@#';

    beforeEach(() => {
      bcryptMock.compare.mockResolvedValue(true as never);
      jwtService.sign.mockReturnValue('mock.jwt.token');
      userRepository.findOne.mockResolvedValue(mockUser as any);
      profileRepository.findOne.mockResolvedValue(mockProfile as any);
      sessionRepository.create.mockReturnValue({} as any);
      sessionRepository.save.mockResolvedValue({} as any);
      attemptRepository.create.mockReturnValue({} as any);
      attemptRepository.save.mockResolvedValue({} as any);
      userRepository.save.mockResolvedValue(mockUser as any);
    });

    it('should successfully login with valid credentials', async () => {
      // Act
      const result = await service.login(loginEmail, loginPassword);

      // Assert
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(bcrypt.compare).toHaveBeenCalledWith(loginPassword, mockUser.encrypted_password);
    });

    it('should throw InvalidCredentialsError if user not found', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginEmail, loginPassword)).rejects.toThrow(
        InvalidCredentialsError,
      );
    });

    it('should throw InvalidCredentialsError if password is invalid', async () => {
      // Arrange
      bcryptMock.compare.mockResolvedValue(false as never);

      // Act & Assert
      await expect(service.login(loginEmail, loginPassword)).rejects.toThrow(
        InvalidCredentialsError,
      );
    });

    it('should throw InactiveUserError if user is deleted', async () => {
      // Arrange
      const deletedUser = { ...mockUser, deleted_at: new Date() };
      userRepository.findOne.mockResolvedValue(deletedUser as any);

      // Act & Assert
      await expect(service.login(loginEmail, loginPassword)).rejects.toThrow(
        InactiveUserError,
      );
      await expect(service.login(loginEmail, loginPassword)).rejects.toThrow(
        'Usuario no activo',
      );
    });

    it('should throw ProfileNotFoundError if profile not found', async () => {
      // Arrange
      profileRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginEmail, loginPassword)).rejects.toThrow(
        'Perfil',
      );
    });

    it('should log failed login attempt when user not found', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act
      try {
        await service.login(loginEmail, loginPassword);
      } catch (_error) {
        // Expected to throw
      }

      // Assert
      expect(attemptRepository.create).toHaveBeenCalled();
    });

    it('should update last_sign_in_at on successful login', async () => {
      // Act
      await service.login(loginEmail, loginPassword);

      // Assert
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          last_sign_in_at: expect.any(Date),
        }),
      );
    });
  });

  // =========================================================================
  // TOKEN REFRESH TESTS
  // =========================================================================

  describe('refreshToken', () => {
    const mockRefreshToken = 'valid.refresh.token';
    const mockSession = {
      id: 'session-id',
      user_id: mockProfile.id, // DB-125: session.user_id is profile.id
      refresh_token: 'hashed-refresh-token',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    beforeEach(() => {
      // DB-125: JWT sub is now profile.id, refreshToken() looks up profile first
      jwtService.verify.mockReturnValue({ sub: mockProfile.id, email: mockUser.email });
      jwtService.sign.mockReturnValue('new.jwt.token');
      profileRepository.findOne.mockResolvedValue(mockProfile as any);
      userRepository.findOne.mockResolvedValue(mockUser as any);
      sessionRepository.findOne.mockResolvedValue(mockSession as any);
      sessionRepository.save.mockResolvedValue(mockSession as any);
    });

    it('should successfully refresh tokens', async () => {
      // Act
      const result = await service.refreshToken(mockRefreshToken);

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(jwtService.verify).toHaveBeenCalledWith(mockRefreshToken);
    });

    it('should throw InvalidRefreshTokenError if token is invalid', async () => {
      // Arrange
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(service.refreshToken('invalid.token')).rejects.toThrow(
        InvalidRefreshTokenError,
      );
    });

    it('should throw InactiveUserError if user not found', async () => {
      // Arrange - profile exists but user does not
      profileRepository.findOne.mockResolvedValue(mockProfile as any);
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.refreshToken(mockRefreshToken)).rejects.toThrow(
        InactiveUserError,
      );
    });

    it('should throw SessionExpiredError if session expired', async () => {
      // Arrange
      const expiredSession = {
        ...mockSession,
        expires_at: new Date(Date.now() - 1000),
      };
      sessionRepository.findOne.mockResolvedValue(expiredSession as any);

      // Act & Assert
      await expect(service.refreshToken(mockRefreshToken)).rejects.toThrow(
        'Sesion expirada',
      );
    });

    it('should update session with new refresh token', async () => {
      // Act
      await service.refreshToken(mockRefreshToken);

      // Assert
      expect(sessionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          refresh_token: expect.any(String),
          expires_at: expect.any(Date),
          last_activity_at: expect.any(Date),
        }),
      );
    });
  });

  // =========================================================================
  // PASSWORD CHANGE TESTS
  // =========================================================================

  describe('changePassword', () => {
    const userId = mockUser.id;
    const currentPassword = 'OldPassword123';
    const newPassword = 'NewPassword456';

    beforeEach(() => {
      userRepository.findOne.mockResolvedValue(mockUser as any);
      bcryptMock.compare.mockResolvedValue(true as never);
      bcryptMock.hash.mockResolvedValue('$2b$10$newhashedpassword' as never);
      userRepository.update.mockResolvedValue({ affected: 1 } as any);
    });

    it('should successfully change password', async () => {
      // Act
      const result = await service.changePassword(userId, currentPassword, newPassword);

      // Assert
      expect(result).toEqual({ message: 'Contraseña actualizada correctamente' });
      expect(bcrypt.compare).toHaveBeenCalledWith(currentPassword, mockUser.encrypted_password);
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
    });

    it('should throw UserNotFoundError if user not found', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.changePassword(userId, currentPassword, newPassword),
      ).rejects.toThrow(UserNotFoundError);
    });

    it('should throw InvalidPasswordError if current password is incorrect', async () => {
      // Arrange
      bcryptMock.compare.mockResolvedValue(false as never);

      // Act & Assert
      await expect(
        service.changePassword(userId, currentPassword, newPassword),
      ).rejects.toThrow(InvalidPasswordError);
    });

    it('should throw WeakPasswordError if new password is too short', async () => {
      // Act & Assert
      await expect(service.changePassword(userId, currentPassword, 'short')).rejects.toThrow(
        WeakPasswordError,
      );
    });

    it('should throw SamePasswordError if new password equals current password', async () => {
      // Act & Assert
      await expect(
        service.changePassword(userId, currentPassword, currentPassword),
      ).rejects.toThrow(SamePasswordError);
    });
  });

  // =========================================================================
  // VALIDATE USER TESTS
  // =========================================================================

  describe('validateUser', () => {
    it('should return user if found and active', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockUser as any);

      // Act
      const result = await service.validateUser(mockUser.id);

      // Assert
      expect(result).toEqual(mockUser);
    });

    it('should return null if user is deleted', async () => {
      // Arrange
      const deletedUser = { ...mockUser, deleted_at: new Date() };
      userRepository.findOne.mockResolvedValue(deletedUser as any);

      // Act
      const result = await service.validateUser(mockUser.id);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null if user not found', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.validateUser('non-existent-id');

      // Assert
      expect(result).toBeNull();
    });
  });

  // =========================================================================
  // LOGOUT TESTS
  // =========================================================================

  describe('logout', () => {
    it('should delete session successfully', async () => {
      // Arrange
      const userId = mockUser.id;
      const sessionId = 'session-123';
      sessionRepository.delete.mockResolvedValue({ affected: 1 } as any);

      // Act
      await service.logout(userId, sessionId);

      // Assert
      expect(sessionRepository.delete).toHaveBeenCalledWith({
        id: sessionId,
        user_id: userId,
      });
    });
  });

  // =========================================================================
  // GET USER STATISTICS TESTS
  // =========================================================================

  describe('getUserStatistics', () => {
    const mockUserStats = {
      user_id: mockUser.id,
      total_xp: 1500,
      ml_coins: 350,
      exercises_completed: 25,
      modules_completed: 3,
      current_streak: 5,
    };

    const mockUserRank = {
      user_id: mockUser.id,
      current_rank: 'Kinich Ahau',
      is_current: true,
    };

    beforeEach(() => {
      userStatsRepository.findOne.mockResolvedValue(mockUserStats as any);
      userRanksRepository.findOne.mockResolvedValue(mockUserRank as any);
      userAchievementsRepository.count.mockResolvedValue(5);
      achievementsRepository.count.mockResolvedValue(20);
    });

    it('should return user statistics', async () => {
      // Act
      const result = await service.getUserStatistics(mockUser.id);

      // Assert
      expect(result).toEqual({
        total_xp: 1500,
        total_ml_coins: 350,
        total_exercises: 25,
        total_achievements: 20,
        current_rank: 'Kinich Ahau',
        modules_completed: 3,
        login_streak: 5,
        achievements_earned: 5,
      });
    });

    it('should return default values if user stats not found', async () => {
      // Arrange
      userStatsRepository.findOne.mockResolvedValue(null);
      userRanksRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.getUserStatistics(mockUser.id);

      // Assert
      expect(result.total_xp).toBe(0);
      expect(result.total_ml_coins).toBe(0);
      expect(result.current_rank).toBe('Ajaw');
    });
  });

  // =========================================================================
  // HELPER METHODS TESTS
  // =========================================================================

  describe('toUserResponse', () => {
    it('should convert user to response DTO', () => {
      // Act
      const result = service.toUserResponse(mockUser as any);

      // Assert
      expect(result).not.toHaveProperty('encrypted_password');
      expect(result).toHaveProperty('emailVerified');
      expect(result).toHaveProperty('isActive');
    });

    it('should set emailVerified to true if email_confirmed_at exists', () => {
      // Arrange
      const verifiedUser = { ...mockUser, email_confirmed_at: new Date() };

      // Act
      const result = service.toUserResponse(verifiedUser as any);

      // Assert
      expect(result.emailVerified).toBe(true);
    });

    it('should set isActive to false if user is deleted', () => {
      // Arrange
      const deletedUser = { ...mockUser, deleted_at: new Date() };

      // Act
      const result = service.toUserResponse(deletedUser as any);

      // Assert
      expect(result.isActive).toBe(false);
    });
  });
});
