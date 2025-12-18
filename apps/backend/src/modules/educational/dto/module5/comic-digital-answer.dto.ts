import {
  IsArray,
  IsString,
  IsNumber,
  IsOptional,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * ComicPanelDto
 *
 * @description DTO para representar una viñeta individual del cómic.
 * Cada viñeta debe tener diálogo, narración, y opcionalmente imagen.
 */
export class ComicPanelDto {
  @ApiProperty({
    description: 'Número de la viñeta (1-6)',
    example: 1,
    minimum: 1,
  })
  @IsNumber({}, { message: 'panelNumber must be a number' })
  @Min(1, { message: 'panelNumber must be at least 1' })
  panelNumber: number;

  @ApiProperty({
    description: 'Diálogo de los personajes en la viñeta',
    example: 'Marie: "Este mineral contiene algo extraordinario, Pierre."',
  })
  @IsString({ message: 'dialogue must be a string' })
  dialogue: string;

  @ApiProperty({
    description: 'Narración contextual de la viñeta',
    example: '1898. En un laboratorio frío de París...',
  })
  @IsString({ message: 'narration must be a string' })
  narration: string;

  @ApiProperty({
    description: 'URL de la imagen o boceto de la viñeta (opcional)',
    example: 'https://storage.example.com/panel1.png',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'imageUrl must be a string' })
  imageUrl?: string;

  @ApiProperty({
    description: 'Descripción visual de la escena (para accesibilidad o si no hay imagen)',
    example: 'Marie y Pierre observan un mineral oscuro sobre la mesa del laboratorio',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'visualDescription must be a string' })
  visualDescription?: string;
}

/**
 * ComicDigitalAnswerDto
 *
 * @description DTO para validar las respuestas del ejercicio "Cómic Digital".
 * El estudiante debe crear un cómic de 4-6 viñetas narrando una historia científica.
 *
 * @example
 * ```json
 * {
 *   "panels": [
 *     {
 *       "panelNumber": 1,
 *       "dialogue": "Marie: 'Este mineral es extraordinario.'",
 *       "narration": "1898. En un laboratorio de París...",
 *       "imageUrl": "https://storage.example.com/panel1.png"
 *     },
 *     {
 *       "panelNumber": 2,
 *       "dialogue": "Pierre: 'Debemos aislarlo.'",
 *       "narration": "Los Curie comienzan su investigación.",
 *       "visualDescription": "Close-up de mediciones en electroscopio"
 *     }
 *   ]
 * }
 * ```
 */
export class ComicDigitalAnswerDto {
  @ApiProperty({
    description: 'Lista de viñetas del cómic (mínimo 4, máximo 6)',
    type: [ComicPanelDto],
    example: [
      {
        panelNumber: 1,
        dialogue: 'Marie: "Este mineral contiene algo extraordinario."',
        narration: '1898. En un laboratorio frío de París...',
      },
      {
        panelNumber: 2,
        dialogue: 'Pierre: "Debemos aislarlo, por muy difícil que sea."',
        narration: 'Los Curie inician años de arduo trabajo.',
      },
      {
        panelNumber: 3,
        dialogue: 'Marie: "No puedo rendirme. El secreto está ahí."',
        narration: 'Cuatro años de procesamiento manual.',
      },
      {
        panelNumber: 4,
        dialogue: 'Ambos: "¡Brilla! Lo logramos."',
        narration: 'El radio ilumina la oscuridad del laboratorio.',
      },
    ],
  })
  @IsArray({ message: 'panels must be an array' })
  @ArrayMinSize(4, { message: 'panels must contain at least 4 panels' })
  @ArrayMaxSize(6, { message: 'panels must contain at most 6 panels' })
  @ValidateNested({ each: true })
  @Type(() => ComicPanelDto)
  panels: ComicPanelDto[];
}
