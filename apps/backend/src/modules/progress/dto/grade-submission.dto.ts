import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

/**
 * GradeSubmissionDto
 *
 * @description DTO para calificación manual de ejercicios por profesores.
 * Permite sobrescribir el auto-grading con una calificación manual.
 *
 * Campos:
 * - final_score (opcional): Calificación manual del profesor (0-100)
 * - grader_id (opcional): ID del profesor calificador (se toma del JWT si no se provee)
 * - feedback (opcional): Retroalimentación adicional del profesor
 *
 * Uso:
 * - Si final_score está presente: se usa como calificación manual
 * - Si final_score no está presente: se ejecuta auto-grading
 */
export class GradeSubmissionDto {
  @ApiPropertyOptional({
    description: 'Calificación manual del profesor (0-100). Si se provee, sobrescribe el auto-grading.',
    example: 92,
    minimum: 0,
    maximum: 100,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
    final_score?: number;

  @ApiPropertyOptional({
    description: 'ID del profesor que califica. Se toma automáticamente del JWT si no se provee.',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  @IsOptional()
  @IsString()
    grader_id?: string;

  @ApiPropertyOptional({
    description: 'Retroalimentación adicional del profesor para el estudiante',
    example: 'Excelente trabajo en la comprensión del tema. Revisa la ortografía en la pregunta 3.',
    type: String,
  })
  @IsOptional()
  @IsString()
    feedback?: string;
}
