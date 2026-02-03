/**
 * Socket.IO Adapters
 *
 * Export adapters for WebSocket communication.
 * RedisIoAdapter is the primary adapter for production use with horizontal scaling.
 */

export { RedisIoAdapter, RedisAdapterConfig } from './redis-io.adapter';
export { SocketIOAdapter } from './socket-io.adapter';
