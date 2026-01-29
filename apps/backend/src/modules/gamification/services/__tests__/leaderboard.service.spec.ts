import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { LeaderboardService } from '../leaderboard.service';
import { UserStats } from '../../entities';
import { Profile } from '@modules/auth/entities';

describe('LeaderboardService', () => {
  let service: LeaderboardService;
  let _userStatsRepo: Repository<UserStats>;
  let _profileRepo: Repository<Profile>;
  let _cacheManager: any;

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getCount: jest.fn(),
  };

  const mockUserStatsRepo = {
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    findOne: jest.fn(),
    count: jest.fn(),
    query: jest.fn(),
  };

  const mockProfileRepo = {
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const createMockUserStats = (overrides?: any) => ({
    stats_user_id: 'user-1',
    stats_total_xp: 1000,
    stats_level: 10,
    stats_current_rank: 'Nacom',
    stats_current_streak: 7,
    stats_achievements_earned: 15,
    stats_exercises_completed: 50,
    ...overrides,
  });

  const createMockProfile = (overrides?: any) => ({
    profile_user_id: 'user-1',
    profile_display_name: 'TestUser',
    profile_first_name: 'Test',
    profile_last_name: 'User',
    profile_avatar_url: 'https://example.com/avatar.jpg',
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaderboardService,
        {
          provide: getRepositoryToken(UserStats, 'gamification'),
          useValue: mockUserStatsRepo,
        },
        {
          provide: getRepositoryToken(Profile, 'auth'),
          useValue: mockProfileRepo,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<LeaderboardService>(LeaderboardService);
    _userStatsRepo = module.get(getRepositoryToken(UserStats, 'gamification'));
    _profileRepo = module.get(getRepositoryToken(Profile, 'auth'));
    _cacheManager = module.get(CACHE_MANAGER);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // =====================================================
  // getGlobalLeaderboard
  // =====================================================
  describe('getGlobalLeaderboard', () => {
    it('should return cached data if available', async () => {
      // Arrange
      const cachedData = { type: 'global', entries: [], totalEntries: 0 };
      mockCacheManager.get.mockResolvedValue(cachedData);

      // Act
      const result = await service.getGlobalLeaderboard();

      // Assert
      expect(result).toEqual(cachedData);
      expect(mockCacheManager.get).toHaveBeenCalledWith('leaderboard:global:100:0:all_time');
      expect(mockQueryBuilder.getRawMany).not.toHaveBeenCalled();
    });

    it('should query database when cache is empty', async () => {
      // Arrange
      mockCacheManager.get.mockResolvedValue(null);
      const mockStats = [
        createMockUserStats({ stats_user_id: 'user-1', stats_total_xp: 1000 }),
        createMockUserStats({ stats_user_id: 'user-2', stats_total_xp: 900 }),
      ];
      const mockProfiles = [
        createMockProfile({ profile_user_id: 'user-1' }),
        createMockProfile({ profile_user_id: 'user-2' }),
      ];

      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce(mockStats)
        .mockResolvedValueOnce(mockProfiles);
      mockUserStatsRepo.count.mockResolvedValue(100);

      // Act
      const result = await service.getGlobalLeaderboard();

      // Assert
      expect(result.type).toBe('global');
      expect(result.entries).toHaveLength(2);
      expect(result.entries[0].rank).toBe(1);
      expect(result.entries[0].userId).toBe('user-1');
      expect(result.entries[0].totalXP).toBe(1000);
      expect(result.totalEntries).toBe(100);
      expect(mockCacheManager.set).toHaveBeenCalled();
    });

    it('should handle pagination with limit and offset', async () => {
      // Arrange
      mockCacheManager.get.mockResolvedValue(null);
      const mockStats = [createMockUserStats({ stats_user_id: 'user-11' })];
      const mockProfiles = [createMockProfile({ profile_user_id: 'user-11' })];

      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce(mockStats)
        .mockResolvedValueOnce(mockProfiles);
      mockUserStatsRepo.count.mockResolvedValue(100);

      // Act
      const result = await service.getGlobalLeaderboard(10, 10);

      // Assert
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.offset).toHaveBeenCalledWith(10);
      expect(result.entries[0].rank).toBe(11); // offset + index + 1
    });

    it('should order by total_xp, level, and exercises_completed', async () => {
      // Arrange
      mockCacheManager.get.mockResolvedValue(null);
      mockQueryBuilder.getRawMany.mockResolvedValue([]);
      mockUserStatsRepo.count.mockResolvedValue(0);

      // Act
      await service.getGlobalLeaderboard();

      // Assert
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('stats.total_xp', 'DESC');
      expect(mockQueryBuilder.addOrderBy).toHaveBeenCalledWith('stats.level', 'DESC');
      expect(mockQueryBuilder.addOrderBy).toHaveBeenCalledWith('stats.exercises_completed', 'DESC');
    });

    it('should return empty result when no users exist', async () => {
      // Arrange
      mockCacheManager.get.mockResolvedValue(null);
      mockQueryBuilder.getRawMany.mockResolvedValue([]);
      mockUserStatsRepo.count.mockResolvedValue(0);

      // Act
      const result = await service.getGlobalLeaderboard();

      // Assert
      expect(result.type).toBe('global');
      expect(result.entries).toEqual([]);
      expect(result.totalEntries).toBe(0);
      expect(mockCacheManager.set).toHaveBeenCalled();
    });

    it('should handle cache get failures gracefully', async () => {
      // Arrange
      mockCacheManager.get.mockRejectedValue(new Error('Cache unavailable'));
      const mockStats = [createMockUserStats()];
      const mockProfiles = [createMockProfile()];

      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce(mockStats)
        .mockResolvedValueOnce(mockProfiles);
      mockUserStatsRepo.count.mockResolvedValue(1);

      // Act
      const result = await service.getGlobalLeaderboard();

      // Assert
      expect(result.type).toBe('global');
      expect(result.entries).toHaveLength(1);
    });

    it('should handle cache set failures gracefully', async () => {
      // Arrange
      mockCacheManager.get.mockResolvedValue(null);
      const mockStats = [createMockUserStats()];
      const mockProfiles = [createMockProfile()];

      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce(mockStats)
        .mockResolvedValueOnce(mockProfiles);
      mockUserStatsRepo.count.mockResolvedValue(1);

      // Mock cache set to fail after the data is retrieved
      mockCacheManager.set.mockRejectedValueOnce(new Error('Cache write failed'));

      // Act
      const result = await service.getGlobalLeaderboard();

      // Assert
      expect(result.type).toBe('global');
      expect(result.entries).toHaveLength(1);

      // Reset cache mock for other tests
      mockCacheManager.set.mockResolvedValue(undefined);
    });

    it('should use display_name when available, fallback to first_name', async () => {
      // Arrange
      mockCacheManager.get.mockResolvedValue(null);
      const mockStats = [
        createMockUserStats({ stats_user_id: 'user-1' }),
        createMockUserStats({ stats_user_id: 'user-2' }),
        createMockUserStats({ stats_user_id: 'user-3' }),
      ];
      const mockProfiles = [
        createMockProfile({ profile_user_id: 'user-1', profile_display_name: 'CoolNickname' }),
        createMockProfile({ profile_user_id: 'user-2', profile_display_name: null, profile_first_name: 'John' }),
        createMockProfile({ profile_user_id: 'user-3', profile_display_name: null, profile_first_name: null }),
      ];

      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce(mockStats)
        .mockResolvedValueOnce(mockProfiles);
      mockUserStatsRepo.count.mockResolvedValue(3);

      // Act
      const result = await service.getGlobalLeaderboard();

      // Assert
      expect(result.entries[0].username).toBe('CoolNickname');
      expect(result.entries[1].username).toBe('John');
      expect(result.entries[2].username).toBe('Usuario');
    });

    it('should include all required fields in leaderboard entry', async () => {
      // Arrange
      mockCacheManager.get.mockResolvedValue(null);
      const mockStats = [createMockUserStats()];
      const mockProfiles = [createMockProfile()];

      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce(mockStats)
        .mockResolvedValueOnce(mockProfiles);
      mockUserStatsRepo.count.mockResolvedValue(1);

      // Act
      const result = await service.getGlobalLeaderboard();

      // Assert
      const entry = result.entries[0];
      expect(entry).toHaveProperty('rank');
      expect(entry).toHaveProperty('userId');
      expect(entry).toHaveProperty('username');
      expect(entry).toHaveProperty('firstName');
      expect(entry).toHaveProperty('lastName');
      expect(entry).toHaveProperty('avatar');
      expect(entry).toHaveProperty('totalXP');
      expect(entry).toHaveProperty('level');
      expect(entry).toHaveProperty('currentRank');
      expect(entry).toHaveProperty('streak');
      expect(entry).toHaveProperty('achievementCount');
      expect(entry).toHaveProperty('tasksCompleted');
    });

    it('should cache result with correct TTL', async () => {
      // Arrange
      mockCacheManager.get.mockResolvedValue(null);
      const mockStats = [createMockUserStats()];
      const mockProfiles = [createMockProfile()];

      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce(mockStats)
        .mockResolvedValueOnce(mockProfiles);
      mockUserStatsRepo.count.mockResolvedValue(1);

      // Act
      await service.getGlobalLeaderboard();

      // Assert
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'leaderboard:global:100:0:all_time',
        expect.any(Object),
        60000, // 60 seconds TTL
      );
    });
  });

  // =====================================================
  // getSchoolLeaderboard
  // =====================================================
  describe('getSchoolLeaderboard', () => {
    const schoolId = 'school-123';

    it('should return cached data if available', async () => {
      // Arrange
      const cachedData = { type: 'school', entries: [], totalEntries: 0, schoolId };
      mockCacheManager.get.mockResolvedValue(cachedData);

      // Act
      const result = await service.getSchoolLeaderboard(schoolId);

      // Assert
      expect(result).toEqual(cachedData);
      expect(mockCacheManager.get).toHaveBeenCalledWith(`leaderboard:school:${schoolId}:100:0:all_time`);
    });

    it('should query school users and return leaderboard', async () => {
      // Arrange
      mockCacheManager.get.mockResolvedValue(null);
      const mockSchoolProfiles = [
        { profile_user_id: 'user-1' },
        { profile_user_id: 'user-2' },
      ];
      const mockStats = [
        createMockUserStats({ stats_user_id: 'user-1', stats_total_xp: 1000 }),
        createMockUserStats({ stats_user_id: 'user-2', stats_total_xp: 900 }),
      ];
      const mockProfiles = [
        createMockProfile({ profile_user_id: 'user-1' }),
        createMockProfile({ profile_user_id: 'user-2' }),
      ];

      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce(mockSchoolProfiles)
        .mockResolvedValueOnce(mockStats)
        .mockResolvedValueOnce(mockProfiles);

      // Act
      const result = await service.getSchoolLeaderboard(schoolId);

      // Assert
      expect(result.type).toBe('school');
      expect(result.schoolId).toBe(schoolId);
      expect(result.entries).toHaveLength(2);
      expect(result.totalEntries).toBe(2);
    });

    it('should return empty result when school has no users', async () => {
      // Arrange
      mockCacheManager.get.mockResolvedValue(null);
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      // Act
      const result = await service.getSchoolLeaderboard(schoolId);

      // Assert
      expect(result.type).toBe('school');
      expect(result.entries).toEqual([]);
      expect(result.totalEntries).toBe(0);
      expect(result.schoolId).toBe(schoolId);
    });

    it('should filter users by school correctly', async () => {
      // Arrange
      mockCacheManager.get.mockResolvedValue(null);
      mockQueryBuilder.getRawMany.mockResolvedValue([{ profile_user_id: 'user-1' }]);

      // Act
      await service.getSchoolLeaderboard(schoolId);

      // Assert
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'profile.school_id = :schoolId',
        { schoolId },
      );
    });
  });

  // =====================================================
  // getClassroomLeaderboard
  // =====================================================
  describe('getClassroomLeaderboard', () => {
    const classroomId = 'classroom-123';

    it('should query classroom members and return leaderboard', async () => {
      // Arrange
      const mockClassroomMembers = [
        { user_id: 'user-1' },
        { user_id: 'user-2' },
      ];
      const mockStats = [
        createMockUserStats({ stats_user_id: 'user-1', stats_total_xp: 1000 }),
        createMockUserStats({ stats_user_id: 'user-2', stats_total_xp: 900 }),
      ];
      const mockProfiles = [
        createMockProfile({ profile_user_id: 'user-1' }),
        createMockProfile({ profile_user_id: 'user-2' }),
      ];

      mockUserStatsRepo.query.mockResolvedValue(mockClassroomMembers);
      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce(mockStats)
        .mockResolvedValueOnce(mockProfiles);

      // Act
      const result = await service.getClassroomLeaderboard(classroomId);

      // Assert
      expect(result.type).toBe('classroom');
      expect(result.classroomId).toBe(classroomId);
      expect(result.entries).toHaveLength(2);
      expect(result.totalEntries).toBe(2);
      expect(mockUserStatsRepo.query).toHaveBeenCalled();
    });

    it('should return empty result when classroom has no members', async () => {
      // Arrange
      mockUserStatsRepo.query.mockResolvedValue([]);

      // Act
      const result = await service.getClassroomLeaderboard(classroomId);

      // Assert
      expect(result.type).toBe('classroom');
      expect(result.entries).toEqual([]);
      expect(result.totalEntries).toBe(0);
      expect(result.classroomId).toBe(classroomId);
    });
  });

  // =====================================================
  // getFriendsLeaderboard
  // =====================================================
  describe('getFriendsLeaderboard', () => {
    const userId = 'user-123';

    it('should return cached data if available', async () => {
      // Arrange
      const cachedData = { type: 'friends', entries: [], totalEntries: 0, userId };
      mockCacheManager.get.mockResolvedValue(cachedData);

      // Act
      const result = await service.getFriendsLeaderboard(userId);

      // Assert
      expect(result).toEqual(cachedData);
      expect(mockCacheManager.get).toHaveBeenCalledWith(`leaderboard:friends:${userId}:100:0:all_time`);
    });

    it('should query accepted friendships and return leaderboard', async () => {
      // Arrange
      mockCacheManager.get.mockResolvedValue(null);
      const mockFriendships = [
        { user_id: 'friend-1' },
        { user_id: 'friend-2' },
      ];
      const mockStats = [
        createMockUserStats({ stats_user_id: 'friend-1', stats_total_xp: 1000 }),
        createMockUserStats({ stats_user_id: 'friend-2', stats_total_xp: 900 }),
      ];
      const mockProfiles = [
        createMockProfile({ profile_user_id: 'friend-1' }),
        createMockProfile({ profile_user_id: 'friend-2' }),
      ];

      mockUserStatsRepo.query.mockResolvedValue(mockFriendships);
      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce(mockStats)
        .mockResolvedValueOnce(mockProfiles);

      // Act
      const result = await service.getFriendsLeaderboard(userId);

      // Assert
      expect(result.type).toBe('friends');
      expect(result.userId).toBe(userId);
      expect(result.entries).toHaveLength(2);
      expect(result.totalEntries).toBe(2);
      expect(mockUserStatsRepo.query).toHaveBeenCalledWith(
        expect.stringContaining('friendships'),
        [userId],
      );
    });

    it('should return empty result when user has no friends', async () => {
      // Arrange
      mockCacheManager.get.mockResolvedValue(null);
      mockUserStatsRepo.query.mockResolvedValue([]);

      // Act
      const result = await service.getFriendsLeaderboard(userId);

      // Assert
      expect(result.type).toBe('friends');
      expect(result.entries).toEqual([]);
      expect(result.totalEntries).toBe(0);
      expect(result.userId).toBe(userId);
    });
  });

  // =====================================================
  // getUserPosition
  // =====================================================
  describe('getUserPosition', () => {
    const userId = 'user-123';

    it('should return cached position if available', async () => {
      // Arrange
      const cachedData = { rank: 42, totalXP: 1000, level: 10, currentRank: 'Nacom' };
      mockCacheManager.get.mockResolvedValue(cachedData);

      // Act
      const result = await service.getUserPosition(userId);

      // Assert
      expect(result).toEqual(cachedData);
      expect(mockCacheManager.get).toHaveBeenCalledWith(`leaderboard:user:position:${userId}`);
    });

    it('should calculate user position correctly', async () => {
      // Arrange
      mockCacheManager.get.mockResolvedValue(null);
      const userStats = {
        user_id: userId,
        total_xp: 1000,
        level: 10,
        current_rank: 'Nacom',
      } as any;

      mockUserStatsRepo.findOne.mockResolvedValue(userStats);
      mockQueryBuilder.getCount.mockResolvedValue(41); // 41 users ahead

      // Act
      const result = await service.getUserPosition(userId);

      // Assert
      expect(result.rank).toBe(42); // 41 + 1
      expect(result.totalXP).toBe(1000);
      expect(result.level).toBe(10);
      expect(result.currentRank).toBe('Nacom');
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        `leaderboard:user:position:${userId}`,
        expect.any(Object),
        300000, // 5 minutes TTL
      );
    });

    it('should return null when user stats not found', async () => {
      // Arrange
      mockCacheManager.get.mockResolvedValue(null);
      mockUserStatsRepo.findOne.mockResolvedValue(null);

      // Act
      const result = await service.getUserPosition(userId);

      // Assert
      expect(result).toBeNull();
      expect(mockQueryBuilder.getCount).not.toHaveBeenCalled();
    });

    it('should handle ties correctly (same XP, higher level wins)', async () => {
      // Arrange
      mockCacheManager.get.mockResolvedValue(null);
      const userStats = {
        user_id: userId,
        total_xp: 1000,
        level: 10,
        current_rank: 'Nacom',
      } as any;

      mockUserStatsRepo.findOne.mockResolvedValue(userStats);
      mockQueryBuilder.getCount.mockResolvedValue(5);

      // Act
      const result = await service.getUserPosition(userId);

      // Assert
      expect(result.rank).toBe(6);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'stats.total_xp > :userXp',
        { userXp: 1000 },
      );
      expect(mockQueryBuilder.orWhere).toHaveBeenCalledWith(
        'stats.total_xp = :userXp AND stats.level > :userLevel',
        { userXp: 1000, userLevel: 10 },
      );
    });

    it('should cache result with longer TTL for position', async () => {
      // Arrange
      mockCacheManager.get.mockResolvedValue(null);
      const userStats = {
        user_id: userId,
        total_xp: 1000,
        level: 10,
        current_rank: 'Nacom',
      } as any;

      mockUserStatsRepo.findOne.mockResolvedValue(userStats);
      mockQueryBuilder.getCount.mockResolvedValue(10);

      // Act
      await service.getUserPosition(userId);

      // Assert
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        `leaderboard:user:position:${userId}`,
        expect.any(Object),
        300000, // 5 minutes (longer than leaderboard cache)
      );
    });
  });
});
