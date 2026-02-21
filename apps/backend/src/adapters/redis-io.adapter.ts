/**
 * Redis Socket.IO Adapter
 *
 * Enables horizontal scaling for Socket.IO by using Redis as a message broker.
 * All Socket.IO instances communicate through Redis pub/sub, allowing
 * messages to be delivered regardless of which server the client is connected to.
 *
 * Features:
 * - Redis-backed pub/sub for multi-instance communication
 * - Graceful fallback to standard adapter if Redis is unavailable
 * - Configurable via environment variables
 * - Connection health monitoring
 *
 * @see https://socket.io/docs/v4/redis-adapter/
 */

import { INestApplicationContext, Logger } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient, RedisClientType } from 'redis';

export interface RedisAdapterConfig {
  url: string;
  db?: number;
  password?: string;
  keyPrefix?: string;
  retryDelayMs?: number;
  maxRetries?: number;
}

export class RedisIoAdapter extends IoAdapter {
  private readonly logger = new Logger(RedisIoAdapter.name);
  private adapterConstructor: ReturnType<typeof createAdapter> | null = null;
  private pubClient: RedisClientType | null = null;
  private subClient: RedisClientType | null = null;
  private isConnected = false;
  private readonly corsOrigins: string[] | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void);
  private readonly config: RedisAdapterConfig;

  constructor(
    app: INestApplicationContext,
    corsOrigins: string[] | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void),
    config?: Partial<RedisAdapterConfig>,
  ) {
    super(app);
    this.corsOrigins = corsOrigins;
    this.config = {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      db: parseInt(process.env.REDIS_SOCKET_DB || '0', 10),
      password: process.env.REDIS_PASSWORD || undefined,
      keyPrefix: process.env.REDIS_SOCKET_PREFIX || 'gamilit:socket:',
      retryDelayMs: parseInt(process.env.REDIS_RETRY_DELAY_MS || '1000', 10),
      maxRetries: parseInt(process.env.REDIS_MAX_RETRIES || '3', 10),
      ...config,
    };
  }

  /**
   * Connect to Redis for pub/sub communication
   * Returns true if connection successful, false otherwise
   */
  async connectToRedis(): Promise<boolean> {
    try {
      this.logger.log('Connecting to Redis for Socket.IO adapter...');

      const clientOptions = {
        url: this.config.url,
        database: this.config.db,
        password: this.config.password,
        socket: {
          connectTimeout: 5000,
          reconnectStrategy: (retries: number) => {
            if (retries >= (this.config.maxRetries || 3)) {
              this.logger.warn(`Redis max retries (${this.config.maxRetries}) reached — Socket.IO will use in-memory adapter`);
              return false;
            }
            const baseDelay = this.config.retryDelayMs || 1000;
            const exponentialDelay = Math.min(baseDelay * Math.pow(2, retries), 10000);
            const jitter = Math.floor(Math.random() * baseDelay);
            const delay = exponentialDelay + jitter;
            this.logger.warn(`Redis reconnecting in ${delay}ms (attempt ${retries + 1}/${this.config.maxRetries})`);
            return delay;
          },
        },
      };

      // Create pub/sub clients
      this.pubClient = createClient(clientOptions) as RedisClientType;
      this.subClient = this.pubClient.duplicate() as RedisClientType;

      // Set up error handlers
      this.pubClient.on('error', (err) => {
        this.logger.error(`Redis pub client error: ${err.message}`);
        this.isConnected = false;
      });

      this.subClient.on('error', (err) => {
        this.logger.error(`Redis sub client error: ${err.message}`);
        this.isConnected = false;
      });

      // Set up reconnection handlers
      this.pubClient.on('reconnecting', () => {
        this.logger.warn('Redis pub client reconnecting...');
      });

      this.subClient.on('reconnecting', () => {
        this.logger.warn('Redis sub client reconnecting...');
      });

      this.pubClient.on('ready', () => {
        this.logger.log('Redis pub client ready');
        this.checkConnectionStatus();
      });

      this.subClient.on('ready', () => {
        this.logger.log('Redis sub client ready');
        this.checkConnectionStatus();
      });

      // Connect both clients
      await Promise.all([
        this.pubClient.connect(),
        this.subClient.connect(),
      ]);

      // Create the adapter
      this.adapterConstructor = createAdapter(this.pubClient, this.subClient, {
        key: this.config.keyPrefix,
      });

      this.isConnected = true;
      this.logger.log(`Redis adapter connected successfully (DB: ${this.config.db}, prefix: ${this.config.keyPrefix})`);

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to connect Redis adapter: ${errorMessage}`);
      this.logger.warn('Socket.IO will use default in-memory adapter (no horizontal scaling)');

      // Cleanup orphan clients to prevent memory leaks
      for (const client of [this.pubClient, this.subClient]) {
        if (client) {
          try {
            client.removeAllListeners();
            if (client.isOpen) await client.quit();
            else client.destroy();
          } catch { /* ignore cleanup errors */ }
        }
      }
      this.pubClient = null;
      this.subClient = null;
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Check if both Redis clients are connected
   */
  private checkConnectionStatus(): void {
    if (this.pubClient?.isReady && this.subClient?.isReady) {
      this.isConnected = true;
    }
  }

  /**
   * Create the Socket.IO server with Redis adapter if available
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createIOServer(port: number, options?: ServerOptions): any {
    const serverOptions: Partial<ServerOptions> = {
      ...options,
      cors: {
        origin: this.corsOrigins,
        credentials: true,
        methods: ['GET', 'POST'],
      },
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      allowEIO3: true,
      // Connection settings for reliability
      pingTimeout: 60000,
      pingInterval: 25000,
      // Allow reconnection
      connectTimeout: 45000,
    };

    const server = super.createIOServer(port, serverOptions);

    // Apply Redis adapter if connected
    if (this.adapterConstructor && this.isConnected) {
      server.adapter(this.adapterConstructor);
      this.logger.log('Socket.IO server using Redis adapter for horizontal scaling');
    } else {
      this.logger.warn('Socket.IO server using default in-memory adapter');
    }

    return server;
  }

  /**
   * Check if Redis adapter is connected and active
   */
  isRedisConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Get connection status details
   */
  getConnectionStatus(): {
    connected: boolean;
    pubClientReady: boolean;
    subClientReady: boolean;
    config: Omit<RedisAdapterConfig, 'password'>;
  } {
    return {
      connected: this.isConnected,
      pubClientReady: this.pubClient?.isReady || false,
      subClientReady: this.subClient?.isReady || false,
      config: {
        url: this.config.url.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@'), // Mask password in URL
        db: this.config.db,
        keyPrefix: this.config.keyPrefix,
        retryDelayMs: this.config.retryDelayMs,
        maxRetries: this.config.maxRetries,
      },
    };
  }

  /**
   * Gracefully disconnect Redis clients
   */
  async disconnect(): Promise<void> {
    try {
      if (this.pubClient?.isOpen) {
        await this.pubClient.quit();
        this.logger.log('Redis pub client disconnected');
      }
      if (this.subClient?.isOpen) {
        await this.subClient.quit();
        this.logger.log('Redis sub client disconnected');
      }
      this.isConnected = false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error disconnecting Redis clients: ${errorMessage}`);
    }
  }
}
