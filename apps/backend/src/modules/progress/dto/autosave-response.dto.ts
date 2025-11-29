import { ApiProperty } from '@nestjs/swagger';

/**
 * AutoSaveResponseDto
 *
 * @description Respuesta del endpoint de auto-save.
 * Contiene el progreso guardado y metadatos útiles para el frontend.
 */
export class AutoSaveResponseDto {
  /**
   * ID de la submission (draft) guardada
   * @example "990e8400-e29b-41d4-a716-446655440000"
   */
  @ApiProperty({
    description: 'ID de la submission draft guardada',
    example: '990e8400-e29b-41d4-a716-446655440000',
  })
    id!: string;

  /**
   * ID del usuario
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  @ApiProperty({
    description: 'ID del usuario',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
    user_id!: string;

  /**
   * ID del ejercicio
   * @example "880e8400-e29b-41d4-a716-446655440000"
   */
  @ApiProperty({
    description: 'ID del ejercicio',
    example: '880e8400-e29b-41d4-a716-446655440000',
  })
    exercise_id!: string;

  /**
   * Respuestas parciales guardadas
   */
  @ApiProperty({
    description: 'Respuestas parciales guardadas',
    example: {
      question_1: 'respuesta parcial',
      question_2: { option: 'A' },
    },
  })
    partial_answers!: Record<string, any>;

  /**
   * Tiempo transcurrido guardado
   */
  @ApiProperty({
    description: 'Tiempo transcurrido en segundos',
    example: 180,
  })
    time_spent_seconds!: number;

  /**
   * Metadatos guardados
   */
  @ApiProperty({
    description: 'Metadatos adicionales guardados',
    example: {
      hints_used: 1,
      current_section: 2,
    },
    required: false,
  })
    metadata?: Record<string, any>;

  /**
   * Fecha de inicio del ejercicio
   */
  @ApiProperty({
    description: 'Fecha y hora de inicio del ejercicio',
    example: '2025-01-20T10:00:00Z',
    required: false,
  })
    started_at?: Date;

  /**
   * Última fecha de guardado
   */
  @ApiProperty({
    description: 'Fecha y hora del último guardado',
    example: '2025-01-20T10:30:00Z',
  })
    updated_at!: Date;

  /**
   * Estado de la submission (siempre 'draft' para auto-save)
   */
  @ApiProperty({
    description: 'Estado de la submission',
    example: 'draft',
    enum: ['draft', 'submitted', 'graded', 'reviewed'],
  })
    status!: string;
}
