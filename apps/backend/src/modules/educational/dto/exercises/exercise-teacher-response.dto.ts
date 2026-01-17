import { Expose } from 'class-transformer';
import { ExerciseResponseDto } from './exercise-response.dto';

/**
 * ExerciseTeacherResponseDto
 *
 * @description DTO de respuesta para profesores que incluye el campo solution.
 *              SOLO usar para endpoints de profesores/administradores.
 *
 * @security Este DTO expone la solución del ejercicio.
 *           NO usar para estudiantes - usar ExerciseResponseDto en su lugar.
 *
 * @see ExerciseResponseDto - DTO base sin solution para estudiantes
 * @see SEC-001 - Issue de seguridad que motivó esta separación
 */
export class ExerciseTeacherResponseDto extends ExerciseResponseDto {
  /**
   * Solución del ejercicio (JSONB)
   *
   * @security SOLO exponer a profesores y administradores.
   *           Contiene las respuestas correctas del ejercicio.
   */
  @Expose()
  declare solution?: Record<string, unknown>;
}
