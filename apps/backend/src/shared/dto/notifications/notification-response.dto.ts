import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * NotificationResponseDto
 *
 * @description DTO de respuesta para notificaciones
 * @version 1.0 (2025-11-13) - EXT-003
 *
 * Usado en responses de:
 * - POST /notifications
 * - POST /notifications/send-from-template
 * - GET /notifications
 * - GET /notifications/:id
 *
 * @example
 * {
 *   "id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
 *   "userId": "cccccccc-cccc-cccc-cccc-cccccccccccc",
 *   "title": "¡Felicidades! Has desbloqueado un logro",
 *   "content": "Has completado el módulo 1...",
 *   "notificationType": "achievement_unlocked",
 *   "isRead": false,
 *   "readAt": null,
 *   "channelsSent": ["in_app", "email"],
 *   "relatedEntityType": "achievement",
 *   "relatedEntityId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
 *   "metadata": { "achievementIcon": "🏆", "points": 100 },
 *   "templateKey": "achievement_unlocked",
 *   "expiresAt": null,
 *   "createdAt": "2025-11-13T10:30:00.000Z"
 * }
 */
export class NotificationResponseDto {
  /**
   * UUID de la notificación
   */
  @ApiProperty({
    description: 'UUID de la notificación',
    example: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  })
  id!: string;

  /**
   * UUID del usuario destinatario
   */
  @ApiProperty({
    description: 'UUID del usuario destinatario',
    example: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
  })
  userId!: string;

  /**
   * Tipo de notificación
   */
  @ApiProperty({
    description: 'Tipo de notificación',
    example: 'achievement_unlocked',
  })
  type!: string;

  /**
   * Título de la notificación
   */
  @ApiProperty({
    description: 'Título de la notificación',
    example: '¡Felicidades! Has desbloqueado un logro',
  })
  title!: string;

  /**
   * Contenido/cuerpo de la notificación
   */
  @ApiProperty({
    description: 'Contenido de la notificación',
    example: "Has completado el módulo 1 y desbloqueaste el logro 'Pensador Crítico'",
  })
  message!: string;

  /**
   * Datos adicionales de la notificación (JSONB)
   */
  @ApiPropertyOptional({
    description: 'Datos adicionales',
    example: { achievementIcon: '🏆', points: 100 },
    nullable: true,
  })
  data?: Record<string, any> | null;

  /**
   * Indica si la notificación fue leída
   */
  @ApiProperty({
    description: 'Indica si la notificación fue leída',
    example: false,
  })
  read!: boolean;

  /**
   * Fecha de creación
   */
  @ApiProperty({
    description: 'Fecha de creación',
    example: '2025-11-13T10:30:00.000Z',
  })
  createdAt!: Date;

  /**
   * Fecha de última actualización
   */
  @ApiPropertyOptional({
    description: 'Fecha de última actualización',
    example: '2025-11-13T10:30:00.000Z',
    nullable: true,
  })
  updatedAt?: Date | null;
}

/**
 * PaginatedNotificationsResponseDto
 *
 * @description DTO de respuesta paginada para lista de notificaciones
 *
 * Usado en: GET /notifications
 *
 * @example
 * {
 *   "data": [ { ...NotificationResponseDto }, { ...NotificationResponseDto } ],
 *   "total": 42,
 *   "limit": 20,
 *   "offset": 0
 * }
 */
export class PaginatedNotificationsResponseDto {
  /**
   * Array de notificaciones
   */
  @ApiProperty({
    description: 'Array de notificaciones',
    type: [NotificationResponseDto],
  })
  data!: NotificationResponseDto[];

  /**
   * Número total de notificaciones (sin paginar)
   */
  @ApiProperty({
    description: 'Número total de resultados',
    example: 42,
  })
  total!: number;

  /**
   * Límite usado en la query
   */
  @ApiProperty({
    description: 'Límite de resultados',
    example: 20,
  })
  limit!: number;

  /**
   * Offset usado en la query
   */
  @ApiProperty({
    description: 'Offset de resultados',
    example: 0,
  })
  offset!: number;
}

/**
 * UnreadCountResponseDto
 *
 * @description DTO de respuesta para contador de no leídas
 *
 * Usado en: GET /notifications/unread-count
 *
 * @example
 * {
 *   "count": 5
 * }
 */
export class UnreadCountResponseDto {
  /**
   * Número de notificaciones no leídas
   */
  @ApiProperty({
    description: 'Número de notificaciones no leídas',
    example: 5,
  })
  count!: number;
}
