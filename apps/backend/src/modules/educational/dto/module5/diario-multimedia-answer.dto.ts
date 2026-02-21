import {
  IsString,
  IsArray,
  IsOptional,
  IsNumber,
  IsDateString,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DiaryEntryDto
 *
 * @description DTO para representar una entrada individual del diario multimedia.
 * Cada entrada debe tener fecha, contenido, y opcionalmente titulo, mood y multimedia.
 */
export class DiaryEntryDto {
  @ApiProperty({
    description: 'Identificador unico de la entrada',
    example: 'entry1',
  })
  @IsString({ message: 'id must be a string' })
  id: string;

  @ApiProperty({
    description: 'Fecha de la entrada del diario (formato ISO 8601)',
    example: '1898-12-15',
  })
  @IsDateString({}, { message: 'date must be a valid date string (ISO 8601)' })
  date: string;

  @ApiProperty({
    description: 'Titulo de la entrada',
    example: 'El Dia del Descubrimiento',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'title must be a string' })
  title?: string;

  @ApiProperty({
    description: 'Contenido reflexivo de la entrada (minimo 50 caracteres)',
    example:
      'Querido diario, hoy es un dia que nunca olvidare. Despues de cuatro anos de trabajo incansable...',
  })
  @IsString({ message: 'content must be a string' })
  @MinLength(50, { message: 'content must be at least 50 characters long' })
  content: string;

  @ApiProperty({
    description: 'Estado de animo asociado a la entrada',
    example: 'excitement',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'mood must be a string' })
  mood?: string;

  @ApiProperty({
    description: 'Conteo de palabras de la entrada',
    example: 156,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'wordCount must be a number' })
  wordCount?: number;

  @ApiProperty({
    description: 'Clima o contexto del dia',
    example: 'Frio invernal en Paris',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'weather must be a string' })
  weather?: string;

  @ApiProperty({
    description: 'Ubicacion donde se escribe la entrada',
    example: 'Laboratorio en Rue Lhomond',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'location must be a string' })
  location?: string;

  @ApiProperty({
    description: 'Template utilizado para la entrada',
    example: 'template_classic',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'template must be a string' })
  template?: string;

  @ApiProperty({
    description: 'Archivos multimedia adjuntos (imagenes, audio, video)',
    required: false,
  })
  @IsOptional()
  multimedia?: Record<string, unknown>;
}

/**
 * DiarioMultimediaAnswerDto
 *
 * @description DTO para validar las respuestas del ejercicio "Diario Multimedia".
 * El estudiante debe escribir un diario desde la perspectiva de Marie Curie
 * durante el descubrimiento del radio (1898-1899).
 *
 * Requisitos:
 * - Minimo 3 entradas, maximo 5
 * - Cada entrada debe tener fecha y contenido (minimo 50 caracteres)
 * - Precision historica requerida
 *
 * @example
 * ```json
 * {
 *   "entries": [
 *     {
 *       "id": "entry1",
 *       "date": "1898-12-15",
 *       "title": "El Dia del Descubrimiento",
 *       "content": "Querido diario, hoy es un dia que nunca olvidare...",
 *       "mood": "excitement",
 *       "wordCount": 156
 *     }
 *   ],
 *   "totalEntries": 3,
 *   "totalWords": 468
 * }
 * ```
 */
export class DiarioMultimediaAnswerDto {
  @ApiProperty({
    description: 'Lista de entradas del diario (minimo 1, maximo 5)',
    type: [DiaryEntryDto],
    example: [
      {
        id: 'entry1',
        date: '1898-12-15',
        title: 'El Dia del Descubrimiento',
        content:
          'Querido diario, hoy es un dia que nunca olvidare. Despues de cuatro anos de trabajo incansable, Pierre y yo finalmente lo logramos. En la oscuridad de nuestro laboratorio, el radio brillo con una luz azul-verde eterea.',
        mood: 'excitement',
        wordCount: 156,
      },
    ],
  })
  @IsArray({ message: 'entries must be an array' })
  @ArrayMinSize(1, { message: 'entries must contain at least 1 entry' })
  @ArrayMaxSize(5, { message: 'entries must contain at most 5 entries' })
  @ValidateNested({ each: true })
  @Type(() => DiaryEntryDto)
  entries: DiaryEntryDto[];

  @ApiProperty({
    description: 'Total de entradas en el diario',
    example: 3,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'totalEntries must be a number' })
  totalEntries?: number;

  @ApiProperty({
    description: 'Total de palabras en todas las entradas',
    example: 468,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'totalWords must be a number' })
  totalWords?: number;

  @ApiProperty({
    description: 'Fecha y hora de envio',
    example: '2025-01-15T14:30:00Z',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'submittedAt must be a string' })
  submittedAt?: string;
}
