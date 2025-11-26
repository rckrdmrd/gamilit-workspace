import { ApiProperty } from '@nestjs/swagger';

/**
 * TeacherListItemDto
 *
 * @description DTO simplificado para listar profesores en dropdowns/selects
 * @usage GET /admin/teachers/list
 *
 * CONTEXTO:
 * - Se usa para poblar dropdowns de selección de profesores
 * - Retorna solo los campos necesarios para identificación
 * - Filtra automáticamente por rol teacher/admin_teacher/super_admin
 */
export class TeacherListItemDto {
  @ApiProperty({
    description: 'UUID del usuario/profesor',
    example: '550e8400-e29b-41d4-a716-446655440005',
  })
  id!: string;

  @ApiProperty({
    description: 'Nombre completo del profesor',
    example: 'Juan Pérez González',
  })
  display_name!: string;

  @ApiProperty({
    description: 'Email del profesor',
    example: 'juan.perez@escuela.edu',
  })
  email!: string;

  @ApiProperty({
    description: 'Rol en la plataforma',
    example: 'admin_teacher',
  })
  role!: string;
}
