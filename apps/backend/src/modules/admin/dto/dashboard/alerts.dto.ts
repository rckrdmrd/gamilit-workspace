import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for system alerts requiring admin attention
 * Represents alerts from various subsystems (security, performance, content, etc.)
 *
 * GAP-FE-003: Updated to match frontend expectations
 * - Changed type enum to match frontend: 'error' | 'warning' | 'info' | 'security'
 * - Added title field for short alert summary
 * - Added details field for additional context
 * - Changed acknowledged to dismissed to match frontend naming
 */
export class AlertDto {
  @ApiProperty({
    description: 'Unique identifier for the alert',
    example: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  })
    id!: string;

  @ApiProperty({
    description: 'Type of alert for UI display',
    example: 'warning',
    enum: ['error', 'warning', 'info', 'security'],
  })
    type!: 'error' | 'warning' | 'info' | 'security';

  @ApiProperty({
    description: 'Severity level of the alert',
    example: 'medium',
    enum: ['low', 'medium', 'high', 'critical'],
  })
    severity!: 'low' | 'medium' | 'high' | 'critical';

  @ApiProperty({
    description: 'Short title summarizing the alert',
    example: 'Contenido pendiente',
  })
    title!: string;

  @ApiProperty({
    description: 'Main alert message',
    example: 'Hay 25 contenidos pendientes de aprobación',
  })
    message!: string;

  @ApiProperty({
    description: 'Additional details about the alert',
    example: 'Revisa la sección de aprobaciones para gestionar el contenido educativo',
  })
    details?: string;

  @ApiProperty({
    description: 'Timestamp when the alert was created',
    example: '2025-11-23T10:30:00Z',
  })
    timestamp!: Date;

  @ApiProperty({
    description: 'Whether the alert has been dismissed by an admin',
    example: false,
  })
    dismissed!: boolean;
}
