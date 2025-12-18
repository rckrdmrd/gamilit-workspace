import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * FeatureFlagQueryDto
 *
 * @description DTO para filtrar feature flags en consultas GET
 * @usedBy FeatureFlagsController.findAll()
 */
export class FeatureFlagQueryDto {
  @ApiProperty({
    description: 'Filtrar por estado habilitado/deshabilitado',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
    isEnabled?: boolean;

  @ApiProperty({
    description: 'Filtrar por categoría',
    example: 'gamification',
    required: false,
  })
  @IsString()
  @IsOptional()
    category?: string;
}
