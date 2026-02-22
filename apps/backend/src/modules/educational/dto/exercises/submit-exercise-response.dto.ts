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
 * Review de respuesta individual (por pregunta)
 */
export class AnswerReviewDto {
  @ApiProperty({ description: 'ID de la pregunta', example: 'q1' })
    questionId!: string;

  @ApiProperty({ description: '¿Fue correcta?', example: true })
    isCorrect!: boolean;

  @ApiProperty({ description: 'Respuesta del usuario', example: 'SORBONA' })
    userAnswer!: unknown;

  @ApiProperty({ description: 'Respuesta correcta', required: false })
    correctAnswer?: unknown;

  @ApiProperty({ description: 'Explicación', required: false })
    explanation?: string;
}

/**
 * Feedback estructurado del ejercicio
 */
export class ExerciseFeedbackDto {
  @ApiProperty({
    description: 'Retroalimentación general',
    example: 'Buen trabajo! 4/5 correctas.',
  })
    overall!: string;

  @ApiProperty({
    description: 'Review por respuesta individual',
    type: [AnswerReviewDto],
    required: false,
  })
    answerReview?: AnswerReviewDto[];
}

/**
 * Achievement desbloqueado al completar ejercicio
 */
export class UnlockedAchievementDto {
  @ApiProperty({ description: 'ID del achievement', example: '90000001-0000-0000-0000-000000000001' })
    id!: string;

  @ApiProperty({ description: 'Nombre del achievement', example: 'Primeros Pasos' })
    name!: string;

  @ApiProperty({ description: 'Descripción del achievement', example: 'Completa tu primer ejercicio' })
    description!: string;

  @ApiProperty({ description: 'Icono del achievement', example: 'footprints' })
    icon!: string;

  @ApiProperty({ description: 'Rareza del achievement', example: 'common' })
    rarity!: string;
}

/**
 * SubmitExerciseResponseDto
 *
 * @description Respuesta del endpoint POST /exercises/:id/submit
 * Contiene el resultado de la validación, score obtenido y recompensas.
 */
export class SubmitExerciseResponseDto {
  @ApiProperty({
    description: 'ID del intento creado',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    required: false,
  })
    attemptId?: string;

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
    description: 'Cantidad de respuestas correctas',
    example: 4,
    required: false,
  })
    correctAnswersCount?: number;

  @ApiProperty({
    description: 'Total de preguntas en el ejercicio',
    example: 5,
    required: false,
  })
    totalQuestions?: number;

  @ApiProperty({
    description: 'Recompensas otorgadas por el ejercicio',
    type: ExerciseRewardsDto,
  })
    rewards!: ExerciseRewardsDto;

  @ApiProperty({
    description: 'Feedback estructurado del ejercicio',
    type: ExerciseFeedbackDto,
    required: false,
  })
    feedback?: ExerciseFeedbackDto;

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

  @ApiProperty({
    description: 'Achievements desbloqueados con este ejercicio',
    type: [UnlockedAchievementDto],
    required: false,
  })
    achievements?: UnlockedAchievementDto[];

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
