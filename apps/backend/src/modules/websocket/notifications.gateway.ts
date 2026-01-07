/**
 * Notifications Gateway
 *
 * WebSocket gateway for real-time notifications
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

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3005', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST'],
  },
  path: '/socket.io/',
  transports: ['websocket', 'polling'],
})
export class NotificationsGateway
implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
    server!: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  private userSockets = new Map<string, Set<string>>(); // userId -> Set of socketIds

  constructor(private readonly jwtService: JwtService) {}

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

      // Emit authenticated event
      client.emit(SocketEvent.AUTHENTICATED, {
        success: true,
        userId,
        email: userEmail,
        socketId: client.id,
      });
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
        }
      }
    }

    this.logger.log(`Client disconnected: ${userEmail} (${client.id})`);
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
   */
  emitToUser(userId: string, event: SocketEvent, data: any) {
    const room = `user:${userId}`;
    this.server.to(room).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
    this.logger.debug(`Emitted ${event} to user ${userId}`);
  }

  /**
   * Emit notification to multiple users
   */
  emitToUsers(userIds: string[], event: SocketEvent, data: any) {
    userIds.forEach((userId) => {
      this.emitToUser(userId, event, data);
    });
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
