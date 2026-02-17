/**
 * Message Persistence Service
 *
 * Handles storing and retrieving undelivered WebSocket messages in Redis.
 * When a user is offline, messages are stored with a TTL and automatically
 * delivered when they reconnect.
 *
 * Features:
 * - Store pending messages with configurable TTL
 * - Retrieve and clear messages on reconnection
 * - Automatic expiration of old messages
 * - Message deduplication support
 */

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { SocketEvent } from '../types/websocket.types';

export interface PendingMessage {
  id: string;
  event: SocketEvent | string;
  data: Record<string, unknown>;
  createdAt: string;
  expiresAt: string;
}

export interface MessagePersistenceConfig {
  url: string;
  db?: number;
  password?: string;
  keyPrefix?: string;
  defaultTtlSeconds?: number;
  maxMessagesPerUser?: number;
}

@Injectable()
export class MessagePersistenceService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MessagePersistenceService.name);
  private client: RedisClientType | null = null;
  private isConnected = false;
  private readonly config: MessagePersistenceConfig;

  constructor() {
    this.config = {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      db: parseInt(process.env.REDIS_SOCKET_DB || '0', 10),
      password: process.env.REDIS_PASSWORD || undefined,
      keyPrefix: process.env.REDIS_MESSAGE_PREFIX || 'gamilit:pending:',
      defaultTtlSeconds: parseInt(process.env.REDIS_MESSAGE_TTL || '86400', 10), // 24 hours default
      maxMessagesPerUser: parseInt(process.env.REDIS_MAX_PENDING_MESSAGES || '100', 10),
    };
  }

  async onModuleInit(): Promise<void> {
    const redisEnabled = (process.env.REDIS_ENABLED || 'true').toLowerCase() === 'true';
    if (!redisEnabled) {
      this.logger.log('Redis disabled by configuration — message persistence inactive');
      return;
    }
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  /**
   * Connect to Redis
   */
  private async connect(): Promise<boolean> {
    try {
      this.logger.log('Connecting to Redis for message persistence...');

      const maxRetries = parseInt(process.env.REDIS_MAX_RETRIES || '3', 10);
      const baseDelay = parseInt(process.env.REDIS_RETRY_DELAY_MS || '1000', 10);
      this.client = createClient({
        url: this.config.url,
        database: this.config.db,
        password: this.config.password,
        socket: {
          connectTimeout: 5000,
          reconnectStrategy: (retries: number) => {
            if (retries >= maxRetries) {
              this.logger.warn(`Redis max retries (${maxRetries}) reached for message persistence — falling back to no persistence`);
              return false;
            }
            const exponentialDelay = Math.min(baseDelay * Math.pow(2, retries), 10000);
            const jitter = Math.floor(Math.random() * baseDelay);
            const delay = exponentialDelay + jitter;
            this.logger.warn(`Redis message persistence reconnecting in ${delay}ms (attempt ${retries + 1}/${maxRetries})`);
            return delay;
          },
        },
      }) as RedisClientType;

      this.client.on('error', (err) => {
        this.logger.error(`Redis message persistence error: ${err.message}`);
        this.isConnected = false;
      });

      this.client.on('ready', () => {
        this.logger.log('Redis message persistence client ready');
        this.isConnected = true;
      });

      await this.client.connect();
      this.isConnected = true;
      this.logger.log('Message persistence service connected to Redis');

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to connect message persistence to Redis: ${errorMessage}`);
      this.logger.warn('Message persistence disabled - messages will not be stored for offline users');
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Disconnect from Redis
   */
  private async disconnect(): Promise<void> {
    try {
      if (this.client?.isOpen) {
        await this.client.quit();
        this.logger.log('Message persistence disconnected from Redis');
      }
      this.isConnected = false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error disconnecting message persistence: ${errorMessage}`);
    }
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get the Redis key for a user's pending messages
   */
  private getUserKey(userId: string): string {
    return `${this.config.keyPrefix}${userId}`;
  }

  /**
   * Store a pending message for an offline user
   */
  async storePendingMessage(
    userId: string,
    event: SocketEvent | string,
    data: Record<string, unknown>,
    ttlSeconds?: number,
  ): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      this.logger.warn(`Cannot store message for user ${userId}: Redis not connected`);
      return false;
    }

    try {
      const key = this.getUserKey(userId);
      const ttl = ttlSeconds || this.config.defaultTtlSeconds || 86400;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + ttl * 1000);

      const message: PendingMessage = {
        id: this.generateMessageId(),
        event,
        data,
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      };

      // Add message to user's list
      await this.client.rPush(key, JSON.stringify(message));

      // Set expiration on the key
      await this.client.expire(key, ttl);

      // Trim to max messages if exceeded
      const listLength = await this.client.lLen(key);
      if (listLength > (this.config.maxMessagesPerUser || 100)) {
        // Remove oldest messages
        const toRemove = listLength - (this.config.maxMessagesPerUser || 100);
        for (let i = 0; i < toRemove; i++) {
          await this.client.lPop(key);
        }
        this.logger.debug(`Trimmed ${toRemove} old messages for user ${userId}`);
      }

      this.logger.debug(`Stored pending message for user ${userId}: ${event}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to store pending message for user ${userId}: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Retrieve all pending messages for a user
   */
  async getPendingMessages(userId: string): Promise<PendingMessage[]> {
    if (!this.isConnected || !this.client) {
      return [];
    }

    try {
      const key = this.getUserKey(userId);
      const messages = await this.client.lRange(key, 0, -1);

      if (!messages || messages.length === 0) {
        return [];
      }

      const now = new Date();
      const validMessages: PendingMessage[] = [];

      for (const msgStr of messages) {
        try {
          const message = JSON.parse(msgStr) as PendingMessage;
          // Filter out expired messages
          if (new Date(message.expiresAt) > now) {
            validMessages.push(message);
          }
        } catch {
          this.logger.warn(`Invalid message format in pending queue for user ${userId}`);
        }
      }

      this.logger.debug(`Retrieved ${validMessages.length} pending messages for user ${userId}`);
      return validMessages;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get pending messages for user ${userId}: ${errorMessage}`);
      return [];
    }
  }

  /**
   * Clear all pending messages for a user (after successful delivery)
   */
  async clearPendingMessages(userId: string): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const key = this.getUserKey(userId);
      await this.client.del(key);
      this.logger.debug(`Cleared pending messages for user ${userId}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to clear pending messages for user ${userId}: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Remove specific messages by IDs
   */
  async removeMessages(userId: string, messageIds: string[]): Promise<number> {
    if (!this.isConnected || !this.client || messageIds.length === 0) {
      return 0;
    }

    try {
      const key = this.getUserKey(userId);
      const messages = await this.client.lRange(key, 0, -1);

      if (!messages || messages.length === 0) {
        return 0;
      }

      let removedCount = 0;
      const messageIdSet = new Set(messageIds);

      // Remove messages by ID
      for (const msgStr of messages) {
        try {
          const message = JSON.parse(msgStr) as PendingMessage;
          if (messageIdSet.has(message.id)) {
            await this.client.lRem(key, 1, msgStr);
            removedCount++;
          }
        } catch {
          // Skip invalid messages
        }
      }

      this.logger.debug(`Removed ${removedCount} messages for user ${userId}`);
      return removedCount;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to remove messages for user ${userId}: ${errorMessage}`);
      return 0;
    }
  }

  /**
   * Get count of pending messages for a user
   */
  async getPendingMessageCount(userId: string): Promise<number> {
    if (!this.isConnected || !this.client) {
      return 0;
    }

    try {
      const key = this.getUserKey(userId);
      return await this.client.lLen(key);
    } catch {
      return 0;
    }
  }

  /**
   * Check if service is connected and operational
   */
  isOperational(): boolean {
    return this.isConnected && this.client?.isReady === true;
  }

  /**
   * Get service status
   */
  getStatus(): {
    connected: boolean;
    config: Omit<MessagePersistenceConfig, 'password'>;
  } {
    return {
      connected: this.isConnected,
      config: {
        url: this.config.url.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@'),
        db: this.config.db,
        keyPrefix: this.config.keyPrefix,
        defaultTtlSeconds: this.config.defaultTtlSeconds,
        maxMessagesPerUser: this.config.maxMessagesPerUser,
      },
    };
  }
}
