import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  } from '@nestjs/swagger';
import { NotificationService } from '../services/notification.service';
import { NotificationResponseDto } from '@shared/dto/notifications/notification-response.dto';
import { CreateNotificationDto } from '@shared/dto/notifications/create-notification.dto';
import { GetNotificationsQueryDto } from '../dto/get-notifications-query.dto';
import { PaginatedNotificationsDto } from '../dto/paginated-notifications.dto';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../modules/auth/guards';
import { AccountStatusGuard } from '../../../shared/guards/account-status.guard';
import { Permissions } from '../../../shared/decorators/permissions.decorator';
import { PermissionsGuard } from '../../../shared/guards/permissions.guard';

/**
 * NotificationsController
 *
 * Controller para gestión de notificaciones del usuario.
 * Todos los usuarios autenticados pueden gestionar sus propias notificaciones.
 * Solo el endpoint POST requiere permisos especiales (system:webhook).
 *
 * @version 4.0 (2026-01-07) - Migrado a NotificationService consolidado (notifications schema)
 */
@ApiTags('Notifications')
@Controller('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AccountStatusGuard)
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * GET /notifications
   * Obtiene las notificaciones del usuario con filtros y paginación
   */
  @Get()
  @ApiOperation({
    summary: 'Get user notifications',
    description: 'Retrieves notifications for the authenticated user with filtering and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
    type: PaginatedNotificationsDto,
  })
  async getNotifications(
    @CurrentUser('sub') userId: string,
      @Query() query: GetNotificationsQueryDto,
  ): Promise<PaginatedNotificationsDto> {
    const { type, status, page = 1, limit = 20 } = query;

    // Convert status filter for consolidated service
    const statusFilter = status === 'read' ? 'read' :
      status === 'unread' ? 'sent' : undefined;

    const result = await this.notificationService.findAllByUser(userId, {
      type,
      status: statusFilter,
      limit,
      offset: (page - 1) * limit,
    });

    const totalPages = Math.ceil(result.total / limit);

    return {
      notifications: result.data.map((n) => this.mapToResponseDto(n)),
      total: result.total,
      page,
      limit,
      hasMore: page < totalPages,
    };
  }

  /**
   * Mapea Notification entity a NotificationResponseDto
   */
  private mapToResponseDto(notification: any): NotificationResponseDto {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      status: notification.status === 'read' ? 'read' : 'unread',
      createdAt: notification.createdAt,
      updatedAt: notification.createdAt, // Entity doesn't have updatedAt
    };
  }

  /**
   * GET /notifications/unread-count
   * Obtiene el número de notificaciones no leídas
   */
  @Get('unread-count')
  @ApiOperation({
    summary: 'Get unread notifications count',
    description: 'Returns the number of unread notifications for the user',
  })
  @ApiResponse({
    status: 200,
    description: 'Unread count retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number', example: 5 },
      },
    },
  })
  async getUnreadCount(
    @CurrentUser('sub') userId: string,
  ): Promise<{ count: number }> {
    const count = await this.notificationService.getUnreadCount(userId);
    return { count };
  }

  /**
   * GET /notifications/stats
   * Obtiene estadísticas de notificaciones
   */
  @Get('stats')
  @ApiOperation({
    summary: 'Get notification statistics',
    description: 'Returns statistics about user notifications (total, unread, by type)',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', example: 50 },
        unread: { type: 'number', example: 5 },
        byType: {
          type: 'object',
          properties: {
            achievement: { type: 'number', example: 10 },
            mission: { type: 'number', example: 15 },
            reward: { type: 'number', example: 8 },
            system: { type: 'number', example: 7 },
            social: { type: 'number', example: 5 },
            educational: { type: 'number', example: 5 },
          },
        },
      },
    },
  })
  async getStats(@CurrentUser('sub') userId: string) {
    const result = await this.notificationService.findAllByUser(userId, {});
    const notifications = result.data;
    const unread = notifications.filter((n) => n.status !== 'read').length;

    // Count by type
    const byType: Record<string, number> = {};
    notifications.forEach((n) => {
      byType[n.type] = (byType[n.type] || 0) + 1;
    });

    return {
      total: notifications.length,
      unread,
      byType,
    };
  }

  /**
   * PATCH /notifications/:id/read
   * Marca una notificación como leída
   */
  @Patch(':id/read')
  @ApiOperation({
    summary: 'Mark notification as read',
    description: 'Marks a specific notification as read',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read',
    type: NotificationResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - notification does not belong to user',
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found',
  })
  async markAsRead(
    @Param('id', ParseUUIDPipe) notificationId: string,
      @CurrentUser('sub') userId: string,
  ): Promise<NotificationResponseDto> {
    await this.notificationService.markAsRead(notificationId, userId);
    const notification = await this.notificationService.findOne(notificationId, userId);
    return this.mapToResponseDto(notification);
  }

  /**
   * POST /notifications/read-all
   * Marca todas las notificaciones como leídas
   */
  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark all notifications as read',
    description: 'Marks all user notifications as read',
  })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read',
    schema: {
      type: 'object',
      properties: {
        updated: { type: 'number', example: 5 },
      },
    },
  })
  async markAllAsRead(
    @CurrentUser('sub') userId: string,
  ): Promise<{ updated: number }> {
    const updated = await this.notificationService.markAllAsRead(userId);
    return { updated };
  }

  /**
   * DELETE /notifications/:id
   * Elimina una notificación específica
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete notification',
    description: 'Deletes a specific notification',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted successfully',
    schema: {
      type: 'object',
      properties: {
        deleted: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - notification does not belong to user',
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found',
  })
  async deleteNotification(
    @Param('id', ParseUUIDPipe) notificationId: string,
      @CurrentUser('sub') userId: string,
  ): Promise<{ deleted: boolean }> {
    await this.notificationService.deleteNotification(notificationId, userId);
    return { deleted: true };
  }

  /**
   * DELETE /notifications/clear-all
   * Limpia todas las notificaciones leídas
   */
  @Delete('clear-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Clear all read notifications',
    description: 'Deletes all read notifications for the user',
  })
  @ApiResponse({
    status: 200,
    description: 'Read notifications cleared',
    schema: {
      type: 'object',
      properties: {
        deleted: { type: 'number', example: 10 },
      },
    },
  })
  async clearAll(
    @CurrentUser('sub') userId: string,
  ): Promise<{ deleted: number }> {
    // Get all read notifications
    const result = await this.notificationService.findAllByUser(userId, {
      status: 'read',
      limit: 1000, // Process in batches
    });

    // Delete each one
    let deleted = 0;
    for (const notification of result.data) {
      await this.notificationService.deleteNotification(notification.id, userId);
      deleted++;
    }

    return { deleted };
  }

  /**
   * POST /notifications
   * Envía una nueva notificación (solo sistema)
   */
  @Post()
  @UseGuards(PermissionsGuard)
  @ApiOperation({
    summary: 'Send notification (System only)',
    description: 'Internal endpoint to send notifications to users',
  })
  @ApiResponse({
    status: 201,
    description: 'Notification sent successfully',
    type: NotificationResponseDto,
  })
  @Permissions('system:webhook')
  async sendNotification(
    @Body() createDto: CreateNotificationDto,
  ): Promise<NotificationResponseDto> {
    const notification = await this.notificationService.create({
      userId: createDto.userId,
      type: createDto.type,
      title: createDto.title,
      message: createDto.message,
      data: createDto.data,
    });
    return this.mapToResponseDto(notification);
  }
}
