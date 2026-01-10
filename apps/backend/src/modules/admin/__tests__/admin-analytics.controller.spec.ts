import { Test, TestingModule } from '@nestjs/testing';
import { AdminAnalyticsController } from '../controllers/admin-analytics.controller';
import { AdminAnalyticsService } from '../services/admin-analytics.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { Response } from 'express';
import {
  AnalyticsOverviewDto,
  EngagementAnalyticsDto,
  GamificationAnalyticsDto,
  ActivityTimelineDto,
  TopUsersDto,
  RetentionAnalyticsDto,
} from '../dto/analytics';

describe('AdminAnalyticsController', () => {
  let controller: AdminAnalyticsController;
  let analyticsService: jest.Mocked<AdminAnalyticsService>;

  const mockOverviewData: AnalyticsOverviewDto = {
    total_users: 150,
    total_students: 120,
    total_teachers: 30,
    active_users: 100,
    avg_xp: 1500.5,
    avg_exercises_completed: 25.5,
    avg_engagement_score: 0.75,
    inactive_users: 20,
    beginner_users: 40,
    intermediate_users: 60,
    advanced_users: 30,
  };

  const mockEngagementData: EngagementAnalyticsDto = {
    by_segment: [
      {
        user_segment: 'advanced',
        users_count: 30,
        avg_engagement_score: 0.95,
        avg_exercises_completed: 50.5,
        avg_streak: 15.2,
        active_last_7d: 28,
        active_last_30d: 30,
      },
      {
        user_segment: 'intermediate',
        users_count: 60,
        avg_engagement_score: 0.65,
        avg_exercises_completed: 25.3,
        avg_streak: 7.5,
        active_last_7d: 45,
        active_last_30d: 55,
      },
    ],
  };

  const mockGamificationData: GamificationAnalyticsDto = {
    xp_distribution: [
      { xp_range: '0 XP', users_count: 10 },
      { xp_range: '1-100 XP', users_count: 25 },
    ],
    ranks_distribution: [
      { current_rank: 'Master', users_count: 5, avg_xp: 8500, avg_exercises: 100.5 },
    ],
    levels_distribution: [
      { current_level: 1, users_count: 20 },
      { current_level: 2, users_count: 35 },
    ],
  };

  const mockTimelineData: ActivityTimelineDto = {
    timeline: [
      {
        activity_date: '2026-01-10',
        unique_users: 85,
        total_activities: 350,
        exercises_completed: 120,
        modules_completed: 15,
        logins: 150,
      },
    ],
  };

  const mockTopUsersData: TopUsersDto = {
    metric: 'xp',
    users: [
      {
        user_id: 'user-1',
        display_name: 'Top User 1',
        email: 'top1@example.com',
        role: 'student',
        total_xp: 9500,
        exercises_completed: 150,
        current_streak: 45,
        current_rank: 'Master',
        current_level: 10,
        engagement_score: 0.98,
      },
    ],
  };

  const mockRetentionData: RetentionAnalyticsDto = {
    cohorts: [
      {
        cohort_month: '2026-01-01',
        cohort_size: 50,
        retained_users: 45,
        retention_rate: 90,
      },
    ],
  };

  beforeEach(async () => {
    const mockAnalyticsService = {
      getAnalyticsOverview: jest.fn(),
      getEngagementAnalytics: jest.fn(),
      getGamificationAnalytics: jest.fn(),
      getActivityTimeline: jest.fn(),
      getTopUsers: jest.fn(),
      getRetentionAnalytics: jest.fn(),
      exportAnalytics: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminAnalyticsController],
      providers: [
        {
          provide: AdminAnalyticsService,
          useValue: mockAnalyticsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AdminAnalyticsController>(AdminAnalyticsController);
    analyticsService = module.get(AdminAnalyticsService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getAnalyticsOverview', () => {
    it('should return analytics overview', async () => {
      // Arrange
      analyticsService.getAnalyticsOverview.mockResolvedValue(mockOverviewData);

      // Act
      const result = await controller.getAnalyticsOverview();

      // Assert
      expect(result).toEqual(mockOverviewData);
      expect(analyticsService.getAnalyticsOverview).toHaveBeenCalledTimes(1);
    });

    it('should propagate service errors', async () => {
      // Arrange
      analyticsService.getAnalyticsOverview.mockRejectedValue(
        new Error('Service error'),
      );

      // Act & Assert
      await expect(controller.getAnalyticsOverview()).rejects.toThrow('Service error');
    });
  });

  describe('getEngagementAnalytics', () => {
    it('should return engagement analytics with empty query', async () => {
      // Arrange
      analyticsService.getEngagementAnalytics.mockResolvedValue(mockEngagementData);

      // Act
      const result = await controller.getEngagementAnalytics({});

      // Assert
      expect(result).toEqual(mockEngagementData);
      expect(analyticsService.getEngagementAnalytics).toHaveBeenCalledWith({});
    });

    it('should pass role filter to service', async () => {
      // Arrange
      analyticsService.getEngagementAnalytics.mockResolvedValue(mockEngagementData);
      const query = { role: 'student' };

      // Act
      await controller.getEngagementAnalytics(query);

      // Assert
      expect(analyticsService.getEngagementAnalytics).toHaveBeenCalledWith(query);
    });

    it('should pass date_from filter to service', async () => {
      // Arrange
      analyticsService.getEngagementAnalytics.mockResolvedValue(mockEngagementData);
      const dateFrom = new Date('2026-01-01');
      const query = { date_from: dateFrom };

      // Act
      await controller.getEngagementAnalytics(query);

      // Assert
      expect(analyticsService.getEngagementAnalytics).toHaveBeenCalledWith(query);
    });
  });

  describe('getGamificationAnalytics', () => {
    it('should return gamification analytics', async () => {
      // Arrange
      analyticsService.getGamificationAnalytics.mockResolvedValue(mockGamificationData);

      // Act
      const result = await controller.getGamificationAnalytics();

      // Assert
      expect(result).toEqual(mockGamificationData);
      expect(analyticsService.getGamificationAnalytics).toHaveBeenCalledTimes(1);
    });
  });

  describe('getActivityTimeline', () => {
    it('should return activity timeline with default days', async () => {
      // Arrange
      analyticsService.getActivityTimeline.mockResolvedValue(mockTimelineData);

      // Act
      const result = await controller.getActivityTimeline({});

      // Assert
      expect(result).toEqual(mockTimelineData);
      expect(analyticsService.getActivityTimeline).toHaveBeenCalledWith({});
    });

    it('should pass custom days parameter', async () => {
      // Arrange
      analyticsService.getActivityTimeline.mockResolvedValue(mockTimelineData);
      const query = { days: 7 };

      // Act
      await controller.getActivityTimeline(query);

      // Assert
      expect(analyticsService.getActivityTimeline).toHaveBeenCalledWith(query);
    });
  });

  describe('getTopUsers', () => {
    it('should return top users by XP', async () => {
      // Arrange
      analyticsService.getTopUsers.mockResolvedValue(mockTopUsersData);
      const query = { metric: 'xp' as const };

      // Act
      const result = await controller.getTopUsers(query);

      // Assert
      expect(result).toEqual(mockTopUsersData);
      expect(analyticsService.getTopUsers).toHaveBeenCalledWith(query);
    });

    it('should pass role and limit filters', async () => {
      // Arrange
      analyticsService.getTopUsers.mockResolvedValue(mockTopUsersData);
      const query = { metric: 'exercises' as const, role: 'student', limit: 5 };

      // Act
      await controller.getTopUsers(query);

      // Assert
      expect(analyticsService.getTopUsers).toHaveBeenCalledWith(query);
    });
  });

  describe('getRetentionAnalytics', () => {
    it('should return retention analytics', async () => {
      // Arrange
      analyticsService.getRetentionAnalytics.mockResolvedValue(mockRetentionData);

      // Act
      const result = await controller.getRetentionAnalytics();

      // Assert
      expect(result).toEqual(mockRetentionData);
      expect(analyticsService.getRetentionAnalytics).toHaveBeenCalledTimes(1);
    });
  });

  describe('exportAnalytics', () => {
    let mockResponse: Partial<Response>;

    beforeEach(() => {
      mockResponse = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };
    });

    it('should export overview data as CSV', async () => {
      // Arrange
      const csvData = 'Metric,Value\nTotal Users,150';
      analyticsService.exportAnalytics.mockResolvedValue(csvData);
      const query = { type: 'overview' as const };

      // Act
      await controller.exportAnalytics(query, mockResponse as Response);

      // Assert
      expect(analyticsService.exportAnalytics).toHaveBeenCalledWith('overview');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('analytics-overview'),
      );
      expect(mockResponse.send).toHaveBeenCalledWith(csvData);
    });

    it('should export users data as CSV', async () => {
      // Arrange
      const csvData = 'User ID,Name\nuser-1,Test User';
      analyticsService.exportAnalytics.mockResolvedValue(csvData);
      const query = { type: 'users' as const };

      // Act
      await controller.exportAnalytics(query, mockResponse as Response);

      // Assert
      expect(analyticsService.exportAnalytics).toHaveBeenCalledWith('users');
    });

    it('should export engagement data as CSV', async () => {
      // Arrange
      const csvData = 'Segment,Count\nadvanced,30';
      analyticsService.exportAnalytics.mockResolvedValue(csvData);
      const query = { type: 'engagement' as const };

      // Act
      await controller.exportAnalytics(query, mockResponse as Response);

      // Assert
      expect(analyticsService.exportAnalytics).toHaveBeenCalledWith('engagement');
    });

    it('should export gamification data as CSV', async () => {
      // Arrange
      const csvData = 'XP Range,Count\n0 XP,10';
      analyticsService.exportAnalytics.mockResolvedValue(csvData);
      const query = { type: 'gamification' as const };

      // Act
      await controller.exportAnalytics(query, mockResponse as Response);

      // Assert
      expect(analyticsService.exportAnalytics).toHaveBeenCalledWith('gamification');
    });

    it('should set correct headers for CSV download', async () => {
      // Arrange
      analyticsService.exportAnalytics.mockResolvedValue('csv data');
      const query = { type: 'overview' as const };

      // Act
      await controller.exportAnalytics(query, mockResponse as Response);

      // Assert
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringMatching(/attachment; filename="analytics-overview-\d{4}-\d{2}-\d{2}\.csv"/),
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Pragma', 'no-cache');
    });

    it('should propagate service errors', async () => {
      // Arrange
      analyticsService.exportAnalytics.mockRejectedValue(new Error('Export failed'));
      const query = { type: 'overview' as const };

      // Act & Assert
      await expect(
        controller.exportAnalytics(query, mockResponse as Response),
      ).rejects.toThrow('Export failed');
    });
  });

  describe('Guards', () => {
    it('should have JwtAuthGuard and AdminGuard applied', () => {
      // This test verifies the controller is decorated with guards
      // The actual guard logic is tested separately
      const guards = Reflect.getMetadata('__guards__', AdminAnalyticsController);
      expect(guards).toBeDefined();
      expect(guards.length).toBe(2);
    });
  });
});
