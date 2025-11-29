import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * ListClassroomsQueryDto
 *
 * @description Query params para listar aulas
 * @usage GET /admin/classrooms/list?search=Mat&limit=50
 */
export class ListClassroomsQueryDto {
  @ApiPropertyOptional({
    description: 'Filtro de búsqueda por nombre de aula',
    example: 'Matemáticas',
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
    description: 'ID de la escuela (filtrar por tenant)',
    example: '660e8400-e29b-41d4-a716-446655440010',
  })
  @IsOptional()
  @IsString()
    schoolId?: string;
}
