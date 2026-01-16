/**
 * ModuleProgressService Unit Tests
 *
 * @description Tests for module progress tracking service covering:
 * - CRUD operations for module progress
 * - Progress percentage updates and validation
 * - Module completion tracking
 * - Statistics aggregation (module stats, user summary)
 * - Learning path calculation
 * - Status management (not_started, in_progress, completed)
 *
 * Sprint 1 - P1-021: Increase coverage to 50%
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ModuleProgressService } from '../module-progress.service';
import { ModuleProgress } from '../../entities';
import { createMockRepository } from '@/__mocks__/repositories.mock';
import { TestDataFactory } from '@/__mocks__/services.mock';
import { ProgressStatusEnum } from '@shared/constants/enums.constants';

describe('ModuleProgressService', () => {
  let service: ModuleProgressService;
  let moduleProgressRepo: ReturnType<typeof createMockRepository>;

  // Test data
  const mockUserId = TestDataFactory.createUuid('user');
  const mockModuleId = TestDataFactory.createUuid('module');
  const mockProgressId = TestDataFactory.createUuid('progress');

  const mockModuleProgress = {
    id: mockProgressId,
    user_id: mockUserId,
    module_id: mockModuleId,
    status: ProgressStatusEnum.IN_PROGRESS,
    progress_percentage: 50,
    completed_exercises: 5,
    total_exercises: 10,
    skipped_exercises: 0,
    total_score: 450,
    max_possible_score: 1000,
    average_score: 90,
    total_xp_earned: 250,
    total_ml_coins_earned: 50,
    time_spent: '01:30:00',
    sessions_count: 3,
    attempts_count: 8,
    hints_used_total: 2,
    comodines_used_total: 1,
    comodines_cost_total: 10,
    started_at: new Date('2025-01-01'),
    last_accessed_at: new Date('2025-01-05'),
    completed_at: null,
    learning_path: [],
    performance_analytics: {},
    system_observations: {},
    metadata: {},
    created_at: new Date('2025-01-01'),
    updated_at: new Date('2025-01-05'),
  };

  beforeEach(async () => {
    moduleProgressRepo = createMockRepository<ModuleProgress>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModuleProgressService,
        {
          provide: getRepositoryToken(ModuleProgress, 'progress'),
          useValue: moduleProgressRepo,
        },
      ],
    }).compile();

    service = module.get<ModuleProgressService>(ModuleProgressService);
    jest.clearAllMocks();
  });

  describe('Service Definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  // =========================================================================
  // FIND OPERATIONS
  // =========================================================================

  describe('findByUserId', () => {
    it('should return all progress records for a user', async () => {
      const mockProgressList = [mockModuleProgress, { ...mockModuleProgress, id: 'another-id' }];
      moduleProgressRepo.find.mockResolvedValue(mockProgressList as any);

      const result = await service.findByUserId(mockUserId);

      expect(result).toEqual(mockProgressList);
      expect(moduleProgressRepo.find).toHaveBeenCalledWith({
        where: { user_id: mockUserId },
        order: { updated_at: 'DESC' },
      });
    });

    it('should return empty array if user has no progress', async () => {
      moduleProgressRepo.find.mockResolvedValue([]);

      const result = await service.findByUserId(mockUserId);

      expect(result).toEqual([]);
    });
  });

  describe('findByUserAndModule', () => {
    it('should return progress for specific user and module', async () => {
      moduleProgressRepo.findOne.mockResolvedValue(mockModuleProgress as any);

      const result = await service.findByUserAndModule(mockUserId, mockModuleId);

      expect(result).toEqual(mockModuleProgress);
      expect(moduleProgressRepo.findOne).toHaveBeenCalledWith({
        where: { user_id: mockUserId, module_id: mockModuleId },
      });
    });

    it('should throw NotFoundException if progress not found', async () => {
      moduleProgressRepo.findOne.mockResolvedValue(null);

      await expect(service.findByUserAndModule(mockUserId, mockModuleId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByUserAndModule(mockUserId, mockModuleId)).rejects.toThrow(
        `No progress found for user ${mockUserId} in module ${mockModuleId}`,
      );
    });
  });

  describe('findInProgress', () => {
    it('should return only in-progress modules for a user', async () => {
      const inProgressModules = [mockModuleProgress];
      moduleProgressRepo.find.mockResolvedValue(inProgressModules as any);

      const result = await service.findInProgress(mockUserId);

      expect(result).toEqual(inProgressModules);
      expect(moduleProgressRepo.find).toHaveBeenCalledWith({
        where: {
          user_id: mockUserId,
          status: ProgressStatusEnum.IN_PROGRESS,
        },
        order: { last_accessed_at: 'DESC' },
      });
    });
  });

  // =========================================================================
  // CREATE OPERATION
  // =========================================================================

  describe('create', () => {
    const createDto = {
      user_id: mockUserId,
      module_id: mockModuleId,
      total_exercises: 10,
    };

    beforeEach(() => {
      moduleProgressRepo.findOne.mockResolvedValue(null);
      moduleProgressRepo.create.mockReturnValue(mockModuleProgress as any);
      moduleProgressRepo.save.mockResolvedValue(mockModuleProgress as any);
    });

    it('should create new module progress successfully', async () => {
      const result = await service.create(createDto);

      expect(result).toEqual(mockModuleProgress);
      expect(moduleProgressRepo.findOne).toHaveBeenCalledWith({
        where: { user_id: createDto.user_id, module_id: createDto.module_id },
      });
      expect(moduleProgressRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: createDto.user_id,
          module_id: createDto.module_id,
          status: ProgressStatusEnum.NOT_STARTED,
          progress_percentage: 0,
          completed_exercises: 0,
          total_exercises: 10,
        }),
      );
      expect(moduleProgressRepo.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if progress already exists', async () => {
      moduleProgressRepo.findOne.mockResolvedValue(mockModuleProgress as any);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(createDto)).rejects.toThrow(
        `Progress already exists for user ${createDto.user_id} in module ${createDto.module_id}`,
      );
    });

    it('should initialize with default values', async () => {
      await service.create(createDto);

      expect(moduleProgressRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          progress_percentage: 0,
          completed_exercises: 0,
          skipped_exercises: 0,
          total_score: 0,
          total_xp_earned: 0,
          total_ml_coins_earned: 0,
          sessions_count: 0,
          attempts_count: 0,
          hints_used_total: 0,
          comodines_used_total: 0,
          comodines_cost_total: 0,
        }),
      );
    });
  });

  // =========================================================================
  // UPDATE OPERATIONS
  // =========================================================================

  describe('update', () => {
    it('should update module progress successfully', async () => {
      const updateDto = { completed_exercises: 6, total_score: 500 };
      moduleProgressRepo.findOne.mockResolvedValue(mockModuleProgress as any);
      moduleProgressRepo.save.mockResolvedValue({ ...mockModuleProgress, ...updateDto } as any);

      const result = await service.update(mockProgressId, updateDto);

      expect(result).toMatchObject(updateDto);
      expect(moduleProgressRepo.findOne).toHaveBeenCalledWith({ where: { id: mockProgressId } });
      expect(moduleProgressRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if progress not found', async () => {
      moduleProgressRepo.findOne.mockResolvedValue(null);

      await expect(service.update(mockProgressId, {})).rejects.toThrow(NotFoundException);
      await expect(service.update(mockProgressId, {})).rejects.toThrow(
        `Progress with ID ${mockProgressId} not found`,
      );
    });
  });

  describe('updateProgressPercentage', () => {
    beforeEach(() => {
      moduleProgressRepo.findOne.mockResolvedValue(mockModuleProgress as any);
      moduleProgressRepo.save.mockResolvedValue(mockModuleProgress as any);
    });

    it('should update progress percentage successfully', async () => {
      const result = await service.updateProgressPercentage(mockProgressId, 75);

      expect(result.progress_percentage).toBe(75);
      expect(result.status).toBe(ProgressStatusEnum.IN_PROGRESS);
      expect(moduleProgressRepo.save).toHaveBeenCalled();
    });

    it('should set status to NOT_STARTED when percentage is 0', async () => {
      const result = await service.updateProgressPercentage(mockProgressId, 0);

      expect(result.status).toBe(ProgressStatusEnum.NOT_STARTED);
    });

    it('should set status to IN_PROGRESS when percentage is between 1-99', async () => {
      const result = await service.updateProgressPercentage(mockProgressId, 50);

      expect(result.status).toBe(ProgressStatusEnum.IN_PROGRESS);
    });

    it('should set status to COMPLETED when percentage is 100', async () => {
      const result = await service.updateProgressPercentage(mockProgressId, 100);

      expect(result.status).toBe(ProgressStatusEnum.COMPLETED);
      expect(result.completed_at).toBeInstanceOf(Date);
    });

    it('should throw BadRequestException if percentage is negative', async () => {
      await expect(service.updateProgressPercentage(mockProgressId, -10)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.updateProgressPercentage(mockProgressId, -10)).rejects.toThrow(
        'Progress percentage must be between 0 and 100',
      );
    });

    it('should throw BadRequestException if percentage is over 100', async () => {
      await expect(service.updateProgressPercentage(mockProgressId, 150)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if progress not found', async () => {
      moduleProgressRepo.findOne.mockResolvedValue(null);

      await expect(service.updateProgressPercentage(mockProgressId, 50)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('completeModule', () => {
    beforeEach(() => {
      moduleProgressRepo.findOne.mockResolvedValue(mockModuleProgress as any);
      moduleProgressRepo.save.mockResolvedValue(mockModuleProgress as any);
    });

    it('should mark module as completed successfully', async () => {
      const result = await service.completeModule(mockProgressId);

      expect(result.status).toBe(ProgressStatusEnum.COMPLETED);
      expect(result.progress_percentage).toBe(100);
      expect(result.completed_at).toBeInstanceOf(Date);
      expect(moduleProgressRepo.save).toHaveBeenCalled();
    });

    it('should calculate average score if exercises completed', async () => {
      const progressWithScore = {
        ...mockModuleProgress,
        average_score: undefined,
        completed_exercises: 10,
        total_score: 900,
        max_possible_score: 1000,
      };
      moduleProgressRepo.findOne.mockResolvedValue(progressWithScore as any);
      moduleProgressRepo.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.completeModule(mockProgressId);

      expect(result.average_score).toBe(90);
    });

    it('should not calculate average score if no exercises completed', async () => {
      const progressNoExercises = {
        ...mockModuleProgress,
        average_score: undefined,
        completed_exercises: 0,
      };
      moduleProgressRepo.findOne.mockResolvedValue(progressNoExercises as any);
      moduleProgressRepo.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.completeModule(mockProgressId);

      expect(result.average_score).toBeUndefined();
    });

    it('should throw NotFoundException if progress not found', async () => {
      moduleProgressRepo.findOne.mockResolvedValue(null);

      await expect(service.completeModule(mockProgressId)).rejects.toThrow(NotFoundException);
    });
  });

  // =========================================================================
  // STATISTICS OPERATIONS
  // =========================================================================

  describe('getModuleStats', () => {
    it('should return module statistics', async () => {
      const mockProgressList = [
        { ...mockModuleProgress, status: ProgressStatusEnum.COMPLETED, progress_percentage: 100, average_score: 95 },
        { ...mockModuleProgress, status: ProgressStatusEnum.IN_PROGRESS, progress_percentage: 50, average_score: 85 },
        { ...mockModuleProgress, status: ProgressStatusEnum.NOT_STARTED, progress_percentage: 0, average_score: null },
      ];
      moduleProgressRepo.find.mockResolvedValue(mockProgressList as any);

      const result = await service.getModuleStats(mockModuleId);

      expect(result).toEqual({
        total_students: 3,
        completed_count: 1,
        in_progress_count: 1,
        average_progress: 50,
        average_score: 90,
        average_time_spent: '00:00:00',
      });
    });

    it('should return zero stats if no progress records exist', async () => {
      moduleProgressRepo.find.mockResolvedValue([]);

      const result = await service.getModuleStats(mockModuleId);

      expect(result).toEqual({
        total_students: 0,
        completed_count: 0,
        in_progress_count: 0,
        average_progress: 0,
        average_score: 0,
        average_time_spent: '00:00:00',
      });
    });

    it('should handle null average scores correctly', async () => {
      const mockProgressList = [
        { ...mockModuleProgress, average_score: null },
        { ...mockModuleProgress, average_score: undefined },
      ];
      moduleProgressRepo.find.mockResolvedValue(mockProgressList as any);

      const result = await service.getModuleStats(mockModuleId);

      expect(result.average_score).toBe(0);
    });
  });

  describe('getUserProgressSummary', () => {
    it('should return user progress summary', async () => {
      const mockProgressList = [
        {
          ...mockModuleProgress,
          status: ProgressStatusEnum.COMPLETED,
          total_exercises: 10,
          completed_exercises: 10,
          total_score: 900,
        },
        {
          ...mockModuleProgress,
          status: ProgressStatusEnum.IN_PROGRESS,
          total_exercises: 15,
          completed_exercises: 5,
          total_score: 400,
        },
      ];
      moduleProgressRepo.find.mockResolvedValue(mockProgressList as any);

      const result = await service.getUserProgressSummary(mockUserId);

      expect(result).toEqual({
        total_modules: 2,
        completed_modules: 1,
        in_progress_modules: 1,
        completion_rate: 50,
        total_xp_earned: expect.any(Number),
        total_ml_coins_earned: expect.any(Number),
        total_time_spent: '00:00:00',
        total_exercises: 25,
        completed_exercises: 15,
        average_score: 650,
        current_streak: 0,
        longest_streak: 0,
      });
    });

    it('should handle empty progress list', async () => {
      moduleProgressRepo.find.mockResolvedValue([]);

      const result = await service.getUserProgressSummary(mockUserId);

      expect(result.total_modules).toBe(0);
      expect(result.completion_rate).toBe(0);
      expect(result.average_score).toBe(0);
    });
  });

  // =========================================================================
  // LEARNING PATH CALCULATION
  // =========================================================================

  describe('calculateLearningPath', () => {
    it('should recommend increasing difficulty for high performers', async () => {
      const highPerformerProgress = [
        { ...mockModuleProgress, status: ProgressStatusEnum.COMPLETED, average_score: 95 },
        { ...mockModuleProgress, status: ProgressStatusEnum.COMPLETED, average_score: 92 },
      ];
      moduleProgressRepo.find.mockResolvedValue(highPerformerProgress as any);

      const result = await service.calculateLearningPath(mockUserId);

      expect(result.difficulty_adjustment).toBe('increase');
      expect(result.reasoning).toContain('High performance detected');
    });

    it('should recommend decreasing difficulty for struggling students', async () => {
      const strugglingProgress = [
        { ...mockModuleProgress, average_score: 55 },
        { ...mockModuleProgress, average_score: 50 },
      ];
      moduleProgressRepo.find.mockResolvedValue(strugglingProgress as any);

      const result = await service.calculateLearningPath(mockUserId);

      expect(result.difficulty_adjustment).toBe('decrease');
      expect(result.reasoning).toContain('Additional practice recommended');
    });

    it('should maintain difficulty for average performance', async () => {
      const averageProgress = [
        { ...mockModuleProgress, average_score: 75 },
        { ...mockModuleProgress, average_score: 80 },
      ];
      moduleProgressRepo.find.mockResolvedValue(averageProgress as any);

      const result = await service.calculateLearningPath(mockUserId);

      expect(result.difficulty_adjustment).toBe('maintain');
      expect(result.reasoning).toContain('Continue with current difficulty level');
    });

    it('should handle users with no progress', async () => {
      moduleProgressRepo.find.mockResolvedValue([]);

      const result = await service.calculateLearningPath(mockUserId);

      expect(result).toHaveProperty('recommended_modules');
      expect(result).toHaveProperty('difficulty_adjustment');
    });
  });
});
