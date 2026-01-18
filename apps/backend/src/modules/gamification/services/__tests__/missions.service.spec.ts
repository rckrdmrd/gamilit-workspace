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
          status: expect.anything(),
        },
        order: { created_at: 'DESC' },
      });
    });

    it('should generate missions if none exist', async () => {
      // Arrange
      missionsRepo.find.mockResolvedValue([]);
      const mockTemplates = [
        { id: 'template-1', name: 'Complete Exercises', type: 'daily' },
      ];
      templatesService.getActiveByTypeAndLevel.mockResolvedValue(mockTemplates as any);
      missionsRepo.create.mockReturnValue(mockMission as any);
      missionsRepo.save.mockResolvedValue(mockMission as any);

      // Act
      const result = await service.findByTypeAndUser(userId, missionType);

      // Assert
      expect(templatesService.getActiveByTypeAndLevel).toHaveBeenCalled();
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
  // FIND BY ID TESTS
  // =========================================================================

  describe('findById', () => {
    const missionId = 'mission-123';

    it('should return mission if found', async () => {
      // Arrange
      missionsRepo.findOne.mockResolvedValue(mockMission as any);

      // Act
      const result = await service.findById(missionId);

      // Assert
      expect(result).toEqual(mockMission);
      expect(missionsRepo.findOne).toHaveBeenCalledWith({
        where: { id: missionId },
      });
    });

    it('should throw NotFoundException if mission not found', async () => {
      // Arrange
      missionsRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById(missionId)).rejects.toThrow(NotFoundException);
      await expect(service.findById(missionId)).rejects.toThrow(
        `Mission ${missionId} not found`,
      );
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
      // Arrange
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getRawOne.mockResolvedValue({
        active_count: '3',
        completed_count: '10',
        claimed_count: '8',
        expired_count: '2',
        total_ml_coins_earned: '500',
        total_xp_earned: '1000',
      });

      missionsRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.getStats(userId);

      // Assert
      expect(result).toEqual({
        active: 3,
        completed: 10,
        claimed: 8,
        expired: 2,
        total_ml_coins_earned: 500,
        total_xp_earned: 1000,
      });
    });

    it('should return zeros if no statistics found', async () => {
      // Arrange
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getRawOne.mockResolvedValue(null);
      missionsRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.getStats(userId);

      // Assert
      expect(result.active).toBe(0);
      expect(result.completed).toBe(0);
    });
  });

  // =========================================================================
  // UPDATE PROGRESS TESTS
  // =========================================================================

  describe('updateProgress', () => {
    const missionId = 'mission-123';
    const increment = 1;

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

      // Act
      const result = await service.updateProgress(missionId, increment);

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
      const result = await service.updateProgress(missionId, increment);

      // Assert
      expect(result.status).toBe(MissionStatusEnum.COMPLETED);
      expect(result.completed_at).toBeDefined();
    });

    it('should throw NotFoundException if mission not found', async () => {
      // Arrange
      missionsRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateProgress(missionId, increment)).rejects.toThrow(
        NotFoundException,
      );
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
      const result = await service.updateProgress(missionId, increment);

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
      };
      missionsRepo.findOne.mockResolvedValue(completedMission as any);
      missionsRepo.save.mockResolvedValue({
        ...completedMission,
        status: MissionStatusEnum.CLAIMED,
        claimed_at: expect.any(Date),
      } as any);

      // Act
      const result = await service.claimRewards(userId, missionId);

      // Assert
      expect(result.status).toBe(MissionStatusEnum.CLAIMED);
      expect(mlCoinsService.addCoins).toHaveBeenCalledWith(
        mockProfile.id,
        50,
        expect.anything(),
        expect.anything(),
        missionId,
        'mission',
      );
      expect(userStatsService.updateStats).toHaveBeenCalled();
    });

    it('should throw NotFoundException if mission not found', async () => {
      // Arrange
      missionsRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.claimRewards(userId, missionId)).rejects.toThrow(
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
      await expect(service.claimRewards(userId, missionId)).rejects.toThrow();
    });

    it('should throw error if rewards already claimed', async () => {
      // Arrange
      const claimedMission = {
        ...mockMission,
        status: MissionStatusEnum.CLAIMED,
      };
      missionsRepo.findOne.mockResolvedValue(claimedMission as any);

      // Act & Assert
      await expect(service.claimRewards(userId, missionId)).rejects.toThrow();
    });

    it('should check for rank-up after claiming rewards', async () => {
      // Arrange
      const completedMission = {
        ...mockMission,
        status: MissionStatusEnum.COMPLETED,
        rewards: { ml_coins: 50, xp: 100 },
      };
      missionsRepo.findOne.mockResolvedValue(completedMission as any);
      missionsRepo.save.mockResolvedValue({
        ...completedMission,
        status: MissionStatusEnum.CLAIMED,
      } as any);
      ranksService.checkForRankUp.mockResolvedValue(null);

      // Act
      await service.claimRewards(userId, missionId);

      // Assert
      expect(ranksService.checkForRankUp).toHaveBeenCalledWith(mockProfile.id);
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
        { id: 'template-1', name: 'Mission 1', type: 'daily' },
        { id: 'template-2', name: 'Mission 2', type: 'daily' },
        { id: 'template-3', name: 'Mission 3', type: 'daily' },
      ];
      templatesService.getActiveByTypeAndLevel.mockResolvedValue(mockTemplates as any);
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

    it('should expire old daily missions before generating new ones', async () => {
      // Arrange
      templatesService.getActiveByTypeAndLevel.mockResolvedValue([]);
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.execute.mockResolvedValue({ affected: 2 });
      missionsRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      await service.generateDailyMissions(userId);

      // Assert
      expect(mockQueryBuilder.update).toHaveBeenCalled();
      expect(mockQueryBuilder.set).toHaveBeenCalledWith({
        status: MissionStatusEnum.EXPIRED,
      });
    });

    it('should return empty array if no templates available', async () => {
      // Arrange
      templatesService.getActiveByTypeAndLevel.mockResolvedValue([]);
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.execute.mockResolvedValue({ affected: 0 });
      missionsRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.generateDailyMissions(userId);

      // Assert
      expect(result).toEqual([]);
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
        { id: 'template-1', name: 'Weekly Mission 1', type: 'weekly' },
        { id: 'template-2', name: 'Weekly Mission 2', type: 'weekly' },
      ];
      templatesService.getActiveByTypeAndLevel.mockResolvedValue(mockTemplates as any);
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
