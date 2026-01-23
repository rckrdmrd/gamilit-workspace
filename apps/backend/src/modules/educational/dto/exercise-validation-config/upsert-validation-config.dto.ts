import {
  IsString,
  IsBoolean,
  IsInt,
  IsOptional,
  IsNumber,
  IsObject,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * UpsertValidationConfigDto
 *
 * @description DTO para crear o actualizar configuracion de validacion de ejercicios.
 *              Sistema Dual ADR-008: Define la funcion SQL y parametros de validacion.
 */
export class UpsertValidationConfigDto {
  @ApiProperty({
    description: 'Tipo de ejercicio al que aplica esta configuracion',
    example: 'crucigrama',
  })
  @IsString()
  exerciseType!: string;

  @ApiProperty({
    description: 'Nombre de la funcion SQL a usar para validar',
    example: 'validate_crucigrama',
  })
  @IsString()
  validationFunction!: string;

  @ApiPropertyOptional({
    description: 'Si la validacion distingue mayusculas/minusculas',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  caseSensitive?: boolean;

  @ApiPropertyOptional({
    description: 'Si permite credito parcial (puntaje proporcional)',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  allowPartialCredit?: boolean;

  @ApiPropertyOptional({
    description: 'Umbral para matching difuso (0.00 - 1.00)',
    example: 0.85,
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  fuzzyMatchingThreshold?: number;

  @ApiPropertyOptional({
    description: 'Si normaliza el texto antes de comparar (quitar acentos, etc)',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  normalizeText?: boolean;

  @ApiPropertyOptional({
    description: 'Reglas especiales para la validacion (JSONB)',
    example: { ignoreWhitespace: true, allowSynonyms: false },
  })
  @IsOptional()
  @IsObject()
  specialRules?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Puntuacion maxima por defecto',
    example: 100,
    default: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  defaultMaxPoints?: number;

  @ApiPropertyOptional({
    description: 'Puntuacion minima para aprobar por defecto',
    example: 70,
    default: 70,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  defaultPassingScore?: number;

  @ApiPropertyOptional({
    description: 'Descripcion de la configuracion',
    example: 'Configuracion de validacion para crucigramas con matching difuso',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Ejemplos de validacion (JSONB)',
    type: 'array',
    items: { type: 'object' },
    example: [
      { input: 'POLONIA', expected: 'POLONIA', result: true },
      { input: 'Polonia', expected: 'POLONIA', result: true },
    ],
  })
  @IsOptional()
  @IsArray()
  examples?: Record<string, unknown>[];
}
