import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm';
import { ExercisesController } from '../controllers/exercises.controller';
import { ExercisesService } from '../services';
import { ExerciseSubmissionService, ExerciseAttemptService } from '@/modules/progress/services';
import { ExerciseAnswerValidator } from '@/modules/progress/dto/answers/exercise-answer.validator';
import { Profile } from '@modules/auth/entities/profile.entity';

describe('ExercisesController - Submit Endpoint', () => {
  let controller: ExercisesController;
  let exerciseSubmissionService: ExerciseSubmissionService;

  const mockExercisesService = {
    findOne: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    findAllForStudent: jest.fn(),
    findByModuleId: jest.fn(),
    getHints: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    validateProfileExists: jest.fn().mockImplementation((id: string) => Promise.resolve(id)),
    delete: jest.fn(),
    validateContentByExerciseType: jest.fn(),
  };

  const mockExerciseSubmissionService = {
    submitExercise: jest.fn(),
  };

  const mockExerciseAttemptService = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findByUserId: jest.fn(),
    findByUserAndExercise: jest.fn(),
  };

  const mockDataSource = {
    query: jest.fn(),
  };

  const mockProfileRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
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
        {
          provide: ExerciseAttemptService,
          useValue: mockExerciseAttemptService,
        },
        {
          provide: getRepositoryToken(Profile, 'auth'),
          useValue: mockProfileRepository,
        },
        {
          provide: getDataSourceToken('educational'),
          useValue: mockDataSource,
        },
      ],
    }).compile();

    controller = module.get<ExercisesController>(ExercisesController);
    exerciseSubmissionService = module.get<ExerciseSubmissionService>(
      ExerciseSubmissionService,
    );

    // Setup default mock for profile lookup
    mockProfileRepository.findOne.mockResolvedValue({
      id: 'profile-550e8400-e29b-41d4-a716-446655440000',
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      full_name: 'Test Student',
    });

    // Setup default mock for findById - return exercise that requires manual grading
    // so the submit path delegates to exerciseSubmissionService.submitExercise
    mockExercisesService.findById.mockResolvedValue({
      id: '880e8400-e29b-41d4-a716-446655440000',
      title: 'Test Exercise',
      exercise_type: 'verdadero_falso',
      requires_manual_grading: true,
      passing_score: 70,
      xp_reward: 50,
      ml_coins_reward: 25,
      hint_cost_ml_coins: 10,
    });

    // Mock ExerciseAnswerValidator.validate to skip answer structure validation
    // since this is a controller unit test focused on submit flow, not answer validation
    jest.spyOn(ExerciseAnswerValidator, 'validate').mockResolvedValue(undefined);
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
      attemptId: 'aa0e8400-e29b-41d4-a716-446655440000',
      exerciseId: exerciseId,
      score: 85,
      isPerfect: false,
      rankUp: null,
      rewards: {
        bonuses: [],
        mlCoins: 85,
        xp: 170,
      },
    };

    it('should submit exercise and return score with XP and ML Coins', async () => {
      // Arrange
      mockExerciseSubmissionService.submitExercise.mockResolvedValue(
        expectedResponse,
      );

      // Act
      const result = await controller.submitExercise(exerciseId, submitDto, mockRequest);

      // Assert
      expect(exerciseSubmissionService.submitExercise).toHaveBeenCalledWith(
        userId,
        exerciseId,
        submitDto.submitted_answers,
      );
      expect(result.score).toBeDefined();
      expect(result.rewards).toBeDefined();
      expect(result.rewards.xp).toBeDefined();
      expect(result.rewards.mlCoins).toBeDefined();
      expect(result.isPerfect).toBe(false);
    });

    it('should handle exercise with perfect score (100%)', async () => {
      // Arrange: Use auto-grading path (requires_manual_grading: false)
      mockExercisesService.findById.mockResolvedValueOnce({
        id: exerciseId,
        title: 'Test Exercise',
        exercise_type: 'verdadero_falso',
        requires_manual_grading: false,
        passing_score: 70,
        xp_reward: 200,
        ml_coins_reward: 100,
        hint_cost_ml_coins: 10,
      });

      // No previous attempts (first attempt)
      mockExerciseAttemptService.findByUserAndExercise.mockResolvedValue([]);

      // SQL validation returns perfect score
      mockDataSource.query.mockResolvedValue([{
        score: 100,
        feedback: 'Perfect score!',
        details: { correct_questions: 3, total_questions: 3, results_per_question: [] },
      }]);

      // Save attempt returns the created attempt
      mockExerciseAttemptService.create.mockResolvedValue({
        id: 'aa0e8400-e29b-41d4-a716-446655440000',
        score: 100,
        is_correct: true,
      });

      // Use submitDto with 0 hints to trigger isPerfect = true (score === 100 && hintsUsed === 0)
      const perfectSubmitDto = {
        ...submitDto,
        hints_used: 0,
        comodines_used: [],
      };

      // Act
      const result = await controller.submitExercise(exerciseId, perfectSubmitDto, mockRequest);

      // Assert
      expect(result.score).toBe(100);
      expect(result.isPerfect).toBe(true);
      expect(result.rewards).toBeDefined();
      expect(result.rewards.xp).toBeDefined();
      expect(result.rewards.mlCoins).toBeDefined();
    });

    it('should handle exercise submission with no hints used', async () => {
      // Arrange
      const noDtoWithoutHints = {
        ...submitDto,
        hints_used: 0,
        comodines_used: [],
      };

      const responseWithoutHints = {
        attemptId: 'aa0e8400-e29b-41d4-a716-446655440000',
        exerciseId: exerciseId,
        score: 90, // Higher score without hints
        isPerfect: false,
        rankUp: null,
        rewards: {
          bonuses: [],
          mlCoins: 90,
          xp: 180,
        },
      };

      mockExerciseSubmissionService.submitExercise.mockResolvedValue(
        responseWithoutHints,
      );

      // Act
      await controller.submitExercise(exerciseId, noDtoWithoutHints, mockRequest);

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
        controller.submitExercise(exerciseId, submitDto, mockRequest),
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
        controller.submitExercise(exerciseId, invalidDto, mockRequest),
      ).rejects.toThrow('Invalid submitted_answers format');
    });
  });
});
