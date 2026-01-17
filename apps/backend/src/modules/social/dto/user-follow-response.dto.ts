import { ApiProperty } from '@nestjs/swagger';

/**
 * UserFollowResponseDto
 *
 * @description DTO de respuesta para operaciones de seguimiento.
 */
export class UserFollowResponseDto {
  @ApiProperty({
    description: 'ID único del registro de seguimiento',
    example: '660e8400-e29b-41d4-a716-446655440001',
  })
  id!: string;

  @ApiProperty({
    description: 'ID del usuario que sigue',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  follower_id!: string;

  @ApiProperty({
    description: 'ID del usuario seguido',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  following_id!: string;

  @ApiProperty({
    description: 'Fecha y hora del seguimiento',
    example: '2026-01-16T10:00:00Z',
  })
  followed_at!: Date;
}

/**
 * UserFollowCountsDto
 *
 * @description DTO para conteos de seguidores y seguidos.
 */
export class UserFollowCountsDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  user_id!: string;

  @ApiProperty({
    description: 'Cantidad de seguidores',
    example: 150,
  })
  followers_count!: number;

  @ApiProperty({
    description: 'Cantidad de usuarios seguidos',
    example: 75,
  })
  following_count!: number;
}
