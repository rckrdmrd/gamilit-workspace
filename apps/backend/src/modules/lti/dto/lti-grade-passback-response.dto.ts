import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityProgress, GradingProgress, PassbackStatus } from '../enums/lti-grade-passback.enums';

/**
 * LtiGradePassbackResponseDto
 *
 * @description DTO de respuesta para LTI Grade Passback
 */
export class LtiGradePassbackResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: '660e8400-e29b-41d4-a716-446655440001' })
  sessionId!: string;

  @ApiProperty({ example: '770e8400-e29b-41d4-a716-446655440002' })
  userId!: string;

  @ApiProperty({ example: '880e8400-e29b-41d4-a716-446655440003' })
  consumerId!: string;

  @ApiProperty({
    example: 'https://canvas.instructure.com/api/lti/courses/123/line_items/456',
  })
  lineitemUrl!: string;

  @ApiPropertyOptional({ example: 'lineitem-456' })
  lineitemId!: string | null;

  @ApiPropertyOptional({ example: 'Ejercicio de Matemáticas' })
  lineitemLabel!: string | null;

  @ApiPropertyOptional({ example: 85 })
  scoreGiven!: number | null;

  @ApiProperty({ example: 100 })
  scoreMaximum!: number;

  @ApiPropertyOptional({ example: 85 })
  scorePercentage!: number | null;

  @ApiPropertyOptional({ enum: ActivityProgress, example: 'Completed' })
  activityProgress!: ActivityProgress | null;

  @ApiPropertyOptional({ enum: GradingProgress, example: 'FullyGraded' })
  gradingProgress!: GradingProgress | null;

  @ApiPropertyOptional({ example: 'Excelente trabajo!' })
  comment!: string | null;

  @ApiProperty({ enum: PassbackStatus, example: 'success' })
  passbackStatus!: PassbackStatus;

  @ApiProperty({ example: 0 })
  attemptCount!: number;

  @ApiProperty({ example: 3 })
  maxRetries!: number;

  @ApiPropertyOptional({ example: '2026-01-16T10:00:00Z' })
  gradedAt!: Date | null;

  @ApiPropertyOptional({ example: '2026-01-16T10:01:00Z' })
  firstSentAt!: Date | null;

  @ApiPropertyOptional({ example: '2026-01-16T10:01:00Z' })
  lastSentAt!: Date | null;

  @ApiPropertyOptional({ example: '2026-01-16T10:01:05Z' })
  successAt!: Date | null;

  @ApiProperty({ example: '2026-01-16T10:00:00Z' })
  createdAt!: Date;
}
