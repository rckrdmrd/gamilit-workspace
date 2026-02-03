/**
 * WebSocket Module
 *
 * Provides real-time communication via Socket.IO with:
 * - Redis adapter support for horizontal scaling
 * - Message persistence for offline users
 * - JWT authentication
 *
 * FIX: CORR-005 - Unificado JWT config con Auth Module usando ConfigService
 */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationsGateway } from './notifications.gateway';
import { WebSocketService } from './websocket.service';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { MessagePersistenceService } from './services/message-persistence.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN') || '7d';
        return {
          secret: configService.get<string>('JWT_SECRET') || 'dev-secret-change-in-production',
          signOptions: {
            expiresIn: expiresIn as any,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    NotificationsGateway,
    WebSocketService,
    WsJwtGuard,
    MessagePersistenceService,
  ],
  exports: [WebSocketService, MessagePersistenceService],
})
export class WebSocketModule {}
