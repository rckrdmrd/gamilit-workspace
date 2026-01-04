import { IsArray, IsUUID, IsEnum, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GamilityRoleEnum } from '@shared/constants';

/**
 * BulkUpdateRoleDto
 * DTO para actualizar roles de múltiples usuarios de forma masiva
 * Relacionado: EXT-002 (Admin Extendido - Bulk Operations)
 *
 * @note Usa GamilityRoleEnum alineado con DDL gamilit_role
 * @see DDL: auth_management.gamilit_role ENUM
 */
export class BulkUpdateRoleDto {
  @ApiProperty({
    description: 'Array de UUIDs de usuarios a actualizar',
    example: ['123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe proporcionar al menos un usuario' })
  @IsUUID('4', { each: true, message: 'Cada ID debe ser un UUID válido' })
    userIds!: string[];

  @ApiProperty({
    description: 'Nuevo rol a asignar',
    example: 'admin_teacher',
    enum: GamilityRoleEnum,
  })
  @IsEnum(GamilityRoleEnum, {
    message: 'Rol inválido. Debe ser: student, admin_teacher o super_admin',
  })
    newRole!: GamilityRoleEnum;
}
