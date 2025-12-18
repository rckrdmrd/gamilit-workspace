/**
 * ExerciseValidatorService
 *
 * @description Service for validating exercise answers before grading.
 * Extracted from ExerciseSubmissionService (P0-006: God Class division).
 *
 * Responsibilities:
 * - Exercise type validation (diario_multimedia, comic_digital, video_carta)
 * - Answer structure validation
 * - Anti-redundancy checks (e.g., Completar Espacios exercise 1.3)
 * - Minimum requirements validation (word count, panel count, etc.)
 *
 * @see ExerciseSubmissionService - Orchestrates validation + grading + rewards
 * @see ExerciseGradingService - Handles scoring after validation
 */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exercise } from '@/modules/educational/entities';
import { ExerciseAnswerValidator } from '../../dto/answers';

/**
 * Validation result structure
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Anti-redundancy check result
 */
export interface RedundancyCheckResult {
  hasRedundancy: boolean;
  affectedFields?: string[];
  detectedValue?: string;
  message?: string;
}

@Injectable()
export class ExerciseValidatorService {
  constructor(
    @InjectRepository(Exercise, 'educational')
    private readonly exerciseRepo: Repository<Exercise>,
  ) {}

  /**
   * Validates exercise answers based on type and requirements
   *
   * @param exerciseId - Exercise ID
   * @param answers - User submitted answers
   * @returns ValidationResult with status and errors
   */
  async validateExercise(
    exerciseId: string,
    answers: Record<string, unknown>,
  ): Promise<ValidationResult> {
    const exercise = await this.exerciseRepo.findOne({ where: { id: exerciseId } });

    if (!exercise) {
      throw new NotFoundException(`Exercise ${exerciseId} not found`);
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    const metadata: Record<string, unknown> = {};

    // Validate based on exercise type
    switch (exercise.exercise_type) {
      case 'diario_multimedia':
        this.validateDiarioMultimedia(answers, errors, metadata);
        break;

      case 'comic_digital':
        this.validateComicDigital(answers, errors, metadata);
        break;

      case 'video_carta':
        this.validateVideoCarta(answers, errors, metadata);
        break;

      case 'completar_espacios':
        const redundancyResult = this.checkAntiRedundancy(answers);
        if (redundancyResult.hasRedundancy) {
          errors.push(redundancyResult.message || 'Redundancy detected');
        }
        break;

      default:
        // Default validation via ExerciseAnswerValidator
        break;
    }

    // FE-059: Validate answer structure using centralized validator
    try {
      await ExerciseAnswerValidator.validate(exercise.exercise_type, answers);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metadata,
    };
  }

  /**
   * Validates diario_multimedia exercise requirements
   *
   * @param answers - User answers
   * @param errors - Errors array (mutated)
   * @param metadata - Metadata object (mutated)
   */
  private validateDiarioMultimedia(
    answers: Record<string, unknown>,
    errors: string[],
    metadata: Record<string, unknown>,
  ): void {
    const content = (answers.content || answers.text || '') as string;
    const wordCount = this.countWords(content);
    metadata.wordCount = wordCount;

    const minWords = 150;
    if (wordCount < minWords) {
      errors.push(
        `El diario debe tener al menos ${minWords} palabras. Actualmente tienes ${wordCount} palabras.`,
      );
    }
  }

  /**
   * Validates comic_digital exercise requirements
   *
   * @param answers - User answers
   * @param errors - Errors array (mutated)
   * @param metadata - Metadata object (mutated)
   */
  private validateComicDigital(
    answers: Record<string, unknown>,
    errors: string[],
    metadata: Record<string, unknown>,
  ): void {
    const panels = (answers.panels || []) as Array<{ text?: string; image?: string; imageUrl?: string }>;
    const minPanels = 4;
    metadata.panelCount = panels.length;

    if (panels.length < minPanels) {
      errors.push(
        `El comic debe tener al menos ${minPanels} paneles. Actualmente tienes ${panels.length} paneles.`,
      );
      return;
    }

    // Validate each panel has content
    const emptyPanels = panels.filter((panel) => {
      const hasText = panel.text && panel.text.trim().length > 0;
      const hasImage = panel.image || panel.imageUrl;
      return !hasText && !hasImage;
    });

    if (emptyPanels.length > 0) {
      errors.push(
        `Todos los paneles deben tener contenido (texto o imagen). Tienes ${emptyPanels.length} panel(es) vacio(s).`,
      );
    }
  }

  /**
   * Validates video_carta exercise requirements
   *
   * @param answers - User answers
   * @param errors - Errors array (mutated)
   * @param metadata - Metadata object (mutated)
   */
  private validateVideoCarta(
    answers: Record<string, unknown>,
    errors: string[],
    metadata: Record<string, unknown>,
  ): void {
    const videoUrl = answers.videoUrl || answers.url || answers.video;
    const answerMetadata = (answers.metadata || {}) as { duration?: number };

    if (!videoUrl) {
      errors.push('Debes subir o proporcionar la URL de tu video carta.');
      return;
    }

    metadata.videoUrl = videoUrl;

    const minDuration = 30; // seconds
    if (answerMetadata.duration !== undefined) {
      metadata.duration = answerMetadata.duration;
      if (answerMetadata.duration < minDuration) {
        errors.push(
          `La video carta debe tener al menos ${minDuration} segundos de duracion. Tu video tiene ${answerMetadata.duration} segundos.`,
        );
      }
    }
  }

  /**
   * Checks for anti-redundancy in completar_espacios exercises
   *
   * @description Exercise 1.3 requires spaces 5 and 6 to be different words
   *
   * @param answers - User answers
   * @returns RedundancyCheckResult
   */
  checkAntiRedundancy(answers: Record<string, unknown>): RedundancyCheckResult {
    const blanks = (answers.blanks || {}) as Record<string, string>;

    if (blanks['5'] && blanks['6']) {
      const space5 = String(blanks['5']).toLowerCase().trim();
      const space6 = String(blanks['6']).toLowerCase().trim();

      if (space5 === space6) {
        return {
          hasRedundancy: true,
          affectedFields: ['5', '6'],
          detectedValue: space5,
          message: `Los espacios 5 y 6 no pueden tener la misma palabra. Has puesto '${space5}' en ambos. Elige dos palabras DIFERENTES del grupo: ciencias, matematicas, fisica.`,
        };
      }
    }

    return { hasRedundancy: false };
  }

  /**
   * Checks if exercise requires manual grading
   *
   * @param exerciseId - Exercise ID
   * @returns true if manual grading required
   */
  async requiresManualGrading(exerciseId: string): Promise<boolean> {
    const exercise = await this.exerciseRepo.findOne({
      where: { id: exerciseId },
      select: ['requires_manual_grading'],
    });

    return exercise?.requires_manual_grading ?? false;
  }

  /**
   * Counts words in text content
   *
   * @param content - Text content
   * @returns Word count
   */
  countWords(content: unknown): number {
    if (typeof content !== 'string') return 0;
    return content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }
}
