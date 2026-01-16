import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

/**
 * UpdateUserDto (Self-Service)
 *
 * @description DTO para actualización parcial de usuarios por sí mismos.
 * @usage Endpoints de actualización de perfil propio (self-service).
 *
 * NOTA ARQUITECTÓNICA: Este DTO es diferente a admin/dto/users/UpdateUserDto
 * porque tiene permisos limitados para self-service:
 * - Self-service (este): solo role, raw_user_meta_data
 * - Admin: email, role, status, email_verified, raw_user_meta_data
 *
 * IMPORTANTE:
 * - Omite 'password' (usar endpoint específico /api/auth/password)
 * - Todos los campos son opcionales (PartialType)
 * - NO permite cambiar email directamente (usar flujo de cambio de email con verificación)
 *
 * @see CreateUserDto
 * @see modules/admin/dto/users/update-user.dto.ts (versión Admin)
 */
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password', 'email'] as const),
) {
  // Hereda de CreateUserDto excepto password y email:
  // - role?: GamilityRoleEnum
  // - raw_user_meta_data?: Record<string, unknown>

  // Campos opcionales adicionales para actualización:
  // (actualmente solo role y raw_user_meta_data son editables)
}
