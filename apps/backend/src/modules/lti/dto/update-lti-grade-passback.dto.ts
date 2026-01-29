import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
  IsObject,
  IsInt,
} from 'class-validator';
import {
  ActivityProgress,
  GradingProgress,
  PassbackStatus,
} from '../entities/lti-grade-passback.entity';

/**
 * UpdateLtiGradePassbackDto
 *
 * @description DTO para actualizar un registro de grade passback
 */
export class UpdateLtiGradePassbackDto {
  @ApiPropertyOptional({
    description: 'Calificación obtenida',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  scoreGiven?: number;

  @ApiPropertyOptional({
    description: 'Progreso de la actividad',
    enum: ActivityProgress,
  })
  @IsEnum(ActivityProgress)
  @IsOptional()
  activityProgress?: ActivityProgress;

  @ApiPropertyOptional({
    description: 'Progreso de la calificación',
    enum: GradingProgress,
  })
  @IsEnum(GradingProgress)
  @IsOptional()
  gradingProgress?: GradingProgress;

  @ApiPropertyOptional({
    description: 'Estado del passback',
    enum: PassbackStatus,
  })
  @IsEnum(PassbackStatus)
  @IsOptional()
  passbackStatus?: PassbackStatus;

  @ApiPropertyOptional({
    description: 'Comentario/feedback',
  })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiPropertyOptional({
    description: 'Respuesta del LMS',
  })
  @IsObject()
  @IsOptional()
  lmsResponse?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Código de respuesta HTTP del LMS',
  })
  @IsInt()
  @IsOptional()
  lmsResponseCode?: number;

  @ApiPropertyOptional({
    description: 'Mensaje de error',
  })
  @IsString()
  @IsOptional()
  errorMessage?: string;
}
