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
import { BattleSessionService } from '../services/battle-session.service';
import {
  BattleJoinDto,
  BattleReadyDto,
  BattleAnswerDto,
  PowerUpDto,
  BattleStateDto,
  AnswerResultDto,
  BattleResultDto,
  CountdownDto,
} from '../dto/battle.dto';

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
 * Battle WebSocket Events
 */
export enum BattleEvent {
  // Client -> Server
  JOIN = 'battle:join',
  READY = 'battle:ready',
  ANSWER = 'battle:answer',
  POWERUP = 'battle:powerup',
  EMOJI = 'battle:emoji',

  // Server -> Client
  STATE = 'battle:state',
  COUNTDOWN = 'battle:countdown',
  START = 'battle:start',
  SCORE_UPDATE = 'battle:scoreUpdate',
  QUESTION_NEXT = 'battle:questionNext',
  OPPONENT_ANSWERED = 'battle:opponentAnswered',
  POWERUP_USED = 'battle:powerupUsed',
  END = 'battle:end',
  OPPONENT_DISCONNECTED = 'battle:opponentDisconnected',
  OPPONENT_RECONNECTED = 'battle:opponentReconnected',
  ERROR = 'battle:error',
}

/**
 * BattleGateway
 *
 * @description WebSocket gateway for real-time battle operations.
 * Handles battle join, ready state, answer submission, and live score updates.
 *
 * @see Epic: EXT-009 - Peer Challenges
 * @see ET-PEER-002-realtime-battles.md
 */
// FIX-BE-016-2026-01-29: CORS and transports configured in SocketIOAdapter
@WebSocketGateway({ namespace: '/battle' })
export class BattleGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(BattleGateway.name);

  /**
   * Map of socketId to userId
   */
  private socketUsers = new Map<string, string>();

  /**
   * Map of userId to socketId
   */
  private userSockets = new Map<string, string>();

  /**
   * Map of challengeId to set of userIds in the battle room
   */
  private battleRooms = new Map<string, Set<string>>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly battleSessionService: BattleSessionService,
  ) {}

  afterInit(_server: Server) {
    this.logger.log('Battle WebSocket Gateway initialized');
  }

  /**
   * Handle new WebSocket connection
   */
  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth?.token || client.handshake.query?.token;

      if (!token || typeof token !== 'string') {
        this.logger.warn(`Connection rejected: no token (socket: ${client.id})`);
        client.emit(BattleEvent.ERROR, { message: 'Authentication required' });
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

      this.logger.log(`Client connected to battle: ${userId} (${client.id})`);
    } catch (_error) {
      this.logger.warn(`Connection rejected: auth failed (socket: ${client.id})`);
      client.emit(BattleEvent.ERROR, { message: 'Authentication failed' });
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

      // Notify battles that user disconnected
      for (const [challengeId, players] of this.battleRooms) {
        if (players.has(userId)) {
          players.delete(userId);
          await this.battleSessionService.handlePlayerDisconnect(challengeId, userId);

          // Notify other players
          this.broadcastToBattle(challengeId, BattleEvent.OPPONENT_DISCONNECTED, {
            playerId: userId,
            waitingTime: 60, // 60 seconds to reconnect
          });

          this.logger.log(`Player ${userId} disconnected from battle ${challengeId}`);
        }
      }
    }
  }

  /**
   * Handle join battle request
   */
  @SubscribeMessage(BattleEvent.JOIN)
  async handleJoin(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: BattleJoinDto,
  ): Promise<BattleStateDto | { error: string }> {
    try {
      const userId = client.userData?.userId;
      if (!userId) {
        return { error: 'User not authenticated' };
      }

      const { challengeId } = data;

      // Initialize battle if needed
      let battleState = await this.battleSessionService.initBattle(challengeId);

      // Join battle room
      await client.join(`battle:${challengeId}`);

      // Track user in battle room
      if (!this.battleRooms.has(challengeId)) {
        this.battleRooms.set(challengeId, new Set());
      }
      this.battleRooms.get(challengeId)!.add(userId);

      // Check if this is a reconnect
      const existingState = await this.battleSessionService.handlePlayerReconnect(
        challengeId,
        userId,
      );

      if (existingState) {
        // Notify other players of reconnect
        this.broadcastToBattle(challengeId, BattleEvent.OPPONENT_RECONNECTED, {
          playerId: userId,
        });
        battleState = existingState;
      }

      // Send current state to joining player
      client.emit(BattleEvent.STATE, battleState);

      this.logger.log(`Player ${userId} joined battle ${challengeId}`);

      return battleState;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Join battle failed';
      this.logger.error(`Join battle failed: ${message}`);
      return { error: message };
    }
  }

  /**
   * Handle ready state
   */
  @SubscribeMessage(BattleEvent.READY)
  async handleReady(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: BattleReadyDto,
  ): Promise<{ success: boolean }> {
    try {
      const userId = client.userData?.userId;
      if (!userId) {
        return { success: false };
      }

      const { challengeId } = data;

      const allReady = await this.battleSessionService.setPlayerReady(
        challengeId,
        userId,
      );

      // Notify all players of ready state update
      const battleState = await this.battleSessionService.getBattleState(challengeId);
      this.broadcastToBattle(challengeId, BattleEvent.STATE, battleState);

      // If all players ready, start countdown
      if (allReady) {
        await this.startCountdown(challengeId);
      }

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ready failed';
      this.logger.error(`Ready failed: ${message}`);
      return { success: false };
    }
  }

  /**
   * Handle answer submission
   */
  @SubscribeMessage(BattleEvent.ANSWER)
  async handleAnswer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: BattleAnswerDto,
  ): Promise<AnswerResultDto | { error: string }> {
    try {
      const userId = client.userData?.userId;
      if (!userId) {
        return { error: 'User not authenticated' };
      }

      const { challengeId, questionId, answer, timeTakenMs } = data;

      // Process the answer
      const result = await this.battleSessionService.processAnswer(
        challengeId,
        userId,
        questionId,
        answer,
        timeTakenMs,
      );

      // Notify opponent that player answered
      this.broadcastToOthersInBattle(challengeId, userId, BattleEvent.OPPONENT_ANSWERED, {
        playerId: userId,
        correct: result.correct,
      });

      // Send score update to all players
      const battleState = await this.battleSessionService.getBattleState(challengeId);
      this.broadcastToBattle(challengeId, BattleEvent.SCORE_UPDATE, {
        players: battleState.players.map((p) => ({
          id: p.id,
          score: p.score,
          correctAnswers: p.correctAnswers,
          totalAnswers: p.totalAnswers,
        })),
      });

      // Check if battle should end
      const shouldEnd = await this.battleSessionService.checkBattleEnd(challengeId);
      if (shouldEnd) {
        await this.endBattle(challengeId);
      } else {
        // Send next question to the player
        const nextQuestion = await this.battleSessionService.getNextQuestion(
          challengeId,
          userId,
        );
        if (nextQuestion) {
          client.emit(BattleEvent.QUESTION_NEXT, {
            question: nextQuestion,
            timeRemaining: battleState.timeRemaining,
          });
        }
      }

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Answer failed';
      this.logger.error(`Answer failed: ${message}`);
      return { error: message };
    }
  }

  /**
   * Handle power-up usage
   */
  @SubscribeMessage(BattleEvent.POWERUP)
  async handlePowerUp(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: PowerUpDto,
  ): Promise<{ success: boolean }> {
    try {
      const userId = client.userData?.userId;
      if (!userId) {
        return { success: false };
      }

      const { challengeId, powerUpId } = data;

      // TODO: Implement power-up logic
      // For now, just notify other players
      this.broadcastToOthersInBattle(challengeId, userId, BattleEvent.POWERUP_USED, {
        playerId: userId,
        powerUpId,
        effect: 'freeze', // placeholder
      });

      this.logger.log(`Player ${userId} used power-up ${powerUpId} in battle ${challengeId}`);

      return { success: true };
    } catch (error) {
      this.logger.error(`Power-up failed:`, error);
      return { success: false };
    }
  }

  /**
   * Handle emoji/quick chat
   */
  @SubscribeMessage(BattleEvent.EMOJI)
  async handleEmoji(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { challengeId: string; emoji: string },
  ): Promise<void> {
    const userId = client.userData?.userId;
    if (!userId) return;

    const { challengeId, emoji } = data;

    // Broadcast emoji to battle room
    this.broadcastToOthersInBattle(challengeId, userId, 'battle:emoji', {
      playerId: userId,
      emoji,
    });
  }

  /**
   * Start countdown before battle
   */
  async startCountdown(challengeId: string): Promise<void> {
    const countdownValues = [3, 2, 1];

    for (const count of countdownValues) {
      const payload: CountdownDto = {
        count,
        message: count === 1 ? 'GO!' : `${count}`,
      };
      this.broadcastToBattle(challengeId, BattleEvent.COUNTDOWN, payload);
      await this.sleep(1000);
    }

    // Start the battle
    await this.battleSessionService.startBattle(challengeId);

    // Send battle start event with first question
    const battleState = await this.battleSessionService.getBattleState(challengeId);
    this.broadcastToBattle(challengeId, BattleEvent.START, {
      state: battleState,
    });

    // Send first question to each player
    for (const player of battleState.players) {
      const question = await this.battleSessionService.getNextQuestion(
        challengeId,
        player.id,
      );
      const socketId = this.userSockets.get(player.id);
      if (socketId && question) {
        this.server.to(socketId).emit(BattleEvent.QUESTION_NEXT, {
          question,
          timeRemaining: battleState.timeRemaining,
        });
      }
    }

    this.logger.log(`Battle ${challengeId} started`);
  }

  /**
   * End battle and send results
   */
  async endBattle(challengeId: string): Promise<void> {
    try {
      const result = await this.battleSessionService.finalizeBattle(challengeId);
      this.broadcastToBattle(challengeId, BattleEvent.END, result);

      // Clean up battle room after delay
      setTimeout(() => {
        this.battleRooms.delete(challengeId);
      }, 30000);

      this.logger.log(`Battle ${challengeId} ended`);
    } catch (error) {
      this.logger.error(`End battle failed:`, error);
    }
  }

  /**
   * Broadcast event to all players in a battle
   */
  broadcastToBattle(challengeId: string, event: string, data: any): void {
    this.server.to(`battle:${challengeId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast event to all players except one
   */
  broadcastToOthersInBattle(
    challengeId: string,
    excludeUserId: string,
    event: string,
    data: any,
  ): void {
    const players = this.battleRooms.get(challengeId);
    if (!players) return;

    for (const userId of players) {
      if (userId === excludeUserId) continue;

      const socketId = this.userSockets.get(userId);
      if (socketId) {
        this.server.to(socketId).emit(event, {
          ...data,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  /**
   * Notify specific player in battle
   */
  notifyPlayer(userId: string, event: string, data: any): void {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, {
        ...data,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Send battle result to specific player
   */
  notifyBattleEnd(challengeId: string, result: BattleResultDto): void {
    this.broadcastToBattle(challengeId, BattleEvent.END, result);
  }

  /**
   * Helper: Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get number of active battles
   */
  getActiveBattlesCount(): number {
    return this.battleRooms.size;
  }

  /**
   * Check if user is in a battle
   */
  isUserInBattle(userId: string): boolean {
    for (const players of this.battleRooms.values()) {
      if (players.has(userId)) {
        return true;
      }
    }
    return false;
  }
}
