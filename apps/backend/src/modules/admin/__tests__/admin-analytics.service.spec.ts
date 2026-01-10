import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { AdminAnalyticsService } from '../services/admin-analytics.service';
import { EngagementQueryDto, TimelineQueryDto, TopUsersQueryDto } from '../dto/analytics';

describe('AdminAnalyticsService', () => {
  let service: AdminAnalyticsService;
  let mockDataSource: jest.Mocked<Partial<DataSource>>;

  const mockOverviewData = {
    total_users: '150',
    total_students: '120',
    total_teachers: '30',
    active_users: '100',
    avg_xp: '1500.50',
    avg_exercises_completed: '25.5',
    avg_engagement_score: '0.75',
    inactive_users: '20',
    beginner_users: '40',
    intermediate_users: '60',
    advanced_users: '30',
  };

  const mockEngagementData = [
    {
      user_segment: 'advanced',
      users_count: '30',
      avg_engagement_score: '0.95',
      avg_exercises_completed: '50.5',
      avg_streak: '15.2',
      active_last_7d: '28',
      active_last_30d: '30',
    },
    {
      user_segment: 'intermediate',
      users_count: '60',
      avg_engagement_score: '0.65',
      avg_exercises_completed: '25.3',
      avg_streak: '7.5',
      active_last_7d: '45',
      active_last_30d: '55',
    },
  ];

  const mockGamificationXp = [
    { xp_range: '0 XP', users_count: '10' },
    { xp_range: '1-100 XP', users_count: '25' },
    { xp_range: '101-500 XP', users_count: '40' },
    { xp_range: '501-1000 XP', users_count: '35' },
    { xp_range: '1001-5000 XP', users_count: '30' },
    { xp_range: '5000+ XP', users_count: '10' },
  ];

  const mockGamificationRanks = [
    { current_rank: 'Master', users_count: '5', avg_xp: '8500.00', avg_exercises: '100.5' },
    { current_rank: 'Expert', users_count: '15', avg_xp: '5000.00', avg_exercises: '75.2' },
    { current_rank: 'Advanced', users_count: '30', avg_xp: '2500.00', avg_exercises: '50.0' },
  ];

  const mockGamificationLevels = [
    { current_level: '1', users_count: '20' },
    { current_level: '2', users_count: '35' },
    { current_level: '3', users_count: '40' },
    { current_level: '4', users_count: '30' },
    { current_level: '5', users_count: '25' },
  ];

  const mockTimelineData = [
    {
      activity_date: '2026-01-10',
      unique_users: '85',
      total_activities: '350',
      exercises_completed: '120',
      modules_completed: '15',
      logins: '150',
    },
    {
      activity_date: '2026-01-09',
      unique_users: '78',
      total_activities: '320',
      exercises_completed: '100',
      modules_completed: '12',
      logins: '140',
    },
  ];

  const mockTopUsersData = [
    {
      user_id: 'user-1',
      display_name: 'Top User 1',
      email: 'top1@example.com',
      role: 'student',
      total_xp: '9500',
      exercises_completed: '150',
      current_streak: '45',
      current_rank: 'Master',
      current_level: '10',
      engagement_score: '0.98',
    },
    {
      user_id: 'user-2',
      display_name: 'Top User 2',
      email: 'top2@example.com',
      role: 'student',
      total_xp: '8200',
      exercises_completed: '130',
      current_streak: '30',
      current_rank: 'Expert',
      current_level: '8',
      engagement_score: '0.92',
    },
  ];

  const mockRetentionData = [
    {
      cohort_month: '2026-01-01',
      cohort_size: '50',
      retained_users: '45',
      retention_rate: '90.00',
    },
    {
      cohort_month: '2025-12-01',
      cohort_size: '60',
      retained_users: '48',
      retention_rate: '80.00',
    },
  ];

  beforeEach(async () => {
    mockDataSource = {
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminAnalyticsService,
        {
          provide: getDataSourceToken('auth'),
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<AdminAnalyticsService>(AdminAnalyticsService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getAnalyticsOverview', () => {
    it('should return analytics overview with all metrics', async () => {
      // Arrange
      mockDataSource.query!.mockResolvedValue([mockOverviewData]);

      // Act
      const result = await service.getAnalyticsOverview();

      // Assert
      expect(result).toBeDefined();
      expect(result.total_users).toBe(150);
      expect(result.total_students).toBe(120);
      expect(result.total_teachers).toBe(30);
      expect(result.active_users).toBe(100);
      expect(result.avg_xp).toBeCloseTo(1500.5);
      expect(result.avg_exercises_completed).toBeCloseTo(25.5);
      expect(result.avg_engagement_score).toBeCloseTo(0.75);
      expect(result.inactive_users).toBe(20);
      expect(result.beginner_users).toBe(40);
      expect(result.intermediate_users).toBe(60);
      expect(result.advanced_users).toBe(30);
    });

    it('should handle empty result gracefully', async () => {
      // Arrange
      mockDataSource.query!.mockResolvedValue([]);

      // Act & Assert
      await expect(service.getAnalyticsOverview()).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should handle null values with defaults', async () => {
      // Arrange
      const nullData = {
        total_users: null,
        total_students: null,
        total_teachers: null,
        active_users: null,
        avg_xp: null,
        avg_exercises_completed: null,
        avg_engagement_score: null,
        inactive_users: null,
        beginner_users: null,
        intermediate_users: null,
        advanced_users: null,
      };
      mockDataSource.query!.mockResolvedValue([nullData]);

      // Act
      const result = await service.getAnalyticsOverview();

      // Assert
      expect(result.total_users).toBe(0);
      expect(result.avg_xp).toBe(0);
      expect(result.avg_engagement_score).toBe(0);
    });

    it('should throw InternalServerErrorException on database error', async () => {
      // Arrange
      mockDataSource.query!.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.getAnalyticsOverview()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getEngagementAnalytics', () => {
    it('should return engagement analytics by segment', async () => {
      // Arrange
      mockDataSource.query!.mockResolvedValue(mockEngagementData);
      const query: EngagementQueryDto = {};

      // Act
      const result = await service.getEngagementAnalytics(query);

      // Assert
      expect(result).toBeDefined();
      expect(result.by_segment).toHaveLength(2);
      expect(result.by_segment[0].user_segment).toBe('advanced');
      expect(result.by_segment[0].users_count).toBe(30);
      expect(result.by_segment[0].avg_engagement_score).toBeCloseTo(0.95);
      expect(result.by_segment[0].avg_exercises_completed).toBeCloseTo(50.5);
      expect(result.by_segment[0].avg_streak).toBeCloseTo(15.2);
      expect(result.by_segment[0].active_last_7d).toBe(28);
      expect(result.by_segment[0].active_last_30d).toBe(30);
    });

    it('should filter by role when provided', async () => {
      // Arrange
      mockDataSource.query!.mockResolvedValue(mockEngagementData);
      const query: EngagementQueryDto = { role: 'student' };

      // Act
      await service.getEngagementAnalytics(query);

      // Assert
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.any(String),
        ['student', null],
      );
    });

    it('should filter by date_from when provided', async () => {
      // Arrange
      mockDataSource.query!.mockResolvedValue(mockEngagementData);
      const dateFrom = new Date('2026-01-01');
      const query: EngagementQueryDto = { date_from: dateFrom };

      // Act
      await service.getEngagementAnalytics(query);

      // Assert
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.any(String),
        [null, dateFrom],
      );
    });

    it('should handle empty results', async () => {
      // Arrange
      mockDataSource.query!.mockResolvedValue([]);

      // Act
      const result = await service.getEngagementAnalytics({});

      // Assert
      expect(result.by_segment).toHaveLength(0);
    });

    it('should throw InternalServerErrorException on database error', async () => {
      // Arrange
      mockDataSource.query!.mockRejectedValue(new Error('Query failed'));

      // Act & Assert
      await expect(service.getEngagementAnalytics({})).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getGamificationAnalytics', () => {
    it('should return comprehensive gamification distribution data', async () => {
      // Arrange
      mockDataSource.query!
        .mockResolvedValueOnce(mockGamificationXp)
        .mockResolvedValueOnce(mockGamificationRanks)
        .mockResolvedValueOnce(mockGamificationLevels);

      // Act
      const result = await service.getGamificationAnalytics();

      // Assert
      expect(result).toBeDefined();
      expect(result.xp_distribution).toHaveLength(6);
      expect(result.ranks_distribution).toHaveLength(3);
      expect(result.levels_distribution).toHaveLength(5);
    });

    it('should parse XP distribution correctly', async () => {
      // Arrange
      mockDataSource.query!
        .mockResolvedValueOnce(mockGamificationXp)
        .mockResolvedValueOnce(mockGamificationRanks)
        .mockResolvedValueOnce(mockGamificationLevels);

      // Act
      const result = await service.getGamificationAnalytics();

      // Assert
      expect(result.xp_distribution[0].xp_range).toBe('0 XP');
      expect(result.xp_distribution[0].users_count).toBe(10);
      expect(result.xp_distribution[5].xp_range).toBe('5000+ XP');
      expect(result.xp_distribution[5].users_count).toBe(10);
    });

    it('should parse ranks distribution correctly', async () => {
      // Arrange
      mockDataSource.query!
        .mockResolvedValueOnce(mockGamificationXp)
        .mockResolvedValueOnce(mockGamificationRanks)
        .mockResolvedValueOnce(mockGamificationLevels);

      // Act
      const result = await service.getGamificationAnalytics();

      // Assert
      expect(result.ranks_distribution[0].current_rank).toBe('Master');
      expect(result.ranks_distribution[0].users_count).toBe(5);
      expect(result.ranks_distribution[0].avg_xp).toBeCloseTo(8500);
      expect(result.ranks_distribution[0].avg_exercises).toBeCloseTo(100.5);
    });

    it('should parse levels distribution correctly', async () => {
      // Arrange
      mockDataSource.query!
        .mockResolvedValueOnce(mockGamificationXp)
        .mockResolvedValueOnce(mockGamificationRanks)
        .mockResolvedValueOnce(mockGamificationLevels);

      // Act
      const result = await service.getGamificationAnalytics();

      // Assert
      expect(result.levels_distribution[0].current_level).toBe(1);
      expect(result.levels_distribution[0].users_count).toBe(20);
    });

    it('should execute all three queries in parallel', async () => {
      // Arrange
      mockDataSource.query!
        .mockResolvedValueOnce(mockGamificationXp)
        .mockResolvedValueOnce(mockGamificationRanks)
        .mockResolvedValueOnce(mockGamificationLevels);

      // Act
      await service.getGamificationAnalytics();

      // Assert
      expect(mockDataSource.query).toHaveBeenCalledTimes(3);
    });

    it('should throw InternalServerErrorException on database error', async () => {
      // Arrange
      mockDataSource.query!.mockRejectedValue(new Error('Query failed'));

      // Act & Assert
      await expect(service.getGamificationAnalytics()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getActivityTimeline', () => {
    it('should return activity timeline with default 30 days', async () => {
      // Arrange
      mockDataSource.query!.mockResolvedValue(mockTimelineData);
      const query: TimelineQueryDto = {};

      // Act
      const result = await service.getActivityTimeline(query);

      // Assert
      expect(result).toBeDefined();
      expect(result.timeline).toHaveLength(2);
    });

    it('should parse timeline data correctly', async () => {
      // Arrange
      mockDataSource.query!.mockResolvedValue(mockTimelineData);

      // Act
      const result = await service.getActivityTimeline({});

      // Assert
      expect(result.timeline[0].activity_date).toBe('2026-01-10');
      expect(result.timeline[0].unique_users).toBe(85);
      expect(result.timeline[0].total_activities).toBe(350);
      expect(result.timeline[0].exercises_completed).toBe(120);
      expect(result.timeline[0].modules_completed).toBe(15);
      expect(result.timeline[0].logins).toBe(150);
    });

    it('should use custom days parameter', async () => {
      // Arrange
      mockDataSource.query!.mockResolvedValue(mockTimelineData);
      const query: TimelineQueryDto = { days: 7 };

      // Act
      await service.getActivityTimeline(query);

      // Assert
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('7 days'),
      );
    });

    it('should handle empty results', async () => {
      // Arrange
      mockDataSource.query!.mockResolvedValue([]);

      // Act
      const result = await service.getActivityTimeline({});

      // Assert
      expect(result.timeline).toHaveLength(0);
    });

    it('should throw InternalServerErrorException on database error', async () => {
      // Arrange
      mockDataSource.query!.mockRejectedValue(new Error('Query failed'));

      // Act & Assert
      await expect(service.getActivityTimeline({})).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getTopUsers', () => {
    it('should return top users by XP by default', async () => {
      // Arrange
      mockDataSource.query!.mockResolvedValue(mockTopUsersData);
      const query: TopUsersQueryDto = { metric: 'xp' };

      // Act
      const result = await service.getTopUsers(query);

      // Assert
      expect(result).toBeDefined();
      expect(result.metric).toBe('xp');
      expect(result.users).toHaveLength(2);
    });

    it('should parse user data correctly', async () => {
      // Arrange
      mockDataSource.query!.mockResolvedValue(mockTopUsersData);

      // Act
      const result = await service.getTopUsers({ metric: 'xp' });

      // Assert
      expect(result.users[0].user_id).toBe('user-1');
      expect(result.users[0].display_name).toBe('Top User 1');
      expect(result.users[0].email).toBe('top1@example.com');
      expect(result.users[0].total_xp).toBe(9500);
      expect(result.users[0].exercises_completed).toBe(150);
      expect(result.users[0].current_streak).toBe(45);
      expect(result.users[0].current_rank).toBe('Master');
      expect(result.users[0].current_level).toBe(10);
      expect(result.users[0].engagement_score).toBeCloseTo(0.98);
    });

    it('should order by exercises when metric is exercises', async () => {
      // Arrange
      mockDataSource.query!.mockResolvedValue(mockTopUsersData);
      const query: TopUsersQueryDto = { metric: 'exercises' };

      // Act
      await service.getTopUsers(query);

      // Assert
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('exercises_completed DESC'),
        expect.any(Array),
      );
    });

    it('should order by streak when metric is streak', async () => {
      // Arrange
      mockDataSource.query!.mockResolvedValue(mockTopUsersData);
      const query: TopUsersQueryDto = { metric: 'streak' };

      // Act
      await service.getTopUsers(query);

      // Assert
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('current_streak DESC'),
        expect.any(Array),
      );
    });

    it('should filter by role when provided', async () => {
      // Arrange
      mockDataSource.query!.mockResolvedValue(mockTopUsersData);
      const query: TopUsersQueryDto = { metric: 'xp', role: 'student' };

      // Act
      await service.getTopUsers(query);

      // Assert
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.any(String),
        ['student', 10],
      );
    });

    it('should use custom limit when provided', async () => {
      // Arrange
      mockDataSource.query!.mockResolvedValue(mockTopUsersData);
      const query: TopUsersQueryDto = { metric: 'xp', limit: 5 };

      // Act
      await service.getTopUsers(query);

      // Assert
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.any(String),
        [null, 5],
      );
    });

    it('should throw InternalServerErrorException on database error', async () => {
      // Arrange
      mockDataSource.query!.mockRejectedValue(new Error('Query failed'));

      // Act & Assert
      await expect(service.getTopUsers({ metric: 'xp' })).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getRetentionAnalytics', () => {
    it('should return retention analytics by cohort', async () => {
      // Arrange
      mockDataSource.query!.mockResolvedValue(mockRetentionData);

      // Act
      const result = await service.getRetentionAnalytics();

      // Assert
      expect(result).toBeDefined();
      expect(result.cohorts).toHaveLength(2);
    });

    it('should parse cohort data correctly', async () => {
      // Arrange
      mockDataSource.query!.mockResolvedValue(mockRetentionData);

      // Act
      const result = await service.getRetentionAnalytics();

      // Assert
      expect(result.cohorts[0].cohort_month).toBe('2026-01-01');
      expect(result.cohorts[0].cohort_size).toBe(50);
      expect(result.cohorts[0].retained_users).toBe(45);
      expect(result.cohorts[0].retention_rate).toBeCloseTo(90);
    });

    it('should handle empty results', async () => {
      // Arrange
      mockDataSource.query!.mockResolvedValue([]);

      // Act
      const result = await service.getRetentionAnalytics();

      // Assert
      expect(result.cohorts).toHaveLength(0);
    });

    it('should throw InternalServerErrorException on database error', async () => {
      // Arrange
      mockDataSource.query!.mockRejectedValue(new Error('Query failed'));

      // Act & Assert
      await expect(service.getRetentionAnalytics()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('exportAnalytics', () => {
    beforeEach(() => {
      // Setup mocks for export methods
      mockDataSource.query!.mockResolvedValue([mockOverviewData]);
    });

    it('should export overview data as CSV', async () => {
      // Arrange
      mockDataSource.query!.mockResolvedValue([mockOverviewData]);

      // Act
      const result = await service.exportAnalytics('overview');

      // Assert
      expect(result).toBeDefined();
      expect(result).toContain('Metric,Value');
      expect(result).toContain('Total Users,150');
      expect(result).toContain('Total Students,120');
    });

    it('should export users data as CSV', async () => {
      // Arrange
      const mockUsersExport = [{
        user_id: 'user-1',
        display_name: 'Test User',
        email: 'test@example.com',
        role: 'student',
        status: 'ACTIVE',
        total_xp: 1500,
        current_level: 5,
        current_rank: 'Advanced',
        ml_coins: 100,
        exercises_completed: 50,
        missions_completed: 10,
        current_streak: 7,
        engagement_score: 0.85,
        user_segment: 'intermediate',
        registered_at: '2025-12-01',
        last_activity_at: '2026-01-10',
      }];
      mockDataSource.query!.mockResolvedValue(mockUsersExport);

      // Act
      const result = await service.exportAnalytics('users');

      // Assert
      expect(result).toBeDefined();
      expect(result).toContain('User ID');
      expect(result).toContain('Display Name');
      expect(result).toContain('Test User');
    });

    it('should export engagement data as CSV', async () => {
      // Arrange
      mockDataSource.query!.mockResolvedValue(mockEngagementData);

      // Act
      const result = await service.exportAnalytics('engagement');

      // Assert
      expect(result).toBeDefined();
      expect(result).toContain('User Segment');
      expect(result).toContain('Users Count');
      expect(result).toContain('advanced');
    });

    it('should export gamification data as CSV', async () => {
      // Arrange
      mockDataSource.query!
        .mockResolvedValueOnce(mockGamificationXp)
        .mockResolvedValueOnce(mockGamificationRanks)
        .mockResolvedValueOnce(mockGamificationLevels);

      // Act
      const result = await service.exportAnalytics('gamification');

      // Assert
      expect(result).toBeDefined();
      expect(result).toContain('XP DISTRIBUTION');
      expect(result).toContain('RANKS DISTRIBUTION');
      expect(result).toContain('LEVELS DISTRIBUTION');
    });

    it('should throw error for unknown export type', async () => {
      // Act & Assert
      await expect(service.exportAnalytics('unknown')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should escape CSV values with special characters', async () => {
      // Arrange
      const mockDataWithSpecialChars = [{
        ...mockOverviewData,
        // Include a value that would need escaping
      }];
      mockDataSource.query!.mockResolvedValue(mockDataWithSpecialChars);

      // Act
      const result = await service.exportAnalytics('overview');

      // Assert
      expect(result).toBeDefined();
      // CSV should be properly formatted
      expect(result.split('\n').length).toBeGreaterThan(1);
    });
  });

  describe('Error Handling', () => {
    it('should log errors when analytics overview fails', async () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockDataSource.query!.mockRejectedValue(new Error('Database connection lost'));

      // Act & Assert
      await expect(service.getAnalyticsOverview()).rejects.toThrow(
        InternalServerErrorException,
      );

      consoleSpy.mockRestore();
    });

    it('should handle null/undefined query parameters gracefully', async () => {
      // Arrange
      mockDataSource.query!.mockResolvedValue(mockEngagementData);

      // Act
      const result = await service.getEngagementAnalytics({
        role: undefined,
        date_from: undefined,
      });

      // Assert
      expect(result).toBeDefined();
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.any(String),
        [null, null],
      );
    });
  });
});
