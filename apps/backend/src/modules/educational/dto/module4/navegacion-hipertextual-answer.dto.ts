import {
  IsArray,
  IsString,
  IsObject,
  IsOptional,
  ArrayMinSize,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * NavegacionHipertextualAnswerDto
 *
 * @description DTO para validar las respuestas del ejercicio "Navegación Hipertextual".
 * El estudiante navega por una red de contenidos hipertextuales, recopila información
 * y responde preguntas de reflexión evaluadas por el maestro.
 *
 * @example
 * ```json
 * {
 *   "path": ["node_inicio", "node_historia", "node_impacto", "node_conclusion"],
 *   "information_found": { ... },
 *   "summary": "Durante mi navegación aprendí que la alfabetización digital...",
 *   "reflection_questions": {
 *     "alternative_route": "Habría tomado una ruta diferente empezando por...",
 *     "most_important": "La información más importante fue..."
 *   }
 * }
 * ```
 */
export class NavegacionHipertextualAnswerDto {
  @ApiProperty({
    description:
      'Ruta de navegación seguida por el estudiante. Array de IDs de nodos visitados (mínimo 2 nodos)',
    example: ['node_inicio', 'node_historia', 'node_impacto', 'node_conclusion'],
    minItems: 2,
  })
  @IsArray({ message: 'path must be an array' })
  @ArrayMinSize(2, {
    message: 'path must contain at least 2 elements (nodes visited)',
  })
  @IsString({ each: true, message: 'each path element must be a string' })
    path: string[];

  @ApiProperty({
    description:
      'Información recopilada durante la navegación, organizada por nodo visitado',
    example: {
      node_historia: {
        fact_1: 'La alfabetización digital surge en los años 90',
      },
    },
  })
  @IsObject({ message: 'information_found must be an object' })
    informationFound: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Resumen de lo aprendido durante la navegación (mínimo 150 caracteres)',
    example: 'Durante mi navegación aprendí que la alfabetización digital surgió en los años 90 y que Paul Gilster acuñó el término. Las habilidades digitales son fundamentales para el empleo moderno.',
  })
  @IsOptional()
  @IsString({ message: 'summary must be a string' })
  @MinLength(150, { message: 'summary must be at least 150 characters' })
    summary?: string;

  @ApiPropertyOptional({
    description: 'Respuestas a preguntas de reflexión sobre la navegación',
    example: {
      alternative_route: 'Habría tomado una ruta diferente empezando por el nodo de impacto...',
      most_important: 'La información más importante fue sobre las habilidades digitales...',
    },
  })
  @IsOptional()
  @IsObject({ message: 'reflection_questions must be an object' })
    reflectionQuestions?: Record<string, string>;
}
