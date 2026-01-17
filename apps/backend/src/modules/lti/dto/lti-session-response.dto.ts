import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * LtiSessionResponseDto
 *
 * @description DTO de respuesta para LTI Session
 */
export class LtiSessionResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: '660e8400-e29b-41d4-a716-446655440001' })
  consumerId!: string;

  @ApiPropertyOptional({ example: '770e8400-e29b-41d4-a716-446655440002' })
  userId!: string | null;

  @ApiProperty({ example: 'lti13-launch-12345' })
  launchId!: string;

  @ApiProperty({ example: 'LtiResourceLinkRequest' })
  messageType!: string;

  @ApiPropertyOptional({ example: 'course-12345' })
  contextId!: string | null;

  @ApiPropertyOptional({ example: 'CS101' })
  contextLabel!: string | null;

  @ApiPropertyOptional({ example: 'Introducción a la Programación' })
  contextTitle!: string | null;

  @ApiPropertyOptional({ example: 'resource-abc123' })
  resourceLinkId!: string | null;

  @ApiPropertyOptional({ example: 'Ejercicio de Matemáticas' })
  resourceLinkTitle!: string | null;

  @ApiPropertyOptional({ example: 'user-lms-123' })
  lmsUserId!: string | null;

  @ApiPropertyOptional({ example: 'estudiante@uam.mx' })
  lmsUserEmail!: string | null;

  @ApiPropertyOptional({ example: 'Juan Pérez' })
  lmsUserName!: string | null;

  @ApiPropertyOptional({ example: ['Learner'] })
  lmsUserRoles!: string[] | null;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: '2026-01-16T10:00:00Z' })
  launchedAt!: Date;

  @ApiPropertyOptional({ example: '2026-01-16T10:30:00Z' })
  lastActivityAt!: Date | null;
}
