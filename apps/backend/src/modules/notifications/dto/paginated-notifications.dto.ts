import { ApiProperty } from '@nestjs/swagger';
import { NotificationResponseDto } from '@shared/dto/notifications/notification-response.dto';

/**
 * PaginatedNotificationsDto
 *
 * Estructura de respuesta para lista de notificaciones paginadas.
 * Alineada con el contrato esperado por el frontend.
 */
export class PaginatedNotificationsDto {
  @ApiProperty({
    type: [NotificationResponseDto],
    description: 'Array of notifications',
  })
    notifications!: NotificationResponseDto[];

  @ApiProperty({
    description: 'Total number of notifications',
    example: 50,
  })
    total!: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
    page!: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
  })
    limit!: number;

  @ApiProperty({
    description: 'Whether there are more pages',
    example: true,
  })
    hasMore!: boolean;
}
