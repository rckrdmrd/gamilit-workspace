import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * ValidationConfigResponseDto
 *
 * @description DTO de respuesta para configuracion de validacion de ejercicios.
 */
export class ValidationConfigResponseDto {
  @ApiProperty({
    description: 'ID unico de la configuracion',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'Tipo de ejercicio al que aplica esta configuracion',
    example: 'crucigrama',
  })
  exerciseType!: string;

  @ApiProperty({
    description: 'Nombre de la funcion SQL a usar para validar',
    example: 'validate_crucigrama',
  })
  validationFunction!: string;

  @ApiProperty({
    description: 'Si la validacion distingue mayusculas/minusculas',
    example: false,
  })
  caseSensitive!: boolean;

  @ApiProperty({
    description: 'Si permite credito parcial (puntaje proporcional)',
    example: true,
  })
  allowPartialCredit!: boolean;

  @ApiPropertyOptional({
    description: 'Umbral para matching difuso (0.00 - 1.00)',
    example: 0.85,
  })
  fuzzyMatchingThreshold!: number | null;

  @ApiProperty({
    description: 'Si normaliza el texto antes de comparar',
    example: true,
  })
  normalizeText!: boolean;

  @ApiProperty({
    description: 'Reglas especiales para la validacion',
    example: { ignoreWhitespace: true },
  })
  specialRules!: Record<string, unknown>;

  @ApiProperty({
    description: 'Puntuacion maxima por defecto',
    example: 100,
  })
  defaultMaxPoints!: number;

  @ApiProperty({
    description: 'Puntuacion minima para aprobar por defecto',
    example: 70,
  })
  defaultPassingScore!: number;

  @ApiPropertyOptional({
    description: 'Descripcion de la configuracion',
    example: 'Configuracion de validacion para crucigramas',
  })
  description!: string | null;

  @ApiPropertyOptional({
    description: 'Ejemplos de validacion',
    type: 'array',
    items: { type: 'object' },
  })
  examples!: Record<string, unknown>[] | null;

  @ApiProperty({
    description: 'Fecha de creacion',
    example: '2026-01-14T10:00:00Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Fecha de ultima actualizacion',
    example: '2026-01-14T10:00:00Z',
  })
  updatedAt!: Date;
}
