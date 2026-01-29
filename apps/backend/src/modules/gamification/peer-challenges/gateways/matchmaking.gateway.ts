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
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MatchmakingService } from '../services/matchmaking.service';
import {
  MatchmakingPreferencesDto,
  QueuePositionResponseDto,
  MatchResultDto,
} from '../dto/matchmaking.dto';

/**
 * Socket with user data attached
 */
interface AuthenticatedSocket extends Socket {
  userData?: {
    userId: string;
    email: string;
    role: string;
    tenantId?: string;
  };
}

/**
 * Matchmaking WebSocket Events
 */
export enum MatchmakingEvent {
  // Client -> Server
  JOIN_QUEUE = 'matchmaking:joinQueue',
  LEAVE_QUEUE = 'matchmaking:leaveQueue',
  GET_STATUS = 'matchmaking:getStatus',

  // Server -> Client
  QUEUE_JOINED = 'matchmaking:queueJoined',
  QUEUE_LEFT = 'matchmaking:queueLeft',
  QUEUE_UPDATE = 'matchmaking:queueUpdate',
  MATCH_FOUND = 'matchmaking:matchFound',
  MATCHMAKING_TIMEOUT = 'matchmaking:timeout',
  ERROR = 'matchmaking:error',
}

/**
 * MatchmakingGateway
 *
 * @description WebSocket gateway for real-time matchmaking operations.
 * Handles queue join/leave operations and notifies clients when matches are found.
 *
 * @see Epic: EXT-009 - Peer Challenges
 * @see ET-PEER-001-matchmaking.md
 */
// FIX-BE-016-2026-01-29: CORS and transports configured in SocketIOAdapter
@WebSocketGateway({ namespace: '/matchmaking' })
export class MatchmakingGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(MatchmakingGateway.name);

  /**
   * Map of userId to socketId for direct notifications
   */
  private userSockets = new Map<string, string>();

  /**
   * Map of socketId to userId for cleanup
   */
  private socketUsers = new Map<string, string>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly matchmakingService: MatchmakingService,
  ) {}

  afterInit(_server: Server) {
    this.logger.log('Matchmaking WebSocket Gateway initialized');
  }

  /**
   * Handle new WebSocket connection
   */
  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract and verify token
      const token =
        client.handshake.auth?.token || client.handshake.query?.token;

      if (!token || typeof token !== 'string') {
        this.logger.warn(`Connection rejected: no token (socket: ${client.id})`);
        client.emit(MatchmakingEvent.ERROR, { message: 'Authentication required' });
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);

      client.userData = {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
        tenantId: payload.tenant_id,
      };

      const userId = client.userData.userId;

      // Register socket
      this.userSockets.set(userId, client.id);
      this.socketUsers.set(client.id, userId);

      // Join user-specific room
      await client.join(`user:${userId}`);

      this.logger.log(`Client connected: ${userId} (${client.id})`);

      // Check if user was already in queue (reconnect scenario)
      const queueStatus = await this.matchmakingService.getQueueStatus(userId);
      if (queueStatus.inQueue) {
        client.emit(MatchmakingEvent.QUEUE_UPDATE, queueStatus.position);
      }
    } catch (_error) {
      this.logger.warn(`Connection rejected: auth failed (socket: ${client.id})`);
      client.emit(MatchmakingEvent.ERROR, { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  /**
   * Handle WebSocket disconnection
   */
  async handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.userData?.userId || this.socketUsers.get(client.id);

    if (userId) {
      this.userSockets.delete(userId);
      this.socketUsers.delete(client.id);

      // Remove from matchmaking queue
      await this.matchmakingService.leaveQueue(userId);

      this.logger.log(`Client disconnected: ${userId} (${client.id})`);
    }
  }

  /**
   * Handle join queue request
   */
  @SubscribeMessage(MatchmakingEvent.JOIN_QUEUE)
  async handleJoinQueue(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() preferences: MatchmakingPreferencesDto,
  ): Promise<QueuePositionResponseDto | { error: string }> {
    try {
      const userId = client.userData?.userId;
      if (!userId) {
        return { error: 'User not authenticated' };
      }

      const displayName = client.userData?.email?.split('@')[0] || 'Player';

      const position = await this.matchmakingService.joinQueue(
        userId,
        preferences,
        displayName,
      );

      // Notify client
      client.emit(MatchmakingEvent.QUEUE_JOINED, position);

      this.logger.log(`User ${userId} joined matchmaking queue`);

      // Try to find immediate match
      const match = await this.matchmakingService.findMatch(userId);
      if (match) {
        this.notifyMatchFound(userId, match);
        // Notify opponent
        this.notifyMatchFound(match.opponent.id, {
          ...match,
          opponent: {
            id: userId,
            displayName,
            skillRating: position.currentSearchRange, // Approximate
          },
        });
      }

      return position;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Join queue failed';
      this.logger.error(`Join queue failed for ${client.userData?.userId}: ${message}`);
      client.emit(MatchmakingEvent.ERROR, { message });
      return { error: message };
    }
  }

  /**
   * Handle leave queue request
   */
  @SubscribeMessage(MatchmakingEvent.LEAVE_QUEUE)
  async handleLeaveQueue(
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<{ success: boolean }> {
    try {
      const userId = client.userData?.userId;
      if (!userId) {
        return { success: false };
      }

      await this.matchmakingService.leaveQueue(userId);

      client.emit(MatchmakingEvent.QUEUE_LEFT, { success: true });

      this.logger.log(`User ${userId} left matchmaking queue`);

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Leave queue failed';
      this.logger.error(`Leave queue failed: ${message}`);
      return { success: false };
    }
  }

  /**
   * Handle get status request
   */
  @SubscribeMessage(MatchmakingEvent.GET_STATUS)
  async handleGetStatus(
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<any> {
    try {
      const userId = client.userData?.userId;
      if (!userId) {
        return { inQueue: false, totalInQueue: 0 };
      }

      const status = await this.matchmakingService.getQueueStatus(userId);
      return status;
    } catch (error) {
      this.logger.error('Get status failed:', error);
      return { inQueue: false, totalInQueue: 0 };
    }
  }

  /**
   * Notify user that a match was found
   */
  notifyMatchFound(userId: string, matchResult: MatchResultDto): void {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(MatchmakingEvent.MATCH_FOUND, matchResult);
      this.logger.log(`Match notification sent to user ${userId}`);
    }
  }

  /**
   * Notify user of queue position update
   */
  notifyQueueUpdate(userId: string, position: QueuePositionResponseDto): void {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(MatchmakingEvent.QUEUE_UPDATE, position);
    }
  }

  /**
   * Notify user that matchmaking timed out
   */
  notifyMatchmakingTimeout(userId: string): void {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(MatchmakingEvent.MATCHMAKING_TIMEOUT, {
        message: 'Matchmaking timed out. Please try again.',
      });
      this.logger.log(`Matchmaking timeout notification sent to user ${userId}`);
    }
  }

  /**
   * Get number of connected users
   */
  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  /**
   * Check if user is connected
   */
  isUserConnected(userId: string): boolean {
    return this.userSockets.has(userId);
  }
}
