import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

/**
 * CreateUserFollowDto
 *
 * @description DTO para crear un nuevo seguimiento entre usuarios.
 * El follower_id se obtiene del token JWT del usuario autenticado.
 */
export class CreateUserFollowDto {
  /**
   * ID del usuario a seguir (UUID)
   * @example '550e8400-e29b-41d4-a716-446655440002'
   */
  @ApiProperty({
    description: 'ID del usuario a seguir en formato UUID',
    example: '550e8400-e29b-41d4-a716-446655440002',
    type: String,
    required: true,
  })
  @IsUUID('4', { message: 'following_id debe ser un UUID válido' })
  @IsNotEmpty({ message: 'following_id es requerido' })
  following_id!: string;
}
