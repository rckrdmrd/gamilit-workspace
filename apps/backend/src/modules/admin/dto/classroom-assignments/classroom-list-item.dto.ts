import { ApiProperty } from '@nestjs/swagger';

/**
 * ClassroomListItemDto
 *
 * @description DTO simplificado para listar aulas en dropdowns/selects
 * @usage GET /admin/classrooms/list
 *
 * CONTEXTO:
 * - Se usa para poblar dropdowns de selección de aulas
 * - Retorna solo los campos necesarios para identificación y búsqueda
 * - Optimizado para performance (no incluye relaciones complejas)
 */
export class ClassroomListItemDto {
  @ApiProperty({
    description: 'UUID del aula',
    example: '770e8400-e29b-41d4-a716-446655440020',
  })
  id!: string;

  @ApiProperty({
    description: 'Nombre del aula',
    example: 'Matemáticas 3A',
  })
  name!: string;

  @ApiProperty({
    description: 'Grado académico',
    example: '8',
    required: false,
  })
  grade?: string;

  @ApiProperty({
    description: 'Sección del aula',
    example: 'A',
    required: false,
  })
  section?: string;

  @ApiProperty({
    description: 'Nombre de la escuela (si aplica)',
    example: 'Colegio San José',
    required: false,
  })
  school_name?: string;

  @ApiProperty({
    description: 'Número actual de estudiantes',
    example: 25,
  })
  student_count!: number;
}
