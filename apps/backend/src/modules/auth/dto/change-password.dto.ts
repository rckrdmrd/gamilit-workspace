import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para cambiar contraseña (usuario autenticado)
 *
 * @description
 * DTO utilizado cuando un usuario autenticado desea cambiar su contraseña.
 * Requiere proporcionar la contraseña actual y la nueva contraseña.
 *
 * @security
 * - Requiere autenticación JWT (JwtAuthGuard)
 * - Valida contraseña actual antes de actualizar
 * - Nueva contraseña debe tener mínimo 8 caracteres
 * - Nueva contraseña debe ser diferente a la actual
 *
 * @usage
 * PUT /auth/change-password
 * Headers: Authorization: Bearer {jwt_token}
 * Body: { current_password, new_password }
 *
 * @see PasswordController.changePassword
 * @see AuthService.changePassword
 */
export class ChangePasswordDto {
  /**
   * Contraseña actual del usuario
   *
   * @example "MyCurrentP@ssw0rd"
   */
  @ApiProperty({
    description: 'Contraseña actual del usuario',
    example: 'MyCurrentP@ssw0rd',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña actual es requerida' })
    current_password!: string;

  /**
   * Nueva contraseña (mínimo 8 caracteres)
   *
   * @example "MyNewP@ssw0rd123"
   */
  @ApiProperty({
    description: 'Nueva contraseña (mínimo 8 caracteres)',
    example: 'MyNewP@ssw0rd123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' })
    new_password!: string;
}
