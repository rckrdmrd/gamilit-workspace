/**
 * Audit Module
 *
 * Provides audit logging capabilities for compliance and security
 *
 * @updated 2026-01-14 - Agregadas entities UserActivityLog, PendingUserInitialization
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog, UserActivityLog, PendingUserInitialization } from './entities';
import { AuditService } from './services/audit.service';
import { AuditInterceptor } from './interceptors/audit.interceptor';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        AuditLog,
        UserActivityLog, // ✨ NUEVO - 2026-01-14 (Analytics de actividad)
        PendingUserInitialization, // ✨ NUEVO - 2026-01-14 (Control de inicialización)
      ],
      'audit',
    ), // Use audit connection
  ],
  providers: [AuditService, AuditInterceptor],
  exports: [AuditService, AuditInterceptor, TypeOrmModule],
})
export class AuditModule {}
