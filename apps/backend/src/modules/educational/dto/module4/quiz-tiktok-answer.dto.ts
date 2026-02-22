import { IsArray, IsInt, IsString, Min, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * QuizTikTokAnswerDto
 *
 * @description DTO para validar las respuestas del ejercicio "Quiz tipo TikTok".
 * El estudiante responde a una serie de preguntas de opción múltiple presentadas
 * en formato similar a TikTok. Cada respuesta incluye el índice de la opción
 * seleccionada y una justificación escrita evaluada por el maestro.
 *
 * @example
 * ```json
 * {
 *   "answers": [0, 2, 1, 3, 0],
 *   "justifications": [
 *     "Marie Curie nació en 1867 en Varsovia, Polonia",
 *     "Ganó el Nobel de Física en 1903 y de Química en 1911",
 *     "Descubrió el polonio y el radio durante sus investigaciones",
 *     "Fue profesora en la Sorbona de París",
 *     "Sus premios fueron en Física y Química"
 *   ]
 * }
 * ```
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

  @ApiProperty({
    description:
      'Justificaciones escritas para cada respuesta. El maestro las evalúa manualmente (mínimo 30 caracteres cada una)',
    example: [
      'Marie Curie nació en 1867 en Varsovia, Polonia',
      'Ganó el Nobel de Física en 1903 y de Química en 1911',
    ],
    type: [String],
  })
  @IsArray({ message: 'justifications must be an array' })
  @IsString({ each: true, message: 'each justification must be a string' })
  @MinLength(30, {
    each: true,
    message: 'each justification must be at least 30 characters',
  })
    justifications: string[];
}
