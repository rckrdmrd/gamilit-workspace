import { IsArray, IsUUID, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * BulkActivateUsersDto
 * DTO para activar múltiples usuarios de forma masiva
 * Relacionado: EXT-002 (Admin Extendido - Bulk Operations)
 */
export class BulkActivateUsersDto {
  @ApiProperty({
    description: 'Array de UUIDs de usuarios a activar',
    example: ['123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe proporcionar al menos un usuario' })
  @ArrayMaxSize(500, { message: 'Máximo 500 usuarios por operación bulk (FIX-2025-01-07)' })
  @IsUUID('4', { each: true, message: 'Cada ID debe ser un UUID válido' })
    userIds!: string[];
}
