import {
  IsEnum,
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsArray,
  Min,
  IsObject,
} from 'class-validator';
import { AuthProviderEnum } from '@shared/constants/enums.constants';

/**
 * CreateAuthProviderDto
 *
 * @description DTO para crear/configurar un proveedor de autenticación OAuth.
 * Modelo de configuración global (NO per-user).
 *
 * FIX H-021: DTO reescrito para alinear con DDL (configuración global OAuth).
 * Antes: modelo per-user (user_id, access_token, refresh_token)
 * Ahora: modelo de configuración global (client_id, client_secret, URLs OAuth)
 *
 * @see AuthProvider entity
 * @see DDL: auth_management.auth_providers
 */
export class CreateAuthProviderDto {
  @IsEnum(AuthProviderEnum, {
    message:
      'El proveedor debe ser: local, google, facebook, apple, microsoft o github',
  })
  provider_name!: AuthProviderEnum;

  @IsString()
  display_name!: string;

  @IsBoolean()
  @IsOptional()
  is_enabled?: boolean;

  @IsString()
  @IsOptional()
  client_id?: string;

  @IsString()
  @IsOptional()
  client_secret?: string;

  @IsString()
  @IsOptional()
  authorization_url?: string;

  @IsString()
  @IsOptional()
  token_url?: string;

  @IsString()
  @IsOptional()
  user_info_url?: string;

  @IsArray()
  @IsOptional()
  scope?: string[];

  @IsString()
  @IsOptional()
  redirect_uri?: string;

  @IsString()
  @IsOptional()
  icon_url?: string;

  @IsString()
  @IsOptional()
  button_color?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  priority?: number;

  @IsObject()
  @IsOptional()
  config?: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
