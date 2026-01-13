import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm';
import { ExercisesController } from '../controllers/exercises.controller';
import { ExercisesService } from '../services';
import { ExerciseSubmissionService, ExerciseAttemptService } from '@/modules/progress/services';
import { Profile } from '@modules/auth/entities/profile.entity';

describe('ExercisesController - Submit Endpoint', () => {
  let controller: ExercisesController;
  let _exerciseSubmissionService: ExerciseSubmissionService;

  const mockExercisesService = {
    findOne: jest.fn(),
    findById: jest.fn(),
    validateContentByExerciseType: jest.fn(),
  };

  const mockExerciseSubmissionService = {
    submitExercise: jest.fn(),
  };

  const mockExerciseAttemptService = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findByUserAndExercise: jest.fn().mockResolvedValue([]), // No previous attempts
  };

  const mockProfileRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
  };

  // Mock DataSource for educational database
  const mockDataSource = {
    query: jest.fn(),
    isInitialized: true,
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
    _exerciseSubmissionService = module.get<ExerciseSubmissionService>(
      ExerciseSubmissionService,
    );

    // Setup default mock for profile lookup
    mockProfileRepository.findOne.mockResolvedValue({
      id: 'profile-550e8400-e29b-41d4-a716-446655440000',
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      full_name: 'Test Student',
    });

    // Setup default mock for exercise lookup
    // Using 'verdadero_falso' as it's a valid exercise type
    mockExercisesService.findById.mockResolvedValue({
      id: '880e8400-e29b-41d4-a716-446655440000',
      title: 'Test Exercise',
      exercise_type: 'verdadero_falso',
      requires_manual_grading: false,
      passing_score: 70,
      xp_reward: 170,
      ml_coins_reward: 85,
      content: {
        statements: [
          { id: 'stmt-1', text: 'Marie Curie won 2 Nobel Prizes', correct: true },
          { id: 'stmt-2', text: 'Radium was discovered in 1900', correct: false },
        ],
      },
    });

    // Setup default mock for DataSource query (validate_and_audit SQL function)
    mockDataSource.query.mockResolvedValue([
      {
        score: 85,
        feedback: 'Good job!',
        is_correct: true,
      },
    ]);

    // Setup mock for creating attempt
    mockExerciseAttemptService.create.mockResolvedValue({
      id: 'aa0e8400-e29b-41d4-a716-446655440000',
      user_id: 'profile-550e8400-e29b-41d4-a716-446655440000',
      exercise_id: '880e8400-e29b-41d4-a716-446655440000',
      score: 85,
      is_correct: true,
    });
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

    // Answer format for verdadero_falso exercise type
    const submitDto = {
      userId,
      answers: {
        statements: {
          'stmt-1': true,
          'stmt-2': false,
        },
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
      // Arrange - DataSource mock already setup in beforeEach

      // Act
      const result = await controller.submitExercise(exerciseId, submitDto, mockRequest);

      // Assert
      expect(mockDataSource.query).toHaveBeenCalled();
      expect(mockExerciseAttemptService.create).toHaveBeenCalled();
      expect(result.score).toBe(85);
      expect(result.rewards).toBeDefined();
      expect(result.rewards.xp).toBe(170); // First correct attempt gets XP
      expect(result.rewards.mlCoins).toBe(85);
      expect(result.isPerfect).toBe(false);
    });

    it('should handle exercise with perfect score (100%)', async () => {
      // Arrange
      mockDataSource.query.mockResolvedValue([
        {
          score: 100,
          feedback: 'Perfect!',
          is_correct: true,
        },
      ]);

      // Use DTO without hints for perfect score
      const perfectDto = {
        ...submitDto,
        hints_used: 0,
      };

      // Act
      const result = await controller.submitExercise(exerciseId, perfectDto, mockRequest);

      // Assert
      expect(result.score).toBe(100);
      expect(result.isPerfect).toBe(true);
      expect(result.rewards).toBeDefined();
      expect(result.rewards.xp).toBe(170);
      expect(result.rewards.mlCoins).toBe(85);
    });

    it('should handle exercise submission with no hints used', async () => {
      // Arrange
      const dtoWithoutHints = {
        ...submitDto,
        hints_used: 0,
        comodines_used: [],
      };

      mockDataSource.query.mockResolvedValue([
        {
          score: 90,
          feedback: 'Great job!',
          is_correct: true,
        },
      ]);

      // Act
      const result = await controller.submitExercise(exerciseId, dtoWithoutHints, mockRequest);

      // Assert
      expect(mockDataSource.query).toHaveBeenCalled();
      expect(result.score).toBe(90);
      expect(result.rewards.xp).toBe(170); // First correct attempt
      expect(result.rewards.mlCoins).toBe(85);
    });

    it('should throw error if exercise not found', async () => {
      // Arrange - exercise not found
      mockExercisesService.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        controller.submitExercise(exerciseId, submitDto, mockRequest),
      ).rejects.toThrow(`Exercise ${exerciseId} not found`);
    });

    it('should validate answers format is required', async () => {
      // Arrange - invalid verdadero_falso answer format (missing statements)
      const invalidDto = {
        userId,
        answers: {} as any, // Empty answers - will fail validation
      };

      // Act & Assert - validator throws BadRequestException for invalid format
      await expect(
        controller.submitExercise(exerciseId, invalidDto, mockRequest),
      ).rejects.toThrow("Validation failed for exercise type 'verdadero_falso'");
    });
  });
});
