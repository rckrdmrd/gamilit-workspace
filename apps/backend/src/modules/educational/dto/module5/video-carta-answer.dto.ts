import {
  IsUrl,
  IsArray,
  IsString,
  IsNumber,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * VideoSectionDto
 *
 * @description DTO para representar una sección individual del video-carta.
 * Cada sección tiene un título descriptivo y su duración en segundos.
 */
export class VideoSectionDto {
  @ApiProperty({
    description: 'Título descriptivo de la sección del video',
    example: 'Introducción y presentación personal',
  })
  @IsString({ message: 'title must be a string' })
    title: string;

  @ApiProperty({
    description: 'Duración de la sección en segundos',
    example: 45,
  })
  @IsNumber({}, { message: 'durationSeconds must be a number' })
  @IsPositive({ message: 'durationSeconds must be a positive number' })
    durationSeconds: number;
}

/**
 * VideoCartaAnswerDto
 *
 * @description DTO para validar las respuestas del ejercicio "Video-Carta".
 * El estudiante crea un video reflexivo estructurado en secciones,
 * compartiendo sus aprendizajes sobre alfabetización digital.
 *
 * @example
 * ```json
 * {
 *   "videoUrl": "https://youtu.be/dQw4w9WgXcQ",
 *   "sections": [
 *     {
 *       "title": "Introducción y presentación personal",
 *       "durationSeconds": 45
 *     },
 *     {
 *       "title": "Aprendizajes sobre verificación de información",
 *       "durationSeconds": 120
 *     },
 *     {
 *       "title": "Reflexión sobre alfabetización digital",
 *       "durationSeconds": 90
 *     },
 *     {
 *       "title": "Conclusiones y compromisos futuros",
 *       "durationSeconds": 60
 *     }
 *   ]
 * }
 * ```
 */
export class VideoCartaAnswerDto {
  @ApiProperty({
    description:
      'URL del video-carta subido por el estudiante (YouTube, Vimeo, etc.)',
    example: 'https://youtu.be/dQw4w9WgXcQ',
  })
  @IsUrl(
    {
      require_protocol: true,
      protocols: ['http', 'https'],
    },
    { message: 'videoUrl must be a valid URL' },
  )
    videoUrl: string;

  @ApiProperty({
    description:
      'Secciones del video con sus títulos y duraciones individuales',
    type: [VideoSectionDto],
    example: [
      {
        title: 'Introducción y presentación personal',
        durationSeconds: 45,
      },
      {
        title: 'Aprendizajes sobre verificación de información',
        durationSeconds: 120,
      },
      {
        title: 'Reflexión sobre alfabetización digital',
        durationSeconds: 90,
      },
      {
        title: 'Conclusiones y compromisos futuros',
        durationSeconds: 60,
      },
    ],
  })
  @IsArray({ message: 'sections must be an array' })
  @ValidateNested({ each: true })
  @Type(() => VideoSectionDto)
    sections: VideoSectionDto[];
}
