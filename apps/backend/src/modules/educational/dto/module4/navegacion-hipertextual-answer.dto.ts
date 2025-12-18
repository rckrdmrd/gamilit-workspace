import {
  IsArray,
  IsString,
  IsObject,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * NavegacionHipertextualAnswerDto
 *
 * @description DTO para validar las respuestas del ejercicio "Navegación Hipertextual".
 * El estudiante navega por una red de contenidos hipertextuales y recopila información
 * a través de diferentes rutas. Se registra el camino seguido y la información encontrada.
 *
 * @example
 * ```json
 * {
 *   "path": ["node_inicio", "node_historia", "node_impacto", "node_conclusion"],
 *   "information_found": {
 *     "node_historia": {
 *       "fact_1": "La alfabetización digital surge en los años 90",
 *       "fact_2": "Paul Gilster acuñó el término en 1997"
 *     },
 *     "node_impacto": {
 *       "statistic": "85% de los empleos requieren habilidades digitales",
 *       "example": "Casos de éxito en educación digital"
 *     }
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
        fact_2: 'Paul Gilster acuñó el término en 1997',
      },
      node_impacto: {
        statistic: '85% de los empleos requieren habilidades digitales',
        example: 'Casos de éxito en educación digital',
      },
    },
  })
  @IsObject({ message: 'information_found must be an object' })
    information_found: Record<string, unknown>;
}
