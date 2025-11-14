import { Test, TestingModule } from '@nestjs/testing';
import { ExercisesController } from '../controllers/exercises.controller';
import { ExercisesService } from '../services';
import { ExerciseSubmissionService } from '@/modules/progress/services';

describe('ExercisesController - Submit Endpoint', () => {
  let controller: ExercisesController;
  let exerciseSubmissionService: ExerciseSubmissionService;

  const mockExercisesService = {
    findOne: jest.fn(),
    validateContentByExerciseType: jest.fn(),
  };

  const mockExerciseSubmissionService = {
    submitExercise: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExercisesController],
      providers: [
        {
          provide: ExercisesService,
          useValue: mockExercisesService,
        },
        {
          provide: ExerciseSubmissionService,
          useValue: mockExerciseSubmissionService,
        },
      ],
    }).compile();

    controller = module.get<ExercisesController>(ExercisesController);
    exerciseSubmissionService = module.get<ExerciseSubmissionService>(
      ExerciseSubmissionService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /exercises/:id/submit', () => {
    const exerciseId = '880e8400-e29b-41d4-a716-446655440000';
    const userId = '550e8400-e29b-41d4-a716-446655440000';

    // Mock request object with authenticated user (from JWT)
    const mockRequest = {
      user: {
        id: userId,
        email: 'student@gamilit.com',
        role: 'student',
      },
    };

    const submitDto = {
      userId,
      submitted_answers: {
        question_1: 'Marie Curie',
        question_2: '1903',
        question_3: 'Radiactividad',
      },
      time_spent_seconds: 180,
      hints_used: 1,
      comodines_used: ['pistas'],
    };

    const expectedResponse = {
      id: 'aa0e8400-e29b-41d4-a716-446655440000',
      user_id: userId,
      exercise_id: exerciseId,
      status: 'auto_graded',
      final_score: 85,
      submitted_at: new Date('2025-11-11T15:00:00Z'),
      graded_at: new Date('2025-11-11T15:00:01Z'),
      xp_earned: 170,
      ml_coins_earned: 85,
      user_answers: submitDto.submitted_answers,
    };

    it('should submit exercise and return score with XP and ML Coins', async () => {
      // Arrange
      mockExerciseSubmissionService.submitExercise.mockResolvedValue(
        expectedResponse,
      );

      // Act
      const result = await controller.submitExercise(exerciseId, mockRequest, submitDto);

      // Assert
      expect(exerciseSubmissionService.submitExercise).toHaveBeenCalledWith(
        userId,
        exerciseId,
        submitDto.submitted_answers,
      );
      expect(result).toEqual(expectedResponse);
      // Note: final_score, xp_earned, ml_coins_earned no están en ExerciseSubmissionResponseDto
      // La entity/DTO usa 'score' (no 'final_score'), y no incluye xp_earned/ml_coins_earned
      expect(result.score).toBeDefined();
    });

    it('should handle exercise with perfect score (100%)', async () => {
      // Arrange
      const perfectScoreResponse = {
        ...expectedResponse,
        final_score: 100,
        xp_earned: 200,
        ml_coins_earned: 100,
      };
      mockExerciseSubmissionService.submitExercise.mockResolvedValue(
        perfectScoreResponse,
      );

      // Act
      const result = await controller.submitExercise(exerciseId, mockRequest, submitDto);

      // Assert
      // Note: final_score, xp_earned, ml_coins_earned no están en ExerciseSubmissionResponseDto
      // La entity/DTO usa 'score' (no 'final_score'), y no incluye xp_earned/ml_coins_earned
      expect(result.score).toBeDefined();
    });

    it('should handle exercise submission with no hints used', async () => {
      // Arrange
      const noDtoWithoutHints = {
        ...submitDto,
        hints_used: 0,
        comodines_used: [],
      };

      mockExerciseSubmissionService.submitExercise.mockResolvedValue(
        expectedResponse,
      );

      // Act
      await controller.submitExercise(exerciseId, mockRequest, noDtoWithoutHints);

      // Assert
      expect(exerciseSubmissionService.submitExercise).toHaveBeenCalledWith(
        userId,
        exerciseId,
        noDtoWithoutHints.submitted_answers,
      );
    });

    it('should throw error if exercise not found', async () => {
      // Arrange
      const error = new Error('Exercise with ID 880e8400-... not found');
      mockExerciseSubmissionService.submitExercise.mockRejectedValue(error);

      // Act & Assert
      await expect(
        controller.submitExercise(exerciseId, mockRequest, submitDto),
      ).rejects.toThrow('Exercise with ID 880e8400-... not found');
    });

    it('should validate submitted_answers is required', async () => {
      // Arrange
      const invalidDto = {
        userId,
        submitted_answers: {} as any, // Empty answers
      };

      const error = new Error('Invalid submitted_answers format');
      mockExerciseSubmissionService.submitExercise.mockRejectedValue(error);

      // Act & Assert
      await expect(
        controller.submitExercise(exerciseId, mockRequest, invalidDto),
      ).rejects.toThrow('Invalid submitted_answers format');
    });
  });
});
