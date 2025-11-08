import { Exclude, Expose, Type } from 'class-transformer';
import { GamilityRoleEnum } from '@shared/constants';

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
   * Fecha y hora de confirmación del email
   */
  @Expose()
  email_confirmed_at?: Date;

  /**
   * Fecha y hora del último inicio de sesión
   */
  @Expose()
  last_sign_in_at?: Date;

  /**
   * Metadatos adicionales del usuario (JSON)
   * NOTA: Filtrar campos sensibles si existen
   */
  @Expose()
  raw_user_meta_data!: Record<string, any>;

  /**
   * Fecha y hora de creación del registro
   */
  @Expose()
  created_at!: Date;

  /**
   * Fecha y hora de última actualización del registro
   */
  @Expose()
  updated_at!: Date;

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
