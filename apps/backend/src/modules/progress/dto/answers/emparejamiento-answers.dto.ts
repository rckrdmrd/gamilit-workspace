import { IsObject, IsNotEmpty } from 'class-validator';

/**
 * DTO para respuestas de ejercicio Emparejamiento
 *
 * @description Valida la estructura de pares item-respuesta
 * enviados por el estudiante en ejercicios de emparejamiento.
 *
 * Expected format:
 * {
 *   "matches": {
 *     "item1": "pair1",
 *     "item2": "pair2",
 *     "item3": "pair3"
 *   }
 * }
 */
export class EmparejamientoAnswersDto {
  /**
   * Object mapping item IDs to their matched pairs
   * Example: { "item1": "pair1", "item2": "pair2" }
   */
  @IsObject({ message: 'matches must be an object' })
  @IsNotEmpty({ message: 'matches object is required' })
    matches!: Record<string, string>;
}
