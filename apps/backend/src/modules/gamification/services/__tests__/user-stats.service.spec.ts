import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UserStatsService } from '../user-stats.service';
import { UserStats } from '../../entities';
import { Profile } from '@/modules/auth/entities/profile.entity';

describe('UserStatsService', () => {
  let service: UserStatsService;
  let userStatsRepo: Repository<UserStats>;

  const mockUserStatsRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockProfileRepo = {
    findOne: jest.fn(),
  };

  const mockUserId = 'user-123';
  const mockTenantId = 'tenant-456';
  const mockProfileId = 'profile-789';

  // Mock profile for CORR-GAM-002: service resolves auth.users.id → profiles.id
  const mockProfile = {
    id: mockProfileId,
    user_id: mockUserId,
    tenant_id: mockTenantId,
  };

  const createMockStats = (overrides?: Partial<UserStats>): UserStats => ({
    id: 'stats-1',
    user_id: mockProfileId, // CORR-GAM-002: user_stats.user_id = profiles.id
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
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserStatsService,
        {
          provide: getRepositoryToken(UserStats, 'gamification'),
          useValue: mockUserStatsRepo,
        },
        {
          provide: getRepositoryToken(Profile, 'auth'),
          useValue: mockProfileRepo,
        },
      ],
    }).compile();

    service = module.get<UserStatsService>(UserStatsService);
    userStatsRepo = module.get(getRepositoryToken(UserStats, 'gamification'));

    jest.clearAllMocks();

    // Default: profile exists (CORR-GAM-002 - resolves authUserId to profileId)
    mockProfileRepo.findOne.mockResolvedValue(mockProfile);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // =====================================================
  // findByUserId
  // =====================================================
  describe('findByUserId', () => {
    it('should return user stats when found', async () => {
      // Arrange
      const mockStats = createMockStats();
      mockUserStatsRepo.findOne.mockResolvedValue(mockStats);

      // Act
      const result = await service.findByUserId(mockUserId);

      // Assert
      expect(result).toEqual(mockStats);
      // CORR-GAM-002: Service resolves authUserId → profileId before lookup
      expect(mockUserStatsRepo.findOne).toHaveBeenCalledWith({
        where: { user_id: mockProfileId },
      });
    });

    it('should throw NotFoundException when profile not found', async () => {
      // Arrange - profile doesn't exist for this auth user
      mockProfileRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findByUserId(mockUserId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByUserId(mockUserId)).rejects.toThrow(
        'Profile not found for auth user',
      );
    });

    it('should throw NotFoundException when stats not found', async () => {
      // Arrange - profile exists but stats don't
      mockUserStatsRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findByUserId(mockUserId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByUserId(mockUserId)).rejects.toThrow(
        `No stats found for user ${mockUserId}`,
      );
    });
  });

  // =====================================================
  // create
  // =====================================================
  describe('create', () => {
    it('should create new stats with default values', async () => {
      // Arrange
      mockUserStatsRepo.findOne.mockResolvedValue(null);
      const newStats = createMockStats();
      mockUserStatsRepo.create.mockReturnValue(newStats);
      mockUserStatsRepo.save.mockResolvedValue(newStats);

      // Act
      const result = await service.create(mockUserId, mockTenantId);

      // Assert
      expect(result).toEqual(newStats);
      // CORR-GAM-002: Service uses profile.id for user_stats.user_id
      expect(mockUserStatsRepo.create).toHaveBeenCalledWith({
        user_id: mockProfileId,
        tenant_id: mockTenantId,
        level: 1,
        total_xp: 0,
        xp_to_next_level: 100,
        current_rank: 'Ajaw',
        ml_coins: 100,
        ml_coins_earned_total: 100,
        ml_coins_spent_total: 0,
        current_streak: 0,
        max_streak: 0,
        days_active_total: 0,
        exercises_completed: 0,
        modules_completed: 0,
        total_score: 0,
        achievements_earned: 0,
        certificates_earned: 0,
        sessions_count: 0,
        metadata: {},
      });
      expect(mockUserStatsRepo.save).toHaveBeenCalledWith(newStats);
    });

    it('should use profile tenant_id when not provided', async () => {
      // Arrange
      mockUserStatsRepo.findOne.mockResolvedValue(null);
      const newStats = createMockStats();
      mockUserStatsRepo.create.mockReturnValue(newStats);
      mockUserStatsRepo.save.mockResolvedValue(newStats);

      // Act
      const result = await service.create(mockUserId);

      // Assert
      expect(result).toBeDefined();
      // CORR-GAM-002: Uses profile.tenant_id when not provided
      expect(mockUserStatsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockProfileId,
          tenant_id: mockTenantId, // From mockProfile
        }),
      );
    });

    it('should throw BadRequestException if stats already exist', async () => {
      // Arrange
      const existingStats = createMockStats();
      mockUserStatsRepo.findOne.mockResolvedValue(existingStats);

      // Act & Assert
      await expect(service.create(mockUserId, mockTenantId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(mockUserId, mockTenantId)).rejects.toThrow(
        `already has stats`,
      );
      expect(mockUserStatsRepo.create).not.toHaveBeenCalled();
      expect(mockUserStatsRepo.save).not.toHaveBeenCalled();
    });
  });

  // =====================================================
  // updateStats
  // =====================================================
  describe('updateStats', () => {
    it('should update stats successfully', async () => {
      // Arrange
      const mockStats = createMockStats();
      const updates = { level: 5, total_xp: 500 };
      const updatedStats = { ...mockStats, ...updates };
      mockUserStatsRepo.findOne.mockResolvedValue(mockStats);
      mockUserStatsRepo.save.mockResolvedValue(updatedStats);

      // Act
      const result = await service.updateStats(mockUserId, updates);

      // Assert
      expect(result).toEqual(updatedStats);
      expect(mockUserStatsRepo.save).toHaveBeenCalledWith(
        expect.objectContaining(updates),
      );
    });

    it('should throw NotFoundException if user stats not found', async () => {
      // Arrange
      mockUserStatsRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateStats(mockUserId, { level: 5 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle multiple field updates', async () => {
      // Arrange
      const mockStats = createMockStats();
      const updates = {
        level: 10,
        total_xp: 1000,
        ml_coins: 500,
        current_rank: 'Nacom',
        exercises_completed: 50,
      };
      const updatedStats = { ...mockStats, ...updates };
      mockUserStatsRepo.findOne.mockResolvedValue(mockStats);
      mockUserStatsRepo.save.mockResolvedValue(updatedStats);

      // Act
      const result = await service.updateStats(mockUserId, updates);

      // Assert
      expect(result).toEqual(updatedStats);
      expect(result.level).toBe(10);
      expect(result.total_xp).toBe(1000);
      expect(result.ml_coins).toBe(500);
      expect(result.current_rank).toBe('Nacom');
      expect(result.exercises_completed).toBe(50);
    });
  });

  // =====================================================
  // incrementField
  // =====================================================
  describe('incrementField', () => {
    it('should increment numeric field by default amount (1)', async () => {
      // Arrange
      const mockStats = createMockStats({ exercises_completed: 10 });
      const updatedStats = createMockStats({ exercises_completed: 11 });
      mockUserStatsRepo.findOne.mockResolvedValue(mockStats);
      mockUserStatsRepo.save.mockResolvedValue(updatedStats);

      // Act
      const result = await service.incrementField(
        mockUserId,
        'exercises_completed',
      );

      // Assert
      expect(result.exercises_completed).toBe(11);
      expect(mockUserStatsRepo.save).toHaveBeenCalled();
    });

    it('should increment numeric field by specified amount', async () => {
      // Arrange
      const mockStats = createMockStats({ ml_coins: 100 });
      const updatedStats = createMockStats({ ml_coins: 150 });
      mockUserStatsRepo.findOne.mockResolvedValue(mockStats);
      mockUserStatsRepo.save.mockResolvedValue(updatedStats);

      // Act
      const result = await service.incrementField(mockUserId, 'ml_coins', 50);

      // Assert
      expect(result.ml_coins).toBe(150);
    });

    it('should throw BadRequestException for non-numeric field', async () => {
      // Arrange
      const mockStats = createMockStats();
      mockUserStatsRepo.findOne.mockResolvedValue(mockStats);

      // Act & Assert
      await expect(
        service.incrementField(mockUserId, 'user_id' as any, 1),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.incrementField(mockUserId, 'user_id' as any, 1),
      ).rejects.toThrow('Field user_id is not numeric');
    });

    it('should throw NotFoundException if user stats not found', async () => {
      // Arrange
      mockUserStatsRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.incrementField(mockUserId, 'exercises_completed'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // =====================================================
  // decrementField
  // =====================================================
  describe('decrementField', () => {
    it('should decrement numeric field by default amount (1)', async () => {
      // Arrange
      const mockStats = createMockStats({ ml_coins: 100 });
      const updatedStats = createMockStats({ ml_coins: 99 });
      mockUserStatsRepo.findOne.mockResolvedValue(mockStats);
      mockUserStatsRepo.save.mockResolvedValue(updatedStats);

      // Act
      const result = await service.decrementField(mockUserId, 'ml_coins');

      // Assert
      expect(result.ml_coins).toBe(99);
    });

    it('should decrement numeric field by specified amount', async () => {
      // Arrange
      const mockStats = createMockStats({ ml_coins: 100 });
      const updatedStats = createMockStats({ ml_coins: 50 });
      mockUserStatsRepo.findOne.mockResolvedValue(mockStats);
      mockUserStatsRepo.save.mockResolvedValue(updatedStats);

      // Act
      const result = await service.decrementField(mockUserId, 'ml_coins', 50);

      // Assert
      expect(result.ml_coins).toBe(50);
    });

    it('should allow decrement to negative values', async () => {
      // Arrange
      const mockStats = createMockStats({ ml_coins: 10 });
      const updatedStats = createMockStats({ ml_coins: -40 });
      mockUserStatsRepo.findOne.mockResolvedValue(mockStats);
      mockUserStatsRepo.save.mockResolvedValue(updatedStats);

      // Act
      const result = await service.decrementField(mockUserId, 'ml_coins', 50);

      // Assert
      expect(result.ml_coins).toBe(-40);
    });
  });

  // =====================================================
  // addXp
  // =====================================================
  describe('addXp', () => {
    it('should add XP without leveling up', async () => {
      // Arrange
      const mockStats = createMockStats({ total_xp: 50, xp_to_next_level: 100 });
      const updatedStats = createMockStats({ total_xp: 80, xp_to_next_level: 100 });
      mockUserStatsRepo.findOne.mockResolvedValue(mockStats);
      mockUserStatsRepo.save.mockResolvedValue(updatedStats);

      // Act
      const result = await service.addXp(mockUserId, 30);

      // Assert
      expect(result.total_xp).toBe(80);
      expect(result.level).toBe(1);
      expect(mockUserStatsRepo.save).toHaveBeenCalled();
    });

    it('should accumulate XP and delegate level-up to DB trigger', async () => {
      // NOTE: Level-ups are now handled by database triggers, not client-side code
      // The service just adds XP and saves; trigger handles promotion
      // Arrange
      const mockStats = createMockStats({
        level: 1,
        total_xp: 80,
        xp_to_next_level: 100,
        current_rank: 'Ajaw',
        rank_progress: 0,
      });
      // Simulate what DB trigger would return after level up
      const savedStats = createMockStats({
        level: 2, // Trigger promoted level
        total_xp: 130, // Service adds XP, trigger adjusts if needed
        xp_to_next_level: 110,
        current_rank: 'Ajaw',
        rank_progress: 26,
      });
      mockUserStatsRepo.findOne.mockResolvedValue(mockStats);
      mockUserStatsRepo.save.mockResolvedValue(savedStats);

      // Act
      const result = await service.addXp(mockUserId, 50);

      // Assert - verify save was called with accumulated XP
      expect(mockUserStatsRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ total_xp: 130 }),
      );
      // Result comes from DB (with trigger effects)
      expect(result.level).toBe(2);
    });

    it('should handle large XP gain - trigger handles multiple level ups', async () => {
      // NOTE: Multi-level ups are handled by database triggers
      // Arrange
      const mockStats = createMockStats({
        level: 1,
        total_xp: 0,
        xp_to_next_level: 100,
        current_rank: 'Ajaw',
        rank_progress: 0,
      });
      // Simulate trigger result after multiple level-ups
      const savedStats = createMockStats({
        level: 4,
        total_xp: 500,
        xp_to_next_level: 130,
        current_rank: 'Ajaw',
        rank_progress: 100,
      });
      mockUserStatsRepo.findOne.mockResolvedValue(mockStats);
      mockUserStatsRepo.save.mockResolvedValue(savedStats);

      // Act
      const result = await service.addXp(mockUserId, 500);

      // Assert
      expect(mockUserStatsRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ total_xp: 500 }),
      );
      expect(result.level).toBe(4);
    });

    it('should trigger rank promotion via DB trigger at level threshold', async () => {
      // NOTE: Rank promotions are handled by database triggers
      // Arrange
      const mockStats = createMockStats({
        level: 4,
        total_xp: 90,
        xp_to_next_level: 100,
        current_rank: 'Ajaw',
        rank_progress: 80,
      });
      // Simulate trigger result after rank promotion
      const savedStats = createMockStats({
        level: 5,
        total_xp: 140,
        xp_to_next_level: 140,
        current_rank: 'Nacom',
        rank_progress: 0,
      });
      mockUserStatsRepo.findOne.mockResolvedValue(mockStats);
      mockUserStatsRepo.save.mockResolvedValue(savedStats);

      // Act
      const result = await service.addXp(mockUserId, 50);

      // Assert - verify XP was added
      expect(mockUserStatsRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ total_xp: 140 }),
      );
      // Result from DB includes trigger effects
      expect(result.level).toBe(5);
      expect(result.current_rank).toBe('Nacom');
    });

    it('should throw NotFoundException if user stats not found', async () => {
      // Arrange
      mockUserStatsRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.addXp(mockUserId, 100)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle zero XP addition', async () => {
      // Arrange
      const mockStats = createMockStats({ total_xp: 50 });
      const updatedStats = createMockStats({ total_xp: 50 });
      mockUserStatsRepo.findOne.mockResolvedValue(mockStats);
      mockUserStatsRepo.save.mockResolvedValue(updatedStats);

      // Act
      const result = await service.addXp(mockUserId, 0);

      // Assert
      expect(result.total_xp).toBe(50);
      expect(result.level).toBe(1);
    });

    it('should calculate rank progress correctly - handled by DB trigger', async () => {
      // NOTE: Rank progress calculation is now handled by database triggers
      // Arrange
      const mockStats = createMockStats({
        level: 2,
        total_xp: 50,
        xp_to_next_level: 100,
        current_rank: 'Ajaw',
        rank_progress: 0,
      });
      // Simulate trigger result with updated rank progress
      const savedStats = createMockStats({
        level: 2,
        total_xp: 100,
        xp_to_next_level: 100,
        current_rank: 'Ajaw',
        rank_progress: 60,
      });
      mockUserStatsRepo.findOne.mockResolvedValue(mockStats);
      mockUserStatsRepo.save.mockResolvedValue(savedStats);

      // Act
      const result = await service.addXp(mockUserId, 50);

      // Assert
      expect(mockUserStatsRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ total_xp: 100 }),
      );
      expect(result.rank_progress).toBe(60); // From DB trigger
    });

    it('should cap rank progress at 100 when at max rank - handled by DB trigger', async () => {
      // NOTE: Max rank capping is handled by database triggers
      // Arrange
      const mockStats = createMockStats({
        level: 20,
        total_xp: 0,
        xp_to_next_level: 600,
        current_rank: "K'uk'ulkan",
        rank_progress: 100,
      });
      // Simulate trigger result maintaining 100% at max rank
      const savedStats = createMockStats({
        level: 22,
        total_xp: 1000,
        xp_to_next_level: 660,
        current_rank: "K'uk'ulkan",
        rank_progress: 100,
      });
      mockUserStatsRepo.findOne.mockResolvedValue(mockStats);
      mockUserStatsRepo.save.mockResolvedValue(savedStats);

      // Act
      const result = await service.addXp(mockUserId, 1000);

      // Assert
      expect(result.current_rank).toBe("K'uk'ulkan");
      expect(result.rank_progress).toBe(100);
      expect(result.level).toBeGreaterThan(20);
    });
  });

  // =====================================================
  // getGlobalRanking
  // =====================================================
  describe('getGlobalRanking', () => {
    it('should return top users by total XP with default limit', async () => {
      // Arrange
      const mockRanking = [
        createMockStats({ user_id: 'user-1', total_xp: 1000 }),
        createMockStats({ user_id: 'user-2', total_xp: 900 }),
        createMockStats({ user_id: 'user-3', total_xp: 800 }),
      ];
      mockUserStatsRepo.find.mockResolvedValue(mockRanking);

      // Act
      const result = await service.getGlobalRanking();

      // Assert
      expect(result).toEqual(mockRanking);
      expect(mockUserStatsRepo.find).toHaveBeenCalledWith({
        order: { total_xp: 'DESC' },
        take: 100,
      });
    });

    it('should return top users with custom limit', async () => {
      // Arrange
      const mockRanking = [
        createMockStats({ user_id: 'user-1', total_xp: 1000 }),
        createMockStats({ user_id: 'user-2', total_xp: 900 }),
      ];
      mockUserStatsRepo.find.mockResolvedValue(mockRanking);

      // Act
      const result = await service.getGlobalRanking(50);

      // Assert
      expect(result).toEqual(mockRanking);
      expect(mockUserStatsRepo.find).toHaveBeenCalledWith({
        order: { total_xp: 'DESC' },
        take: 50,
      });
    });

    it('should return empty array when no stats exist', async () => {
      // Arrange
      mockUserStatsRepo.find.mockResolvedValue([]);

      // Act
      const result = await service.getGlobalRanking();

      // Assert
      expect(result).toEqual([]);
    });
  });

  // =====================================================
  // getTenantRanking
  // =====================================================
  describe('getTenantRanking', () => {
    it('should return tenant ranking with default limit', async () => {
      // Arrange
      const mockRanking = [
        createMockStats({ user_id: 'user-1', tenant_id: mockTenantId, total_xp: 1000 }),
        createMockStats({ user_id: 'user-2', tenant_id: mockTenantId, total_xp: 900 }),
      ];
      mockUserStatsRepo.find.mockResolvedValue(mockRanking);

      // Act
      const result = await service.getTenantRanking(mockTenantId);

      // Assert
      expect(result).toEqual(mockRanking);
      expect(mockUserStatsRepo.find).toHaveBeenCalledWith({
        where: { tenant_id: mockTenantId },
        order: { total_xp: 'DESC' },
        take: 100,
      });
    });

    it('should return tenant ranking with custom limit', async () => {
      // Arrange
      const mockRanking = [
        createMockStats({ user_id: 'user-1', tenant_id: mockTenantId, total_xp: 1000 }),
      ];
      mockUserStatsRepo.find.mockResolvedValue(mockRanking);

      // Act
      const result = await service.getTenantRanking(mockTenantId, 10);

      // Assert
      expect(result).toEqual(mockRanking);
      expect(mockUserStatsRepo.find).toHaveBeenCalledWith({
        where: { tenant_id: mockTenantId },
        order: { total_xp: 'DESC' },
        take: 10,
      });
    });

    it('should return only users from specified tenant', async () => {
      // Arrange
      const tenant1Stats = createMockStats({
        user_id: 'user-1',
        tenant_id: 'tenant-1',
        total_xp: 1000,
      });
      mockUserStatsRepo.find.mockResolvedValue([tenant1Stats]);

      // Act
      const result = await service.getTenantRanking('tenant-1');

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].tenant_id).toBe('tenant-1');
      expect(mockUserStatsRepo.find).toHaveBeenCalledWith({
        where: { tenant_id: 'tenant-1' },
        order: { total_xp: 'DESC' },
        take: 100,
      });
    });

    it('should return empty array when tenant has no users', async () => {
      // Arrange
      mockUserStatsRepo.find.mockResolvedValue([]);

      // Act
      const result = await service.getTenantRanking('empty-tenant');

      // Assert
      expect(result).toEqual([]);
    });
  });

  // =====================================================
  // getTopByLevel
  // =====================================================
  describe('getTopByLevel', () => {
    it('should return top users by level with default limit', async () => {
      // Arrange
      const mockRanking = [
        createMockStats({ user_id: 'user-1', level: 10, total_xp: 1000 }),
        createMockStats({ user_id: 'user-2', level: 9, total_xp: 900 }),
        createMockStats({ user_id: 'user-3', level: 8, total_xp: 800 }),
      ];
      mockUserStatsRepo.find.mockResolvedValue(mockRanking);

      // Act
      const result = await service.getTopByLevel();

      // Assert
      expect(result).toEqual(mockRanking);
      expect(mockUserStatsRepo.find).toHaveBeenCalledWith({
        order: { level: 'DESC', total_xp: 'DESC' },
        take: 50,
      });
    });

    it('should return top users with custom limit', async () => {
      // Arrange
      const mockRanking = [
        createMockStats({ user_id: 'user-1', level: 10, total_xp: 1000 }),
      ];
      mockUserStatsRepo.find.mockResolvedValue(mockRanking);

      // Act
      const result = await service.getTopByLevel(10);

      // Assert
      expect(result).toEqual(mockRanking);
      expect(mockUserStatsRepo.find).toHaveBeenCalledWith({
        order: { level: 'DESC', total_xp: 'DESC' },
        take: 10,
      });
    });

    it('should use total_xp as tiebreaker for same level', async () => {
      // Arrange
      const mockRanking = [
        createMockStats({ user_id: 'user-1', level: 5, total_xp: 500 }),
        createMockStats({ user_id: 'user-2', level: 5, total_xp: 400 }),
      ];
      mockUserStatsRepo.find.mockResolvedValue(mockRanking);

      // Act
      const result = await service.getTopByLevel();

      // Assert
      expect(result[0].total_xp).toBeGreaterThan(result[1].total_xp);
      expect(mockUserStatsRepo.find).toHaveBeenCalledWith({
        order: { level: 'DESC', total_xp: 'DESC' },
        take: 50,
      });
    });

    it('should return empty array when no stats exist', async () => {
      // Arrange
      mockUserStatsRepo.find.mockResolvedValue([]);

      // Act
      const result = await service.getTopByLevel();

      // Assert
      expect(result).toEqual([]);
    });
  });
});
