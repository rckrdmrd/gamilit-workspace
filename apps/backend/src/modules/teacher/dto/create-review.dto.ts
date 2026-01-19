import {
  IsUUID,
  IsObject,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para crear una evaluación manual (ManualReview)
 *
 * @description Utilizado por docentes para evaluar ejercicios creativos de módulos 4 y 5
 */
export class CreateReviewDto {
  @ApiProperty({
    description: 'ID del submission a evaluar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
    submissionId!: string;

  @ApiProperty({
    description: 'Puntuaciones por criterio de rúbrica',
    example: { creativity: 25, accuracy: 30, presentation: 20 },
  })
  @IsObject()
    rubricScores!: Record<string, number>;

  @ApiProperty({
    description: 'Puntuación total calculada (0-100)',
    example: 85,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
    totalScore!: number;

  @ApiProperty({
    description: 'Comentarios generales del docente',
    example: 'Excelente trabajo, muy creativo y bien presentado.',
    required: false,
  })
  @IsString()
  @IsOptional()
    generalFeedback?: string;

  @ApiProperty({
    description: 'Feedback detallado por sección/criterio',
    example: {
      creativity: 'Ideas muy originales',
      presentation: 'Buena estructura y diseño',
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
    detailedFeedback?: Record<string, unknown>;
}

/**
 * DTO para actualizar una evaluación manual existente
 * TASK-2026-01-18-014: Todos los campos son opcionales para permitir actualizaciones parciales
 * NOTA: Los nombres usan snake_case porque el frontend transforma camelCase -> snake_case
 * en el interceptor de axios (apiClient.ts líneas 54-57)
 */
export class UpdateReviewDto {
  @ApiProperty({
    description: 'Puntuaciones por criterio de rúbrica',
    example: { creativity: 25, accuracy: 30, presentation: 20 },
    required: false,
  })
  @IsObject()
  @IsOptional()
    rubric_scores?: Record<string, number>;

  @ApiProperty({
    description: 'Puntuación total calculada (0-100)',
    example: 85,
    minimum: 0,
    maximum: 100,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
    total_score?: number;

  @ApiProperty({
    description: 'Comentarios generales del docente',
    example: 'Excelente trabajo, muy creativo y bien presentado.',
    required: false,
  })
  @IsString()
  @IsOptional()
    general_feedback?: string;

  @ApiProperty({
    description: 'Feedback detallado por sección/criterio',
    example: {
      creativity: 'Ideas muy originales',
      presentation: 'Buena estructura y diseño',
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
    detailed_feedback?: Record<string, unknown>;

  @ApiProperty({
    description: 'Estado del review',
    enum: ['pending', 'in_progress', 'completed', 'returned'],
    example: 'in_progress',
    required: false,
  })
  @IsEnum(['pending', 'in_progress', 'completed', 'returned'])
  @IsOptional()
    status?: 'pending' | 'in_progress' | 'completed' | 'returned';
}

/**
 * DTO para actualizar el estado de una evaluación manual
 */
export class UpdateReviewStatusDto {
  @ApiProperty({
    description: 'Nuevo estado del review',
    enum: ['pending', 'in_progress', 'completed', 'returned'],
    example: 'in_progress',
  })
  @IsEnum(['pending', 'in_progress', 'completed', 'returned'])
    status!: 'pending' | 'in_progress' | 'completed' | 'returned';
}

/**
 * DTO para devolver un submission para corrección
 */
export class ReturnForRevisionDto {
  @ApiProperty({
    description: 'Razón por la cual se devuelve el trabajo',
    example: 'Por favor revisa los siguientes aspectos: 1) Falta desarrollar más la argumentación, 2) Algunos errores de ortografía',
  })
  @IsString()
    feedback!: string;
}
