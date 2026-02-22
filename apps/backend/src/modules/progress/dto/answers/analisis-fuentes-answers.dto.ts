import { IsArray, ArrayNotEmpty, IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * AnalisisFuentesAnswersDto
 *
 * @description DTO for validating Análisis de Fuentes (Module 3.2) answers
 * Students rank sources by credibility and justify their ranking.
 * Evaluated by the teacher (requires_manual_grading = true).
 *
 * Expected format:
 * {
 *   "ranking": ["source1", "source3", "source2", "source4"],
 *   "justification": "Ordené las fuentes de esta manera porque..."
 * }
 */
export class AnalisisFuentesAnswersDto {
  /**
   * Array of source IDs ordered by credibility (most credible first)
   */
  @ApiProperty({
    description: 'Array of source IDs ordered by credibility (most credible first)',
    example: ['source1', 'source3', 'source2', 'source4'],
    minItems: 1,
  })
  @IsArray({ message: 'ranking must be an array' })
  @ArrayNotEmpty({ message: 'ranking array cannot be empty' })
  @IsString({ each: true, message: 'Each source ID must be a string' })
    ranking!: string[];

  /**
   * Justification for the ranking order (min 100 chars, evaluated by teacher)
   */
  @ApiPropertyOptional({
    description: 'Justification for the ranking order (min 100 chars, evaluated by teacher)',
    example: 'Ordené las fuentes de esta manera porque la fuente académica tiene revisión por pares...',
  })
  @IsOptional()
  @IsString({ message: 'justification must be a string' })
  @MinLength(100, { message: 'justification must be at least 100 characters' })
    justification?: string;
}
