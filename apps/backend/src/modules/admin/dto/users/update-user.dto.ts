import { IsOptional, IsEnum, IsEmail, IsBoolean, IsObject } from 'class-validator';
import { GamilityRoleEnum, UserStatusEnum } from '@shared/constants';

/**
 * UpdateUserDto (Admin Privileged)
 *
 * @description DTO para actualización de usuarios por administradores.
 * @usage Endpoints de administración de usuarios (admin panel).
 *
 * NOTA ARQUITECTÓNICA: Este DTO es diferente a auth/dto/UpdateUserDto
 * porque tiene permisos privilegiados para admin:
 * - Admin (este): email, role, status, email_verified, raw_user_meta_data
 * - Self-service: solo role, raw_user_meta_data
 *
 * @see modules/auth/dto/update-user.dto.ts (versión Self-Service)
 */
export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
    email?: string;

  @IsOptional()
  @IsEnum(GamilityRoleEnum)
    role?: GamilityRoleEnum;

  @IsOptional()
  @IsEnum(UserStatusEnum)
    status?: UserStatusEnum;

  @IsOptional()
  @IsBoolean()
    email_verified?: boolean;

  @IsOptional()
  @IsObject()
    raw_user_meta_data?: Record<string, unknown>;
}
