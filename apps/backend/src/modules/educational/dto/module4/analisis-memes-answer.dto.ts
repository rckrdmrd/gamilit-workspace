import {
  IsArray,
  IsString,
  IsNumber,
  IsObject,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * MemeAnnotationDto
 *
 * @description DTO para representar una anotación individual en un meme.
 * Contiene las coordenadas (x, y) de la anotación y el texto asociado.
 */
export class MemeAnnotationDto {
  @ApiProperty({
    description: 'Coordenada X de la anotación en el meme',
    example: 120.5,
  })
  @IsNumber({}, { message: 'x must be a number' })
    x: number;

  @ApiProperty({
    description: 'Coordenada Y de la anotación en el meme',
    example: 85.3,
  })
  @IsNumber({}, { message: 'y must be a number' })
    y: number;

  @ApiProperty({
    description: 'Texto de la anotación',
    example: 'Aquí se puede ver un ejemplo de manipulación visual',
  })
  @IsString({ message: 'text must be a string' })
  @IsNotEmpty({ message: 'text cannot be empty' })
    text: string;
}

/**
 * MemeAnalysisDto
 *
 * @description DTO para el análisis general del meme.
 * Contiene el mensaje principal identificado por el estudiante.
 */
export class MemeAnalysisDto {
  @ApiProperty({
    description: 'Mensaje principal del meme identificado por el estudiante',
    example:
      'Este meme utiliza humor para trivializar un tema serio relacionado con la desinformación',
  })
  @IsString({ message: 'message must be a string' })
  @IsNotEmpty({ message: 'message cannot be empty' })
    message: string;
}

/**
 * AnalisisMemesAnswerDto
 *
 * @description DTO para validar las respuestas del ejercicio "Análisis de Memes".
 * El estudiante debe analizar memes relacionados con la alfabetización digital,
 * identificando elementos visuales clave mediante anotaciones y proporcionando
 * un análisis del mensaje transmitido.
 *
 * @example
 * ```json
 * {
 *   "annotations": [
 *     {
 *       "x": 120.5,
 *       "y": 85.3,
 *       "text": "Aquí se puede ver un ejemplo de manipulación visual"
 *     },
 *     {
 *       "x": 200.0,
 *       "y": 150.0,
 *       "text": "El texto usa ironía para criticar la desinformación"
 *     }
 *   ],
 *   "analysis": {
 *     "message": "Este meme utiliza humor para trivializar un tema serio relacionado con la desinformación"
 *   }
 * }
 * ```
 */
export class AnalisisMemesAnswerDto {
  @ApiProperty({
    description: 'Lista de anotaciones realizadas sobre el meme',
    type: [MemeAnnotationDto],
    example: [
      {
        x: 120.5,
        y: 85.3,
        text: 'Aquí se puede ver un ejemplo de manipulación visual',
      },
      {
        x: 200.0,
        y: 150.0,
        text: 'El texto usa ironía para criticar la desinformación',
      },
    ],
  })
  @IsArray({ message: 'annotations must be an array' })
  @ValidateNested({ each: true })
  @Type(() => MemeAnnotationDto)
    annotations: MemeAnnotationDto[];

  @ApiProperty({
    description: 'Análisis general del meme con el mensaje identificado',
    example: {
      message:
        'Este meme utiliza humor para trivializar un tema serio relacionado con la desinformación',
    },
  })
  @IsObject({ message: 'analysis must be an object' })
  @ValidateNested()
  @Type(() => MemeAnalysisDto)
    analysis: MemeAnalysisDto;
}
