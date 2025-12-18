import {
  IsUUID,
  IsOptional,
  IsObject,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

/**
 * AutoSaveProgressDto
 *
 * @description DTO para auto-guardar progreso parcial de ejercicios.
 * Permite guardar respuestas intermedias para evitar pérdida de trabajo
 * si el estudiante cierra el navegador.
 *
 * @usage
 * - Frontend debe llamar a POST /progress/exercises/:id/autosave cada 30-60 segundos
 * - Al recargar ejercicio, llamar a GET /progress/exercises/:id/autosave
 *
 * @note Acepta campos en camelCase (partialAnswers) o snake_case (partial_answers)
 *
 * @see ExerciseSubmission entity (status: 'draft' para progreso parcial)
 */
export class AutoSaveProgressDto {
  /**
   * ID del ejercicio (opcional en body, viene del URL param)
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  @ApiProperty({
    description: 'ID del ejercicio en formato UUID (opcional - viene del URL param)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4')
  @Expose({ name: 'exerciseId' })
  @Transform(({ obj }) => obj.exercise_id || obj.exerciseId)
    exercise_id?: string;

  /**
   * Respuestas parciales del estudiante
   * La estructura varía según tipo de ejercicio
   * Acepta: partial_answers (snake_case) o partialAnswers (camelCase)
   *
   * @example
   * {
   *   "question_1": "respuesta parcial",
   *   "question_2": { "option": "A" },
   *   "question_3": null
   * }
   */
  @ApiProperty({
    description: 'Respuestas parciales del estudiante (estructura varía por tipo de ejercicio)',
    example: {
      question_1: 'respuesta parcial',
      question_2: { option: 'A' },
      question_3: null,
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  @Expose({ name: 'partialAnswers' })
  @Transform(({ obj }) => obj.partial_answers || obj.partialAnswers)
    partial_answers?: Record<string, unknown>;

  /**
   * Tiempo transcurrido en el ejercicio (segundos)
   * Acepta: time_spent_seconds (snake_case) o timeSpentSeconds (camelCase)
   * @example 180
   */
  @ApiProperty({
    description: 'Tiempo transcurrido en el ejercicio (en segundos)',
    example: 180,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Expose({ name: 'timeSpentSeconds' })
  @Transform(({ obj }) => obj.time_spent_seconds ?? obj.timeSpentSeconds)
    time_spent_seconds?: number;

  /**
   * Metadatos adicionales del progreso
   *
   * Puede incluir:
   * - Estado del UI (sección actual, scroll position, etc.)
   * - Hints usados hasta el momento
   * - Comodines consumidos
   * - Fecha del último auto-save
   *
   * @example
   * {
   *   "current_section": 2,
   *   "hints_used": 1,
   *   "comodines_used": ["pistas"],
   *   "scroll_position": 450,
   *   "last_saved_at": "2025-01-20T10:30:00Z"
   * }
   */
  @ApiProperty({
    description: 'Metadatos adicionales (estado UI, hints usados, comodines, etc.)',
    example: {
      current_section: 2,
      hints_used: 1,
      comodines_used: ['pistas'],
      scroll_position: 450,
      last_saved_at: '2025-01-20T10:30:00Z',
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
    metadata?: Record<string, unknown>;
}
