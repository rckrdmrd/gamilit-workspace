import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * ListTeachersQueryDto
 *
 * @description Query params para listar profesores
 * @usage GET /admin/teachers/list?search=Juan&limit=50
 */
export class ListTeachersQueryDto {
  @ApiPropertyOptional({
    description: 'Filtro de búsqueda por nombre o email',
    example: 'Juan',
  })
  @IsOptional()
  @IsString()
    search?: string;

  @ApiPropertyOptional({
    description: 'Límite de resultados (default: 50, max: 100)',
    example: 50,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
    limit?: number;

  @ApiPropertyOptional({
    description: 'ID de la escuela/tenant (filtrar por tenant)',
    example: '660e8400-e29b-41d4-a716-446655440010',
  })
  @IsOptional()
  @IsString()
    schoolId?: string;
}
