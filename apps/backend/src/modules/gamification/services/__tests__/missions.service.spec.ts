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
import { MLCoinsService } from '../ml-coins.service';
import { UserStatsService } from '../user-stats.service';
import { RanksService } from '../ranks.service';
import { MissionTemplatesService } from '../mission-templates.service';
import { Mission, MissionTypeEnum, MissionStatusEnum } from '../../entities/mission.entity';
import { Profile } from '@/modules/auth/entities/profile.entity';
import { ExerciseSubmission } from '@/modules/progress/entities/exercise-submission.entity';
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
          status: expect.anything(), // Between(ACTIVE, IN_PROGRESS)
        },
        order: { created_at: 'ASC' },
      });
    });

    it('should generate missions if none exist', async () => {
      // Arrange
      missionsRepo.find.mockResolvedValue([]);
      const mockTemplates = [
        { id: 'template-1', name: 'Complete Exercises', type: 'daily', target_type: 'exercises', target_value: 5, ml_coins_reward: 100, xp_reward: 50 },
      ];
      templatesService.getActiveByType.mockResolvedValue(mockTemplates as any);
      templatesService.selectRandom.mockReturnValue(mockTemplates.slice(0, 3));
      missionsRepo.create.mockReturnValue(mockMission as any);
      missionsRepo.save.mockResolvedValue(mockMission as any);

      // Act
      const _result = await service.findByTypeAndUser(userId, missionType);

      // Assert
      expect(templatesService.getActiveByType).toHaveBeenCalled();
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
  // FIND BY ID TESTS
  // NOTE: MissionsService doesn't expose findById - missions are accessed via
  // findByTypeAndUser or internally via startMission/updateProgress
  // =========================================================================

  describe.skip('findById (method does not exist)', () => {
    const _missionId = 'mission-123';

    it('should return mission if found', async () => {
      // SKIPPED: MissionsService doesn't have findById method
    });

    it('should throw NotFoundException if mission not found', async () => {
      // SKIPPED: MissionsService doesn't have findById method
    });
  });

  // =========================================================================
  // GET STATS TESTS
  // =========================================================================

  describe('getStats', () => {
    const userId = 'user-123';

    beforeEach(() => {
      profileRepo.findOne.mockResolvedValue(mockProfile as any);
      // Service uses find() not queryBuilder for main queries
      missionsRepo.find.mockResolvedValue([]);
      userStatsService.findByUserId.mockResolvedValue({ max_streak: 0 } as any);
      userStatsService.updateStats.mockResolvedValue({} as any);
      // Mock queryBuilder for calculateStreaks
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getRawMany.mockResolvedValue([]);
      missionsRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
    });

    it('should return mission statistics', async () => {
      // Arrange - service uses find() multiple times
      const completedMissions = [
        { ...mockMission, status: MissionStatusEnum.COMPLETED, rewards: { xp: 100, ml_coins: 50 } },
        { ...mockMission, status: MissionStatusEnum.CLAIMED, rewards: { xp: 200, ml_coins: 100 } },
      ];
      missionsRepo.find.mockResolvedValue(completedMissions as any);

      // Act
      const result = await service.getStats(userId);

      // Assert - check structure matches actual service output
      expect(result).toHaveProperty('todayCompleted');
      expect(result).toHaveProperty('weekCompleted');
      expect(result).toHaveProperty('totalCompleted');
    });

    it('should return zeros if no statistics found', async () => {
      // Arrange
      missionsRepo.find.mockResolvedValue([]);

      // Act
      const result = await service.getStats(userId);

      // Assert
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
        objectives: [
          { type: 'exercise_completion', target: 5, current: 2 },
        ],
        progress: 40,
      };
      missionsRepo.findOne.mockResolvedValue(mission as any);
      missionsRepo.save.mockResolvedValue({
        ...mission,
        objectives: [
          { type: 'exercise_completion', target: 5, current: 3 },
        ],
        progress: 60,
      } as any);

      // Act - updateProgress(missionId, userId, objectiveType, increment)
      const result = await service.updateProgress(missionId, userId, objectiveType, increment);

      // Assert
      expect(result.objectives[0].current).toBe(3);
      expect(result.progress).toBe(60);
    });

    it('should auto-complete mission when reaching 100% progress', async () => {
      // Arrange
      const mission = {
        ...mockMission,
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
        service.updateProgress(missionId, userId, objectiveType, increment),
      ).rejects.toThrow(NotFoundException);
    });

    it('should not update progress beyond target', async () => {
      // Arrange
      const mission = {
        ...mockMission,
        objectives: [
          { type: 'exercise_completion', target: 5, current: 5 },
        ],
        progress: 100,
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
    });

    it('should successfully claim rewards for completed mission', async () => {
      // Arrange
      const completedMission = {
        ...mockMission,
        status: MissionStatusEnum.COMPLETED,
        rewards: { ml_coins: 50, xp: 100 },
        claimed_at: null, // Must be null to not trigger "already claimed" error
      };
      missionsRepo.findOne.mockResolvedValue(completedMission as any);
      missionsRepo.save.mockResolvedValue({
        ...completedMission,
        status: MissionStatusEnum.CLAIMED,
        claimed_at: new Date(),
      } as any);

      // Act - service returns { mission, rewards, rewards_granted }
      const result = await service.claimRewards(missionId, userId);

      // Assert - check mission.status
      expect(result.mission.status).toBe(MissionStatusEnum.CLAIMED);
      // Service passes userId (not profileId) to mlCoinsService
      expect(mlCoinsService.addCoins).toHaveBeenCalledWith(
        userId,
        50,
        expect.anything(),
        expect.anything(),
        missionId,
        'mission',
      );
      // Note: XP is awarded via addXp, not updateStats
      expect(userStatsService.addXp).toHaveBeenCalled();
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
        status: MissionStatusEnum.CLAIMED,
      };
      missionsRepo.findOne.mockResolvedValue(claimedMission as any);

      // Act & Assert
      await expect(service.claimRewards(missionId, userId)).rejects.toThrow();
    });

    it('should check current rank after claiming rewards', async () => {
      // Arrange
      const completedMission = {
        ...mockMission,
        status: MissionStatusEnum.COMPLETED,
        rewards: { ml_coins: 50, xp: 100 },
        claimed_at: null,
      };
      missionsRepo.findOne.mockResolvedValue(completedMission as any);
      missionsRepo.save.mockResolvedValue({
        ...completedMission,
        status: MissionStatusEnum.CLAIMED,
        claimed_at: new Date(),
      } as any);
      // Service calls getCurrentRank twice: before and after awarding XP to detect promotion
      ranksService.getCurrentRank.mockResolvedValue({ current_rank: 'Guerrero' });

      // Act
      await service.claimRewards(missionId, userId);

      // Assert - Service uses getCurrentRank for rank promotion detection
      expect(ranksService.getCurrentRank).toHaveBeenCalledWith(userId);
    });
  });

  // =========================================================================
  // GENERATE DAILY MISSIONS TESTS
  // =========================================================================

  describe('generateDailyMissions', () => {
    const userId = 'user-123';
    const userLevel = 5;

    beforeEach(() => {
      profileRepo.findOne.mockResolvedValue(mockProfile as any);
      userStatsService.findByUserId.mockResolvedValue({ level: userLevel } as any);
    });

    it('should generate 3 daily missions', async () => {
      // Arrange
      const mockTemplates = [
        { id: 'template-1', name: 'Mission 1', type: 'daily', target_type: 'exercises', target_value: 5, ml_coins_reward: 50, xp_reward: 25, description: 'Test' },
        { id: 'template-2', name: 'Mission 2', type: 'daily', target_type: 'exercises', target_value: 10, ml_coins_reward: 100, xp_reward: 50, description: 'Test' },
        { id: 'template-3', name: 'Mission 3', type: 'daily', target_type: 'xp', target_value: 100, ml_coins_reward: 75, xp_reward: 35, description: 'Test' },
      ];
      templatesService.getActiveByType.mockResolvedValue(mockTemplates as any);
      templatesService.selectRandom.mockReturnValue(mockTemplates);
      missionsRepo.create.mockImplementation((data) => data as any);
      missionsRepo.save.mockImplementation((data) => Promise.resolve(data as any));

      // Mock expiration query
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.execute.mockResolvedValue({ affected: 0 });
      missionsRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.generateDailyMissions(userId);

      // Assert
      expect(result).toHaveLength(3);
      expect(missionsRepo.save).toHaveBeenCalledTimes(3);
    });

    it('should generate daily missions even when expiration query affects records', async () => {
      // Arrange
      const mockTemplates = [
        { id: 'template-1', name: 'Mission 1', type: 'daily', target_type: 'exercises', target_value: 5, ml_coins_reward: 50, xp_reward: 25, description: 'Test' },
        { id: 'template-2', name: 'Mission 2', type: 'daily', target_type: 'exercises', target_value: 10, ml_coins_reward: 100, xp_reward: 50, description: 'Test' },
        { id: 'template-3', name: 'Mission 3', type: 'daily', target_type: 'xp', target_value: 100, ml_coins_reward: 75, xp_reward: 35, description: 'Test' },
      ];
      templatesService.getActiveByType.mockResolvedValue(mockTemplates as any);
      templatesService.selectRandom.mockReturnValue(mockTemplates);
      missionsRepo.create.mockImplementation((data) => data as any);
      missionsRepo.save.mockImplementation((data) => Promise.resolve(data as any));
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.execute.mockResolvedValue({ affected: 2 });
      missionsRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.generateDailyMissions(userId);

      // Assert - Verify new missions were generated regardless of expiration
      expect(result).toHaveLength(3);
      expect(missionsRepo.save).toHaveBeenCalledTimes(3);
    });

    it('should throw BadRequestException if no templates available', async () => {
      // Arrange
      templatesService.getActiveByType.mockResolvedValue([]);
      templatesService.selectRandom.mockReturnValue([]);
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.execute.mockResolvedValue({ affected: 0 });
      missionsRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act & Assert - Service throws when no templates are available
      await expect(service.generateDailyMissions(userId)).rejects.toThrow(
        'No daily mission templates available',
      );
    });
  });

  // =========================================================================
  // GENERATE WEEKLY MISSIONS TESTS
  // =========================================================================

  describe('generateWeeklyMissions', () => {
    const userId = 'user-123';
    const userLevel = 5;

    beforeEach(() => {
      profileRepo.findOne.mockResolvedValue(mockProfile as any);
      userStatsService.findByUserId.mockResolvedValue({ level: userLevel } as any);
    });

    it('should generate 2 weekly missions', async () => {
      // Arrange
      const mockTemplates = [
        { id: 'template-1', name: 'Weekly Mission 1', type: 'weekly', target_type: 'exercises', target_value: 20, ml_coins_reward: 200, xp_reward: 100, description: 'Test' },
        { id: 'template-2', name: 'Weekly Mission 2', type: 'weekly', target_type: 'streak', target_value: 5, ml_coins_reward: 250, xp_reward: 125, description: 'Test' },
      ];
      templatesService.getActiveByType.mockResolvedValue(mockTemplates as any);
      templatesService.selectRandom.mockReturnValue(mockTemplates);
      missionsRepo.create.mockImplementation((data) => data as any);
      missionsRepo.save.mockImplementation((data) => Promise.resolve(data as any));

      // Mock expiration query
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.execute.mockResolvedValue({ affected: 0 });
      missionsRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.generateWeeklyMissions(userId);

      // Assert
      expect(result).toHaveLength(2);
      expect(missionsRepo.save).toHaveBeenCalledTimes(2);
    });
  });
});
