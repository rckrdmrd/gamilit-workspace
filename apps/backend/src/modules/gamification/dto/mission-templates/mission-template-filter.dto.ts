import { IsOptional, IsEnum, IsBoolean, IsNumber, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  MissionTemplateTypeEnum,
  MissionTemplateDifficultyEnum,
} from '../../entities/mission-template.entity';

/**
 * Mission Template Filter DTO
 *
 * @description DTO para filtrar templates de misiones
 * @usage Usado en endpoint GET /api/v1/admin/mission-templates
 *
 * Permite filtrado por:
 * - Tipo (daily, weekly, special, classroom)
 * - Categoría
 * - Dificultad
 * - Estado activo/inactivo
 * - Nivel de usuario
 */
export class MissionTemplateFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by mission type',
    enum: MissionTemplateTypeEnum,
    example: MissionTemplateTypeEnum.DAILY,
  })
  @IsOptional()
  @IsEnum(MissionTemplateTypeEnum)
    type?: MissionTemplateTypeEnum;

  @ApiPropertyOptional({
    description: 'Filter by category',
    example: 'exercise',
  })
  @IsOptional()
  @IsString()
    category?: string;

  @ApiPropertyOptional({
    description: 'Filter by difficulty',
    enum: MissionTemplateDifficultyEnum,
    example: MissionTemplateDifficultyEnum.NORMAL,
  })
  @IsOptional()
  @IsEnum(MissionTemplateDifficultyEnum)
    difficulty?: MissionTemplateDifficultyEnum;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
    is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by minimum user level (templates with min_level <= this value)',
    example: 5,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
    user_level?: number;

  @ApiPropertyOptional({
    description: 'Limit number of results',
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
    limit?: number;

  @ApiPropertyOptional({
    description: 'Offset for pagination',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
    offset?: number;
}
