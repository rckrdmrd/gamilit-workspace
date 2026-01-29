import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AchievementsService } from '../achievements.service';
import { Achievement, UserAchievement, UserStats } from '../../entities';
import { GrantAchievementDto } from '../../dto';
import { AchievementCategoryEnum, DifficultyLevelEnum } from '@shared/constants';

describe('AchievementsService', () => {
  let service: AchievementsService;
  let _achievementRepo: Repository<Achievement>;
  let _userAchievementRepo: Repository<UserAchievement>;
  let _userStatsRepo: Repository<UserStats>;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  const mockAchievementRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  const mockUserAchievementRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockUserStatsRepo = {
    findOne: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn(() => ({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        save: jest.fn(),
        findOne: jest.fn(),
      },
    })),
    getRepository: jest.fn(),
    query: jest.fn(),
    manager: {
      transaction: jest.fn((cb) => cb({
        save: jest.fn(),
        findOne: jest.fn(),
      })),
    },
  };

  const mockUserId = 'user-123';
  const mockAchievementId = 'achievement-456';
  const mockTenantId = 'tenant-789';

  const createMockAchievement = (overrides?: Partial<Achievement>): Achievement => ({
    id: mockAchievementId,
    tenant_id: mockTenantId,
    name: 'First Steps',
    description: 'Complete your first exercise',
    icon: 'trophy',
    category: AchievementCategoryEnum.PROGRESS,
    rarity: 'common',
    difficulty_level: DifficultyLevelEnum.BEGINNER,
    conditions: { type: 'progress', exercises_completed: 1 },
    rewards: { ml_coins: 50, xp: 100 },
    points: 10,
    xp_reward: 100,
    ml_coins_reward: 50,
    is_active: true,
    is_secret: false,
    is_repeatable: false,
    unlock_conditions: {},
    order_index: 1,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  } as Achievement);

  const createMockUserAchievement = (overrides?: Partial<UserAchievement>): UserAchievement => ({
    id: 'user-achievement-1',
    user_id: mockUserId,
    achievement_id: mockAchievementId,
    progress: 0,
    max_progress: 100,
    is_completed: false,
    completion_percentage: 0,
    completed_at: null,
    notified: false,
    viewed: false,
    rewards_claimed: false,
    rewards_received: {},
    progress_data: {},
    metadata: {},
    milestones_reached: [],
    ...overrides,
  } as UserAchievement);

  const createMockUserStats = (overrides?: Partial<UserStats>): UserStats => ({
    id: 'stats-1',
    user_id: mockUserId,
    tenant_id: mockTenantId,
    level: 1,
    total_xp: 0,
    xp_to_next_level: 100,
    current_rank: 'Ajaw',
    rank_progress: 0,
    ml_coins: 100,
    ml_coins_earned_total: 100,
    ml_coins_spent_total: 0,
    ml_coins_earned_today: 0,
    last_ml_coins_reset: undefined,
    current_streak: 0,
    max_streak: 0,
    streak_started_at: undefined,
    days_active_total: 0,
    exercises_completed: 0,
    modules_completed: 0,
    total_score: 0,
    average_score: undefined,
    perfect_scores: 0,
    achievements_earned: 0,
    certificates_earned: 0,
    total_time_spent: '00:00:00',
    weekly_time_spent: '00:00:00',
    sessions_count: 0,
    weekly_xp: 0,
    monthly_xp: 0,
    weekly_exercises: 0,
    global_rank_position: undefined,
    class_rank_position: undefined,
    school_rank_position: undefined,
    last_activity_at: undefined,
    last_login_at: undefined,
    metadata: {},
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  } as UserStats);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AchievementsService,
        {
          provide: getRepositoryToken(Achievement, 'gamification'),
          useValue: mockAchievementRepo,
        },
        {
          provide: getRepositoryToken(UserAchievement, 'gamification'),
          useValue: mockUserAchievementRepo,
        },
        {
          provide: getRepositoryToken(UserStats, 'gamification'),
          useValue: mockUserStatsRepo,
        },
        {
          provide: getDataSourceToken('gamification'),
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<AchievementsService>(AchievementsService);
    _achievementRepo = module.get(getRepositoryToken(Achievement, 'gamification'));
    _userAchievementRepo = module.get(getRepositoryToken(UserAchievement, 'gamification'));
    _userStatsRepo = module.get(getRepositoryToken(UserStats, 'gamification'));

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // =====================================================
  // findAll
  // =====================================================
  describe('findAll', () => {
    it('should return all active non-secret achievements by default', async () => {
      // Arrange
      const mockAchievements = [
        createMockAchievement({ name: 'Achievement 1' }),
        createMockAchievement({ name: 'Achievement 2' }),
      ];
      mockQueryBuilder.getMany.mockResolvedValue(mockAchievements);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(mockAchievements);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('a.is_active = true');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('a.is_secret = false');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('a.order_index', 'ASC');
      expect(mockQueryBuilder.addOrderBy).toHaveBeenCalledWith('a.name', 'ASC');
    });

    it('should include secret achievements when includeSecret is true', async () => {
      // Arrange
      const mockAchievements = [
        createMockAchievement({ name: 'Public Achievement' }),
        createMockAchievement({ name: 'Secret Achievement', is_secret: true }),
      ];
      mockQueryBuilder.getMany.mockResolvedValue(mockAchievements);

      // Act
      const result = await service.findAll(true);

      // Assert
      expect(result).toEqual(mockAchievements);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('a.is_active = true');
      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalledWith('a.is_secret = false');
    });

    it('should return empty array when no achievements exist', async () => {
      // Arrange
      mockQueryBuilder.getMany.mockResolvedValue([]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual([]);
    });

    it('should order results by order_index and then by name', async () => {
      // Arrange
      mockQueryBuilder.getMany.mockResolvedValue([]);

      // Act
      await service.findAll();

      // Assert
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('a.order_index', 'ASC');
      expect(mockQueryBuilder.addOrderBy).toHaveBeenCalledWith('a.name', 'ASC');
    });
  });

  // =====================================================
  // findById
  // =====================================================
  describe('findById', () => {
    it('should return achievement when found', async () => {
      // Arrange
      const mockAchievement = createMockAchievement();
      mockAchievementRepo.findOne.mockResolvedValue(mockAchievement);

      // Act
      const result = await service.findById(mockAchievementId);

      // Assert
      expect(result).toEqual(mockAchievement);
      expect(mockAchievementRepo.findOne).toHaveBeenCalledWith({
        where: { id: mockAchievementId },
      });
    });

    it('should throw NotFoundException when achievement not found', async () => {
      // Arrange
      mockAchievementRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById(mockAchievementId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findById(mockAchievementId)).rejects.toThrow(
        `Achievement ${mockAchievementId} not found`,
      );
    });
  });

  // =====================================================
  // findByCategory
  // =====================================================
  describe('findByCategory', () => {
    it('should return achievements by category', async () => {
      // Arrange
      const category = AchievementCategoryEnum.PROGRESS;
      const mockAchievements = [
        createMockAchievement({ category }),
        createMockAchievement({ category }),
      ];
      mockAchievementRepo.find.mockResolvedValue(mockAchievements);

      // Act
      const result = await service.findByCategory(category);

      // Assert
      expect(result).toEqual(mockAchievements);
      expect(mockAchievementRepo.find).toHaveBeenCalledWith({
        where: { category, is_active: true },
        order: { order_index: 'ASC' },
      });
    });

    it('should return empty array when no achievements in category', async () => {
      // Arrange
      mockAchievementRepo.find.mockResolvedValue([]);

      // Act
      const result = await service.findByCategory(AchievementCategoryEnum.STREAK);

      // Assert
      expect(result).toEqual([]);
    });

    it('should only return active achievements', async () => {
      // Arrange
      mockAchievementRepo.find.mockResolvedValue([]);

      // Act
      await service.findByCategory(AchievementCategoryEnum.MASTERY);

      // Assert
      expect(mockAchievementRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ is_active: true }),
        }),
      );
    });
  });

  // =====================================================
  // getCompletedByUser
  // =====================================================
  describe('getCompletedByUser', () => {
    it('should return completed achievements for user', async () => {
      // Arrange
      const mockUserAchievements = [
        createMockUserAchievement({ is_completed: true }),
        createMockUserAchievement({ achievement_id: 'achievement-2', is_completed: true }),
      ];
      mockUserAchievementRepo.find.mockResolvedValue(mockUserAchievements);

      // Act
      const result = await service.getCompletedByUser(mockUserId);

      // Assert
      expect(result).toEqual(mockUserAchievements);
      expect(mockUserAchievementRepo.find).toHaveBeenCalledWith({
        where: {
          user_id: mockUserId,
          is_completed: true,
        },
      });
    });

    it('should return empty array when user has no completed achievements', async () => {
      // Arrange
      mockUserAchievementRepo.find.mockResolvedValue([]);

      // Act
      const result = await service.getCompletedByUser(mockUserId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  // =====================================================
  // getInProgressByUser
  // =====================================================
  describe('getInProgressByUser', () => {
    it('should return in-progress achievements for user', async () => {
      // Arrange
      const mockUserAchievements = [
        createMockUserAchievement({ progress: 50, is_completed: false }),
        createMockUserAchievement({ achievement_id: 'achievement-2', progress: 75, is_completed: false }),
      ];
      mockUserAchievementRepo.find.mockResolvedValue(mockUserAchievements);

      // Act
      const result = await service.getInProgressByUser(mockUserId);

      // Assert
      expect(result).toEqual(mockUserAchievements);
      expect(mockUserAchievementRepo.find).toHaveBeenCalledWith({
        where: {
          user_id: mockUserId,
          is_completed: false,
        },
      });
    });

    it('should return empty array when user has no in-progress achievements', async () => {
      // Arrange
      mockUserAchievementRepo.find.mockResolvedValue([]);

      // Act
      const result = await service.getInProgressByUser(mockUserId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  // =====================================================
  // grantAchievement
  // =====================================================
  describe('grantAchievement', () => {
    it('should create new user achievement when not exists', async () => {
      // Arrange
      const grantDto: GrantAchievementDto = {
        user_id: mockUserId,
        achievement_id: mockAchievementId,
        progress: 50,
        max_progress: 100,
        is_completed: false,
        progress_data: {},
        metadata: {},
      };
      const mockAchievement = createMockAchievement();
      const newUserAchievement = createMockUserAchievement({ progress: 50, completion_percentage: 50 });

      mockAchievementRepo.findOne.mockResolvedValue(mockAchievement);
      mockUserAchievementRepo.findOne.mockResolvedValue(null);
      mockUserAchievementRepo.create.mockReturnValue(newUserAchievement);
      mockUserAchievementRepo.save.mockResolvedValue(newUserAchievement);

      // Act
      const result = await service.grantAchievement(mockUserId, grantDto);

      // Assert
      expect(result).toEqual(newUserAchievement);
      expect(mockAchievementRepo.findOne).toHaveBeenCalledWith({
        where: { id: mockAchievementId },
      });
      expect(mockUserAchievementRepo.create).toHaveBeenCalled();
      expect(mockUserAchievementRepo.save).toHaveBeenCalled();
    });

    it('should update existing user achievement', async () => {
      // Arrange
      const grantDto: GrantAchievementDto = {
        user_id: mockUserId,
        achievement_id: mockAchievementId,
        progress: 75,
        max_progress: 100,
        is_completed: false,
        progress_data: { step: 3 },
        metadata: { source: 'auto' },
      };
      const mockAchievement = createMockAchievement();
      const existingUserAchievement = createMockUserAchievement({ progress: 50 });
      const updatedUserAchievement = { ...existingUserAchievement, progress: 75, completion_percentage: 75 };

      mockAchievementRepo.findOne.mockResolvedValue(mockAchievement);
      mockUserAchievementRepo.findOne.mockResolvedValue(existingUserAchievement);
      mockUserAchievementRepo.save.mockResolvedValue(updatedUserAchievement as UserAchievement);

      // Act
      const result = await service.grantAchievement(mockUserId, grantDto);

      // Assert
      expect(result.progress).toBe(75);
      expect(result.completion_percentage).toBe(75);
      expect(mockUserAchievementRepo.save).toHaveBeenCalled();
    });

    it('should set completed_at when achievement is completed', async () => {
      // Arrange
      const grantDto: GrantAchievementDto = {
        user_id: mockUserId,
        achievement_id: mockAchievementId,
        progress: 100,
        max_progress: 100,
        is_completed: true,
        progress_data: {},
        metadata: {},
      };
      const mockAchievement = createMockAchievement();
      mockAchievementRepo.findOne.mockResolvedValue(mockAchievement);
      mockUserAchievementRepo.findOne.mockResolvedValue(null);

      const newUserAchievement = createMockUserAchievement({
        progress: 100,
        max_progress: 100,
        is_completed: true,
      });
      mockUserAchievementRepo.create.mockReturnValue(newUserAchievement);
      mockUserAchievementRepo.save.mockImplementation((achievement) => {
        return Promise.resolve(achievement as UserAchievement);
      });

      // Act
      const result = await service.grantAchievement(mockUserId, grantDto);

      // Assert
      expect(result.is_completed).toBe(true);
      expect(result.completed_at).toBeInstanceOf(Date);
    });

    it('should throw NotFoundException if achievement does not exist', async () => {
      // Arrange
      const grantDto: GrantAchievementDto = {
        user_id: mockUserId,
        achievement_id: 'non-existent',
        progress: 50,
        max_progress: 100,
        is_completed: false,
        progress_data: {},
        metadata: {},
      };
      mockAchievementRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.grantAchievement(mockUserId, grantDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should calculate completion_percentage correctly', async () => {
      // Arrange
      const grantDto: GrantAchievementDto = {
        user_id: mockUserId,
        achievement_id: mockAchievementId,
        progress: 33,
        max_progress: 100,
        is_completed: false,
        progress_data: {},
        metadata: {},
      };
      const mockAchievement = createMockAchievement();
      mockAchievementRepo.findOne.mockResolvedValue(mockAchievement);
      mockUserAchievementRepo.findOne.mockResolvedValue(null);

      const newUserAchievement = createMockUserAchievement({ progress: 33, max_progress: 100 });
      mockUserAchievementRepo.create.mockReturnValue(newUserAchievement);
      mockUserAchievementRepo.save.mockImplementation((achievement) => {
        return Promise.resolve(achievement as UserAchievement);
      });

      // Act
      const result = await service.grantAchievement(mockUserId, grantDto);

      // Assert
      expect(result.completion_percentage).toBe(33);
    });

    it('should use default values when not provided in DTO', async () => {
      // Arrange
      const grantDto: GrantAchievementDto = {
        user_id: mockUserId,
        achievement_id: mockAchievementId,
        progress: 0,
        max_progress: 100,
        is_completed: false,
        progress_data: {},
        metadata: {},
      };
      const mockAchievement = createMockAchievement();
      mockAchievementRepo.findOne.mockResolvedValue(mockAchievement);
      mockUserAchievementRepo.findOne.mockResolvedValue(null);

      const newUserAchievement = createMockUserAchievement();
      mockUserAchievementRepo.create.mockReturnValue(newUserAchievement);
      mockUserAchievementRepo.save.mockResolvedValue(newUserAchievement);

      // Act
      const _result = await service.grantAchievement(mockUserId, grantDto);

      // Assert
      expect(mockUserAchievementRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          progress: 0,
          max_progress: 100,
          is_completed: false,
          progress_data: {},
          metadata: {},
        }),
      );
    });
  });

  // =====================================================
  // checkProgress
  // =====================================================
  describe('checkProgress', () => {
    it('should return user achievement progress', async () => {
      // Arrange
      const mockUserAchievement = createMockUserAchievement({ progress: 75 });
      mockUserAchievementRepo.findOne.mockResolvedValue(mockUserAchievement);

      // Act
      const result = await service.checkProgress(mockUserId, mockAchievementId);

      // Assert
      expect(result).toEqual(mockUserAchievement);
      expect(mockUserAchievementRepo.findOne).toHaveBeenCalledWith({
        where: {
          user_id: mockUserId,
          achievement_id: mockAchievementId,
        },
      });
    });

    it('should throw NotFoundException when user achievement not found', async () => {
      // Arrange
      mockUserAchievementRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.checkProgress(mockUserId, mockAchievementId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.checkProgress(mockUserId, mockAchievementId),
      ).rejects.toThrow(
        `Achievement ${mockAchievementId} not found for user ${mockUserId}`,
      );
    });
  });

  // =====================================================
  // incrementProgress
  // =====================================================
  describe('incrementProgress', () => {
    it('should increment progress by default amount (1)', async () => {
      // Arrange
      const mockUserAchievement = createMockUserAchievement({ progress: 5, max_progress: 10 });
      mockUserAchievementRepo.findOne.mockResolvedValue(mockUserAchievement);
      mockUserAchievementRepo.save.mockImplementation((achievement) => {
        return Promise.resolve(achievement as UserAchievement);
      });

      // Act
      const result = await service.incrementProgress(mockUserId, mockAchievementId);

      // Assert
      expect(result.progress).toBe(6);
      expect(result.completion_percentage).toBe(60);
      expect(mockUserAchievementRepo.save).toHaveBeenCalled();
    });

    it('should increment progress by specified amount', async () => {
      // Arrange
      const mockUserAchievement = createMockUserAchievement({ progress: 10, max_progress: 100 });
      mockUserAchievementRepo.findOne.mockResolvedValue(mockUserAchievement);
      mockUserAchievementRepo.save.mockImplementation((achievement) => {
        return Promise.resolve(achievement as UserAchievement);
      });

      // Act
      const result = await service.incrementProgress(mockUserId, mockAchievementId, 25);

      // Assert
      expect(result.progress).toBe(35);
      expect(result.completion_percentage).toBe(35);
    });

    it('should complete achievement when progress reaches max_progress', async () => {
      // Arrange
      const mockUserAchievement = createMockUserAchievement({
        progress: 95,
        max_progress: 100,
        is_completed: false,
      });
      mockUserAchievementRepo.findOne.mockResolvedValue(mockUserAchievement);
      mockUserAchievementRepo.save.mockImplementation((achievement) => {
        return Promise.resolve(achievement as UserAchievement);
      });

      // Act
      const result = await service.incrementProgress(mockUserId, mockAchievementId, 10);

      // Assert
      expect(result.progress).toBe(100);
      expect(result.is_completed).toBe(true);
      expect(result.completed_at).toBeInstanceOf(Date);
      expect(result.completion_percentage).toBe(100);
    });

    it('should not exceed max_progress', async () => {
      // Arrange
      const mockUserAchievement = createMockUserAchievement({
        progress: 90,
        max_progress: 100,
        is_completed: false,
      });
      mockUserAchievementRepo.findOne.mockResolvedValue(mockUserAchievement);
      mockUserAchievementRepo.save.mockImplementation((achievement) => {
        return Promise.resolve(achievement as UserAchievement);
      });

      // Act
      const result = await service.incrementProgress(mockUserId, mockAchievementId, 50);

      // Assert
      expect(result.progress).toBe(100); // Capped at max_progress
      expect(result.is_completed).toBe(true);
    });

    it('should not set completed_at again if already completed', async () => {
      // Arrange
      const completedDate = new Date('2024-01-01');
      const mockUserAchievement = createMockUserAchievement({
        progress: 100,
        max_progress: 100,
        is_completed: true,
        completed_at: completedDate,
      });
      mockUserAchievementRepo.findOne.mockResolvedValue(mockUserAchievement);
      mockUserAchievementRepo.save.mockImplementation((achievement) => {
        return Promise.resolve(achievement as UserAchievement);
      });

      // Act
      const result = await service.incrementProgress(mockUserId, mockAchievementId, 10);

      // Assert
      expect(result.completed_at).toEqual(completedDate); // Should not change
    });

    it('should throw NotFoundException when user achievement not found', async () => {
      // Arrange
      mockUserAchievementRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.incrementProgress(mockUserId, mockAchievementId, 5),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // =====================================================
  // claimRewards
  // =====================================================
  describe('claimRewards', () => {
    it('should claim rewards for completed achievement', async () => {
      // Arrange - mock SQL function call
      const mockUserAchievement = createMockUserAchievement({
        is_completed: true,
        rewards_claimed: true,
      });
      mockDataSource.query.mockResolvedValue([{
        success: true,
        message: 'Rewards claimed successfully',
        xp_granted: 100,
        coins_granted: 50,
      }]);
      mockUserAchievementRepo.findOne.mockResolvedValue(mockUserAchievement);

      // Act
      const result = await service.claimRewards(mockUserId, mockAchievementId);

      // Assert
      expect(result.userAchievement.rewards_claimed).toBe(true);
      expect(result.xp_granted).toBe(100);
      expect(result.coins_granted).toBe(50);
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('claim_achievement_reward'),
        [mockUserId, mockAchievementId],
      );
    });

    it('should throw BadRequestException if achievement not completed', async () => {
      // Arrange - SQL function returns failure for not completed
      mockDataSource.query.mockResolvedValue([{
        success: false,
        message: `Achievement ${mockAchievementId} is not completed yet`,
      }]);

      // Act & Assert
      await expect(
        service.claimRewards(mockUserId, mockAchievementId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.claimRewards(mockUserId, mockAchievementId),
      ).rejects.toThrow(`Achievement ${mockAchievementId} is not completed yet`);
    });

    it('should throw BadRequestException if rewards already claimed', async () => {
      // Arrange - SQL function returns failure for already claimed
      mockDataSource.query.mockResolvedValue([{
        success: false,
        message: `Rewards already claimed for achievement ${mockAchievementId}`,
      }]);

      // Act & Assert
      await expect(
        service.claimRewards(mockUserId, mockAchievementId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.claimRewards(mockUserId, mockAchievementId),
      ).rejects.toThrow(`Rewards already claimed for achievement ${mockAchievementId}`);
    });

    it('should throw NotFoundException when user achievement not found', async () => {
      // Arrange - SQL function returns failure for not found
      mockDataSource.query.mockResolvedValue([{
        success: false,
        message: `User achievement not found`,
      }]);

      // Act & Assert - the service throws BadRequestException based on SQL result
      await expect(
        service.claimRewards(mockUserId, mockAchievementId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // =====================================================
  // getUserAchievementStats
  // =====================================================
  describe('getUserAchievementStats', () => {
    it('should return achievement statistics for user', async () => {
      // Arrange
      const mockUserStats = createMockUserStats();
      const mockAllAchievements = [
        createMockAchievement({ id: 'achievement-1' }),
        createMockAchievement({ id: 'achievement-2' }),
        createMockAchievement({ id: 'achievement-3' }),
        createMockAchievement({ id: 'achievement-4' }),
      ];
      const mockUserAchievements = [
        createMockUserAchievement({ achievement_id: 'achievement-1', is_completed: true, rewards_claimed: true }),
        createMockUserAchievement({ achievement_id: 'achievement-2', is_completed: true, rewards_claimed: false }),
        createMockUserAchievement({ achievement_id: 'achievement-3', is_completed: false }),
      ];

      mockUserStatsRepo.findOne.mockResolvedValue(mockUserStats);
      mockQueryBuilder.getMany.mockResolvedValue(mockAllAchievements);
      mockUserAchievementRepo.find.mockResolvedValue(mockUserAchievements);

      // Act
      const result = await service.getUserAchievementStats(mockUserId);

      // Assert
      expect(result).toEqual({
        total_available: 4,
        completed: 2,
        completion_percentage: 50,
        unclaimed_rewards: 1,
      });
    });

    it('should calculate correct completion percentage', async () => {
      // Arrange
      const mockUserStats = createMockUserStats();
      const mockAllAchievements = [
        createMockAchievement({ id: 'achievement-1' }),
        createMockAchievement({ id: 'achievement-2' }),
        createMockAchievement({ id: 'achievement-3' }),
      ];
      const mockUserAchievements = [
        createMockUserAchievement({ achievement_id: 'achievement-1', is_completed: true, rewards_claimed: true }),
      ];

      mockUserStatsRepo.findOne.mockResolvedValue(mockUserStats);
      mockQueryBuilder.getMany.mockResolvedValue(mockAllAchievements);
      mockUserAchievementRepo.find.mockResolvedValue(mockUserAchievements);

      // Act
      const result = await service.getUserAchievementStats(mockUserId);

      // Assert
      expect(result.completion_percentage).toBe(33.33); // 1/3 * 100
    });

    it('should return 0 completed when user has no achievements', async () => {
      // Arrange
      const mockUserStats = createMockUserStats();
      const mockAllAchievements = [createMockAchievement()];
      mockUserStatsRepo.findOne.mockResolvedValue(mockUserStats);
      mockQueryBuilder.getMany.mockResolvedValue(mockAllAchievements);
      mockUserAchievementRepo.find.mockResolvedValue([]);

      // Act
      const result = await service.getUserAchievementStats(mockUserId);

      // Assert
      expect(result.completed).toBe(0);
      expect(result.completion_percentage).toBe(0);
      expect(result.unclaimed_rewards).toBe(0);
    });

    it('should throw NotFoundException if user stats not found', async () => {
      // Arrange
      mockUserStatsRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getUserAchievementStats(mockUserId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getUserAchievementStats(mockUserId)).rejects.toThrow(
        `User stats not found for ${mockUserId}`,
      );
    });
  });

  // =====================================================
  // detectAndGrantEarned (auto-detection)
  // =====================================================
  describe('detectAndGrantEarned', () => {
    it('should detect and grant achievements based on user stats', async () => {
      // Arrange
      const mockUserStats = createMockUserStats({
        exercises_completed: 10,
        modules_completed: 2,
      });
      const mockAchievements = [
        createMockAchievement({
          id: 'achievement-1',
          conditions: { type: 'progress', exercises_completed: 5, modules_completed: 1 },
        }),
      ];

      mockUserStatsRepo.findOne.mockResolvedValue(mockUserStats);
      mockQueryBuilder.getMany.mockResolvedValue(mockAchievements);
      mockUserAchievementRepo.findOne.mockResolvedValue(null);
      mockAchievementRepo.findOne.mockResolvedValue(mockAchievements[0]);
      mockUserAchievementRepo.create.mockReturnValue(createMockUserAchievement({ is_completed: true }));
      mockUserAchievementRepo.save.mockImplementation((achievement) => {
        return Promise.resolve(achievement as UserAchievement);
      });

      // Act
      const result = await service.detectAndGrantEarned(mockUserId);

      // Assert
      expect(result).toHaveLength(1);
      expect(mockUserAchievementRepo.save).toHaveBeenCalled();
    });

    it('should not grant already completed non-repeatable achievements', async () => {
      // Arrange
      const mockUserStats = createMockUserStats({ level: 10 });
      const mockAchievement = createMockAchievement({
        conditions: { type: 'level', min_level: 5 },
        is_repeatable: false,
      });
      const existingCompleted = createMockUserAchievement({ is_completed: true });

      mockUserStatsRepo.findOne.mockResolvedValue(mockUserStats);
      mockQueryBuilder.getMany.mockResolvedValue([mockAchievement]);
      mockUserAchievementRepo.findOne.mockResolvedValue(existingCompleted);

      // Act
      const result = await service.detectAndGrantEarned(mockUserId);

      // Assert
      expect(result).toHaveLength(0);
      expect(mockUserAchievementRepo.save).not.toHaveBeenCalled();
    });

    it('should detect streak achievements', async () => {
      // Arrange
      const mockUserStats = createMockUserStats({ current_streak: 7 });
      const mockAchievement = createMockAchievement({
        conditions: { type: 'streak', min_streak: 7 },
      });

      mockUserStatsRepo.findOne.mockResolvedValue(mockUserStats);
      mockQueryBuilder.getMany.mockResolvedValue([mockAchievement]);
      mockUserAchievementRepo.findOne.mockResolvedValue(null);
      mockAchievementRepo.findOne.mockResolvedValue(mockAchievement);
      mockUserAchievementRepo.create.mockReturnValue(createMockUserAchievement({ is_completed: true }));
      mockUserAchievementRepo.save.mockImplementation((achievement) => {
        return Promise.resolve(achievement as UserAchievement);
      });

      // Act
      const result = await service.detectAndGrantEarned(mockUserId);

      // Assert
      expect(result).toHaveLength(1);
    });

    it('should detect level achievements', async () => {
      // Arrange
      const mockUserStats = createMockUserStats({ level: 15 });
      const mockAchievement = createMockAchievement({
        conditions: { type: 'level', min_level: 10 },
      });

      mockUserStatsRepo.findOne.mockResolvedValue(mockUserStats);
      mockQueryBuilder.getMany.mockResolvedValue([mockAchievement]);
      mockUserAchievementRepo.findOne.mockResolvedValue(null);
      mockAchievementRepo.findOne.mockResolvedValue(mockAchievement);
      mockUserAchievementRepo.create.mockReturnValue(createMockUserAchievement({ is_completed: true }));
      mockUserAchievementRepo.save.mockImplementation((achievement) => {
        return Promise.resolve(achievement as UserAchievement);
      });

      // Act
      const result = await service.detectAndGrantEarned(mockUserId);

      // Assert
      expect(result).toHaveLength(1);
    });

    it('should detect rank achievements', async () => {
      // Arrange
      const mockUserStats = createMockUserStats({ current_rank: 'Nacom' });
      const mockAchievement = createMockAchievement({
        conditions: { type: 'rank', target_rank: 'Ajaw' },
      });

      mockUserStatsRepo.findOne.mockResolvedValue(mockUserStats);
      mockQueryBuilder.getMany.mockResolvedValue([mockAchievement]);
      mockUserAchievementRepo.findOne.mockResolvedValue(null);
      mockAchievementRepo.findOne.mockResolvedValue(mockAchievement);
      mockUserAchievementRepo.create.mockReturnValue(createMockUserAchievement({ is_completed: true }));
      mockUserAchievementRepo.save.mockImplementation((achievement) => {
        return Promise.resolve(achievement as UserAchievement);
      });

      // Act
      const result = await service.detectAndGrantEarned(mockUserId);

      // Assert
      expect(result).toHaveLength(1);
    });

    it('should throw NotFoundException if user stats not found', async () => {
      // Arrange
      mockUserStatsRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.detectAndGrantEarned(mockUserId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.detectAndGrantEarned(mockUserId)).rejects.toThrow(
        `User stats not found for ${mockUserId}`,
      );
    });

    it('should return empty array when no achievements are earned', async () => {
      // Arrange
      const mockUserStats = createMockUserStats({ level: 1 });
      const mockAchievement = createMockAchievement({
        conditions: { type: 'level', requirements: { min_level: 100 } },
      });

      mockUserStatsRepo.findOne.mockResolvedValue(mockUserStats);
      mockQueryBuilder.getMany.mockResolvedValue([mockAchievement]);
      mockUserAchievementRepo.findOne.mockResolvedValue(null);

      // Act
      const result = await service.detectAndGrantEarned(mockUserId);

      // Assert
      expect(result).toEqual([]);
    });
  });
});
