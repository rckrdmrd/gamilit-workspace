/**
 * Classroom Response DTOs for Teacher Module
 *
 * @description DTOs de respuesta para endpoints de classrooms
 * @module modules/teacher/dto/classroom-response
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ============================================================================
// CLASSROOM RESPONSE DTO (Basic)
// ============================================================================

/**
 * DTO básico de respuesta para un classroom desde el portal teacher
 *
 * @description Información básica de un classroom para listados en el portal teacher.
 * Renombrado para evitar conflicto con ClassroomResponseDto del módulo social.
 */
export class TeacherClassroomResponseDto {
  @ApiProperty({
    description: 'ID del classroom',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'ID del tenant propietario',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  tenant_id!: string;

  @ApiProperty({
    description: 'Nombre del aula',
    example: 'Matemáticas 5A',
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Código único de acceso',
    example: 'MAT-5A-2024',
  })
  code?: string;

  @ApiPropertyOptional({
    description: 'Descripción',
    example: 'Aula de matemáticas para quinto grado',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Nivel de grado',
    example: '5',
  })
  grade_level?: string;

  @ApiPropertyOptional({
    description: 'Sección',
    example: 'A',
  })
  section?: string;

  @ApiPropertyOptional({
    description: 'Materia',
    example: 'Matemáticas',
  })
  subject?: string;

  @ApiPropertyOptional({
    description: 'Año académico',
    example: '2024-2025',
  })
  academic_year?: string;

  @ApiProperty({
    description: 'ID del profesor principal',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  teacher_id!: string;

  @ApiProperty({
    description: 'Capacidad máxima',
    example: 40,
  })
  capacity!: number;

  @ApiProperty({
    description: 'Cantidad actual de estudiantes',
    example: 28,
  })
  current_students_count!: number;

  @ApiPropertyOptional({
    description: 'Horario de clases',
    example: [{ day: 'lunes', start_time: '08:00', end_time: '10:00' }],
  })
  schedule?: any[];

  @ApiProperty({
    description: 'Aula activa',
    example: true,
  })
  is_active!: boolean;

  @ApiProperty({
    description: 'Aula archivada',
    example: false,
  })
  is_archived!: boolean;

  @ApiPropertyOptional({
    description: 'Fecha de inicio',
    example: '2024-09-01',
  })
  start_date?: Date;

  @ApiPropertyOptional({
    description: 'Fecha de fin',
    example: '2025-06-30',
  })
  end_date?: Date;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-08-15T10:00:00Z',
  })
  created_at!: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-11-24T15:30:00Z',
  })
  updated_at!: Date;
}

// ============================================================================
// CLASSROOM DETAIL RESPONSE DTO (Extended)
// ============================================================================

/**
 * DTO detallado de respuesta para un classroom desde el portal teacher
 *
 * @description Información completa de un classroom incluyendo configuraciones.
 * Renombrado para evitar conflicto con DTOs del módulo social.
 */
export class TeacherClassroomDetailResponseDto extends TeacherClassroomResponseDto {
  @ApiPropertyOptional({
    description: 'ID de la escuela',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  school_id?: string;

  @ApiPropertyOptional({
    description: 'IDs de co-profesores',
    example: ['123e4567-e89b-12d3-a456-426614174004'],
  })
  co_teachers?: string[];

  @ApiPropertyOptional({
    description: 'Semestre',
    example: '1',
  })
  semester?: string;

  @ApiPropertyOptional({
    description: 'URL de reunión virtual',
    example: 'https://meet.google.com/abc-defg-hij',
  })
  meeting_url?: string;

  @ApiProperty({
    description: 'Configuraciones del aula',
    example: {
      require_approval: true,
      visible_in_directory: true,
      allow_self_enrollment: false,
    },
  })
  settings!: Record<string, any>;

  @ApiProperty({
    description: 'Metadatos adicionales',
    example: {},
  })
  metadata!: Record<string, any>;
}

// ============================================================================
// STUDENT IN CLASSROOM DTO
// ============================================================================

/**
 * DTO para información de un estudiante dentro de un classroom
 *
 * @description Datos del estudiante con información de membresía y progreso
 */
export class StudentInClassroomDto {
  @ApiProperty({
    description: 'ID del estudiante (user_id)',
    example: '123e4567-e89b-12d3-a456-426614174005',
  })
  user_id!: string;

  @ApiProperty({
    description: 'Nombre completo del estudiante',
    example: 'Juan Pérez',
  })
  full_name!: string;

  @ApiPropertyOptional({
    description: 'Email del estudiante',
    example: 'juan.perez@example.com',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'Avatar URL',
    example: 'https://example.com/avatars/juan.jpg',
  })
  avatar?: string;

  @ApiProperty({
    description: 'Fecha de inscripción',
    example: '2024-09-01T08:00:00Z',
  })
  enrollment_date!: Date;

  @ApiProperty({
    description: 'Estado de membresía',
    example: 'active',
    enum: ['active', 'inactive', 'withdrawn', 'completed'],
  })
  status!: string;

  @ApiPropertyOptional({
    description: 'Porcentaje de progreso',
    example: 75.5,
  })
  progress_percentage?: number;

  @ApiPropertyOptional({
    description: 'Promedio de calificaciones',
    example: 8.5,
  })
  score_average?: number;

  @ApiPropertyOptional({
    description: 'Última actividad',
    example: '2024-11-24T14:30:00Z',
  })
  last_activity?: Date;

  @ApiPropertyOptional({
    description: 'Porcentaje de asistencia',
    example: 95.0,
  })
  attendance_percentage?: number;

  @ApiPropertyOptional({
    description: 'Notas del profesor',
    example: 'Estudiante destacado, participativo en clase',
  })
  teacher_notes?: string;

  // ============================================================================
  // CAMPOS ADICIONALES PARA INTEGRACIÓN STUDENT-TEACHER (GAP-ST-002, GAP-ST-003, GAP-ST-004)
  // ============================================================================

  @ApiPropertyOptional({
    description: 'Módulo actual en el que trabaja el estudiante',
    example: 'Módulo 2: Comprensión Inferencial',
  })
  current_module?: string | null;

  @ApiPropertyOptional({
    description: 'Ejercicio actual en el que trabaja el estudiante',
    example: 'Detective Textual - Conexiones',
  })
  current_exercise?: string | null;

  @ApiPropertyOptional({
    description: 'Tiempo total dedicado en minutos',
    example: 245,
  })
  time_spent_minutes?: number;

  @ApiPropertyOptional({
    description: 'Ejercicios completados',
    example: 15,
  })
  exercises_completed?: number;

  @ApiPropertyOptional({
    description: 'Total de ejercicios asignados',
    example: 20,
  })
  exercises_total?: number;

  @ApiPropertyOptional({
    description: 'Balance de ML Coins del estudiante',
    example: 850,
  })
  total_ml_coins?: number;

  @ApiPropertyOptional({
    description: 'Rango Maya actual del estudiante',
    example: 'Nacom',
  })
  current_rank?: string | null;

  @ApiPropertyOptional({
    description: 'Cantidad de logros desbloqueados',
    example: 12,
  })
  achievements_count?: number;
}

// ============================================================================
// CLASSROOM STATS DTO
// ============================================================================

/**
 * DTO para estadísticas de un classroom
 *
 * @description Métricas agregadas del classroom
 */
export class ClassroomStatsDto {
  @ApiProperty({
    description: 'ID del classroom',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  classroom_id!: string;

  @ApiProperty({
    description: 'Total de estudiantes',
    example: 28,
  })
  total_students!: number;

  @ApiProperty({
    description: 'Estudiantes activos',
    example: 26,
  })
  active_students!: number;

  @ApiProperty({
    description: 'Progreso promedio (%)',
    example: 68.5,
  })
  avg_progress!: number;

  @ApiProperty({
    description: 'Tasa de completitud (%)',
    example: 45.2,
  })
  completion_rate!: number;

  @ApiProperty({
    description: 'Calificación promedio',
    example: 7.8,
  })
  avg_score!: number;

  @ApiProperty({
    description: 'Porcentaje de asistencia promedio',
    example: 92.5,
  })
  avg_attendance!: number;

  @ApiPropertyOptional({
    description: 'Total de ejercicios asignados',
    example: 120,
  })
  total_exercises?: number;

  @ApiPropertyOptional({
    description: 'Total de ejercicios completados',
    example: 85,
  })
  completed_exercises?: number;

  @ApiPropertyOptional({
    description: 'Tasa de engagement (%)',
    example: 78.3,
  })
  engagement_rate?: number;
}

// ============================================================================
// TEACHER IN CLASSROOM DTO
// ============================================================================

/**
 * DTO para información de un teacher en un classroom
 *
 * @description Datos del teacher con su rol en el aula
 */
export class TeacherInClassroomDto {
  @ApiProperty({
    description: 'ID del teacher (user_id)',
    example: '123e4567-e89b-12d3-a456-426614174006',
  })
  user_id!: string;

  @ApiProperty({
    description: 'Nombre completo del teacher',
    example: 'María González',
  })
  full_name!: string;

  @ApiPropertyOptional({
    description: 'Email del teacher',
    example: 'maria.gonzalez@example.com',
  })
  email?: string;

  @ApiProperty({
    description: 'Rol en el classroom',
    example: 'owner',
    enum: ['owner', 'teacher', 'assistant'],
  })
  role!: string;

  @ApiProperty({
    description: 'Fecha de asignación',
    example: '2024-08-15T10:00:00Z',
  })
  assigned_at!: Date;
}

// ============================================================================
// PAGINATED RESPONSE DTO
// ============================================================================

/**
 * DTO genérico para respuestas paginadas
 *
 * @description Wrapper para respuestas con paginación
 */
export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Datos de la página actual',
    isArray: true,
  })
  data!: T[];

  @ApiProperty({
    description: 'Información de paginación',
    example: {
      page: 1,
      limit: 10,
      total: 45,
      totalPages: 5,
      hasNextPage: true,
      hasPreviousPage: false,
    },
  })
  pagination!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * DTO específico para respuesta paginada de classrooms del portal teacher
 */
export class PaginatedTeacherClassroomsResponseDto extends PaginatedResponseDto<TeacherClassroomResponseDto> {
  @ApiProperty({
    description: 'Lista de classrooms',
    type: [TeacherClassroomResponseDto],
  })
  declare data: TeacherClassroomResponseDto[];
}

/**
 * DTO específico para respuesta paginada de estudiantes
 */
export class PaginatedStudentsResponseDto extends PaginatedResponseDto<StudentInClassroomDto> {
  @ApiProperty({
    description: 'Lista de estudiantes',
    type: [StudentInClassroomDto],
  })
  declare data: StudentInClassroomDto[];
}
