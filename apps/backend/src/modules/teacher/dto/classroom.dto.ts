/**
 * Classroom DTOs for Teacher Module
 *
 * @description DTOs para operaciones CRUD de classrooms desde el portal de teacher
 * @module modules/teacher/dto/classroom
 */

import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsBoolean,
  IsInt,
  IsDateString,
  Min,
  Max,
  Length,
  IsArray,
  ValidateNested,
    Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

// ============================================================================
// SCHEDULE ITEM DTO
// ============================================================================

/**
 * DTO para un elemento de horario de clase
 */
export class ScheduleItemDto {
  @ApiProperty({
    description: 'Día de la semana',
    example: 'lunes',
    enum: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'],
  })
  @IsString()
  @IsNotEmpty()
    day!: string;

  @ApiProperty({
    description: 'Hora de inicio (formato HH:MM)',
    example: '08:00',
  })
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'start_time debe tener formato HH:MM (ej: 08:00)',
  })
    start_time!: string;

  @ApiProperty({
    description: 'Hora de fin (formato HH:MM)',
    example: '10:00',
  })
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'end_time debe tener formato HH:MM (ej: 10:00)',
  })
    end_time!: string;
}

// ============================================================================
// CLASSROOM SETTINGS DTO
// ============================================================================

/**
 * DTO para configuraciones del aula
 */
export class ClassroomSettingsDto {
  @ApiPropertyOptional({
    description: 'Requiere aprobación para unirse',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
    require_approval?: boolean;

  @ApiPropertyOptional({
    description: 'Visible en el directorio de aulas',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
    visible_in_directory?: boolean;

  @ApiPropertyOptional({
    description: 'Permite auto-inscripción',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
    allow_self_enrollment?: boolean;

  @ApiPropertyOptional({
    description: 'Notificar a estudiantes de nuevas actividades',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
    notify_new_activities?: boolean;

  @ApiPropertyOptional({
    description: 'Mostrar leaderboard en el aula',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
    show_leaderboard?: boolean;
}

// ============================================================================
// CREATE CLASSROOM DTO
// ============================================================================

/**
 * DTO para crear un nuevo classroom desde el portal teacher
 *
 * @description Datos requeridos para crear un classroom desde el portal teacher.
 * Renombrado para evitar conflicto con CreateClassroomDto del módulo social.
 */
export class CreateTeacherClassroomDto {
  @ApiProperty({
    description: 'Nombre del aula',
    example: 'Matemáticas 5A',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
    name!: string;

  @ApiPropertyOptional({
    description: 'Código único de acceso al aula',
    example: 'MAT-5A-2024',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @Length(3, 50)
    code?: string;

  @ApiPropertyOptional({
    description: 'Descripción del aula',
    example: 'Aula de matemáticas para quinto grado, sección A',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @Length(0, 500)
    description?: string;

  @ApiPropertyOptional({
    description: 'Nivel de grado',
    example: '5',
  })
  @IsString()
  @IsOptional()
    grade_level?: string;

  @ApiPropertyOptional({
    description: 'Sección',
    example: 'A',
  })
  @IsString()
  @IsOptional()
    section?: string;

  @ApiPropertyOptional({
    description: 'Materia o asignatura',
    example: 'Matemáticas',
  })
  @IsString()
  @IsOptional()
    subject?: string;

  @ApiPropertyOptional({
    description: 'Año académico',
    example: '2024-2025',
  })
  @IsString()
  @IsOptional()
    academic_year?: string;

  @ApiPropertyOptional({
    description: 'Semestre',
    example: '1',
  })
  @IsString()
  @IsOptional()
    semester?: string;

  @ApiPropertyOptional({
    description: 'Capacidad máxima de estudiantes',
    example: 40,
    minimum: 1,
    maximum: 200,
    default: 40,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(200)
    capacity?: number;

  @ApiPropertyOptional({
    description: 'Horario de clases',
    example: [
      {
        day: 'lunes',
        start_time: '08:00',
        end_time: '10:00',
      },
    ],
    type: [ScheduleItemDto],
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ScheduleItemDto)
    schedule?: ScheduleItemDto[];

  @ApiPropertyOptional({
    description: 'URL de reunión virtual',
    example: 'https://meet.google.com/abc-defg-hij',
  })
  @IsString()
  @IsOptional()
    meeting_url?: string;

  @ApiPropertyOptional({
    description: 'Fecha de inicio del curso',
    example: '2024-09-01',
  })
  @IsDateString()
  @IsOptional()
    start_date?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin del curso',
    example: '2025-06-30',
  })
  @IsDateString()
  @IsOptional()
    end_date?: string;

  @ApiPropertyOptional({
    description: 'Configuraciones adicionales del aula',
    example: {
      require_approval: true,
      visible_in_directory: true,
      allow_self_enrollment: false,
    },
    type: ClassroomSettingsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ClassroomSettingsDto)
    settings?: ClassroomSettingsDto;

  @ApiPropertyOptional({
    description: 'ID de la escuela (si aplica)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
    school_id?: string;
}

// ============================================================================
// UPDATE CLASSROOM DTO
// ============================================================================

/**
 * DTO para actualizar un classroom existente desde el portal teacher
 *
 * @description Versión parcial de CreateTeacherClassroomDto.
 * Renombrado para evitar conflicto con DTOs del módulo social.
 */
export class UpdateTeacherClassroomDto extends PartialType(CreateTeacherClassroomDto) {
  @ApiPropertyOptional({
    description: 'Marcar aula como activa/inactiva',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
    is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Marcar aula como archivada',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
    is_archived?: boolean;
}

// ============================================================================
// QUERY DTOs
// ============================================================================

/**
 * DTO para queries de búsqueda de classrooms
 */
export class GetClassroomsQueryDto {
  @ApiPropertyOptional({
    description: 'Número de página',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
    page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de resultados por página',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(100)
  @Type(() => Number)
    limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Búsqueda por nombre o código',
    example: 'matemáticas',
  })
  @IsString()
  @IsOptional()
    search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado',
    example: 'active',
    enum: ['active', 'inactive', 'archived', 'all'],
  })
  @IsString()
  @IsOptional()
    status?: 'active' | 'inactive' | 'archived' | 'all';

  @ApiPropertyOptional({
    description: 'Filtrar por nivel de grado',
    example: '5',
  })
  @IsString()
  @IsOptional()
    grade_level?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por materia',
    example: 'Matemáticas',
  })
  @IsString()
  @IsOptional()
    subject?: string;
}

/**
 * DTO para queries de estudiantes en un classroom
 */
export class GetClassroomStudentsQueryDto {
  @ApiPropertyOptional({
    description: 'Número de página',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
    page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de resultados por página',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(100)
  @Type(() => Number)
    limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Búsqueda por nombre o email',
    example: 'Juan',
  })
  @IsString()
  @IsOptional()
    search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado de membresía',
    example: 'active',
    enum: ['active', 'inactive', 'withdrawn', 'completed', 'all'],
  })
  @IsString()
  @IsOptional()
    status?: 'active' | 'inactive' | 'withdrawn' | 'completed' | 'all';

  @ApiPropertyOptional({
    description: 'Ordenar por campo',
    example: 'name',
    enum: ['name', 'progress', 'score', 'last_activity'],
  })
  @IsString()
  @IsOptional()
    sort_by?: 'name' | 'progress' | 'score' | 'last_activity';

  @ApiPropertyOptional({
    description: 'Orden de clasificación',
    example: 'asc',
    enum: ['asc', 'desc'],
  })
  @IsString()
  @IsOptional()
    sort_order?: 'asc' | 'desc';
}
