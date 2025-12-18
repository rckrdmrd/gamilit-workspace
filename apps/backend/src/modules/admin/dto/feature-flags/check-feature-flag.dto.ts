import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * CheckFeatureFlagDto
 *
 * @description DTO para verificar si una feature está habilitada para un usuario
 * @usedBy FeatureFlagsService.isEnabled()
 */
export class CheckFeatureFlagDto {
  @ApiProperty({
    description: 'ID del usuario para verificar acceso (opcional)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsString()
  @IsOptional()
    userId?: string;

  @ApiProperty({
    description: 'ID del tenant para verificar acceso (opcional)',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: false,
  })
  @IsString()
  @IsOptional()
    tenantId?: string;

  @ApiProperty({
    description: 'ID del classroom para verificar acceso (opcional)',
    example: '550e8400-e29b-41d4-a716-446655440002',
    required: false,
  })
  @IsString()
  @IsOptional()
    classroomId?: string;
}

/**
 * FeatureFlagCheckResultDto
 *
 * @description DTO de respuesta para verificación de feature flags
 */
export class FeatureFlagCheckResultDto {
  @ApiProperty({
    description: 'Indica si la feature está habilitada para el contexto dado',
    example: true,
  })
    enabled!: boolean;

  @ApiProperty({
    description: 'Razón por la cual la feature está habilitada o deshabilitada',
    example: 'Feature enabled via rollout percentage',
  })
    reason!: string;
}
