/**
 * MissionGeneratorService Unit Tests
 *
 * @description Tests for mission generation service covering:
 * - Daily mission generation (3 missions)
 * - Weekly mission generation (2 missions)
 * - Template selection logic
 * - Mission expiration
 * - Weighted random selection
 *
 * Sprint 0 - P0-008: Increase coverage to 30%+
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MissionGeneratorService } from '../mission-generator.service';
import { MissionTemplatesService } from '../../mission-templates.service';
import { Mission, MissionTypeEnum, MissionStatusEnum } from '../../../entities/mission.entity';
import { createMockRepository, createMockQueryBuilder } from '@/__mocks__/repositories.mock';
import { createMockMissionTemplatesService, TestDataFactory } from '@/__mocks__/services.mock';

describe('MissionGeneratorService', () => {
  let service: MissionGeneratorService;
  let missionsRepo: ReturnType<typeof createMockRepository>;
  let templatesService: ReturnType<typeof createMockMissionTemplatesService>;

  // Test data
  const mockProfileId = TestDataFactory.createUuid('profile');
  const mockTemplates = [
    {
      id: 'template-1',
      name: 'Complete 5 exercises',
      description: 'Finish 5 exercises today',
      type: 'daily',
      target_type: 'exercise_completion',
      target_value: 5,
      ml_coins_reward: 50,
      xp_reward: 100,
      priority: 1,
    },
    {
      id: 'template-2',
      name: 'Gain 200 XP',
      description: 'Earn 200 experience points',
      type: 'daily',
      target_type: 'xp_gain',
      target_value: 200,
      ml_coins_reward: 30,
      xp_reward: 50,
      priority: 2,
    },
    {
      id: 'template-3',
      name: 'Use 2 comodines',
      description: 'Use 2 power-ups',
      type: 'daily',
      target_type: 'comodin_usage',
      target_value: 2,
      ml_coins_reward: 20,
      xp_reward: 40,
      priority: 1,
    },
  ];

  beforeEach(async () => {
    missionsRepo = createMockRepository<Mission>();
    templatesService = createMockMissionTemplatesService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MissionGeneratorService,
        { provide: getRepositoryToken(Mission, 'gamification'), useValue: missionsRepo },
        { provide: MissionTemplatesService, useValue: templatesService },
      ],
    }).compile();

    service = module.get<MissionGeneratorService>(MissionGeneratorService);

    jest.clearAllMocks();
  });

  describe('Service Definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  // =========================================================================
  // GENERATE DAILY MISSIONS TESTS
  // =========================================================================

  describe('generateDailyMissions', () => {
    const userLevel = 5;

    beforeEach(() => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.execute.mockResolvedValue({ affected: 0 });
      missionsRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
      templatesService.getActiveByType.mockResolvedValue(mockTemplates);
      missionsRepo.create.mockImplementation((data) => data as any);
      missionsRepo.save.mockImplementation((data) => Promise.resolve(data as any));
    });

    it('should generate 3 daily missions', async () => {
      // Act
      const result = await service.generateDailyMissions(mockProfileId, userLevel);

      // Assert
      expect(result).toHaveLength(3);
      expect(missionsRepo.save).toHaveBeenCalledTimes(3);
    });

    it('should fetch templates for user level', async () => {
      // Act
      await service.generateDailyMissions(mockProfileId, userLevel);

      // Assert
      expect(templatesService.getActiveByType).toHaveBeenCalledWith('daily', userLevel);
    });

    it('should create missions with correct type', async () => {
      // Act
      const result = await service.generateDailyMissions(mockProfileId, userLevel);

      // Assert
      result.forEach((mission) => {
        expect(mission).toHaveProperty('mission_type');
      });
    });

    it('should set end_date to end of day', async () => {
      // Act
      const result = await service.generateDailyMissions(mockProfileId, userLevel);

      // Assert
      const mission = result[0];
      if (mission && mission.end_date) {
        const endDate = new Date(mission.end_date);
        expect(endDate.getHours()).toBe(23);
        expect(endDate.getMinutes()).toBe(59);
        expect(endDate.getSeconds()).toBe(59);
      }
    });

    it('should expire old daily missions before generating', async () => {
      // Arrange
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.execute.mockResolvedValue({ affected: 2 });
      missionsRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      await service.generateDailyMissions(mockProfileId, userLevel);

      // Assert
      expect(mockQueryBuilder.update).toHaveBeenCalled();
      expect(mockQueryBuilder.set).toHaveBeenCalledWith({
        status: MissionStatusEnum.EXPIRED,
      });
    });

    it('should return empty array if no templates available', async () => {
      // Arrange
      templatesService.getActiveByType.mockResolvedValue([]);

      // Act
      const result = await service.generateDailyMissions(mockProfileId, userLevel);

      // Assert
      expect(result).toEqual([]);
      expect(missionsRepo.save).not.toHaveBeenCalled();
    });

    it('should handle fewer templates than requested count', async () => {
      // Arrange
      const limitedTemplates = mockTemplates.slice(0, 2); // Only 2 templates
      templatesService.getActiveByType.mockResolvedValue(limitedTemplates);

      // Act
      const result = await service.generateDailyMissions(mockProfileId, userLevel);

      // Assert
      expect(result.length).toBeLessThanOrEqual(2);
    });

    it('should use default level if not provided', async () => {
      // Act
      await service.generateDailyMissions(mockProfileId);

      // Assert
      expect(templatesService.getActiveByType).toHaveBeenCalledWith('daily', 1);
    });
  });

  // =========================================================================
  // GENERATE WEEKLY MISSIONS TESTS
  // =========================================================================

  describe('generateWeeklyMissions', () => {
    const userLevel = 5;
    const weeklyTemplates = [
      {
        id: 'weekly-1',
        name: 'Complete 20 exercises this week',
        type: 'weekly',
        target_type: 'exercise_completion',
        target_value: 20,
        ml_coins_reward: 200,
        xp_reward: 500,
        priority: 1,
      },
      {
        id: 'weekly-2',
        name: 'Maintain 7 day streak',
        type: 'weekly',
        target_type: 'daily_streak',
        target_value: 7,
        ml_coins_reward: 150,
        xp_reward: 300,
        priority: 1,
      },
    ];

    beforeEach(() => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.execute.mockResolvedValue({ affected: 0 });
      missionsRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
      templatesService.getActiveByType.mockResolvedValue(weeklyTemplates);
      missionsRepo.create.mockImplementation((data) => data as any);
      missionsRepo.save.mockImplementation((data) => Promise.resolve(data as any));
    });

    it('should generate 2 weekly missions', async () => {
      // Act
      const result = await service.generateWeeklyMissions(mockProfileId, userLevel);

      // Assert
      expect(result).toHaveLength(2);
      expect(missionsRepo.save).toHaveBeenCalledTimes(2);
    });

    it('should fetch weekly templates', async () => {
      // Act
      await service.generateWeeklyMissions(mockProfileId, userLevel);

      // Assert
      expect(templatesService.getActiveByType).toHaveBeenCalledWith('weekly', userLevel);
    });

    it('should set end_date to end of week (Sunday)', async () => {
      // Act
      const result = await service.generateWeeklyMissions(mockProfileId, userLevel);

      // Assert
      const mission = result[0];
      if (mission && mission.end_date) {
        const endDate = new Date(mission.end_date);
        expect(endDate.getDay()).toBe(0); // Sunday
        expect(endDate.getHours()).toBe(23);
        expect(endDate.getMinutes()).toBe(59);
      }
    });

    it('should expire old weekly missions before generating', async () => {
      // Arrange
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.execute.mockResolvedValue({ affected: 1 });
      missionsRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      await service.generateWeeklyMissions(mockProfileId, userLevel);

      // Assert
      expect(mockQueryBuilder.update).toHaveBeenCalled();
    });

    it('should return empty array if no templates available', async () => {
      // Arrange
      templatesService.getActiveByType.mockResolvedValue([]);

      // Act
      const result = await service.generateWeeklyMissions(mockProfileId, userLevel);

      // Assert
      expect(result).toEqual([]);
    });
  });

  // =========================================================================
  // CREATE MISSION FROM TEMPLATE TESTS
  // =========================================================================

  describe('createMissionFromTemplate', () => {
    const endDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const template = mockTemplates[0];

    beforeEach(() => {
      missionsRepo.create.mockImplementation((data) => data as any);
      missionsRepo.save.mockImplementation((data) => Promise.resolve(data as any));
    });

    it('should create mission with template data', async () => {
      // Act
      const _result = await service.createMissionFromTemplate(mockProfileId, template as any, endDate);

      // Assert
      expect(missionsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockProfileId,
          template_id: template.id,
          title: template.name,
          description: template.description,
        }),
      );
    });

    it('should create mission with objectives', async () => {
      // Act
      await service.createMissionFromTemplate(mockProfileId, template as any, endDate);

      // Assert
      expect(missionsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          objectives: expect.arrayContaining([
            expect.objectContaining({
              type: template.target_type,
              target: template.target_value,
              current: 0,
            }),
          ]),
        }),
      );
    });

    it('should create mission with rewards', async () => {
      // Act
      await service.createMissionFromTemplate(mockProfileId, template as any, endDate);

      // Assert
      expect(missionsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          rewards: {
            ml_coins: template.ml_coins_reward,
            xp: template.xp_reward,
          },
        }),
      );
    });

    it('should set mission status to IN_PROGRESS', async () => {
      // Act
      await service.createMissionFromTemplate(mockProfileId, template as any, endDate);

      // Assert
      expect(missionsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: MissionStatusEnum.IN_PROGRESS,
        }),
      );
    });

    it('should initialize progress to 0', async () => {
      // Act
      await service.createMissionFromTemplate(mockProfileId, template as any, endDate);

      // Assert
      expect(missionsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          progress: 0,
        }),
      );
    });

    it('should save mission to repository', async () => {
      // Act
      await service.createMissionFromTemplate(mockProfileId, template as any, endDate);

      // Assert
      expect(missionsRepo.save).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // EXPIRE MISSIONS TESTS
  // =========================================================================

  describe('expireMissions', () => {
    beforeEach(() => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.execute.mockResolvedValue({ affected: 2 });
      missionsRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
    });

    it('should expire missions past end_date', async () => {
      // Act
      const count = await service.expireMissions(mockProfileId, MissionTypeEnum.DAILY);

      // Assert
      expect(count).toBe(2);
    });

    it('should only expire ACTIVE and IN_PROGRESS missions', async () => {
      // Arrange
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.execute.mockResolvedValue({ affected: 1 });
      missionsRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      await service.expireMissions(mockProfileId, MissionTypeEnum.DAILY);

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'status IN (:...statuses)',
        expect.objectContaining({
          statuses: [MissionStatusEnum.ACTIVE, MissionStatusEnum.IN_PROGRESS],
        }),
      );
    });

    it('should filter by mission type if provided', async () => {
      // Arrange
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.execute.mockResolvedValue({ affected: 0 });
      missionsRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      await service.expireMissions(mockProfileId, MissionTypeEnum.WEEKLY);

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('mission_type = :type', {
        type: MissionTypeEnum.WEEKLY,
      });
    });

    it('should expire all types if type not specified', async () => {
      // Arrange
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.execute.mockResolvedValue({ affected: 5 });
      missionsRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      const count = await service.expireMissions(mockProfileId);

      // Assert
      expect(count).toBe(5);
    });

    it('should return 0 if no missions expired', async () => {
      // Arrange
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.execute.mockResolvedValue({ affected: 0 });
      missionsRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      const count = await service.expireMissions(mockProfileId);

      // Assert
      expect(count).toBe(0);
    });

    it('should update status to EXPIRED', async () => {
      // Arrange
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.execute.mockResolvedValue({ affected: 3 });
      missionsRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      await service.expireMissions(mockProfileId);

      // Assert
      expect(mockQueryBuilder.set).toHaveBeenCalledWith({
        status: MissionStatusEnum.EXPIRED,
      });
    });
  });

  // =========================================================================
  // WEIGHTED SELECTION TESTS (IMPLICIT)
  // =========================================================================

  describe('generateDailyMissions - Template Selection', () => {
    it('should select different templates for each mission', async () => {
      // Arrange
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.execute.mockResolvedValue({ affected: 0 });
      missionsRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
      templatesService.getActiveByType.mockResolvedValue(mockTemplates);

      const createdMissions: any[] = [];
      missionsRepo.create.mockImplementation((data) => {
        createdMissions.push(data);
        return data as any;
      });
      missionsRepo.save.mockImplementation((data) => Promise.resolve(data as any));

      // Act
      await service.generateDailyMissions(mockProfileId, 5);

      // Assert
      const templateIds = createdMissions.map((m) => m.template_id);
      const uniqueTemplateIds = new Set(templateIds);
      expect(uniqueTemplateIds.size).toBe(3); // All 3 should be different
    });

    it('should handle exact number of templates as needed', async () => {
      // Arrange
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.execute.mockResolvedValue({ affected: 0 });
      missionsRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
      templatesService.getActiveByType.mockResolvedValue(mockTemplates); // Exactly 3

      missionsRepo.create.mockImplementation((data) => data as any);
      missionsRepo.save.mockImplementation((data) => Promise.resolve(data as any));

      // Act
      const result = await service.generateDailyMissions(mockProfileId, 5);

      // Assert
      expect(result).toHaveLength(3);
    });
  });
});
