import { ApiProperty } from '@nestjs/swagger';

/**
 * PaginatedResponseDto
 *
 * DTO genérico para respuestas paginadas en toda la aplicación.
 * Estructura estándar: { data, total, page, limit, total_pages }
 *
 * @template T - Tipo del elemento en el array data
 *
 * @example
 * ```typescript
 * export class PaginatedUsersDto extends PaginatedResponseDto<UserDetailsDto> {}
 * ```
 *
 * @see docs/95-guias-desarrollo/backend/DTO-CONVENTIONS.md
 */
export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Array de elementos',
    isArray: true,
  })
    data!: T[];

  @ApiProperty({
    description: 'Total de elementos que coinciden con los filtros',
    example: 100,
  })
    total!: number;

  @ApiProperty({
    description: 'Número de página actual',
    example: 1,
  })
    page!: number;

  @ApiProperty({
    description: 'Cantidad de elementos por página',
    example: 20,
  })
    limit!: number;

  @ApiProperty({
    description: 'Total de páginas disponibles',
    example: 5,
  })
    total_pages!: number;
}
