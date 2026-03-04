import {
  IsObject,
  IsArray,
  IsString,
  IsOptional,
  ArrayMinSize,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * InfografiaInteractivaAnswerDto
 *
 * @description DTO para validar las respuestas del ejercicio "Infografía Interactiva".
 * El estudiante interactúa con las secciones de la infografía y responde preguntas
 * de análisis evaluadas por el maestro.
 *
 * @example
 * ```json
 * {
 *   "answers": { ... },
 *   "sections_explored": ["card-1", "card-2", "card-3"],
 *   "analysis_questions": {
 *     "relationship": "Los descubrimientos de Marie Curie están relacionados con...",
 *     "surprising": "El dato más sorprendente fue que...",
 *     "summary": "La infografía muestra tres aspectos principales..."
 *   },
 *   "synthesis": "En resumen, Marie Curie revolucionó la ciencia al descubrir..."
 * }
 * ```
 */
export class InfografiaInteractivaAnswerDto {
  @ApiProperty({
    description:
      'Respuestas del estudiante organizadas por sección o elemento interactivo',
    example: {
      'card-1': { title: 'Descubrimientos', revealed: true },
    },
  })
  @IsObject({ message: 'answers must be an object' })
    answers: Record<string, unknown>;

  @ApiProperty({
    description:
      'Lista de IDs de secciones exploradas por el estudiante (mínimo 1)',
    example: ['card-1', 'card-2', 'card-3'],
    minItems: 1,
  })
  @IsArray({ message: 'sections_explored must be an array' })
  @ArrayMinSize(1, {
    message: 'sections_explored must contain at least one section',
  })
  @IsString({ each: true, message: 'each section ID must be a string' })
    sectionsExplored: string[];

  @ApiPropertyOptional({
    description: 'Respuestas a preguntas de análisis sobre la infografía (mínimo 50 caracteres cada una)',
    example: {
      relationship: 'Los descubrimientos de Marie Curie están directamente relacionados con su legado...',
      surprising: 'El dato más sorprendente fue que sus investigaciones salvaron millones de vidas...',
      summary: 'La infografía presenta tres aspectos clave de la vida de Marie Curie...',
    },
  })
  @IsOptional()
  @IsObject({ message: 'analysis_questions must be an object' })
    analysisQuestions?: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Síntesis final del contenido de la infografía (mínimo 100 caracteres)',
    example: 'En resumen, Marie Curie revolucionó la ciencia al descubrir el polonio y el radio...',
  })
  @IsOptional()
  @IsString({ message: 'synthesis must be a string' })
  @MinLength(100, { message: 'synthesis must be at least 100 characters' })
    synthesis?: string;
}
