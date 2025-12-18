import { IsArray, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * QuizTikTokAnswerDto
 *
 * @description DTO para validar las respuestas del ejercicio "Quiz tipo TikTok".
 * El estudiante responde a una serie de preguntas de opción múltiple presentadas
 * en formato similar a TikTok. Cada respuesta se representa como un índice numérico
 * de la opción seleccionada.
 *
 * @example
 * ```json
 * {
 *   "answers": [0, 2, 1, 3, 0]
 * }
 * ```
 *
 * @note Cada número representa el índice de la opción seleccionada (0-based).
 * Por ejemplo: 0 = primera opción, 1 = segunda opción, etc.
 */
export class QuizTikTokAnswerDto {
  @ApiProperty({
    description:
      'Lista de respuestas del quiz. Cada número representa el índice de la opción seleccionada (>= 0)',
    example: [0, 2, 1, 3, 0],
    type: [Number],
  })
  @IsArray({ message: 'answers must be an array' })
  @IsInt({ each: true, message: 'each answer must be an integer' })
  @Min(0, {
    each: true,
    message: 'each answer must be greater than or equal to 0',
  })
    answers: number[];
}
