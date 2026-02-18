import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { GamilityRoleEnum, UserStatusEnum } from '@shared/constants';

/**
 * UserResponseDto
 *
 * @description DTO para respuestas públicas de usuarios (sin información sensible).
 * @usage Respuestas de API que incluyen datos de usuario.
 *
 * IMPORTANTE:
 * - NO incluye 'encrypted_password' (sensible)
 * - NO incluye 'deleted_at' (interno)
 * - Incluye solo campos seguros para exponer en respuestas
 *
 * USO:
 * - Usar con @SerializeOptions({ excludeExtraneousValues: true })
 * - O con ClassSerializerInterceptor configurado
 *
 * @see UserEntity (auth.users)
 */
@Exclude()
export class UserResponseDto {
  /**
   * Identificador único del usuario (UUID)
   */
  @Expose()
    id!: string;

  /**
   * Correo electrónico del usuario
   */
  @Expose()
    email!: string;

  /**
   * Rol del usuario en el sistema
   */
  @Expose()
    role!: GamilityRoleEnum;

  /**
   * Fecha y hora de confirmación del email (ISO string)
   * P0-005: Serializado a ISO para consistencia Frontend
   */
  @Expose()
  @Type(() => Date)
  @Transform(({ value }) => value?.toISOString?.() ?? value)
    email_confirmed_at?: string;

  /**
   * Indica si el email ha sido verificado
   * Campo derivado: true si email_confirmed_at tiene valor
   * IMPORTANTE: Campo agregado para coherencia con Frontend
   */
  @Expose()
    emailVerified?: boolean;

  /**
   * Indica si el usuario está activo
   * Campo derivado: true si no está deleted_at ni banned_until activo
   * IMPORTANTE: Campo agregado para coherencia con Frontend
   */
  @Expose()
    isActive?: boolean;

  /**
   * Número de teléfono del usuario
   * IMPORTANTE: Campo agregado para alineación con DDL auth.users
   */
  @Expose()
    phone?: string;

  /**
   * Fecha y hora de confirmación del teléfono (ISO string)
   * P0-005: Serializado a ISO para consistencia Frontend
   */
  @Expose()
  @Type(() => Date)
  @Transform(({ value }) => value?.toISOString?.() ?? value)
    phone_confirmed_at?: string;

  /**
   * Indica si el usuario es super administrador
   * IMPORTANTE: Campo agregado para alineación con DDL auth.users
   */
  @Expose()
    is_super_admin?: boolean;

  /**
   * Fecha y hora hasta la cual el usuario está baneado (ISO string)
   * P0-005: Serializado a ISO para consistencia Frontend
   */
  @Expose()
  @Type(() => Date)
  @Transform(({ value }) => value?.toISOString?.() ?? value)
    banned_until?: string;

  /**
   * Fecha y hora del último inicio de sesión (ISO string)
   * P0-005: Serializado a ISO para consistencia Frontend
   */
  @Expose()
  @Type(() => Date)
  @Transform(({ value }) => value?.toISOString?.() ?? value)
    last_sign_in_at?: string;

  /**
   * Metadatos adicionales del usuario (JSON)
   * NOTA: Filtrar campos sensibles si existen
   */
  @Expose()
    raw_user_meta_data!: Record<string, unknown>;

  /**
   * Fecha y hora de creación del registro (ISO string)
   * P0-005: Serializado a ISO para consistencia Frontend
   */
  @Expose()
  @Type(() => Date)
  @Transform(({ value }) => value?.toISOString?.() ?? value)
    created_at!: string;

  /**
   * Fecha y hora de última actualización del registro (ISO string)
   * P0-005: Serializado a ISO para consistencia Frontend
   */
  @Expose()
  @Type(() => Date)
  @Transform(({ value }) => value?.toISOString?.() ?? value)
    updated_at!: string;

  // =====================================================
  // CAMPOS DE PROFILE (P0-006)
  // Incluidos para coherencia con Frontend
  // =====================================================

  /**
   * Primer nombre del usuario (desde Profile)
   * P0-006: Campo de Profile incluido en UserResponse
   */
  @Expose()
    first_name?: string;

  /**
   * Apellido(s) del usuario (desde Profile)
   * P0-006: Campo de Profile incluido en UserResponse
   */
  @Expose()
    last_name?: string;

  /**
   * Nombre para mostrar (desde Profile)
   * P0-006: Campo de Profile incluido en UserResponse
   */
  @Expose()
    display_name?: string;

  /**
   * URL del avatar (desde Profile)
   * P0-006: Campo de Profile incluido en UserResponse
   */
  @Expose()
    avatar_url?: string;

  /**
   * Estado del usuario (desde Profile)
   * P0-006: Campo de Profile incluido en UserResponse
   */
  @Expose()
    status?: UserStatusEnum;

  /**
   * ID del tenant (desde Profile)
   * P0-006: Campo de Profile incluido en UserResponse
   */
  @Expose()
    tenant_id?: string;

  /**
   * Items cosméticos equipados actualmente (Skins)
   * Mapa de categoría -> item metadata
   */
  @Expose()
    equipped_items?: Record<string, unknown>;

  // =====================================================
  // Relaciones opcionales
  // =====================================================

  /**
   * Perfil del usuario (si está incluido en la query)
   * Relación OneToOne con auth_management.profiles
   */
  // @Expose()
  // @Type(() => ProfileResponseDto)
  // profile?: ProfileResponseDto;

  // CAMPOS EXCLUIDOS (NO se serializan):
  // - encrypted_password (sensible)
  // - deleted_at (interno)
}
