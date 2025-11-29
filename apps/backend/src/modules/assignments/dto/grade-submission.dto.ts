/**
 * Assignment Grade DTO
 *
 * @description DTO para calificar submissions de assignments.
 * @note Renombrado de GradeSubmissionDto a AssignmentGradeDto para evitar
 *       conflicto con progress/dto/grade-submission.dto.ts
 */

import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignmentGradeDto {
  @ApiProperty({
    description: 'Puntaje de la calificación (0-100)',
    example: 85,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
    score!: number;

  @ApiPropertyOptional({
    description: 'Retroalimentación del profesor',
    example: 'Buen trabajo, pero revisa la ortografía.',
  })
  @IsOptional()
  @IsString()
    feedback?: string;
}
