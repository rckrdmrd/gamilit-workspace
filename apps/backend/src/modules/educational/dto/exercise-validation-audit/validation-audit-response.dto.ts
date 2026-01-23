import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * ValidationAuditResponseDto
 *
 * @description DTO de respuesta para registros de auditoria de validaciones.
 */
export class ValidationAuditResponseDto {
  @ApiProperty({
    description: 'ID unico del registro de auditoria',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'ID del ejercicio',
    example: '660e8400-e29b-41d4-a716-446655440000',
  })
  exerciseId!: string;

  @ApiProperty({
    description: 'ID del usuario',
    example: '770e8400-e29b-41d4-a716-446655440000',
  })
  userId!: string;

  @ApiProperty({
    description: 'Numero de intento',
    example: 1,
  })
  attemptNumber!: number;

  @ApiProperty({
    description: 'Respuesta enviada (snapshot inmutable)',
    example: { clues: { '1': 'POLONIA', '2': 'MARIA' } },
  })
  submittedAnswer!: Record<string, unknown>;

  @ApiProperty({
    description: 'Fecha de envio',
    example: '2026-01-14T10:00:00Z',
  })
  submittedAt!: Date;

  @ApiProperty({
    description: 'Snapshot del ejercicio en el momento de la validacion',
    example: { id: '...', title: 'Crucigrama', content: {} },
  })
  exerciseSnapshot!: Record<string, unknown>;

  @ApiProperty({
    description: 'Snapshot de la configuracion de validacion usada',
    example: { caseSensitive: false, normalizeText: true },
  })
  validationConfigSnapshot!: Record<string, unknown>;

  @ApiProperty({
    description: 'Si la respuesta fue correcta',
    example: true,
  })
  isCorrect!: boolean;

  @ApiProperty({
    description: 'Puntuacion obtenida',
    example: 85,
  })
  score!: number;

  @ApiProperty({
    description: 'Puntuacion maxima',
    example: 100,
  })
  maxScore!: number;

  @ApiPropertyOptional({
    description: 'Retroalimentacion proporcionada',
    example: 'Buen trabajo! Respondiste 17 de 20 palabras correctamente.',
  })
  feedback!: string | null;

  @ApiPropertyOptional({
    description: 'Detalles de la validacion',
    example: { correctCount: 17, totalCount: 20 },
  })
  validationDetails!: Record<string, unknown> | null;

  @ApiProperty({
    description: 'Funcion de validacion utilizada',
    example: 'validate_crucigrama',
  })
  validationFunctionUsed!: string;

  @ApiProperty({
    description: 'Timestamp de la validacion',
    example: '2026-01-14T10:00:01Z',
  })
  validationTimestamp!: Date;

  @ApiPropertyOptional({
    description: 'Duracion de la validacion en milisegundos',
    example: 150,
  })
  validationDurationMs!: number | null;

  @ApiProperty({
    description: 'Si el registro fue recalculado',
    example: false,
  })
  isRecalculated!: boolean;

  @ApiPropertyOptional({
    description: 'Fecha de recalculo',
    example: null,
  })
  recalculatedAt!: Date | null;

  @ApiPropertyOptional({
    description: 'ID del usuario que recalculo',
    example: null,
  })
  recalculatedBy!: string | null;

  @ApiPropertyOptional({
    description: 'Razon del recalculo',
    example: null,
  })
  recalculationReason!: string | null;

  @ApiPropertyOptional({
    description: 'ID del registro de auditoria original (si es recalculo)',
    example: null,
  })
  originalAuditId!: string | null;

  @ApiProperty({
    description: 'Si hay discrepancia detectada',
    example: false,
  })
  hasDiscrepancy!: boolean;

  @ApiPropertyOptional({
    description: 'Tipo de discrepancia',
    example: null,
  })
  discrepancyType!: string | null;

  @ApiPropertyOptional({
    description: 'Notas sobre la discrepancia',
    example: null,
  })
  discrepancyNotes!: string | null;

  @ApiProperty({
    description: 'Metadatos del cliente',
    example: { browser: 'Chrome', platform: 'Windows' },
  })
  clientMetadata!: Record<string, unknown>;

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

/**
 * PaginatedValidationAuditResponseDto
 *
 * @description Respuesta paginada de registros de auditoria.
 */
export class PaginatedValidationAuditResponseDto {
  @ApiProperty({
    description: 'Lista de registros de auditoria',
    type: [ValidationAuditResponseDto],
  })
  data!: ValidationAuditResponseDto[];

  @ApiProperty({
    description: 'Total de registros',
    example: 150,
  })
  total!: number;

  @ApiProperty({
    description: 'Pagina actual',
    example: 1,
  })
  page!: number;

  @ApiProperty({
    description: 'Registros por pagina',
    example: 20,
  })
  limit!: number;

  @ApiProperty({
    description: 'Total de paginas',
    example: 8,
  })
  totalPages!: number;
}
