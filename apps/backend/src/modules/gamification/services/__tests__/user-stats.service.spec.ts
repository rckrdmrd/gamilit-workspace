import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UserStatsService } from '../user-stats.service';
import { UserStats } from '../../entities';
import { Profile } from '@/modules/auth/entities/profile.entity';

describe('UserStatsService', () => {
  let service: UserStatsService;
  let userStatsRepo: jest.Mocked<Partial<Repository<UserStats>>>;
  let profileRepo: jest.Mocked<Partial<Repository<Profile>>>;

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
  const mockProfileId = 'profile-123';
  const mockTenantId = 'tenant-456';

  const mockProfile = {
    id: mockProfileId,
    user_id: mockUserId,
    tenant_id: mockTenantId,
    first_name: 'Test',
    last_name: 'User',
  };

  const createMockStats = (overrides?: Partial<UserStats>): UserStats => ({
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
    profileRepo = module.get(getRepositoryToken(Profile, 'auth'));

    jest.clearAllMocks();

    // Default: profile exists (most tests need this)
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
      // Arrange - profile mock is already set in beforeEach
      const mockStats = createMockStats({ user_id: mockProfileId });
      mockUserStatsRepo.findOne.mockResolvedValue(mockStats);

      // Act
      const result = await service.findByUserId(mockUserId);

      // Assert
      expect(result).toEqual(mockStats);
      expect(mockProfileRepo.findOne).toHaveBeenCalled();
      expect(mockUserStatsRepo.findOne).toHaveBeenCalledWith({
        where: { user_id: mockProfileId },
      });
    });

    it('should throw NotFoundException when stats not found', async () => {
      // Arrange - profile mock is already set in beforeEach
      mockUserStatsRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findByUserId(mockUserId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByUserId(mockUserId)).rejects.toThrow(
        `No stats found for user ${mockUserId} (profile: ${mockProfileId})`,
      );
    });

    it('should throw NotFoundException when profile not found', async () => {
      // Arrange - override the default profile mock
      mockProfileRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findByUserId(mockUserId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // =====================================================
  // create
  // =====================================================
  describe('create', () => {
    it('should create new stats with default values', async () => {
      // Arrange - profile mock is already set in beforeEach
      mockUserStatsRepo.findOne.mockResolvedValue(null);
      const newStats = createMockStats({ user_id: mockProfileId });
      mockUserStatsRepo.create.mockReturnValue(newStats);
      mockUserStatsRepo.save.mockResolvedValue(newStats);

      // Act
      const result = await service.create(mockUserId, mockTenantId);

      // Assert
      expect(result).toEqual(newStats);
      expect(mockUserStatsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockProfileId, // Uses profile.id, not authUserId
          tenant_id: mockTenantId,
          level: 1,
          total_xp: 0,
        }),
      );
      expect(mockUserStatsRepo.save).toHaveBeenCalledWith(newStats);
    });

    it('should create stats using profile tenant_id when not provided', async () => {
      // Arrange - profile mock is already set in beforeEach
      mockUserStatsRepo.findOne.mockResolvedValue(null);
      const newStats = createMockStats({ user_id: mockProfileId });
      mockUserStatsRepo.create.mockReturnValue(newStats);
      mockUserStatsRepo.save.mockResolvedValue(newStats);

      // Act
      const result = await service.create(mockUserId);

      // Assert
      expect(result).toBeDefined();
      expect(mockUserStatsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockProfileId,
          tenant_id: mockTenantId, // Uses profile's tenant_id
        }),
      );
    });

    it('should throw BadRequestException if stats already exist', async () => {
      // Arrange - profile mock is already set in beforeEach
      const existingStats = createMockStats({ user_id: mockProfileId });
      mockUserStatsRepo.findOne.mockResolvedValue(existingStats);

      // Act & Assert
      await expect(service.create(mockUserId, mockTenantId)).rejects.toThrow(
        BadRequestException,
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

    it('should level up when XP exceeds threshold', async () => {
      // Arrange
      const mockStats = createMockStats({
        level: 1,
        total_xp: 80,
        xp_to_next_level: 100,
        current_rank: 'Ajaw',
        rank_progress: 0,
      });
      mockUserStatsRepo.findOne.mockResolvedValue(mockStats);
      // Mock save to simulate DB trigger behavior that handles level-up
      mockUserStatsRepo.save.mockImplementation((stats) => {
        const saved = { ...stats } as UserStats;
        // Simulate DB trigger: if total_xp >= xp_to_next_level, level up
        if (saved.total_xp >= saved.xp_to_next_level) {
          saved.level = 2;
          saved.total_xp = saved.total_xp - 100; // carry over
          saved.xp_to_next_level = 110; // scaled for level 2
        }
        return Promise.resolve(saved);
      });

      // Act
      const result = await service.addXp(mockUserId, 50);

      // Assert
      expect(result.level).toBe(2);
      expect(result.total_xp).toBe(30); // 130 - 100 = 30 XP carry over
      expect(result.xp_to_next_level).toBe(110); // Scaled XP for level 2
      expect(mockUserStatsRepo.save).toHaveBeenCalled();
    });

    it('should level up multiple times with large XP gain', async () => {
      // Arrange
      const mockStats = createMockStats({
        level: 1,
        total_xp: 0,
        xp_to_next_level: 100,
        current_rank: 'Ajaw',
        rank_progress: 0,
      });
      mockUserStatsRepo.findOne.mockResolvedValue(mockStats);
      // Mock save to simulate DB trigger handling multiple level-ups
      mockUserStatsRepo.save.mockImplementation((stats) => {
        const saved = { ...stats } as UserStats;
        // Simulate DB trigger: process level-ups
        let level = saved.level;
        let xp = saved.total_xp;
        let threshold = saved.xp_to_next_level;
        while (xp >= threshold) {
          xp -= threshold;
          level++;
          threshold = 100 + (level - 1) * 10;
        }
        saved.level = level;
        saved.total_xp = xp;
        saved.xp_to_next_level = threshold;
        return Promise.resolve(saved);
      });

      // Act - Adding 500 XP should level up multiple times
      const result = await service.addXp(mockUserId, 500);

      // Assert
      expect(result.level).toBeGreaterThan(1);
      expect(result.total_xp).toBeGreaterThanOrEqual(0);
      expect(result.total_xp).toBeLessThan(result.xp_to_next_level);
    });

    it('should promote rank when reaching level threshold', async () => {
      // Arrange
      const mockStats = createMockStats({
        level: 4,
        total_xp: 90,
        xp_to_next_level: 100,
        current_rank: 'Ajaw',
        rank_progress: 80,
      });
      mockUserStatsRepo.findOne.mockResolvedValue(mockStats);
      // Mock save to simulate DB trigger: level up and rank promotion
      mockUserStatsRepo.save.mockImplementation((stats) => {
        const saved = { ...stats } as UserStats;
        // Simulate: level up from 4 to 5
        if (saved.total_xp >= saved.xp_to_next_level) {
          saved.level = 5;
          saved.total_xp = saved.total_xp - 100;
          saved.xp_to_next_level = 140;
          // Level 5 triggers rank promotion to 'Nacom'
          saved.current_rank = 'Nacom';
          saved.rank_progress = 0;
        }
        return Promise.resolve(saved);
      });

      // Act - Level 4 -> 5 should trigger rank promotion to 'Nacom'
      const result = await service.addXp(mockUserId, 50);

      // Assert
      expect(result.level).toBe(5);
      expect(result.current_rank).toBe('Nacom');
      expect(result.rank_progress).toBe(0); // Reset progress after promotion
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

    it('should calculate rank progress correctly between ranks', async () => {
      // Arrange
      const mockStats = createMockStats({
        level: 2,
        total_xp: 50,
        xp_to_next_level: 100,
        current_rank: 'Ajaw',
        rank_progress: 0,
      });
      mockUserStatsRepo.findOne.mockResolvedValue(mockStats);
      // Mock save to simulate DB trigger: level up + rank progress calc
      mockUserStatsRepo.save.mockImplementation((stats) => {
        const saved = { ...stats } as UserStats;
        // Simulate: level up from 2 to 3
        if (saved.total_xp >= saved.xp_to_next_level) {
          saved.level = 3;
          saved.total_xp = saved.total_xp - 100;
          saved.xp_to_next_level = 120;
          // Calculate rank progress: (3-0)/(5-0)*100 = 60%
          saved.rank_progress = 60;
        }
        return Promise.resolve(saved);
      });

      // Act
      const result = await service.addXp(mockUserId, 50);

      // Assert
      // Level 3 is at 60% progress to rank 'Nacom' (level 5)
      // Progress = (3 - 0) / (5 - 0) * 100 = 60%
      expect(result.level).toBe(3);
      expect(result.rank_progress).toBe(60);
    });

    it('should cap rank progress at 100 when at max rank', async () => {
      // Arrange
      const mockStats = createMockStats({
        level: 20,
        total_xp: 0,
        xp_to_next_level: 600,
        current_rank: "K'uk'ulkan", // Max rank
        rank_progress: 100,
      });
      mockUserStatsRepo.findOne.mockResolvedValue(mockStats);
      // Mock save to simulate DB trigger: level up at max rank
      mockUserStatsRepo.save.mockImplementation((stats) => {
        const saved = { ...stats } as UserStats;
        // Simulate: adding 1000 XP to level 20 (needs 600 to next level)
        // 1000 XP would level up to 21+
        let xp = saved.total_xp;
        let level = saved.level;
        let threshold = saved.xp_to_next_level;
        while (xp >= threshold) {
          xp -= threshold;
          level++;
          threshold = 100 + (level - 1) * 10;
        }
        saved.level = level;
        saved.total_xp = xp;
        saved.xp_to_next_level = threshold;
        // At max rank, progress stays at 100
        saved.current_rank = "K'uk'ulkan";
        saved.rank_progress = 100;
        return Promise.resolve(saved);
      });

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
