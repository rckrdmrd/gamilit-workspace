import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsNumber, IsOptional, Min } from 'class-validator';

/**
 * BattleJoinDto
 * DTO para unirse a una batalla
 */
export class BattleJoinDto {
  @ApiProperty({ description: 'ID del challenge', format: 'uuid' })
  @IsUUID()
  challengeId!: string;
}

/**
 * BattleReadyDto
 * DTO para indicar que el jugador esta listo
 */
export class BattleReadyDto {
  @ApiProperty({ description: 'ID del challenge', format: 'uuid' })
  @IsUUID()
  challengeId!: string;
}

/**
 * BattleAnswerDto
 * DTO para enviar una respuesta durante la batalla
 */
export class BattleAnswerDto {
  @ApiProperty({ description: 'ID del challenge', format: 'uuid' })
  @IsUUID()
  challengeId!: string;

  @ApiProperty({ description: 'ID de la pregunta', format: 'uuid' })
  @IsUUID()
  questionId!: string;

  @ApiProperty({ description: 'Respuesta del usuario' })
  @IsString()
  answer!: string;

  @ApiPropertyOptional({ description: 'Tiempo tomado en milisegundos' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  timeTakenMs?: number;
}

/**
 * PowerUpDto
 * DTO para usar un power-up durante la batalla
 */
export class PowerUpDto {
  @ApiProperty({ description: 'ID del challenge', format: 'uuid' })
  @IsUUID()
  challengeId!: string;

  @ApiProperty({ description: 'ID del power-up', format: 'uuid' })
  @IsUUID()
  powerUpId!: string;

  @ApiPropertyOptional({ description: 'ID de la pregunta objetivo (si aplica)' })
  @IsOptional()
  @IsUUID()
  targetQuestionId?: string;
}

/**
 * BattlePlayerDto
 * Informacion de un jugador en la batalla
 */
export class BattlePlayerDto {
  @ApiProperty({ description: 'ID del jugador', format: 'uuid' })
  id!: string;

  @ApiProperty({ description: 'Nombre del jugador' })
  displayName!: string;

  @ApiPropertyOptional({ description: 'URL del avatar' })
  avatarUrl?: string;

  @ApiProperty({ description: 'Esta listo para comenzar' })
  isReady!: boolean;

  @ApiProperty({ description: 'Esta conectado' })
  isConnected!: boolean;

  @ApiProperty({ description: 'Puntuacion actual', example: 350 })
  score!: number;

  @ApiProperty({ description: 'Respuestas correctas', example: 7 })
  correctAnswers!: number;

  @ApiProperty({ description: 'Total de respuestas', example: 10 })
  totalAnswers!: number;

  @ApiProperty({ description: 'Precision porcentual', example: 70 })
  accuracy!: number;
}

/**
 * BattleQuestionDto
 * Pregunta de la batalla (simplificada para el cliente)
 */
export class BattleQuestionDto {
  @ApiProperty({ description: 'ID de la pregunta', format: 'uuid' })
  id!: string;

  @ApiProperty({ description: 'Texto de la pregunta' })
  text!: string;

  @ApiProperty({ description: 'Opciones de respuesta' })
  options!: Array<{
    id: string;
    text: string;
  }>;

  @ApiProperty({ description: 'Numero de pregunta actual', example: 5 })
  questionNumber!: number;

  @ApiProperty({ description: 'Total de preguntas', example: 10 })
  totalQuestions!: number;

  @ApiPropertyOptional({ description: 'Tiempo limite en segundos' })
  timeLimit?: number;

  @ApiPropertyOptional({ description: 'Puntos disponibles para esta pregunta' })
  points?: number;
}

/**
 * BattleStateDto
 * Estado completo de la batalla
 */
export class BattleStateDto {
  @ApiProperty({ description: 'ID del challenge', format: 'uuid' })
  challengeId!: string;

  @ApiProperty({
    description: 'Estado de la batalla',
    enum: ['waiting', 'countdown', 'active', 'finished'],
  })
  status!: 'waiting' | 'countdown' | 'active' | 'finished';

  @ApiProperty({ description: 'Jugadores en la batalla', type: [BattlePlayerDto] })
  players!: BattlePlayerDto[];

  @ApiPropertyOptional({ description: 'Pregunta actual' })
  currentQuestion?: BattleQuestionDto;

  @ApiPropertyOptional({ description: 'Tiempo restante en segundos' })
  timeRemaining?: number;

  @ApiPropertyOptional({ description: 'Tiempo total de la batalla en segundos' })
  totalTime?: number;

  @ApiPropertyOptional({ description: 'Fecha/hora de inicio' })
  startedAt?: Date;

  @ApiPropertyOptional({ description: 'Fecha/hora de finalizacion estimada' })
  endsAt?: Date;
}

/**
 * AnswerResultDto
 * Resultado de una respuesta enviada
 */
export class AnswerResultDto {
  @ApiProperty({ description: 'Respuesta fue correcta' })
  correct!: boolean;

  @ApiProperty({ description: 'Puntos ganados con esta respuesta', example: 50 })
  pointsEarned!: number;

  @ApiProperty({ description: 'Puntuacion total del jugador', example: 350 })
  totalScore!: number;

  @ApiPropertyOptional({ description: 'Respuesta correcta (si aplica)' })
  correctAnswer?: string;

  @ApiPropertyOptional({ description: 'Explicacion de la respuesta' })
  explanation?: string;

  @ApiPropertyOptional({ description: 'Bonus de tiempo (si aplica)' })
  timeBonus?: number;

  @ApiPropertyOptional({ description: 'Bonus de racha (si aplica)' })
  streakBonus?: number;
}

/**
 * BattleResultDto
 * Resultado final de la batalla
 */
export class BattleResultDto {
  @ApiProperty({ description: 'ID del challenge', format: 'uuid' })
  challengeId!: string;

  @ApiPropertyOptional({ description: 'ID del ganador (null si empate)', format: 'uuid' })
  winnerId?: string | null;

  @ApiProperty({ description: 'Es empate' })
  isDraw!: boolean;

  @ApiProperty({ description: 'Duracion de la batalla en segundos', example: 180 })
  duration!: number;

  @ApiProperty({ description: 'Resultados de cada jugador' })
  players!: Array<{
    id: string;
    displayName: string;
    score: number;
    correctAnswers: number;
    totalAnswers: number;
    accuracy: number;
    avgTimePerQuestion: number;
    xpEarned: number;
    coinsEarned: number;
    ratingChange: number;
    newRating: number;
  }>;

  @ApiProperty({ description: 'Estadisticas de la batalla' })
  stats!: {
    totalQuestions: number;
    avgResponseTime: number;
    fastestAnswer: {
      playerId: string;
      time: number;
    };
  };
}

/**
 * ScoreUpdateDto
 * Actualizacion de puntuacion en tiempo real
 */
export class ScoreUpdateDto {
  @ApiProperty({ description: 'ID del challenge', format: 'uuid' })
  challengeId!: string;

  @ApiProperty({ description: 'Puntuacion del jugador', example: 350 })
  myScore!: number;

  @ApiProperty({ description: 'Puntuacion del oponente', example: 280 })
  opponentScore!: number;

  @ApiProperty({ description: 'Progreso del jugador (preguntas respondidas)', example: 7 })
  myProgress!: number;

  @ApiProperty({ description: 'Progreso del oponente', example: 6 })
  opponentProgress!: number;
}

/**
 * CountdownDto
 * Evento de countdown
 */
export class CountdownDto {
  @ApiProperty({ description: 'Numero del countdown', example: 3 })
  count!: number;

  @ApiProperty({ description: 'Mensaje opcional', example: 'Get Ready!' })
  message?: string;
}
