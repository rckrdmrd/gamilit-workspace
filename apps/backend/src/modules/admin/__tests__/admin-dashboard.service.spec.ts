import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AdminDashboardService } from '../services/admin-dashboard.service';
import { DashboardStatsService } from '../services/statistics/dashboard-stats.service';
import { UserStatsService } from '../services/statistics/user-stats.service';
import { ContentStatsService } from '../services/statistics/content-stats.service';
import { RecentActivityService } from '../services/activity/recent-activity.service';
import { AdminQueryBuilder } from '../services/query-builders/admin.query-builder';
import { User } from '@modules/auth/entities/user.entity';
import {
  DashboardStatsDto,
  UserStatsSummaryDto,
  OrganizationStatsSummaryDto,
  RecentActionDto,
  AlertDto,
} from '../dto/dashboard';

describe('AdminDashboardService', () => {
  let service: AdminDashboardService;
  let dashboardStatsService: jest.Mocked<DashboardStatsService>;
  let userStatsService: jest.Mocked<UserStatsService>;
  let contentStatsService: jest.Mocked<ContentStatsService>;
  let recentActivityService: jest.Mocked<RecentActivityService>;
  let queryBuilder: jest.Mocked<AdminQueryBuilder>;

  const mockDashboardStats: DashboardStatsDto = {
    totalUsers: 150,
    activeUsers: 120,
    newUsers24h: 5,
    totalModules: 10,
    totalExercises: 200,
    exercisesCompleted24h: 50,
    totalOrganizations: 3,
    activeClassrooms: 15,
    avgEngagementScore: 0.75,
    avgSessionDuration: 1800,
  };

  const mockUserStatsSummary: UserStatsSummaryDto = {
    total_users: 150,
    active_users: 120,
    inactive_users: 30,
    students: 100,
    teachers: 40,
    admins: 10,
    new_users_7d: 15,
    new_users_30d: 45,
    avg_exercises_completed: 25.5,
    avg_xp: 1500,
    top_level: 10,
    avg_engagement_score: 0.75,
  };

  const mockOrganizationStats: OrganizationStatsSummaryDto = {
    total_organizations: 5,
    active_organizations: 4,
    total_classrooms: 20,
    active_classrooms: 18,
    total_assignments: 50,
    pending_assignments: 10,
    completed_assignments: 40,
    avg_submission_rate: 0.85,
  };

  const mockRecentActions: RecentActionDto[] = [
    {
      id: 'action-1',
      action_type: 'user_created',
      description: 'New user registered',
      performed_by: 'system',
      performed_at: new Date().toISOString(),
    },
    {
      id: 'action-2',
      action_type: 'classroom_created',
      description: 'New classroom created',
      performed_by: 'admin-1',
      performed_at: new Date().toISOString(),
    },
  ];

  const mockAlerts: AlertDto[] = [
    {
      id: 'alert-1',
      type: 'warning',
      title: 'High failed logins',
      message: '15 failed login attempts in last hour',
      created_at: new Date().toISOString(),
    },
  ];

  beforeEach(async () => {
    const mockDashboardStatsService = {
      getDashboardStats: jest.fn(),
    };

    const mockUserStatsService = {
      getUserStatsSummary: jest.fn(),
    };

    const mockContentStatsService = {
      getOrganizationStatsSummary: jest.fn(),
    };

    const mockRecentActivityService = {
      getRecentActivity: jest.fn(),
      getRecentActivityInternal: jest.fn(),
      getRecentActions: jest.fn(),
    };

    const mockQueryBuilder = {
      getModerationQueue: jest.fn(),
      getClassroomOverview: jest.fn(),
      getAssignmentSubmissionStats: jest.fn(),
    };

    const mockDataSource = {
      query: jest.fn(),
    };

    const mockUserRepo = {
      count: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminDashboardService,
        {
          provide: getDataSourceToken('auth'),
          useValue: mockDataSource,
        },
        {
          provide: getRepositoryToken(User, 'auth'),
          useValue: mockUserRepo,
        },
        {
          provide: DashboardStatsService,
          useValue: mockDashboardStatsService,
        },
        {
          provide: UserStatsService,
          useValue: mockUserStatsService,
        },
        {
          provide: ContentStatsService,
          useValue: mockContentStatsService,
        },
        {
          provide: RecentActivityService,
          useValue: mockRecentActivityService,
        },
        {
          provide: AdminQueryBuilder,
          useValue: mockQueryBuilder,
        },
      ],
    }).compile();

    service = module.get<AdminDashboardService>(AdminDashboardService);
    dashboardStatsService = module.get(DashboardStatsService);
    userStatsService = module.get(UserStatsService);
    contentStatsService = module.get(ContentStatsService);
    recentActivityService = module.get(RecentActivityService);
    queryBuilder = module.get(AdminQueryBuilder);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getDashboard', () => {
    it('should return complete dashboard data', async () => {
      // Arrange
      dashboardStatsService.getDashboardStats.mockResolvedValue(mockDashboardStats);
      recentActivityService.getRecentActivityInternal.mockResolvedValue([]);

      // Act
      const result = await service.getDashboard();

      // Assert
      expect(result).toBeDefined();
      expect(result.stats).toEqual(mockDashboardStats);
      expect(result.recentActivity).toEqual([]);
      expect(result.timestamp).toBeDefined();
    });

    it('should call both stats and activity services in parallel', async () => {
      // Arrange
      dashboardStatsService.getDashboardStats.mockResolvedValue(mockDashboardStats);
      recentActivityService.getRecentActivityInternal.mockResolvedValue([]);

      // Act
      await service.getDashboard();

      // Assert
      expect(dashboardStatsService.getDashboardStats).toHaveBeenCalledTimes(1);
      expect(recentActivityService.getRecentActivityInternal).toHaveBeenCalledWith(10);
    });
  });

  describe('getDashboardStats', () => {
    it('should delegate to DashboardStatsService', async () => {
      // Arrange
      dashboardStatsService.getDashboardStats.mockResolvedValue(mockDashboardStats);

      // Act
      const result = await service.getDashboardStats();

      // Assert
      expect(result).toEqual(mockDashboardStats);
      expect(dashboardStatsService.getDashboardStats).toHaveBeenCalledTimes(1);
    });
  });

  describe('getRecentActivity', () => {
    it('should delegate to RecentActivityService', async () => {
      // Arrange
      const mockPaginatedActivity = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        total_pages: 0,
      };
      recentActivityService.getRecentActivity.mockResolvedValue(mockPaginatedActivity);

      // Act
      const result = await service.getRecentActivity({ page: 1, limit: 10 });

      // Assert
      expect(result).toEqual(mockPaginatedActivity);
      expect(recentActivityService.getRecentActivity).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });
  });

  describe('getUserStatsSummary', () => {
    it('should delegate to UserStatsService', async () => {
      // Arrange
      userStatsService.getUserStatsSummary.mockResolvedValue(mockUserStatsSummary);

      // Act
      const result = await service.getUserStatsSummary();

      // Assert
      expect(result).toEqual(mockUserStatsSummary);
      expect(userStatsService.getUserStatsSummary).toHaveBeenCalledTimes(1);
    });
  });

  describe('getOrganizationStatsSummary', () => {
    it('should delegate to ContentStatsService', async () => {
      // Arrange
      contentStatsService.getOrganizationStatsSummary.mockResolvedValue(mockOrganizationStats);

      // Act
      const result = await service.getOrganizationStatsSummary();

      // Assert
      expect(result).toEqual(mockOrganizationStats);
      expect(contentStatsService.getOrganizationStatsSummary).toHaveBeenCalledTimes(1);
    });
  });

  describe('getModerationQueue', () => {
    it('should delegate to AdminQueryBuilder with default limit', async () => {
      // Arrange
      const mockQueue = { data: [], total: 0, page: 1, limit: 50, total_pages: 0 };
      queryBuilder.getModerationQueue.mockResolvedValue(mockQueue);

      // Act
      const result = await service.getModerationQueue();

      // Assert
      expect(result).toEqual(mockQueue);
      expect(queryBuilder.getModerationQueue).toHaveBeenCalledWith(50);
    });

    it('should pass custom limit to AdminQueryBuilder', async () => {
      // Arrange
      const mockQueue = { data: [], total: 0, page: 1, limit: 20, total_pages: 0 };
      queryBuilder.getModerationQueue.mockResolvedValue(mockQueue);

      // Act
      await service.getModerationQueue(20);

      // Assert
      expect(queryBuilder.getModerationQueue).toHaveBeenCalledWith(20);
    });
  });

  describe('getClassroomOverview', () => {
    it('should delegate to AdminQueryBuilder with default limit', async () => {
      // Arrange
      const mockOverview = { data: [], total: 0, page: 1, limit: 100, total_pages: 0 };
      queryBuilder.getClassroomOverview.mockResolvedValue(mockOverview);

      // Act
      const result = await service.getClassroomOverview();

      // Assert
      expect(result).toEqual(mockOverview);
      expect(queryBuilder.getClassroomOverview).toHaveBeenCalledWith(100);
    });
  });

  describe('getAssignmentSubmissionStats', () => {
    it('should delegate to AdminQueryBuilder with default limit', async () => {
      // Arrange
      const mockStats = { data: [], total: 0, page: 1, limit: 100, total_pages: 0 };
      queryBuilder.getAssignmentSubmissionStats.mockResolvedValue(mockStats);

      // Act
      const result = await service.getAssignmentSubmissionStats();

      // Assert
      expect(result).toEqual(mockStats);
      expect(queryBuilder.getAssignmentSubmissionStats).toHaveBeenCalledWith(100);
    });
  });

  describe('getRecentActions', () => {
    it('should delegate to RecentActivityService with default limit', async () => {
      // Arrange
      recentActivityService.getRecentActions.mockResolvedValue(mockRecentActions);

      // Act
      const result = await service.getRecentActions();

      // Assert
      expect(result).toEqual(mockRecentActions);
      expect(recentActivityService.getRecentActions).toHaveBeenCalledWith(10);
    });

    it('should pass custom limit to RecentActivityService', async () => {
      // Arrange
      recentActivityService.getRecentActions.mockResolvedValue(mockRecentActions);

      // Act
      await service.getRecentActions(25);

      // Assert
      expect(recentActivityService.getRecentActions).toHaveBeenCalledWith(25);
    });
  });

  describe('Error Handling', () => {
    it('should propagate errors from DashboardStatsService', async () => {
      // Arrange
      dashboardStatsService.getDashboardStats.mockRejectedValue(
        new Error('Stats service error'),
      );

      // Act & Assert
      await expect(service.getDashboardStats()).rejects.toThrow('Stats service error');
    });

    it('should propagate errors from UserStatsService', async () => {
      // Arrange
      userStatsService.getUserStatsSummary.mockRejectedValue(
        new Error('User stats error'),
      );

      // Act & Assert
      await expect(service.getUserStatsSummary()).rejects.toThrow('User stats error');
    });

    it('should propagate errors from ContentStatsService', async () => {
      // Arrange
      contentStatsService.getOrganizationStatsSummary.mockRejectedValue(
        new Error('Content stats error'),
      );

      // Act & Assert
      await expect(service.getOrganizationStatsSummary()).rejects.toThrow('Content stats error');
    });
  });
});
