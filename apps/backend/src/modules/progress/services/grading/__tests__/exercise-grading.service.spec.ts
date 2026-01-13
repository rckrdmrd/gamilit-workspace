/**
 * ExerciseGradingService Unit Tests
 *
 * @description Tests for exercise grading service covering:
 * - Auto-grading via SQL function
 * - Manual grading application
 * - Rueda de Inferencias custom grading
 * - Feedback generation
 * - Score calculation
 *
 * Sprint 0 - P0-008: Increase coverage to 30%+
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, getEntityManagerToken } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ExerciseGradingService } from '../exercise-grading.service';
import { Exercise } from '@/modules/educational/entities';
import { ExerciseSubmission } from '../../../entities';
import { createMockRepository } from '@/__mocks__/repositories.mock';
import { TestDataFactory } from '@/__mocks__/services.mock';

/**
 * Creates a mock EntityManager
 */
function createMockEntityManager(): jest.Mocked<EntityManager> {
  return {
    query: jest.fn(),
    transaction: jest.fn(),
  } as any;
}

describe('ExerciseGradingService', () => {
  let service: ExerciseGradingService;
  let exerciseRepo: ReturnType<typeof createMockRepository>;
  let submissionRepo: ReturnType<typeof createMockRepository>;
  let entityManager: jest.Mocked<EntityManager>;

  // Test data
  const mockExercise = TestDataFactory.createExercise();
  const mockSubmission = {
    id: 'submission-123',
    user_id: 'user-123',
    exercise_id: mockExercise.id,
    score: 0,
    max_score: 100,
    status: 'pending',
    is_correct: false,
  };

  beforeEach(async () => {
    exerciseRepo = createMockRepository<Exercise>();
    submissionRepo = createMockRepository<ExerciseSubmission>();
    entityManager = createMockEntityManager();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExerciseGradingService,
        { provide: getRepositoryToken(Exercise, 'educational'), useValue: exerciseRepo },
        { provide: getRepositoryToken(ExerciseSubmission, 'progress'), useValue: submissionRepo },
        { provide: getEntityManagerToken('progress'), useValue: entityManager },
      ],
    }).compile();

    service = module.get<ExerciseGradingService>(ExerciseGradingService);

    jest.clearAllMocks();
  });

  describe('Service Definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  // =========================================================================
  // AUTO GRADE TESTS
  // =========================================================================

  describe('autoGrade', () => {
    const userId = 'user-123';
    const exerciseId = 'exercise-123';
    const answerData = { answer: 'test-answer' };

    beforeEach(() => {
      exerciseRepo.findOne.mockResolvedValue(mockExercise as any);
    });

    it('should throw NotFoundException if exercise not found', async () => {
      // Arrange
      exerciseRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.autoGrade(userId, exerciseId, answerData),
      ).rejects.toThrow(NotFoundException);
    });

    it('should use SQL function for standard exercises', async () => {
      // Arrange
      const sqlResult = [
        {
          score: 80,
          max_score: 100,
          is_correct: true,
          feedback: 'Good job!',
          details: { correct_answers: 4, total_questions: 5 },
          audit_id: 'audit-123',
        },
      ];
      entityManager.query.mockResolvedValue(sqlResult);

      // Act
      const result = await service.autoGrade(userId, exerciseId, answerData);

      // Assert
      expect(result.score).toBe(80);
      expect(result.maxScore).toBe(100);
      expect(result.isCorrect).toBe(true);
      expect(result.correctAnswers).toBe(4);
      expect(result.totalQuestions).toBe(5);
      expect(result.auditId).toBe('audit-123');
      expect(entityManager.query).toHaveBeenCalled();
    });

    it('should handle SQL validation errors', async () => {
      // Arrange
      entityManager.query.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(
        service.autoGrade(userId, exerciseId, answerData),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should use custom validation for rueda_inferencias', async () => {
      // Arrange
      const ruedaExercise = {
        ...mockExercise,
        exercise_type: 'rueda_inferencias',
        solution: {
          fragments: [
            {
              id: 'fragment-1',
              text: 'Test fragment',
              categoryExpectations: {
                'cat-literal': {
                  keywords: ['keyword1', 'keyword2'],
                  description: 'Test category',
                  example: 'Example',
                  points: 10,
                },
              },
            },
          ],
        },
      };
      exerciseRepo.findOne.mockResolvedValue(ruedaExercise as any);

      const fragmentStates = [
        {
          fragmentId: 'fragment-1',
          categoryId: 'cat-literal',
          userText: 'This contains keyword1 and keyword2',
          timeSpent: 30,
        },
      ];

      // Act
      const result = await service.autoGrade(
        userId,
        exerciseId,
        { fragmentStates },
      );

      // Assert
      expect(result.score).toBeGreaterThan(0);
      expect(result.details).toHaveProperty('byFragment');
    });
  });

  // =========================================================================
  // APPLY MANUAL GRADE TESTS
  // =========================================================================

  describe('applyManualGrade', () => {
    const submissionId = 'submission-123';
    const grade = {
      finalScore: 85,
      graderId: 'teacher-123',
      feedback: 'Excellent work!',
    };

    // Helper to create fresh submission copy for each test
    const createFreshSubmission = () => ({
      id: 'submission-123',
      user_id: 'user-123',
      exercise_id: mockExercise.id,
      score: 0,
      max_score: 100,
      status: 'pending',
      is_correct: false,
    });

    beforeEach(() => {
      submissionRepo.findOne.mockResolvedValue(createFreshSubmission() as any);
      submissionRepo.save.mockImplementation((data) => Promise.resolve(data as any));
    });

    it('should apply manual grade successfully', async () => {
      // Act
      const result = await service.applyManualGrade(submissionId, grade);

      // Assert
      expect(result.score).toBe(85);
      expect(result.status).toBe('graded');
      expect(result.is_correct).toBe(true);
      expect(result.graded_at).toBeDefined();
      expect(submissionRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if submission not found', async () => {
      // Arrange
      submissionRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.applyManualGrade(submissionId, grade),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if already graded', async () => {
      // Arrange
      const gradedSubmission = { ...mockSubmission, status: 'graded' };
      submissionRepo.findOne.mockResolvedValue(gradedSubmission as any);

      // Act & Assert
      await expect(
        service.applyManualGrade(submissionId, grade),
      ).rejects.toThrow('Submission already graded');
    });

    it('should validate score is within valid range', async () => {
      // Arrange
      const invalidGrade = { ...grade, finalScore: 150 }; // > max_score

      // Act & Assert
      await expect(
        service.applyManualGrade(submissionId, invalidGrade),
      ).rejects.toThrow('Manual score must be between');
    });

    it('should reject negative scores', async () => {
      // Arrange
      const invalidGrade = { ...grade, finalScore: -10 };

      // Act & Assert
      await expect(
        service.applyManualGrade(submissionId, invalidGrade),
      ).rejects.toThrow(BadRequestException);
    });

    it('should mark as correct if score >= 60%', async () => {
      // Arrange
      const passingGrade = { ...grade, finalScore: 60 };

      // Act
      const result = await service.applyManualGrade(submissionId, passingGrade);

      // Assert
      expect(result.is_correct).toBe(true);
    });

    it('should mark as incorrect if score < 60%', async () => {
      // Arrange
      const failingGrade = { ...grade, finalScore: 50 };

      // Act
      const result = await service.applyManualGrade(submissionId, failingGrade);

      // Assert
      expect(result.is_correct).toBe(false);
    });

    it('should use default feedback if not provided', async () => {
      // Arrange
      const gradeWithoutFeedback = {
        finalScore: 85,
      };

      // Act
      const result = await service.applyManualGrade(submissionId, gradeWithoutFeedback);

      // Assert
      expect(result.feedback).toContain('Calificacion manual');
      expect(result.feedback).toContain('85/100');
    });
  });

  // =========================================================================
  // GENERATE FEEDBACK TESTS
  // =========================================================================

  describe('generateFeedback', () => {
    it('should return perfect score message for 100% without hints', () => {
      // Act
      const result = service.generateFeedback(100, 100, false);

      // Assert
      expect(result).toContain('Perfect score');
    });

    it('should return different message if hints were used', () => {
      // Act
      const result = service.generateFeedback(100, 100, true);

      // Assert
      expect(result).not.toContain('Perfect score');
    });

    it('should return outstanding message for 90%+', () => {
      // Act
      const result = service.generateFeedback(95, 100, false);

      // Assert
      expect(result).toContain('Outstanding');
    });

    it('should return good job message for 70-89%', () => {
      // Act
      const result = service.generateFeedback(75, 100, false);

      // Assert
      expect(result).toContain('Good job');
    });

    it('should return nice effort message for 60-69%', () => {
      // Act
      const result = service.generateFeedback(65, 100, false);

      // Assert
      expect(result).toContain('Nice effort');
    });

    it('should return keep practicing message for < 60%', () => {
      // Act
      const result = service.generateFeedback(50, 100, false);

      // Assert
      expect(result).toContain('Keep practicing');
    });

    it('should handle non-100 max scores correctly', () => {
      // Act
      const result = service.generateFeedback(45, 50, false); // 90%

      // Assert
      expect(result).toContain('Outstanding');
    });
  });

  // =========================================================================
  // RUEDA INFERENCIAS GRADING TESTS
  // =========================================================================

  describe('autoGrade - Rueda de Inferencias', () => {
    const ruedaExercise = {
      ...mockExercise,
      exercise_type: 'rueda_inferencias',
      max_score: 100,
      passing_score: 60,
      solution: {
        fragments: [
          {
            id: 'fragment-1',
            text: 'Test fragment',
            categoryExpectations: {
              'cat-literal': {
                keywords: ['fact', 'evidence', 'data'],
                description: 'Literal comprehension',
                example: 'The text says...',
                points: 25,
              },
              'cat-inferencial': {
                keywords: ['infer', 'conclude', 'suggest'],
                description: 'Inferential thinking',
                example: 'This implies that...',
                points: 25,
              },
            },
          },
        ],
      },
    };

    beforeEach(() => {
      exerciseRepo.findOne.mockResolvedValue(ruedaExercise as any);
    });

    it('should grade based on keyword matching', async () => {
      // Arrange
      const fragmentStates = [
        {
          fragmentId: 'fragment-1',
          categoryId: 'cat-literal',
          userText: 'The text presents clear facts and evidence with supporting data',
          timeSpent: 45,
        },
      ];

      // Act
      const result = await service.autoGrade(
        'user-123',
        ruedaExercise.id,
        { fragmentStates },
      );

      // Assert
      expect(result.score).toBeGreaterThan(0);
      expect(result.details?.byFragment).toHaveLength(1);
    });

    it('should give full points for 50%+ keyword coverage', async () => {
      // Arrange
      const fragmentStates = [
        {
          fragmentId: 'fragment-1',
          categoryId: 'cat-literal',
          userText: 'fact evidence', // 2 out of 3 keywords = 66%
          timeSpent: 30,
        },
      ];

      // Act
      const result = await service.autoGrade(
        'user-123',
        ruedaExercise.id,
        { fragmentStates },
      );

      // Assert
      const fragmentScore = result.details?.byFragment[0].score;
      expect(fragmentScore).toBe(25); // Full points
    });

    it('should give partial points for 25-49% keyword coverage', async () => {
      // Arrange
      const fragmentStates = [
        {
          fragmentId: 'fragment-1',
          categoryId: 'cat-literal',
          userText: 'fact', // 1 out of 3 keywords = 33%
          timeSpent: 30,
        },
      ];

      // Act
      const result = await service.autoGrade(
        'user-123',
        ruedaExercise.id,
        { fragmentStates },
      );

      // Assert
      const fragmentScore = result.details?.byFragment[0].score;
      expect(fragmentScore).toBeGreaterThan(0);
      expect(fragmentScore).toBeLessThan(25);
    });

    it('should give minimal points for long text with low keyword match', async () => {
      // Arrange
      const fragmentStates = [
        {
          fragmentId: 'fragment-1',
          categoryId: 'cat-literal',
          userText: 'This is a long response without relevant keywords to the category',
          timeSpent: 60,
        },
      ];

      // Act
      const result = await service.autoGrade(
        'user-123',
        ruedaExercise.id,
        { fragmentStates },
      );

      // Assert
      const fragmentScore = result.details?.byFragment[0].score;
      expect(fragmentScore).toBeGreaterThanOrEqual(0);
      expect(fragmentScore).toBeLessThan(10);
    });

    it('should give zero points for empty response', async () => {
      // Arrange
      const fragmentStates = [
        {
          fragmentId: 'fragment-1',
          categoryId: 'cat-literal',
          userText: '',
          timeSpent: 0,
        },
      ];

      // Act
      const result = await service.autoGrade(
        'user-123',
        ruedaExercise.id,
        { fragmentStates },
      );

      // Assert
      const fragmentScore = result.details?.byFragment[0].score;
      expect(fragmentScore).toBe(0);
    });

    it('should handle multiple fragments', async () => {
      // Arrange
      const fragmentStates = [
        {
          fragmentId: 'fragment-1',
          categoryId: 'cat-literal',
          userText: 'fact evidence data',
          timeSpent: 30,
        },
        {
          fragmentId: 'fragment-1',
          categoryId: 'cat-inferencial',
          userText: 'infer conclude suggest',
          timeSpent: 40,
        },
      ];

      // Act
      const result = await service.autoGrade(
        'user-123',
        ruedaExercise.id,
        { fragmentStates },
      );

      // Assert
      expect(result.details?.byFragment).toHaveLength(2);
      expect(result.totalQuestions).toBe(2);
    });

    it('should normalize score to max_score', async () => {
      // Arrange
      const fragmentStates = [
        {
          fragmentId: 'fragment-1',
          categoryId: 'cat-literal',
          userText: 'fact evidence data',
          timeSpent: 30,
        },
      ];

      // Act
      const result = await service.autoGrade(
        'user-123',
        ruedaExercise.id,
        { fragmentStates },
      );

      // Assert
      expect(result.maxScore).toBe(100);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should mark as correct if score >= passing_score', async () => {
      // Arrange
      const fragmentStates = [
        {
          fragmentId: 'fragment-1',
          categoryId: 'cat-literal',
          userText: 'fact evidence data',
          timeSpent: 30,
        },
        {
          fragmentId: 'fragment-1',
          categoryId: 'cat-inferencial',
          userText: 'infer conclude suggest',
          timeSpent: 40,
        },
      ];

      // Act
      const result = await service.autoGrade(
        'user-123',
        ruedaExercise.id,
        { fragmentStates },
      );

      // Assert
      if (result.score >= 60) {
        expect(result.isCorrect).toBe(true);
      } else {
        expect(result.isCorrect).toBe(false);
      }
    });

    it('should handle missing fragment in solution', async () => {
      // Arrange
      const fragmentStates = [
        {
          fragmentId: 'non-existent-fragment',
          categoryId: 'cat-literal',
          userText: 'some text',
          timeSpent: 30,
        },
      ];

      // Act
      const result = await service.autoGrade(
        'user-123',
        ruedaExercise.id,
        { fragmentStates },
      );

      // Assert
      expect(result.details?.byFragment[0].feedback).toContain('not found');
      expect(result.details?.byFragment[0].score).toBe(0);
    });
  });
});
