import { registerAs } from '@nestjs/config';

const redisConfig = registerAs('redis', () => ({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  db: parseInt(process.env.REDIS_SOCKET_DB || '0', 10),
  password: process.env.REDIS_PASSWORD || undefined,

  // Socket.IO adapter
  socketPrefix: process.env.REDIS_SOCKET_PREFIX || 'gamilit:socket:',

  // Message persistence
  messagePrefix: process.env.REDIS_MESSAGE_PREFIX || 'gamilit:pending:',
  messageTtlSeconds: parseInt(process.env.REDIS_MESSAGE_TTL || '86400', 10),
  maxPendingMessages: parseInt(process.env.REDIS_MAX_PENDING_MESSAGES || '100', 10),

  // Connection resilience
  retryDelayMs: parseInt(process.env.REDIS_RETRY_DELAY_MS || '1000', 10),
  maxRetries: parseInt(process.env.REDIS_MAX_RETRIES || '10', 10),
}));

export default redisConfig;

export type RedisConfig = ReturnType<typeof redisConfig>;
