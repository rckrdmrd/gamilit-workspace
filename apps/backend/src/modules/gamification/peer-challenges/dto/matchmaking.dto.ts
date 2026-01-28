import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';
import { DifficultyLevelEnum } from '@shared/constants';

/**
 * MatchmakingPreferencesDto
 * Preferencias del usuario para buscar un oponente
 */
export class MatchmakingPreferencesDto {
  @ApiProperty({
    description: 'Tipo de desafio',
    enum: ['head_to_head', 'multiplayer'],
    example: 'head_to_head',
  })
  @IsEnum(['head_to_head', 'multiplayer'])
  challengeType!: 'head_to_head' | 'multiplayer';

  @ApiPropertyOptional({
    description: 'Nivel de dificultad preferido',
    enum: DifficultyLevelEnum,
  })
  @IsOptional()
  @IsEnum(DifficultyLevelEnum)
  difficultyLevel?: DifficultyLevelEnum;

  @ApiPropertyOptional({
    description: 'ID del modulo especifico (opcional)',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  moduleId?: string;

  @ApiPropertyOptional({
    description: 'ID del ejercicio especifico (opcional)',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  exerciseId?: string;

  @ApiPropertyOptional({
    description: 'Diferencia maxima de skill rating permitida',
    minimum: 50,
    maximum: 500,
    default: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(500)
  maxSkillDiff?: number;
}

/**
 * JoinQueueDto
 * DTO para unirse a la cola de matchmaking
 */
export class JoinQueueDto extends MatchmakingPreferencesDto {
  @ApiProperty({
    description: 'ID del usuario que se une a la cola',
    format: 'uuid',
  })
  @IsUUID()
  userId!: string;
}

/**
 * QueuePositionResponseDto
 * Respuesta con la posicion en la cola
 */
export class QueuePositionResponseDto {
  @ApiProperty({ description: 'Posicion en la cola', example: 5 })
  position!: number;

  @ApiProperty({ description: 'Tiempo estimado de espera en segundos', example: 30 })
  estimatedWaitTime!: number;

  @ApiProperty({ description: 'Fecha/hora cuando entro a la cola' })
  queuedAt!: Date;

  @ApiProperty({ description: 'Preferencias de matchmaking' })
  preferences!: MatchmakingPreferencesDto;

  @ApiProperty({ description: 'Rango actual de busqueda de skill', example: 100 })
  currentSearchRange!: number;
}

/**
 * MatchResultDto
 * Resultado cuando se encuentra un match
 */
export class MatchResultDto {
  @ApiProperty({ description: 'ID del challenge creado', format: 'uuid' })
  challengeId!: string;

  @ApiProperty({ description: 'Informacion del oponente' })
  opponent!: {
    id: string;
    displayName: string;
    skillRating: number;
    avatarUrl?: string;
  };

  @ApiProperty({ description: 'Tipo de desafio' })
  challengeType!: 'head_to_head' | 'multiplayer';

  @ApiPropertyOptional({ description: 'Nivel de dificultad' })
  difficultyLevel?: DifficultyLevelEnum;
}

/**
 * QueueStatusResponseDto
 * Estado completo de la cola del usuario
 */
export class QueueStatusResponseDto {
  @ApiProperty({ description: 'Usuario esta en cola' })
  inQueue!: boolean;

  @ApiPropertyOptional({ description: 'Posicion actual si esta en cola' })
  position?: QueuePositionResponseDto;

  @ApiProperty({ description: 'Numero total de usuarios en cola', example: 15 })
  totalInQueue!: number;
}

/**
 * LeaveQueueResponseDto
 * Respuesta al salir de la cola
 */
export class LeaveQueueResponseDto {
  @ApiProperty({ description: 'Operacion exitosa' })
  success!: boolean;

  @ApiPropertyOptional({ description: 'Mensaje informativo' })
  message?: string;
}

/**
 * SkillRatingResponseDto
 * Respuesta con informacion de skill rating
 */
export class SkillRatingResponseDto {
  @ApiProperty({ description: 'ID del usuario', format: 'uuid' })
  userId!: string;

  @ApiProperty({ description: 'Rating actual', example: 1250 })
  rating!: number;

  @ApiProperty({ description: 'Total de partidas jugadas', example: 25 })
  gamesPlayed!: number;

  @ApiProperty({ description: 'Victorias', example: 15 })
  wins!: number;

  @ApiProperty({ description: 'Derrotas', example: 8 })
  losses!: number;

  @ApiProperty({ description: 'Empates', example: 2 })
  draws!: number;

  @ApiProperty({ description: 'Racha actual', example: 3 })
  currentStreak!: number;

  @ApiProperty({ description: 'Mejor racha', example: 7 })
  bestStreak!: number;

  @ApiProperty({ description: 'Rating maximo alcanzado', example: 1350 })
  peakRating!: number;

  @ApiProperty({ description: 'Porcentaje de victorias', example: 60 })
  winRate!: number;

  @ApiProperty({ description: 'Fecha de ultima actualizacion' })
  lastUpdated!: Date;
}

/**
 * LeaderboardEntryDto
 * Entrada del leaderboard de skill rating
 */
export class SkillLeaderboardEntryDto {
  @ApiProperty({ description: 'Posicion en el ranking', example: 1 })
  rank!: number;

  @ApiProperty({ description: 'ID del usuario', format: 'uuid' })
  userId!: string;

  @ApiProperty({ description: 'Nombre de usuario', example: 'TopPlayer123' })
  displayName!: string;

  @ApiPropertyOptional({ description: 'URL del avatar' })
  avatarUrl?: string;

  @ApiProperty({ description: 'Rating actual', example: 1850 })
  rating!: number;

  @ApiProperty({ description: 'Partidas jugadas', example: 150 })
  gamesPlayed!: number;

  @ApiProperty({ description: 'Porcentaje de victorias', example: 72.5 })
  winRate!: number;
}
