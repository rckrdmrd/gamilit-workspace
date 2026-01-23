import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RubricCriteria } from '../../entities/exercise-type-rubric.entity';

/**
 * ExerciseTypeRubricResponseDto
 *
 * @description DTO de respuesta para rubricas por tipo de ejercicio.
 */
export class ExerciseTypeRubricResponseDto {
  @ApiProperty({
    description: 'ID unico de la rubrica',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'Tipo de ejercicio al que aplica esta rubrica',
    example: 'verificador_fake_news',
  })
  exerciseType!: string;

  @ApiProperty({
    description: 'Nombre descriptivo de la rubrica',
    example: 'Rubrica de Verificacion de Fake News',
  })
  rubricName!: string;

  @ApiProperty({
    description: 'Criterios de evaluacion de la rubrica',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'clasificacion' },
        name: { type: 'string', example: 'Clasificacion de informacion' },
        description: { type: 'string', example: 'Capacidad para identificar...' },
        weight: { type: 'number', example: 25 },
        levels: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              score: { type: 'number', example: 3 },
              label: { type: 'string', example: 'Excelente' },
              description: { type: 'string', example: 'Dominio completo...' },
            },
          },
        },
      },
    },
  })
  criteria!: RubricCriteria[];

  @ApiProperty({
    description: 'Peso total (debe sumar 100)',
    example: 100,
  })
  totalWeight!: number;

  @ApiProperty({
    description: 'Si es la rubrica por defecto para este tipo de ejercicio',
    example: true,
  })
  isDefault!: boolean;

  @ApiPropertyOptional({
    description: 'Codigo del modulo (M3, M4, M5)',
    example: 'M4',
  })
  moduleCode!: string | null;

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
