import { ApiProperty } from '@nestjs/swagger';

/**
 * Rewards obtenidos al completar ejercicio
 */
export class ExerciseRewardsDto {
  @ApiProperty({
    description: 'XP ganado por completar el ejercicio',
    example: 100,
    minimum: 0,
  })
    xp!: number;

  @ApiProperty({
    description: 'ML Coins ganadas',
    example: 50,
    minimum: 0,
  })
    mlCoins!: number;

  @ApiProperty({
    description: 'Bonificaciones adicionales aplicadas',
    example: ['first_try_bonus', 'speed_bonus'],
    default: [],
  })
    bonuses!: string[];
}

/**
 * Información de rank up (si aplica)
 */
export class RankUpDto {
  @ApiProperty({
    description: 'Rango anterior del usuario',
    example: 'Novato',
  })
    oldRank!: string;

  @ApiProperty({
    description: 'Nuevo rango alcanzado',
    example: 'Aprendiz',
  })
    newRank!: string;
}

/**
 * SubmitExerciseResponseDto
 *
 * @description Respuesta del endpoint POST /exercises/:id/submit
 * Contiene el resultado de la validación, score obtenido y recompensas.
 *
 * @example Response exitoso:
 * ```json
 * {
 *   "score": 85,
 *   "isPerfect": false,
 *   "rewards": {
 *     "xp": 100,
 *     "mlCoins": 50,
 *     "bonuses": ["first_try_bonus"]
 *   },
 *   "feedback": "Buen trabajo! Algunas respuestas podrían mejorar.",
 *   "isFirstCorrectAttempt": true,
 *   "rankUp": null
 * }
 * ```
 */
export class SubmitExerciseResponseDto {
  @ApiProperty({
    description: 'Puntaje obtenido (0-100)',
    example: 85,
    minimum: 0,
    maximum: 100,
  })
    score!: number;

  @ApiProperty({
    description: '¿Respuesta perfecta? (100% sin hints)',
    example: false,
  })
    isPerfect!: boolean;

  @ApiProperty({
    description: 'Recompensas otorgadas por el ejercicio',
    type: ExerciseRewardsDto,
  })
    rewards!: ExerciseRewardsDto;

  @ApiProperty({
    description: 'Retroalimentación del ejercicio',
    example: 'Buen trabajo! Algunas respuestas podrían mejorar.',
    required: false,
  })
    feedback?: string;

  @ApiProperty({
    description: '¿Es el primer intento correcto del usuario?',
    example: true,
    required: false,
  })
    isFirstCorrectAttempt?: boolean;

  @ApiProperty({
    description: 'Información de rank up si el usuario subió de rango',
    type: RankUpDto,
    nullable: true,
    required: false,
  })
    rankUp?: RankUpDto | null;

  // BUG-M3-SUBMIT-001 FIX 2026-01-07: Campos para ejercicios con revisión manual
  @ApiProperty({
    description: 'Estado de la submission (para ejercicios con revisión manual)',
    enum: ['draft', 'submitted', 'graded', 'reviewed', 'pending_review'],
    example: 'submitted',
    required: false,
  })
    status?: 'draft' | 'submitted' | 'graded' | 'reviewed' | 'pending_review';

  @ApiProperty({
    description: 'Indica si el ejercicio requiere revisión manual del maestro',
    example: true,
    required: false,
  })
    requiresManualReview?: boolean;

  @ApiProperty({
    description: 'Mensaje del backend para mostrar al usuario',
    example: 'Tu respuesta ha sido enviada para revisión del maestro.',
    required: false,
  })
    message?: string;
}
