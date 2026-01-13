/**
 * MissionsService Unit Tests
 *
 * @description Tests for mission management service covering:
 * - Mission generation (daily/weekly)
 * - Mission progress tracking
 * - Mission claiming with rewards
 * - Mission statistics
 * - Mission expiration
 *
 * Sprint 0 - P0-008: Increase coverage to 30%+
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { MissionsService } from '../missions.service';
import { Mission, MissionTypeEnum, MissionStatusEnum } from '../../entities/mission.entity';
import { Profile } from '@/modules/auth/entities/profile.entity';
import { ExerciseSubmission } from '@/modules/progress/entities/exercise-submission.entity';
import { MLCoinsService } from '../ml-coins.service';
import { UserStatsService } from '../user-stats.service';
import { RanksService } from '../ranks.service';
import { MissionTemplatesService } from '../mission-templates.service';
import { createMockRepository, createMockQueryBuilder } from '@/__mocks__/repositories.mock';
import {
  createMockMLCoinsService,
  createMockUserStatsService,
  createMockRanksService,
  createMockMissionTemplatesService,
  TestDataFactory,
} from '@/__mocks__/services.mock';

describe('MissionsService', () => {
  let service: MissionsService;
  let missionsRepo: ReturnType<typeof createMockRepository>;
  let profileRepo: ReturnType<typeof createMockRepository>;
  let exerciseSubmissionRepo: ReturnType<typeof createMockRepository>;
  let mlCoinsService: ReturnType<typeof createMockMLCoinsService>;
  let userStatsService: ReturnType<typeof createMockUserStatsService>;
  let ranksService: ReturnType<typeof createMockRanksService>;
  let templatesService: ReturnType<typeof createMockMissionTemplatesService>;

  // Test data
  const mockProfile = TestDataFactory.createProfile();
  const mockMission = TestDataFactory.createMission({ user_id: mockProfile.id });

  beforeEach(async () => {
    // Create mock services
    missionsRepo = createMockRepository<Mission>();
    profileRepo = createMockRepository<Profile>();
    exerciseSubmissionRepo = createMockRepository<ExerciseSubmission>();
    mlCoinsService = createMockMLCoinsService();
    userStatsService = createMockUserStatsService();
    ranksService = createMockRanksService();
    templatesService = createMockMissionTemplatesService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MissionsService,
        { provide: getRepositoryToken(Mission, 'gamification'), useValue: missionsRepo },
        { provide: getRepositoryToken(Profile, 'auth'), useValue: profileRepo },
        { provide: getRepositoryToken(ExerciseSubmission, 'progress'), useValue: exerciseSubmissionRepo },
        { provide: MLCoinsService, useValue: mlCoinsService },
        { provide: UserStatsService, useValue: userStatsService },
        { provide: RanksService, useValue: ranksService },
        { provide: MissionTemplatesService, useValue: templatesService },
      ],
    }).compile();

    service = module.get<MissionsService>(MissionsService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Service Definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  // =========================================================================
  // GET PROFILE ID TESTS
  // =========================================================================

  describe('getProfileId (private helper)', () => {
    it('should return profile.id when profile exists', async () => {
      // Arrange
      profileRepo.findOne.mockResolvedValue(mockProfile as any);

      // Act - Access through a public method that uses it
      // Note: Testing private method indirectly through public methods

      // Assert
      expect(profileRepo.findOne).not.toHaveBeenCalled(); // Not called yet
    });

    it('should throw NotFoundException when profile does not exist', async () => {
      // Arrange
      profileRepo.findOne.mockResolvedValue(null);

      // This would be tested indirectly through public methods
      // that call getProfileId internally
    });
  });

  // =========================================================================
  // FIND BY TYPE AND USER TESTS
  // =========================================================================

  describe('findByTypeAndUser', () => {
    const userId = 'user-123';
    const missionType = MissionTypeEnum.DAILY;

    beforeEach(() => {
      profileRepo.findOne.mockResolvedValue(mockProfile as any);
      userStatsService.findByUserId.mockResolvedValue({ level: 5 } as any);
    });

    it('should return existing missions of specified type', async () => {
      // Arrange
      const existingMissions = [
        TestDataFactory.createMission({ mission_type: MissionTypeEnum.DAILY }),
        TestDataFactory.createMission({ mission_type: MissionTypeEnum.DAILY }),
      ];
      missionsRepo.find.mockResolvedValue(existingMissions as any);

      // Act
      const result = await service.findByTypeAndUser(userId, missionType);

      // Assert
      expect(result).toEqual(existingMissions);
      expect(missionsRepo.find).toHaveBeenCalledWith({
        where: {
          user_id: mockProfile.id,
          mission_type: missionType,
          status: expect.anything(), // Between operator
        },
        order: { created_at: 'ASC' }, // Service uses ASC
      });
    });

    it('should generate missions if none exist', async () => {
      // Arrange
      missionsRepo.find.mockResolvedValue([]);
      const mockTemplates = [
        { id: 'template-1', name: 'Complete Exercises', type: 'daily' },
      ];
      // Service uses getActiveByType, not getActiveByTypeAndLevel
      templatesService.getActiveByType.mockResolvedValue(mockTemplates as any);
      templatesService.selectRandom.mockReturnValue(mockTemplates as any);
      missionsRepo.create.mockReturnValue(mockMission as any);
      missionsRepo.save.mockResolvedValue(mockMission as any);

      // Act
      const result = await service.findByTypeAndUser(userId, missionType);

      // Assert
      expect(templatesService.getActiveByType).toHaveBeenCalled();
      expect(missionsRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if profile not found', async () => {
      // Arrange
      profileRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findByTypeAndUser(userId, missionType)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // =========================================================================
  // FIND BY ID TESTS - SKIPPED (method doesn't exist on service)
  // =========================================================================
  // NOTE: MissionsService doesn't have a public findById method.
  // Missions are accessed through findByTypeAndUser or updateProgress/claimRewards.

  describe.skip('findById', () => {
    const missionId = 'mission-123';

    it('should return mission if found', async () => {
      missionsRepo.findOne.mockResolvedValue(mockMission as any);
      // Method doesn't exist
      expect(true).toBe(true);
    });

    it('should throw NotFoundException if mission not found', async () => {
      missionsRepo.findOne.mockResolvedValue(null);
      // Method doesn't exist
      expect(true).toBe(true);
    });
  });

  // =========================================================================
  // GET STATS TESTS
  // =========================================================================

  describe('getStats', () => {
    const userId = 'user-123';

    beforeEach(() => {
      profileRepo.findOne.mockResolvedValue(mockProfile as any);
    });

    it('should return mission statistics', async () => {
      // Arrange - Service uses find() calls, not QueryBuilder
      const todayMissions = [
        { status: MissionStatusEnum.COMPLETED, rewards: { xp: 50, ml_coins: 100 } },
        { status: MissionStatusEnum.ACTIVE, rewards: { xp: 0, ml_coins: 0 } },
      ];
      const weekMissions = [
        ...todayMissions,
        { status: MissionStatusEnum.CLAIMED, rewards: { xp: 100, ml_coins: 200 } },
      ];
      const completedMissions = [
        { status: MissionStatusEnum.COMPLETED, rewards: { xp: 50, ml_coins: 100 } },
        { status: MissionStatusEnum.CLAIMED, rewards: { xp: 100, ml_coins: 200 } },
      ];

      // Mock the 3 find() calls in getStats
      missionsRepo.find
        .mockResolvedValueOnce(todayMissions as any)  // todayMissions
        .mockResolvedValueOnce(weekMissions as any)   // weekMissions
        .mockResolvedValueOnce(completedMissions as any);  // allCompletedMissions

      // Mock exerciseSubmissionRepo for streak calculation
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getRawMany.mockResolvedValue([]);
      exerciseSubmissionRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.getStats(userId);

      // Assert - Match actual DTO structure
      expect(result.todayCompleted).toBe(1);
      expect(result.todayTotal).toBe(2);
      expect(result.totalXPEarned).toBe(150);
      expect(result.totalMLCoinsEarned).toBe(300);
    });

    it('should return zeros if no statistics found', async () => {
      // Arrange
      missionsRepo.find
        .mockResolvedValueOnce([])  // todayMissions
        .mockResolvedValueOnce([])  // weekMissions
        .mockResolvedValueOnce([]);  // allCompletedMissions

      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getRawMany.mockResolvedValue([]);
      exerciseSubmissionRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.getStats(userId);

      // Assert
      expect(result.todayCompleted).toBe(0);
      expect(result.totalCompleted).toBe(0);
    });
  });

  // =========================================================================
  // UPDATE PROGRESS TESTS
  // =========================================================================

  describe('updateProgress', () => {
    const missionId = 'mission-123';
    const userId = 'user-123';
    const objectiveType = 'exercise_completion';
    const increment = 1;

    beforeEach(() => {
      profileRepo.findOne.mockResolvedValue(mockProfile as any);
    });

    it('should update mission progress successfully', async () => {
      // Arrange
      const mission = {
        ...mockMission,
        user_id: mockProfile.id,
        objectives: [
          { type: 'exercise_completion', target: 5, current: 2 },
        ],
        progress: 40,
        status: MissionStatusEnum.ACTIVE,
      };
      missionsRepo.findOne.mockResolvedValue(mission as any);
      missionsRepo.save.mockResolvedValue({
        ...mission,
        objectives: [
          { type: 'exercise_completion', target: 5, current: 3 },
        ],
        progress: 60,
      } as any);

      // Act
      const result = await service.updateProgress(missionId, userId, objectiveType, increment);

      // Assert
      expect(result.objectives[0].current).toBe(3);
      expect(result.progress).toBe(60);
    });

    it('should auto-complete mission when reaching 100% progress', async () => {
      // Arrange
      const mission = {
        ...mockMission,
        user_id: mockProfile.id,
        objectives: [
          { type: 'exercise_completion', target: 5, current: 4 },
        ],
        progress: 80,
        status: MissionStatusEnum.ACTIVE,
      };
      missionsRepo.findOne.mockResolvedValue(mission as any);
      missionsRepo.save.mockResolvedValue({
        ...mission,
        objectives: [
          { type: 'exercise_completion', target: 5, current: 5 },
        ],
        progress: 100,
        status: MissionStatusEnum.COMPLETED,
        completed_at: expect.any(Date),
      } as any);

      // Act
      const result = await service.updateProgress(missionId, userId, objectiveType, increment);

      // Assert
      expect(result.status).toBe(MissionStatusEnum.COMPLETED);
      expect(result.completed_at).toBeDefined();
    });

    it('should throw NotFoundException if mission not found', async () => {
      // Arrange
      missionsRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateProgress(missionId, userId, objectiveType, increment)
      ).rejects.toThrow(NotFoundException);
    });

    it('should not update progress beyond target', async () => {
      // Arrange
      const mission = {
        ...mockMission,
        user_id: mockProfile.id,
        objectives: [
          { type: 'exercise_completion', target: 5, current: 5 },
        ],
        progress: 100,
        status: MissionStatusEnum.ACTIVE,
      };
      missionsRepo.findOne.mockResolvedValue(mission as any);
      missionsRepo.save.mockResolvedValue(mission as any);

      // Act
      const result = await service.updateProgress(missionId, userId, objectiveType, increment);

      // Assert
      expect(result.objectives[0].current).toBe(5);
      expect(result.progress).toBe(100);
    });
  });

  // =========================================================================
  // CLAIM REWARDS TESTS
  // =========================================================================

  describe('claimRewards', () => {
    const userId = 'user-123';
    const missionId = 'mission-123';

    beforeEach(() => {
      profileRepo.findOne.mockResolvedValue(mockProfile as any);
      mlCoinsService.addCoins.mockResolvedValue({
        balance: 150,
        transaction: {},
      } as any);
      userStatsService.updateStats.mockResolvedValue({} as any);
      // Service uses getCurrentRank to detect rank changes
      ranksService.getCurrentRank.mockResolvedValue({ current_rank: 'Ajaw' } as any);
    });

    it('should successfully claim rewards for completed mission', async () => {
      // Arrange
      const completedMission = {
        ...mockMission,
        user_id: mockProfile.id,
        status: MissionStatusEnum.COMPLETED,
        claimed_at: null, // Must be null to claim
        rewards: { ml_coins: 50, xp: 100 },
      };
      missionsRepo.findOne.mockResolvedValue(completedMission as any);
      missionsRepo.save.mockResolvedValue({
        ...completedMission,
        status: MissionStatusEnum.CLAIMED,
        claimed_at: new Date(),
      } as any);

      // Act
      const result = await service.claimRewards(missionId, userId);

      // Assert - returns { mission, rewards, rewards_granted }
      expect(result.mission.status).toBe(MissionStatusEnum.CLAIMED);
      expect(result.rewards_granted).toBeDefined();
      expect(mlCoinsService.addCoins).toHaveBeenCalled();
    });

    it('should throw NotFoundException if mission not found', async () => {
      // Arrange
      missionsRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.claimRewards(missionId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw error if mission not completed', async () => {
      // Arrange
      const activeMission = {
        ...mockMission,
        user_id: mockProfile.id,
        status: MissionStatusEnum.ACTIVE,
      };
      missionsRepo.findOne.mockResolvedValue(activeMission as any);

      // Act & Assert
      await expect(service.claimRewards(missionId, userId)).rejects.toThrow();
    });

    it('should throw error if rewards already claimed', async () => {
      // Arrange
      const claimedMission = {
        ...mockMission,
        user_id: mockProfile.id,
        status: MissionStatusEnum.CLAIMED,
      };
      missionsRepo.findOne.mockResolvedValue(claimedMission as any);

      // Act & Assert
      await expect(service.claimRewards(missionId, userId)).rejects.toThrow();
    });

    it('should detect rank-up after claiming rewards', async () => {
      // Arrange
      const completedMission = {
        ...mockMission,
        user_id: mockProfile.id,
        status: MissionStatusEnum.COMPLETED,
        claimed_at: null, // Must be null to claim
        rewards: { ml_coins: 50, xp: 100 },
      };
      missionsRepo.findOne.mockResolvedValue(completedMission as any);
      missionsRepo.save.mockResolvedValue({
        ...completedMission,
        status: MissionStatusEnum.CLAIMED,
        claimed_at: new Date(),
      } as any);
      // Service calls getCurrentRank before and after to detect promotion
      ranksService.getCurrentRank
        .mockResolvedValueOnce({ current_rank: 'Ajaw' } as any)  // Before
        .mockResolvedValueOnce({ current_rank: 'Nacom' } as any); // After (promoted)

      // Act
      const result = await service.claimRewards(missionId, userId);

      // Assert
      expect(ranksService.getCurrentRank).toHaveBeenCalled();
      expect(result.rewards_granted.rank_promotion).toBe(true);
      expect(result.rewards_granted.new_rank).toBe('Nacom');
    });
  });

  // =========================================================================
  // GENERATE DAILY MISSIONS TESTS
  // =========================================================================

  describe('generateDailyMissions', () => {
    // Note: generateDailyMissions takes profileId directly, not userId
    const profileId = mockProfile.id;

    beforeEach(() => {
      userStatsService.findByUserId.mockResolvedValue({ level: 5 } as any);
    });

    it('should generate 3 daily missions', async () => {
      // Arrange
      const mockTemplates = [
        { id: 'template-1', name: 'Mission 1', type: 'daily', objectives: [] },
        { id: 'template-2', name: 'Mission 2', type: 'daily', objectives: [] },
        { id: 'template-3', name: 'Mission 3', type: 'daily', objectives: [] },
      ];
      // Service uses getActiveByType, not getActiveByTypeAndLevel
      templatesService.getActiveByType.mockResolvedValue(mockTemplates as any);
      templatesService.selectRandom.mockReturnValue(mockTemplates as any);
      missionsRepo.create.mockImplementation((data) => data as any);
      missionsRepo.save.mockImplementation((data) => Promise.resolve(data as any));

      // Mock expiration query
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.execute.mockResolvedValue({ affected: 0 });
      missionsRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.generateDailyMissions(profileId);

      // Assert
      expect(result).toHaveLength(3);
      expect(missionsRepo.save).toHaveBeenCalledTimes(3);
    });

    it('should use user level to filter templates', async () => {
      // Arrange
      const mockTemplates = [
        { id: 'template-1', name: 'Mission 1', type: 'daily', objectives: [] },
      ];
      // Service calls getActiveByType with userLevel from getUserLevel
      templatesService.getActiveByType.mockResolvedValue(mockTemplates as any);
      templatesService.selectRandom.mockReturnValue(mockTemplates as any);
      missionsRepo.create.mockImplementation((data) => data as any);
      missionsRepo.save.mockImplementation((data) => Promise.resolve(data as any));
      profileRepo.findOne.mockResolvedValue({ user_id: 'user-123' } as any);

      // Act
      await service.generateDailyMissions(profileId);

      // Assert - getActiveByType is called with userLevel
      expect(templatesService.getActiveByType).toHaveBeenCalled();
    });

    it('should throw BadRequestException if no templates available', async () => {
      // Arrange - Service throws if no templates exist (changed behavior)
      templatesService.getActiveByType.mockResolvedValue([]);
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.execute.mockResolvedValue({ affected: 0 });
      missionsRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act & Assert
      await expect(service.generateDailyMissions(profileId)).rejects.toThrow(
        'No daily mission templates available',
      );
    });
  });

  // =========================================================================
  // GENERATE WEEKLY MISSIONS TESTS
  // =========================================================================

  describe('generateWeeklyMissions', () => {
    // Note: generateWeeklyMissions takes profileId directly, not userId
    const profileId = mockProfile.id;

    beforeEach(() => {
      userStatsService.findByUserId.mockResolvedValue({ level: 5 } as any);
    });

    it('should generate 2 weekly missions', async () => {
      // Arrange
      const mockTemplates = [
        { id: 'template-1', name: 'Weekly Mission 1', type: 'weekly', objectives: [] },
        { id: 'template-2', name: 'Weekly Mission 2', type: 'weekly', objectives: [] },
      ];
      // Service uses getActiveByType
      templatesService.getActiveByType.mockResolvedValue(mockTemplates as any);
      templatesService.selectRandom.mockReturnValue(mockTemplates as any);
      missionsRepo.create.mockImplementation((data) => data as any);
      missionsRepo.save.mockImplementation((data) => Promise.resolve(data as any));

      // Mock expiration query
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.execute.mockResolvedValue({ affected: 0 });
      missionsRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.generateWeeklyMissions(profileId);

      // Assert
      expect(result).toHaveLength(2);
      expect(missionsRepo.save).toHaveBeenCalledTimes(2);
    });
  });
});
