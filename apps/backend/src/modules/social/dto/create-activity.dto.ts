import { IsUUID, IsString, IsEnum, IsOptional, IsBoolean, IsObject, MaxLength } from 'class-validator';

/**
 * Activity Type Enum
 * Tipos de actividades permitidos en el sistema
 */
export enum ActivityTypeEnum {
  ACHIEVEMENT = 'achievement',
  LEVEL_UP = 'level_up',
  STREAK = 'streak',
  FRIEND_REQUEST = 'friend_request',
  EXERCISE = 'exercise',
  CHALLENGE = 'challenge',
  GUILD = 'guild',
  RANKUP = 'rankup',
}

/**
 * CreateActivityDto - DTO para crear una actividad de usuario
 *
 * @description DTO usado para crear una nueva actividad en el feed.
 * Las actividades pueden ser generadas automáticamente por el sistema
 * cuando el usuario completa logros, ejercicios, sube de nivel, etc.
 *
 * @see UserActivity entity para la estructura completa
 */
export class CreateActivityDto {
  /**
   * ID del usuario que realizó la actividad
   */
  @IsUUID('4')
    user_id!: string;

  /**
   * Tipo de actividad
   */
  @IsEnum(ActivityTypeEnum)
    activity_type!: ActivityTypeEnum;

  /**
   * Título de la actividad (máx. 255 caracteres)
   */
  @IsString()
  @MaxLength(255)
    title!: string;

  /**
   * Descripción detallada de la actividad (opcional)
   */
  @IsOptional()
  @IsString()
    description?: string;

  /**
   * Metadatos adicionales (opcional)
   * Ejemplos:
   * - { achievementId: 'uuid', achievementName: 'string' }
   * - { exerciseId: 'uuid', exerciseName: 'string', score: 95 }
   * - { newRank: 'halach_uinik', oldRank: 'chilan' }
   */
  @IsOptional()
  @IsObject()
    metadata?: Record<string, any>;

  /**
   * Visibilidad de la actividad (opcional, por defecto true)
   */
  @IsOptional()
  @IsBoolean()
    is_public?: boolean;
}
