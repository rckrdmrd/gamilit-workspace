import {
  IsUUID,
  IsObject,
  IsOptional,
  IsNumber,
  IsInt,
  IsArray,
  IsString,
  IsNotEmpty,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * SubmitExerciseDto
 *
 * @description DTO para enviar respuestas de ejercicio.
 * Define el contrato entre Frontend y Backend para el endpoint POST /exercises/:id/submit
 *
 * @note FE-061: Este DTO estandariza la estructura de envío.
 * Mantiene compatibilidad temporal con formato antiguo.
 *
 * @example Formato nuevo (estándar):
 * ```json
 * {
 *   "answers": { "clues": { "h1": "SORBONA", "v1": "NOBEL" } },
 *   "startedAt": 1638392400000,
 *   "hintsUsed": 2,
 *   "powerupsUsed": ["hint_50_50"]
 * }
 * ```
 *
 * @example Formato antiguo (deprecated):
 * ```json
 * {
 *   "userId": "uuid",
 *   "submitted_answers": { "clues": { "h1": "SORBONA" } },
 *   "time_spent_seconds": 120,
 *   "hints_used": 2
 * }
 * ```
 */
export class SubmitExerciseDto {
  // ========================================
  // FORMATO NUEVO (ESTÁNDAR)
  // ========================================

  /**
   * Respuestas del ejercicio
   * La estructura varía según el tipo de ejercicio
   *
   * @example Crucigrama: { "clues": { "h1": "SORBONA", "v1": "NOBEL" } }
   * @example Sopa de letras: { "words": ["SORBONA", "NOBEL"] }
   */
  @ApiProperty({
    description: 'Respuestas del ejercicio (estructura varía por tipo)',
    example: { clues: { h1: 'SORBONA', v1: 'NOBEL' } },
    required: false, // Opcional porque también se acepta submitted_answers
  })
  @IsOptional()
  @IsObject({ message: 'answers must be an object' })
  @IsNotEmpty({ message: 'answers cannot be empty' })
    answers?: Record<string, any>;

  /**
   * Timestamp de inicio del ejercicio (milisegundos desde epoch)
   * Usado para calcular time_spent_seconds
   */
  @ApiProperty({
    description: 'Timestamp de inicio (ms desde epoch)',
    example: 1638392400000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
    startedAt?: number;

  /**
   * Cantidad de pistas/hints usados durante el ejercicio
   */
  @ApiProperty({
    description: 'Cantidad de pistas usadas',
    example: 2,
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
    hintsUsed?: number;

  /**
   * Lista de comodines/powerups utilizados
   */
  @ApiProperty({
    description: 'Comodines utilizados',
    example: ['hint_50_50', 'extra_time'],
    required: false,
    default: [],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
    powerupsUsed?: string[];

  // ========================================
  // FORMATO ANTIGUO (DEPRECATED)
  // ========================================

  /**
   * @deprecated Usar JWT authentication en lugar de userId en body
   * Se mantiene temporalmente para compatibilidad con frontend antiguo
   */
  @ApiProperty({
    description: '[DEPRECATED] ID del usuario (usar JWT)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
    deprecated: true,
  })
  @IsOptional()
  @IsUUID('4', { message: 'userId must be a valid UUID v4' })
    userId?: string;

  /**
   * @deprecated Usar 'answers' en su lugar
   */
  @ApiProperty({
    description: '[DEPRECATED] Usar campo "answers"',
    example: { clues: { h1: 'SORBONA' } },
    required: false,
    deprecated: true,
  })
  @IsOptional()
  @IsObject()
    submitted_answers?: Record<string, any>;

  /**
   * @deprecated Usar 'startedAt' para calcular tiempo
   */
  @ApiProperty({
    description: '[DEPRECATED] Usar "startedAt" para calcular tiempo',
    example: 120,
    required: false,
    deprecated: true,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
    time_spent_seconds?: number;

  /**
   * @deprecated Usar 'hintsUsed' (camelCase)
   */
  @ApiProperty({
    description: '[DEPRECATED] Usar "hintsUsed"',
    example: 2,
    required: false,
    deprecated: true,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
    hints_used?: number;

  /**
   * @deprecated Usar 'powerupsUsed'
   */
  @ApiProperty({
    description: '[DEPRECATED] Usar "powerupsUsed"',
    example: ['hint_50_50'],
    required: false,
    deprecated: true,
  })
  @IsOptional()
  @IsArray()
    comodines_used?: string[];
}
