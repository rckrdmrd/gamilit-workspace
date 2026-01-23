import {
  IsString,
  IsBoolean,
  IsInt,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para un nivel de calificacion en un criterio de rubrica
 */
export class RubricLevelDto {
  @ApiProperty({
    description: 'Puntuacion del nivel',
    example: 3,
    minimum: 0,
    maximum: 10,
  })
  @IsInt()
  @Min(0)
  @Max(10)
  score!: number;

  @ApiProperty({
    description: 'Etiqueta del nivel',
    example: 'Excelente',
  })
  @IsString()
  label!: string;

  @ApiProperty({
    description: 'Descripcion del nivel',
    example: 'El estudiante demuestra dominio completo del concepto',
  })
  @IsString()
  description!: string;
}

/**
 * DTO para un criterio de evaluacion en la rubrica
 */
export class RubricCriteriaDto {
  @ApiPropertyOptional({
    description: 'ID unico del criterio (generado si no se proporciona)',
    example: 'clasificacion',
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({
    description: 'Nombre del criterio',
    example: 'Clasificacion de informacion',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'Descripcion del criterio',
    example: 'Capacidad para identificar y clasificar la informacion correctamente',
  })
  @IsString()
  description!: string;

  @ApiProperty({
    description: 'Peso del criterio (porcentaje, suma total debe ser 100)',
    example: 25,
    minimum: 1,
    maximum: 100,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  weight!: number;

  @ApiProperty({
    description: 'Niveles de calificacion para este criterio',
    type: [RubricLevelDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RubricLevelDto)
  levels!: RubricLevelDto[];
}

/**
 * CreateExerciseTypeRubricDto
 *
 * @description DTO para crear una rubrica estandar por tipo de ejercicio.
 *              Define criterios de evaluacion para M3, M4, M5 que requieren calificacion manual.
 */
export class CreateExerciseTypeRubricDto {
  @ApiProperty({
    description: 'Tipo de ejercicio al que aplica esta rubrica',
    example: 'verificador_fake_news',
  })
  @IsString()
  exerciseType!: string;

  @ApiProperty({
    description: 'Nombre descriptivo de la rubrica',
    example: 'Rubrica de Verificacion de Fake News',
  })
  @IsString()
  rubricName!: string;

  @ApiProperty({
    description: 'Criterios de evaluacion de la rubrica',
    type: [RubricCriteriaDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RubricCriteriaDto)
  criteria!: RubricCriteriaDto[];

  @ApiPropertyOptional({
    description: 'Peso total (debe sumar 100)',
    example: 100,
    default: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(100)
  totalWeight?: number;

  @ApiPropertyOptional({
    description: 'Si es la rubrica por defecto para este tipo de ejercicio',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({
    description: 'Codigo del modulo (M3, M4, M5)',
    example: 'M4',
  })
  @IsOptional()
  @IsString()
  moduleCode?: string;
}
