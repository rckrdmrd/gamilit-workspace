import { Expose } from 'class-transformer';
import { AuthProviderEnum } from '@shared/constants/enums.constants';

/**
 * AuthProviderResponseDto
 *
 * @description DTO para respuestas de configuración de proveedor OAuth.
 * Modelo de configuración global (NO per-user).
 *
 * FIX H-021: DTO reescrito para alinear con DDL (configuración global OAuth).
 *
 * SEGURIDAD:
 * NO expone campos sensibles:
 * - client_id (credencial OAuth)
 * - client_secret (credencial OAuth)
 *
 * @see AuthProvider entity
 * @see CreateAuthProviderDto
 */
export class AuthProviderResponseDto {
  @Expose()
  id!: string;

  @Expose()
  provider_name!: AuthProviderEnum;

  @Expose()
  display_name!: string;

  @Expose()
  is_enabled!: boolean;

  @Expose()
  authorization_url!: string | null;

  @Expose()
  token_url!: string | null;

  @Expose()
  user_info_url!: string | null;

  @Expose()
  scope!: string[] | null;

  @Expose()
  redirect_uri!: string | null;

  @Expose()
  icon_url!: string | null;

  @Expose()
  button_color!: string | null;

  @Expose()
  priority!: number;

  @Expose()
  created_at!: Date;

  @Expose()
  updated_at!: Date;

  // SECURITY: client_id and client_secret are NOT exposed
}
