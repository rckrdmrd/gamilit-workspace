/**
 * Notifications Gateway
 *
 * WebSocket gateway for real-time notifications with Redis adapter support
 * for horizontal scaling and message persistence for offline users.
 *
 * Features:
 * - JWT authentication on connection
 * - Room-based message routing (user rooms, classroom rooms)
 * - Redis adapter integration for multi-instance support
 * - Message persistence for offline users
 * - Automatic delivery of pending messages on reconnection
 *
 * IMPORTANTE (2026-01-04): La autenticación se hace manualmente en handleConnection
 * porque @UseGuards no funciona en lifecycle hooks de Socket.IO.
 */

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server } from 'socket.io';
import { WsJwtGuard, AuthenticatedSocket } from './guards/ws-jwt.guard';
import {
  SocketEvent,
  StudentActivityPayload,
  ClassroomUpdatePayload,
  NewSubmissionPayload,
  AlertTriggeredPayload,
  StudentOnlineStatusPayload,
} from './types/websocket.types';
import { MessagePersistenceService } from './services/message-persistence.service';

// FIX-BE-016-2026-01-29: CORS, path, and transports are now configured
// centrally in SocketIOAdapter (main.ts) to prevent handleUpgrade conflicts
@WebSocketGateway()
export class NotificationsGateway
implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
    server!: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  private userSockets = new Map<string, Set<string>>(); // userId -> Set of socketIds
  private userLastDisconnect = new Map<string, Date>(); // Track disconnect times for reconnection detection

  constructor(
    private readonly jwtService: JwtService,
    private readonly messagePersistence: MessagePersistenceService,
  ) {}

  afterInit(_server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  /**
   * Handle new WebSocket connection
   *
   * NOTA: @UseGuards NO funciona en handleConnection porque es un lifecycle hook
   * de Socket.IO, no un message handler. La autenticación se hace manualmente aquí.
   */
  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from auth object or query params
      const token =
        client.handshake.auth?.token ||
        client.handshake.query?.token;

      if (!token || typeof token !== 'string') {
        this.logger.warn(`Connection rejected: no token provided (socket: ${client.id})`);
        client.emit('error', { message: 'Authentication token required' });
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = await this.jwtService.verifyAsync(token);

      // Attach user data to socket
      client.userData = {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
        tenantId: payload.tenant_id,
      };

      const userId = client.userData.userId;
      const userEmail = client.userData.email;

      this.logger.log(`Client connected: ${userEmail} (${client.id})`);

      // Register socket for user
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);

      // Join user's personal room
      await client.join(`user:${userId}`);
      this.logger.debug(`Socket ${client.id} joined room: user:${userId}`);

      // Check if this is a reconnection
      const lastDisconnect = this.userLastDisconnect.get(userId);
      const isReconnection = lastDisconnect !== undefined;

      // Emit authenticated event
      client.emit(SocketEvent.AUTHENTICATED, {
        success: true,
        userId,
        email: userEmail,
        socketId: client.id,
        isReconnection,
      });

      // If reconnecting, deliver any pending messages
      if (isReconnection && this.messagePersistence.isOperational()) {
        this.userLastDisconnect.delete(userId);
        await this.deliverPendingMessages(client, userId);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Connection rejected: authentication failed - ${errorMessage} (socket: ${client.id})`);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.userData?.userId;
    const userEmail = client.userData?.email;

    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
          // Track disconnect time for reconnection detection
          this.userLastDisconnect.set(userId, new Date());
          // Clean up old disconnect records after 24 hours
          setTimeout(() => {
            this.userLastDisconnect.delete(userId);
          }, 24 * 60 * 60 * 1000);
        }
      }
    }

    this.logger.log(`Client disconnected: ${userEmail} (${client.id})`);
  }

  /**
   * Deliver pending messages to a reconnected user
   */
  private async deliverPendingMessages(client: AuthenticatedSocket, userId: string): Promise<void> {
    if (!this.messagePersistence) {
      return;
    }

    try {
      const pendingMessages = await this.messagePersistence.getPendingMessages(userId);

      if (pendingMessages.length === 0) {
        return;
      }

      this.logger.log(`Delivering ${pendingMessages.length} pending messages to user ${userId}`);

      // Notify client about pending messages
      client.emit(SocketEvent.PENDING_MESSAGES, {
        count: pendingMessages.length,
        timestamp: new Date().toISOString(),
      });

      // Deliver each message
      for (const message of pendingMessages) {
        client.emit(message.event, {
          ...message.data,
          _pendingMessageId: message.id,
          _wasOffline: true,
          _originalTimestamp: message.createdAt,
        });
      }

      // Clear delivered messages
      await this.messagePersistence.clearPendingMessages(userId);

      // Notify client that all pending messages were delivered
      client.emit(SocketEvent.PENDING_MESSAGES_DELIVERED, {
        count: pendingMessages.length,
        timestamp: new Date().toISOString(),
      });

      this.logger.debug(`Delivered ${pendingMessages.length} pending messages to user ${userId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to deliver pending messages to user ${userId}: ${errorMessage}`);
    }
  }

  /**
   * Handle client marking notification as read
   */
  @UseGuards(WsJwtGuard)
  @SubscribeMessage(SocketEvent.MARK_AS_READ)
  async handleMarkAsRead(
  @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { notificationId: string },
  ) {
    try {
      const userId = client.userData!.userId;
      const { notificationId } = data;

      this.logger.debug(`User ${userId} marking notification ${notificationId} as read via WebSocket`);

      // Acknowledge to client
      client.emit(SocketEvent.NOTIFICATION_READ, {
        notificationId,
        success: true,
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error handling mark as read:', error);
      client.emit(SocketEvent.ERROR, {
        message: 'Failed to mark notification as read',
      });
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Emit notification to specific user
   * If user is offline and message persistence is enabled, store the message
   */
  async emitToUser(userId: string, event: SocketEvent, data: any, persistIfOffline = true): Promise<void> {
    const room = `user:${userId}`;
    const timestamp = new Date().toISOString();
    const payload = {
      ...data,
      timestamp,
    };

    // Check if user is online
    const isOnline = this.isUserConnected(userId);

    if (isOnline) {
      this.server.to(room).emit(event, payload);
      this.logger.debug(`Emitted ${event} to user ${userId}`);
    } else if (persistIfOffline && this.messagePersistence.isOperational()) {
      // Store message for later delivery
      await this.messagePersistence.storePendingMessage(userId, event, payload);
      this.logger.debug(`Stored ${event} for offline user ${userId}`);
    } else {
      this.logger.debug(`User ${userId} is offline, message ${event} not delivered`);
    }
  }

  /**
   * Emit notification to multiple users
   */
  async emitToUsers(userIds: string[], event: SocketEvent, data: any, persistIfOffline = true): Promise<void> {
    await Promise.all(
      userIds.map((userId) => this.emitToUser(userId, event, data, persistIfOffline)),
    );
    this.logger.debug(`Emitted ${event} to ${userIds.length} users`);
  }

  /**
   * Broadcast to all connected users
   */
  broadcast(event: SocketEvent, data: any) {
    this.server.emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
    this.logger.debug(`Broadcasted ${event} to all connected users`);
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  /**
   * Check if user is connected
   */
  isUserConnected(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
  }

  /**
   * Get user's socket count
   */
  getUserSocketCount(userId: string): number {
    return this.userSockets.get(userId)?.size || 0;
  }

  /**
   * Handle client acknowledgment of pending messages
   */
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('pending_messages:ack')
  async handlePendingMessagesAck(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageIds: string[] },
  ) {
    try {
      const userId = client.userData!.userId;
      const { messageIds } = data;

      if (this.messagePersistence.isOperational() && messageIds?.length > 0) {
        const removed = await this.messagePersistence.removeMessages(userId, messageIds);
        this.logger.debug(`User ${userId} acknowledged ${removed} pending messages`);
        return { success: true, removed };
      }

      return { success: true, removed: 0 };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error acknowledging pending messages:', error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get WebSocket connection statistics
   */
  getConnectionStats(): {
    connectedUsers: number;
    totalSockets: number;
    messagePersistenceEnabled: boolean;
  } {
    let totalSockets = 0;
    this.userSockets.forEach((sockets) => {
      totalSockets += sockets.size;
    });

    return {
      connectedUsers: this.userSockets.size,
      totalSockets,
      messagePersistenceEnabled: this.messagePersistence.isOperational(),
    };
  }

  // ==========================================================================
  // TEACHER PORTAL METHODS (P2-01: 2025-12-18)
  // ==========================================================================

  /**
   * Subscribe teacher to classroom updates
   */
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('teacher:subscribe_classroom')
  async handleSubscribeClassroom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { classroomId: string },
  ) {
    try {
      const userId = client.userData!.userId;
      const { classroomId } = data;
      const room = `classroom:${classroomId}`;

      await client.join(room);
      this.logger.debug(`Teacher ${userId} subscribed to classroom ${classroomId}`);

      return { success: true, room };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error subscribing to classroom:', error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Unsubscribe teacher from classroom updates
   */
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('teacher:unsubscribe_classroom')
  async handleUnsubscribeClassroom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { classroomId: string },
  ) {
    try {
      const userId = client.userData!.userId;
      const { classroomId } = data;
      const room = `classroom:${classroomId}`;

      await client.leave(room);
      this.logger.debug(`Teacher ${userId} unsubscribed from classroom ${classroomId}`);

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error unsubscribing from classroom:', error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Emit student activity to classroom teachers
   */
  emitStudentActivity(classroomId: string, payload: Omit<StudentActivityPayload, 'timestamp'>) {
    const room = `classroom:${classroomId}`;
    this.server.to(room).emit(SocketEvent.STUDENT_ACTIVITY, {
      ...payload,
      timestamp: new Date().toISOString(),
    });
    this.logger.debug(`Student activity emitted to classroom ${classroomId}`);
  }

  /**
   * Emit classroom update to subscribed teachers
   */
  emitClassroomUpdate(classroomId: string, payload: Omit<ClassroomUpdatePayload, 'timestamp'>) {
    const room = `classroom:${classroomId}`;
    this.server.to(room).emit(SocketEvent.CLASSROOM_UPDATE, {
      ...payload,
      timestamp: new Date().toISOString(),
    });
    this.logger.debug(`Classroom update emitted to ${classroomId}`);
  }

  /**
   * Emit new submission notification to classroom teachers
   */
  emitNewSubmission(classroomId: string, payload: Omit<NewSubmissionPayload, 'timestamp'>) {
    const room = `classroom:${classroomId}`;
    this.server.to(room).emit(SocketEvent.NEW_SUBMISSION, {
      ...payload,
      timestamp: new Date().toISOString(),
    });
    this.logger.debug(`New submission emitted to classroom ${classroomId}`);
  }

  /**
   * Emit alert to specific teacher and classroom
   */
  emitAlertTriggered(
    teacherId: string,
    classroomId: string,
    payload: Omit<AlertTriggeredPayload, 'timestamp'>,
  ) {
    // Emit to teacher's personal room
    this.emitToUser(teacherId, SocketEvent.ALERT_TRIGGERED, payload);
    // Also emit to classroom room for other subscribed teachers
    const room = `classroom:${classroomId}`;
    this.server.to(room).emit(SocketEvent.ALERT_TRIGGERED, {
      ...payload,
      timestamp: new Date().toISOString(),
    });
    this.logger.debug(`Alert triggered for teacher ${teacherId} in classroom ${classroomId}`);
  }

  /**
   * Emit student online/offline status to classroom
   */
  emitStudentOnlineStatus(classroomId: string, payload: Omit<StudentOnlineStatusPayload, 'timestamp'>) {
    const room = `classroom:${classroomId}`;
    const event = payload.isOnline ? SocketEvent.STUDENT_ONLINE : SocketEvent.STUDENT_OFFLINE;
    this.server.to(room).emit(event, {
      ...payload,
      timestamp: new Date().toISOString(),
    });
    this.logger.debug(`Student ${payload.studentId} is now ${payload.isOnline ? 'online' : 'offline'}`);
  }

  /**
   * Emit progress update for a student
   */
  emitProgressUpdate(
    teacherIds: string[],
    classroomId: string,
    data: {
      studentId: string;
      studentName: string;
      progressType: 'module_complete' | 'exercise_complete' | 'level_up' | 'achievement';
      details: Record<string, unknown>;
    },
  ) {
    const payload = {
      ...data,
      classroomId,
      timestamp: new Date().toISOString(),
    };

    // Emit to all relevant teachers
    teacherIds.forEach((teacherId) => {
      this.emitToUser(teacherId, SocketEvent.PROGRESS_UPDATE, payload);
    });

    // Also emit to classroom room
    const room = `classroom:${classroomId}`;
    this.server.to(room).emit(SocketEvent.PROGRESS_UPDATE, payload);

    this.logger.debug(`Progress update emitted for student ${data.studentId}`);
  }

  /**
   * Get count of teachers subscribed to a classroom
   */
  async getClassroomSubscriberCount(classroomId: string): Promise<number> {
    const room = `classroom:${classroomId}`;
    const sockets = await this.server.in(room).fetchSockets();
    return sockets.length;
  }
}
