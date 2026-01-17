import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsNumber,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { ActivityProgress, GradingProgress } from '../entities/lti-grade-passback.entity';

/**
 * CreateLtiGradePassbackDto
 *
 * @description DTO para crear un registro de passback de calificación a LMS
 */
export class CreateLtiGradePassbackDto {
  @ApiProperty({
    description: 'ID de la sesión LTI',
  })
  @IsUUID()
  @IsNotEmpty()
  sessionId!: string;

  @ApiProperty({
    description: 'ID del usuario en Gamilit',
  })
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({
    description: 'ID del LTI Consumer',
  })
  @IsUUID()
  @IsNotEmpty()
  consumerId!: string;

  @ApiProperty({
    description: 'URL del lineitem en el LMS (AGS endpoint)',
    example: 'https://canvas.instructure.com/api/lti/courses/123/line_items/456',
  })
  @IsString()
  @IsNotEmpty()
  lineitemUrl!: string;

  @ApiPropertyOptional({
    description: 'ID del lineitem',
  })
  @IsString()
  @IsOptional()
  lineitemId?: string;

  @ApiPropertyOptional({
    description: 'Etiqueta del assignment',
  })
  @IsString()
  @IsOptional()
  lineitemLabel?: string;

  @ApiPropertyOptional({
    description: 'Calificación obtenida',
    example: 85,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  scoreGiven?: number;

  @ApiPropertyOptional({
    description: 'Calificación máxima posible',
    example: 100,
    default: 100,
  })
  @IsNumber()
  @Min(1)
  @Max(1000)
  @IsOptional()
  scoreMaximum?: number;

  @ApiPropertyOptional({
    description: 'Progreso de la actividad según LTI spec',
    enum: ActivityProgress,
  })
  @IsEnum(ActivityProgress)
  @IsOptional()
  activityProgress?: ActivityProgress;

  @ApiPropertyOptional({
    description: 'Progreso de la calificación según LTI spec',
    enum: GradingProgress,
  })
  @IsEnum(GradingProgress)
  @IsOptional()
  gradingProgress?: GradingProgress;

  @ApiPropertyOptional({
    description: 'Comentario/feedback para el estudiante',
  })
  @IsString()
  @IsOptional()
  comment?: string;
}
