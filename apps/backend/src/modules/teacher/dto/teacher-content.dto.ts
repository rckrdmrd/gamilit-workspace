/**
 * Teacher Content DTOs
 *
 * @description DTOs para gestión de contenido educativo personalizado creado por teachers
 * @module modules/teacher/dto/teacher-content
 */

import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsBoolean,
  IsInt,
  IsArray,
  IsObject,
  IsEnum,
  Min,
  Max,
  Length,
  } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Tipos de contenido que puede crear un teacher
 */
export enum TeacherContentType {
  CUSTOM_EXERCISE = 'custom_exercise',
  WORKSHEET = 'worksheet',
  READING_MATERIAL = 'reading_material',
  VIDEO_LESSON = 'video_lesson',
  PRESENTATION = 'presentation',
  QUIZ = 'quiz',
  ASSIGNMENT = 'assignment',
  RESOURCE_PACK = 'resource_pack',
  OTHER = 'other',
}

/**
 * Nivel de dificultad del contenido
 */
export enum TeacherContentDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert',
}

/**
 * Visibilidad del contenido
 */
export enum TeacherContentVisibility {
  PRIVATE = 'private', // Solo el creador
  CLASSROOM = 'classroom', // Aulas asignadas
  SCHOOL = 'school', // Todos los teachers del tenant
  PUBLIC = 'public', // Todos los usuarios
}

/**
 * Estado del contenido
 */
export enum TeacherContentStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

// ============================================================================
// CREATE DTO
// ============================================================================

/**
 * DTO para crear contenido educativo personalizado
 */
export class CreateTeacherContentDto {
  @ApiProperty({
    description: 'Título del contenido',
    example: 'Ejercicio de Fracciones Interactivo',
    minLength: 3,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 255)
    title!: string;

  @ApiPropertyOptional({
    description: 'Descripción del contenido',
    example: 'Ejercicios interactivos para practicar operaciones con fracciones',
  })
  @IsString()
  @IsOptional()
    description?: string;

  @ApiProperty({
    description: 'Tipo de contenido',
    enum: TeacherContentType,
    example: TeacherContentType.CUSTOM_EXERCISE,
  })
  @IsEnum(TeacherContentType)
  @IsNotEmpty()
    content_type!: TeacherContentType;

  @ApiProperty({
    description: 'Datos del contenido (estructura varía según content_type)',
    example: {
      questions: [
        { id: 1, text: '¿Cuánto es 1/2 + 1/4?', answer: '3/4' },
      ],
    },
  })
  @IsObject()
  @IsNotEmpty()
    content_data!: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Instrucciones para el estudiante',
    example: 'Resuelve cada ejercicio y muestra tu procedimiento',
  })
  @IsString()
  @IsOptional()
    instructions?: string;

  @ApiPropertyOptional({
    description: 'Objetivos de aprendizaje',
    example: ['Sumar fracciones', 'Restar fracciones', 'Simplificar fracciones'],
  })
  @IsArray()
  @IsOptional()
    learning_objectives?: string[];

  @ApiPropertyOptional({
    description: 'Prerrequisitos necesarios',
    example: ['Conocer fracciones básicas', 'Saber multiplicar'],
  })
  @IsArray()
  @IsOptional()
    prerequisites?: string[];

  @ApiPropertyOptional({
    description: 'Área de asignatura',
    example: 'Matemáticas',
  })
  @IsString()
  @IsOptional()
    subject_area?: string;

  @ApiPropertyOptional({
    description: 'Nivel de grado',
    example: '5',
  })
  @IsString()
  @IsOptional()
    grade_level?: string;

  @ApiPropertyOptional({
    description: 'Nivel de dificultad',
    enum: TeacherContentDifficulty,
    example: TeacherContentDifficulty.MEDIUM,
  })
  @IsEnum(TeacherContentDifficulty)
  @IsOptional()
    difficulty_level?: TeacherContentDifficulty;

  @ApiPropertyOptional({
    description: 'Duración estimada en minutos',
    example: 30,
    minimum: 1,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
    estimated_duration_minutes?: number;

  @ApiPropertyOptional({
    description: 'Recursos multimedia (array de UUIDs o URLs)',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
  })
  @IsArray()
  @IsOptional()
    media_resources?: Record<string, unknown>[];

  @ApiPropertyOptional({
    description: 'Archivos adjuntos',
    example: [{ name: 'guia.pdf', url: 'https://...' }],
  })
  @IsArray()
  @IsOptional()
    attachments?: Record<string, unknown>[];

  @ApiPropertyOptional({
    description: 'IDs de aulas objetivo',
    example: ['classroom-uuid-1', 'classroom-uuid-2'],
  })
  @IsArray()
  @IsOptional()
  @IsUUID('4', { each: true })
    target_classrooms?: string[];

  @ApiPropertyOptional({
    description: 'Visibilidad del contenido',
    enum: TeacherContentVisibility,
    example: TeacherContentVisibility.PRIVATE,
    default: TeacherContentVisibility.PRIVATE,
  })
  @IsEnum(TeacherContentVisibility)
  @IsOptional()
    visibility?: TeacherContentVisibility;

  @ApiPropertyOptional({
    description: 'Compartir con otros teachers',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
    is_shared?: boolean;

  @ApiPropertyOptional({
    description: 'IDs de teachers con acceso compartido',
    example: ['teacher-uuid-1'],
  })
  @IsArray()
  @IsOptional()
  @IsUUID('4', { each: true })
    shared_with_teachers?: string[];

  @ApiPropertyOptional({
    description: 'Permitir modificaciones por otros teachers',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
    allow_modifications?: boolean;

  @ApiPropertyOptional({
    description: 'Estado del contenido',
    enum: TeacherContentStatus,
    example: TeacherContentStatus.DRAFT,
    default: TeacherContentStatus.DRAFT,
  })
  @IsEnum(TeacherContentStatus)
  @IsOptional()
    status?: TeacherContentStatus;

  @ApiPropertyOptional({
    description: 'Etiquetas para categorización',
    example: ['geometría', 'resolución de problemas'],
  })
  @IsArray()
  @IsOptional()
    tags?: string[];

  @ApiPropertyOptional({
    description: 'Palabras clave para búsqueda',
    example: ['fracciones', 'matemáticas', 'ejercicios'],
  })
  @IsArray()
  @IsOptional()
    keywords?: string[];

  @ApiPropertyOptional({
    description: 'Puntos que otorga al completar',
    example: 100,
    minimum: 0,
    default: 0,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
    points_value?: number;

  @ApiPropertyOptional({
    description: 'ML coins que otorga al completar',
    example: 50,
    minimum: 0,
    default: 0,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
    ml_coins_reward?: number;

  @ApiPropertyOptional({
    description: 'Usar como plantilla',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
    is_template?: boolean;

  @ApiPropertyOptional({
    description: 'Metadatos adicionales',
    example: { custom_field: 'value' },
  })
  @IsObject()
  @IsOptional()
    metadata?: Record<string, unknown>;
}

// ============================================================================
// UPDATE DTO
// ============================================================================

/**
 * DTO para actualizar contenido educativo personalizado
 */
export class UpdateTeacherContentDto extends PartialType(CreateTeacherContentDto) {
  @ApiPropertyOptional({
    description: 'Marcar como activo/inactivo',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
    is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Marcar como destacado',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
    is_featured?: boolean;
}

// ============================================================================
// QUERY DTOs
// ============================================================================

/**
 * DTO para consultas de listado de contenido
 */
export class GetTeacherContentQueryDto {
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
    description: 'Búsqueda por título, descripción o palabras clave',
    example: 'fracciones',
  })
  @IsString()
  @IsOptional()
    search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de contenido',
    enum: TeacherContentType,
    example: TeacherContentType.CUSTOM_EXERCISE,
  })
  @IsEnum(TeacherContentType)
  @IsOptional()
    content_type?: TeacherContentType;

  @ApiPropertyOptional({
    description: 'Filtrar por estado',
    enum: TeacherContentStatus,
    example: TeacherContentStatus.PUBLISHED,
  })
  @IsEnum(TeacherContentStatus)
  @IsOptional()
    status?: TeacherContentStatus;

  @ApiPropertyOptional({
    description: 'Filtrar por visibilidad',
    enum: TeacherContentVisibility,
    example: TeacherContentVisibility.PRIVATE,
  })
  @IsEnum(TeacherContentVisibility)
  @IsOptional()
    visibility?: TeacherContentVisibility;

  @ApiPropertyOptional({
    description: 'Filtrar por área de asignatura',
    example: 'Matemáticas',
  })
  @IsString()
  @IsOptional()
    subject_area?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por nivel de grado',
    example: '5',
  })
  @IsString()
  @IsOptional()
    grade_level?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por dificultad',
    enum: TeacherContentDifficulty,
    example: TeacherContentDifficulty.MEDIUM,
  })
  @IsEnum(TeacherContentDifficulty)
  @IsOptional()
    difficulty_level?: TeacherContentDifficulty;

  @ApiPropertyOptional({
    description: 'Filtrar solo plantillas',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
    is_template?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar solo activos',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
    is_active?: boolean = true;
}

// ============================================================================
// RESPONSE DTOs
// ============================================================================

/**
 * DTO de respuesta para contenido educativo
 */
export class TeacherContentResponseDto {
  @ApiProperty({
    description: 'ID del contenido',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
    id!: string;

  @ApiProperty({
    description: 'ID del teacher creador',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
    teacher_id!: string;

  @ApiProperty({
    description: 'ID del tenant',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
    tenant_id!: string;

  @ApiProperty({
    description: 'Título del contenido',
    example: 'Ejercicio de Fracciones Interactivo',
  })
    title!: string;

  @ApiPropertyOptional({
    description: 'Descripción del contenido',
    example: 'Ejercicios interactivos para practicar operaciones con fracciones',
  })
    description?: string;

  @ApiProperty({
    description: 'Tipo de contenido',
    enum: TeacherContentType,
    example: TeacherContentType.CUSTOM_EXERCISE,
  })
    content_type!: TeacherContentType;

  @ApiProperty({
    description: 'Datos del contenido',
  })
    content_data!: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Instrucciones',
  })
    instructions?: string;

  @ApiPropertyOptional({
    description: 'Objetivos de aprendizaje',
  })
    learning_objectives?: string[];

  @ApiPropertyOptional({
    description: 'Prerrequisitos',
  })
    prerequisites?: string[];

  @ApiPropertyOptional({
    description: 'Área de asignatura',
    example: 'Matemáticas',
  })
    subject_area?: string;

  @ApiPropertyOptional({
    description: 'Nivel de grado',
    example: '5',
  })
    grade_level?: string;

  @ApiPropertyOptional({
    description: 'Nivel de dificultad',
    enum: TeacherContentDifficulty,
  })
    difficulty_level?: TeacherContentDifficulty;

  @ApiPropertyOptional({
    description: 'Duración estimada en minutos',
    example: 30,
  })
    estimated_duration_minutes?: number;

  @ApiPropertyOptional({
    description: 'Aulas objetivo',
  })
    target_classrooms?: string[];

  @ApiProperty({
    description: 'Visibilidad',
    enum: TeacherContentVisibility,
    example: TeacherContentVisibility.PRIVATE,
  })
    visibility!: TeacherContentVisibility;

  @ApiProperty({
    description: 'Estado',
    enum: TeacherContentStatus,
    example: TeacherContentStatus.DRAFT,
  })
    status!: TeacherContentStatus;

  @ApiProperty({
    description: 'Activo',
    example: true,
  })
    is_active!: boolean;

  @ApiProperty({
    description: 'Es plantilla',
    example: false,
  })
    is_template!: boolean;

  @ApiProperty({
    description: 'Compartido',
    example: false,
  })
    is_shared!: boolean;

  @ApiPropertyOptional({
    description: 'Puntos que otorga',
    example: 100,
  })
    points_value?: number;

  @ApiPropertyOptional({
    description: 'ML coins que otorga',
    example: 50,
  })
    ml_coins_reward?: number;

  @ApiPropertyOptional({
    description: 'Veces asignado',
    example: 5,
  })
    times_assigned?: number;

  @ApiPropertyOptional({
    description: 'Veces completado',
    example: 3,
  })
    times_completed?: number;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-15T10:30:00Z',
  })
    created_at!: Date;

  @ApiProperty({
    description: 'Fecha de actualización',
    example: '2024-01-15T10:30:00Z',
  })
    updated_at!: Date;

  @ApiPropertyOptional({
    description: 'Fecha de publicación',
    example: '2024-01-15T10:30:00Z',
  })
    published_at?: Date;
}

/**
 * DTO de respuesta paginada
 */
export class PaginatedTeacherContentResponseDto {
  @ApiProperty({
    description: 'Lista de contenidos',
    type: [TeacherContentResponseDto],
  })
    data!: TeacherContentResponseDto[];

  @ApiProperty({
    description: 'Información de paginación',
    example: {
      page: 1,
      limit: 10,
      total: 25,
      totalPages: 3,
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
 * DTO para clonar contenido
 */
export class CloneTeacherContentDto {
  @ApiPropertyOptional({
    description: 'Nuevo título (si se omite, se agrega "Copia de" al original)',
    example: 'Mi versión del ejercicio',
  })
  @IsString()
  @IsOptional()
  @Length(3, 255)
    new_title?: string;

  @ApiPropertyOptional({
    description: 'Modificar el contenido al clonar',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
    modify_content?: boolean;
}
