/**
 * ExerciseValidatorService Unit Tests
 *
 * @description Tests for exercise validation service covering:
 * - Diario multimedia validation (word count)
 * - Comic digital validation (panel count, content)
 * - Video carta validation (URL, duration)
 * - Anti-redundancy checks (completar espacios)
 * - Manual grading flag checking
 *
 * Sprint 0 - P0-008: Increase coverage to 30%+
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ExerciseValidatorService } from '../exercise-validator.service';
import { Exercise } from '@/modules/educational/entities';
import { createMockRepository } from '@/__mocks__/repositories.mock';
import { TestDataFactory } from '@/__mocks__/services.mock';
import { ExerciseAnswerValidator } from '../../../dto/answers';

describe('ExerciseValidatorService', () => {
  let service: ExerciseValidatorService;
  let exerciseRepo: ReturnType<typeof createMockRepository>;

  // Test data
  const mockExercise = TestDataFactory.createExercise();

  beforeEach(async () => {
    exerciseRepo = createMockRepository<Exercise>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExerciseValidatorService,
        { provide: getRepositoryToken(Exercise, 'educational'), useValue: exerciseRepo },
      ],
    }).compile();

    service = module.get<ExerciseValidatorService>(ExerciseValidatorService);

    jest.clearAllMocks();

    // Mock ExerciseAnswerValidator.validate to avoid DTO structure validation
    // interfering with type-specific validator tests (must be after clearAllMocks)
    jest.spyOn(ExerciseAnswerValidator, 'validate').mockResolvedValue(undefined);
  });

  describe('Service Definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  // =========================================================================
  // VALIDATE EXERCISE TESTS
  // =========================================================================

  describe('validateExercise', () => {
    it('should throw NotFoundException if exercise not found', async () => {
      // Arrange
      exerciseRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.validateExercise('non-existent-id', {}),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return valid result for valid answers', async () => {
      // Arrange
      const exercise = {
        ...mockExercise,
        exercise_type: 'multiple_choice',
      };
      exerciseRepo.findOne.mockResolvedValue(exercise as any);

      // Act
      const result = await service.validateExercise(exercise.id, {
        answer: 'option-1',
      });

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  // =========================================================================
  // DIARIO MULTIMEDIA VALIDATION TESTS
  // =========================================================================

  describe('validateExercise - diario_multimedia', () => {
    const exerciseId = 'diario-123';

    beforeEach(() => {
      const exercise = {
        ...mockExercise,
        id: exerciseId,
        exercise_type: 'diario_multimedia',
      };
      exerciseRepo.findOne.mockResolvedValue(exercise as any);
    });

    it('should pass validation with sufficient word count', async () => {
      // Arrange - 200 words (> 150 minimum)
      const content = Array(200).fill('palabra').join(' ');

      // Act
      const result = await service.validateExercise(exerciseId, {
        content,
      });

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.metadata?.wordCount).toBeGreaterThanOrEqual(150);
    });

    it('should fail validation with insufficient word count', async () => {
      // Arrange - Only 50 words (< 150 minimum)
      const content = Array(50).fill('palabra').join(' ');

      // Act
      const result = await service.validateExercise(exerciseId, {
        content,
      });

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.stringContaining('al menos 150 palabras'),
      );
      expect(result.metadata?.wordCount).toBe(50);
    });

    it('should handle empty content', async () => {
      // Act
      const result = await service.validateExercise(exerciseId, {
        content: '',
      });

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.metadata?.wordCount).toBe(0);
    });

    it('should accept content in "text" field as well', async () => {
      // Arrange
      const text = Array(200).fill('palabra').join(' ');

      // Act
      const result = await service.validateExercise(exerciseId, {
        text,
      });

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.metadata?.wordCount).toBeGreaterThanOrEqual(150);
    });
  });

  // =========================================================================
  // COMIC DIGITAL VALIDATION TESTS
  // =========================================================================

  describe('validateExercise - comic_digital', () => {
    const exerciseId = 'comic-123';

    beforeEach(() => {
      const exercise = {
        ...mockExercise,
        id: exerciseId,
        exercise_type: 'comic_digital',
      };
      exerciseRepo.findOne.mockResolvedValue(exercise as any);
    });

    it('should pass validation with sufficient panels', async () => {
      // Arrange - 6 panels with content
      const panels = [
        { text: 'Panel 1 text', image: 'image1.png' },
        { text: 'Panel 2 text', image: 'image2.png' },
        { text: 'Panel 3 text', image: 'image3.png' },
        { text: 'Panel 4 text', image: 'image4.png' },
        { text: 'Panel 5 text', image: 'image5.png' },
        { text: 'Panel 6 text', image: 'image6.png' },
      ];

      // Act
      const result = await service.validateExercise(exerciseId, {
        panels,
      });

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.metadata?.panelCount).toBe(6);
    });

    it('should fail validation with insufficient panels', async () => {
      // Arrange - Only 2 panels (< 4 minimum)
      const panels = [
        { text: 'Panel 1', image: 'image1.png' },
        { text: 'Panel 2', image: 'image2.png' },
      ];

      // Act
      const result = await service.validateExercise(exerciseId, {
        panels,
      });

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.stringContaining('al menos 4 paneles'),
      );
    });

    it('should fail validation if panels have no content', async () => {
      // Arrange - 4 panels but all empty
      const panels = [
        { text: '', image: '' },
        { text: '', image: '' },
        { text: '', image: '' },
        { text: '', image: '' },
      ];

      // Act
      const result = await service.validateExercise(exerciseId, {
        panels,
      });

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.stringContaining('contenido (texto o imagen)'),
      );
    });

    it('should accept panels with only text', async () => {
      // Arrange
      const panels = [
        { text: 'Panel 1 text only' },
        { text: 'Panel 2 text only' },
        { text: 'Panel 3 text only' },
        { text: 'Panel 4 text only' },
      ];

      // Act
      const result = await service.validateExercise(exerciseId, {
        panels,
      });

      // Assert
      expect(result.isValid).toBe(true);
    });

    it('should accept panels with only images', async () => {
      // Arrange
      const panels = [
        { imageUrl: 'image1.png' },
        { imageUrl: 'image2.png' },
        { imageUrl: 'image3.png' },
        { imageUrl: 'image4.png' },
      ];

      // Act
      const result = await service.validateExercise(exerciseId, {
        panels,
      });

      // Assert
      expect(result.isValid).toBe(true);
    });
  });

  // =========================================================================
  // VIDEO CARTA VALIDATION TESTS
  // =========================================================================

  describe('validateExercise - video_carta', () => {
    const exerciseId = 'video-123';

    beforeEach(() => {
      const exercise = {
        ...mockExercise,
        id: exerciseId,
        exercise_type: 'video_carta',
      };
      exerciseRepo.findOne.mockResolvedValue(exercise as any);
    });

    it('should pass validation with valid video URL and duration', async () => {
      // Arrange
      const answers = {
        videoUrl: 'https://youtube.com/watch?v=abc123',
        metadata: {
          duration: 45, // seconds
        },
      };

      // Act
      const result = await service.validateExercise(exerciseId, answers);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.metadata?.videoUrl).toBe(answers.videoUrl);
      expect(result.metadata?.duration).toBe(45);
    });

    it('should fail validation without video URL', async () => {
      // Act
      const result = await service.validateExercise(exerciseId, {});

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.stringContaining('subir o proporcionar la URL de tu video'),
      );
    });

    it('should fail validation if video is too short', async () => {
      // Arrange
      const answers = {
        videoUrl: 'https://youtube.com/watch?v=abc123',
        metadata: {
          duration: 15, // Only 15 seconds (< 30 minimum)
        },
      };

      // Act
      const result = await service.validateExercise(exerciseId, answers);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.stringContaining('al menos 30 segundos'),
      );
    });

    it('should accept "url" field as video URL', async () => {
      // Arrange
      const answers = {
        url: 'https://youtube.com/watch?v=abc123',
        metadata: { duration: 60 },
      };

      // Act
      const result = await service.validateExercise(exerciseId, answers);

      // Assert
      expect(result.isValid).toBe(true);
    });

    it('should accept "video" field as video URL', async () => {
      // Arrange
      const answers = {
        video: 'https://youtube.com/watch?v=abc123',
        metadata: { duration: 60 },
      };

      // Act
      const result = await service.validateExercise(exerciseId, answers);

      // Assert
      expect(result.isValid).toBe(true);
    });
  });

  // =========================================================================
  // ANTI-REDUNDANCY CHECK TESTS
  // =========================================================================

  describe('checkAntiRedundancy', () => {
    it('should detect redundancy when blanks 5 and 6 have same value', () => {
      // Arrange
      const answers = {
        blanks: {
          '1': 'palabra1',
          '2': 'palabra2',
          '3': 'palabra3',
          '4': 'palabra4',
          '5': 'ciencias',
          '6': 'ciencias', // Same as blank 5
        },
      };

      // Act
      const result = service.checkAntiRedundancy(answers);

      // Assert
      expect(result.hasRedundancy).toBe(true);
      expect(result.affectedFields).toEqual(['5', '6']);
      expect(result.detectedValue).toBe('ciencias');
      expect(result.message).toContain('misma palabra');
    });

    it('should pass when blanks 5 and 6 have different values', () => {
      // Arrange
      const answers = {
        blanks: {
          '1': 'palabra1',
          '2': 'palabra2',
          '5': 'ciencias',
          '6': 'matematicas',
        },
      };

      // Act
      const result = service.checkAntiRedundancy(answers);

      // Assert
      expect(result.hasRedundancy).toBe(false);
    });

    it('should be case-insensitive', () => {
      // Arrange
      const answers = {
        blanks: {
          '5': 'Ciencias',
          '6': 'ciencias',
        },
      };

      // Act
      const result = service.checkAntiRedundancy(answers);

      // Assert
      expect(result.hasRedundancy).toBe(true);
    });

    it('should trim whitespace before comparing', () => {
      // Arrange
      const answers = {
        blanks: {
          '5': '  ciencias  ',
          '6': 'ciencias',
        },
      };

      // Act
      const result = service.checkAntiRedundancy(answers);

      // Assert
      expect(result.hasRedundancy).toBe(true);
    });

    it('should return false if blanks missing', () => {
      // Arrange
      const answers = {
        blanks: {
          '1': 'palabra1',
        },
      };

      // Act
      const result = service.checkAntiRedundancy(answers);

      // Assert
      expect(result.hasRedundancy).toBe(false);
    });
  });

  // =========================================================================
  // REQUIRES MANUAL GRADING TESTS
  // =========================================================================

  describe('requiresManualGrading', () => {
    it('should return true for exercises requiring manual grading', async () => {
      // Arrange
      const exercise = {
        ...mockExercise,
        requires_manual_grading: true,
      };
      exerciseRepo.findOne.mockResolvedValue(exercise as any);

      // Act
      const result = await service.requiresManualGrading(exercise.id);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for auto-graded exercises', async () => {
      // Arrange
      const exercise = {
        ...mockExercise,
        requires_manual_grading: false,
      };
      exerciseRepo.findOne.mockResolvedValue(exercise as any);

      // Act
      const result = await service.requiresManualGrading(exercise.id);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false if exercise not found', async () => {
      // Arrange
      exerciseRepo.findOne.mockResolvedValue(null);

      // Act
      const result = await service.requiresManualGrading('non-existent');

      // Assert
      expect(result).toBe(false);
    });
  });

  // =========================================================================
  // COUNT WORDS TESTS
  // =========================================================================

  describe('countWords', () => {
    it('should count words correctly', () => {
      // Arrange
      const content = 'This is a test sentence with seven words';

      // Act
      const result = service.countWords(content);

      // Assert
      expect(result).toBe(8);
    });

    it('should handle multiple spaces', () => {
      // Arrange
      const content = 'This   has    multiple     spaces';

      // Act
      const result = service.countWords(content);

      // Assert
      expect(result).toBe(4);
    });

    it('should return 0 for empty string', () => {
      // Act
      const result = service.countWords('');

      // Assert
      expect(result).toBe(0);
    });

    it('should return 0 for non-string input', () => {
      // Act
      const result = service.countWords(123 as any);

      // Assert
      expect(result).toBe(0);
    });

    it('should handle newlines and tabs', () => {
      // Arrange
      const content = 'Line one\nLine two\tWith tab';

      // Act
      const result = service.countWords(content);

      // Assert
      expect(result).toBe(6);
    });

    it('should trim leading/trailing whitespace', () => {
      // Arrange
      const content = '   word1 word2 word3   ';

      // Act
      const result = service.countWords(content);

      // Assert
      expect(result).toBe(3);
    });
  });
});
