import { Expose, Type } from 'class-transformer';

/**
 * ActivityResponseDto - DTO para respuestas de actividades de usuario
 *
 * @description DTO usado para respuestas HTTP al cliente.
 * Incluye todos los campos de la entidad con sus valores actuales.
 *
 * @see UserActivity entity para la estructura de base de datos
 */
export class ActivityResponseDto {
  /**
   * ID único de la actividad
   */
  @Expose()
    activity_id!: string;

  /**
   * ID del usuario que realizó la actividad
   */
  @Expose()
    user_id!: string;

  /**
   * Tipo de actividad
   */
  @Expose()
    activity_type!: string;

  /**
   * Título de la actividad
   */
  @Expose()
    title!: string;

  /**
   * Descripción detallada
   */
  @Expose()
    description?: string;

  /**
   * Metadatos adicionales
   */
  @Expose()
    metadata!: Record<string, any>;

  /**
   * Visibilidad de la actividad
   */
  @Expose()
    is_public!: boolean;

  /**
   * Fecha de creación de la actividad
   */
  @Expose()
  @Type(() => Date)
    created_at!: Date;
}
