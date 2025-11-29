import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para información de progreso del classroom
 */
export class ClassroomProgressDataDto {
  @ApiProperty({
    description: 'ID del classroom',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
    id!: string;

  @ApiProperty({
    description: 'Nombre del classroom',
    example: 'Matemáticas 5A',
  })
  @IsString()
    name!: string;

  @ApiProperty({
    description: 'Total de estudiantes en el classroom',
    example: 25,
  })
  @IsNumber()
    student_count!: number;

  @ApiProperty({
    description: 'Número de estudiantes activos (con actividad en últimos 7 días)',
    example: 22,
  })
  @IsNumber()
    active_students!: number;

  @ApiProperty({
    description: 'Porcentaje promedio de completación de ejercicios',
    example: 75.5,
  })
  @IsNumber()
    average_completion!: number;

  @ApiProperty({
    description: 'Score promedio de todos los ejercicios completados',
    example: 85.3,
  })
  @IsNumber()
    average_score!: number;

  @ApiProperty({
    description: 'Total de ejercicios disponibles/asignados',
    example: 50,
  })
  @IsNumber()
    total_exercises!: number;

  @ApiProperty({
    description: 'Número de ejercicios completados por al menos 1 estudiante',
    example: 40,
  })
  @IsNumber()
    completed_exercises!: number;
}

/**
 * DTO para progreso por módulo
 */
export class ModuleProgressItemDto {
  @ApiProperty({
    description: 'ID del módulo',
    example: '456e7890-a12b-34c5-d678-901234567890',
  })
  @IsUUID()
    module_id!: string;

  @ApiProperty({
    description: 'Nombre del módulo',
    example: 'Módulo 1: Marie Curie - Primera Exploración',
  })
  @IsString()
    module_name!: string;

  @ApiProperty({
    description: 'Porcentaje de completación del módulo',
    example: 68.5,
  })
  @IsNumber()
    completion_percentage!: number;

  @ApiProperty({
    description: 'Score promedio en el módulo',
    example: 82.7,
  })
  @IsNumber()
    average_score!: number;

  @ApiProperty({
    description: 'Número de estudiantes que completaron el módulo',
    example: 18,
  })
  @IsNumber()
    students_completed!: number;

  @ApiProperty({
    description: 'Total de estudiantes en el classroom',
    example: 25,
  })
  @IsNumber()
    students_total!: number;

  @ApiProperty({
    description: 'Tiempo promedio en minutos para completar el módulo',
    example: 120.5,
  })
  @IsNumber()
    average_time_minutes!: number;
}

/**
 * DTO de respuesta para el progreso del classroom
 */
export class ClassroomProgressResponseDto {
  @ApiProperty({
    description: 'Datos generales del classroom',
    type: ClassroomProgressDataDto,
  })
  @ValidateNested()
  @Type(() => ClassroomProgressDataDto)
    classroomData!: ClassroomProgressDataDto;

  @ApiProperty({
    description: 'Progreso por módulo',
    type: [ModuleProgressItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModuleProgressItemDto)
    moduleProgress!: ModuleProgressItemDto[];
}
