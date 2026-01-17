import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * LtiConsumerResponseDto
 *
 * @description DTO de respuesta para LTI Consumer
 */
export class LtiConsumerResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'https://canvas.instructure.com' })
  platformId!: string;

  @ApiProperty({ example: '10000000000001' })
  clientId!: string;

  @ApiPropertyOptional({ example: '1:abc123' })
  deploymentId!: string | null;

  @ApiProperty({ example: 'Canvas UAM Xochimilco' })
  platformName!: string;

  @ApiPropertyOptional({ example: '2024.01' })
  platformVersion!: string | null;

  @ApiProperty({ example: true })
  supportsDeepLinking!: boolean;

  @ApiProperty({ example: false })
  supportsNrps!: boolean;

  @ApiProperty({ example: true })
  supportsAgs!: boolean;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: false })
  isVerified!: boolean;

  @ApiProperty({ example: '2026-01-16T10:00:00Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-16T10:00:00Z' })
  updatedAt!: Date;

  @ApiPropertyOptional({ example: '2026-01-16T15:30:00Z' })
  lastUsedAt!: Date | null;
}
