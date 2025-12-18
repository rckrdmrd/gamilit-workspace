import {
  IsObject,
  IsArray,
  IsString,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * InfografiaInteractivaAnswerDto
 *
 * @description DTO para validar las respuestas del ejercicio "Infografía Interactiva".
 * El estudiante debe interactuar con diferentes secciones de la infografía y proporcionar
 * respuestas a las preguntas o actividades asociadas a cada sección.
 *
 * @example
 * ```json
 * {
 *   "answers": {
 *     "section_1": {
 *       "question_1": "La alfabetización digital implica...",
 *       "question_2": "Tres competencias clave son..."
 *     },
 *     "section_2": {
 *       "interactive_element": "clicked",
 *       "response": "Los datos personales incluyen..."
 *     }
 *   },
 *   "sections_explored": ["section_1", "section_2", "section_3"]
 * }
 * ```
 */
export class InfografiaInteractivaAnswerDto {
  @ApiProperty({
    description:
      'Respuestas del estudiante organizadas por sección o elemento interactivo',
    example: {
      section_1: {
        question_1: 'La alfabetización digital implica...',
        question_2: 'Tres competencias clave son...',
      },
      section_2: {
        interactive_element: 'clicked',
        response: 'Los datos personales incluyen...',
      },
    },
  })
  @IsObject({ message: 'answers must be an object' })
    answers: Record<string, unknown>;

  @ApiProperty({
    description:
      'Lista de IDs de secciones exploradas por el estudiante (mínimo 1)',
    example: ['section_1', 'section_2', 'section_3'],
    minItems: 1,
  })
  @IsArray({ message: 'sections_explored must be an array' })
  @ArrayMinSize(1, {
    message: 'sections_explored must contain at least one section',
  })
  @IsString({ each: true, message: 'each section ID must be a string' })
    sections_explored: string[];
}
