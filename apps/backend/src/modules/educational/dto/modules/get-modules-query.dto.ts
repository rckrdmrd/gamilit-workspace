import { IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * GetModulesQueryDto
 *
 * @description DTO para query parameters del endpoint GET /modules.
 *              Permite filtrar módulos por classroom_id para mostrar solo
 *              módulos asignados al aula específica del estudiante.
 *
 * @example
 * GET /api/v1/educational/modules?classroomId=550e8400-e29b-41d4-a716-446655440000
 *
 * @author Backend-Agent
 * @date 2025-11-26
 */
export class GetModulesQueryDto {
  /**
   * ID del classroom para filtrar módulos asignados
   * Si se proporciona, retorna solo módulos de ese classroom (classroom_modules)
   * Si no se proporciona, retorna todos los módulos publicados (backward compatible)
   */
  @ApiProperty({
    description: 'ID del classroom para filtrar módulos asignados a ese aula',
    required: false,
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
    classroomId?: string;

  /**
   * ID del usuario para incluir progreso (opcional)
   * Si se proporciona, incluye información de progreso del usuario
   */
  @ApiProperty({
    description: 'ID del usuario para incluir información de progreso',
    required: false,
    type: String,
    example: '660e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID()
    userId?: string;
}
