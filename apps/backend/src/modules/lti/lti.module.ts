/**
 * LTI Integration Module
 *
 * @description Módulo de integración LTI 1.3 para conexión con LMS externos.
 *              Implementa Learning Tools Interoperability según estándar IMS Global.
 *
 * @features
 * - OAuth 2.0 + OIDC Authentication
 * - Deep Linking (selección de contenido)
 * - NRPS (Names and Role Provisioning Services)
 * - AGS (Assignment and Grade Services - passback de calificaciones)
 *
 * @entities
 * - LtiConsumer: Configuración de LMS externos (Canvas, Moodle, Blackboard)
 * - LtiSession: Sesiones LTI activas (tracking de launches)
 * - LtiGradePassback: Envío de calificaciones vía AGS
 *
 * @services
 * - LtiConsumersService: Gestión de configuración de LMS
 * - LtiSessionsService: Gestión de sesiones LTI
 * - LtiGradePassbacksService: Gestión de envío de calificaciones
 * - OidcLoginService: Gestión del flujo OIDC de autenticación
 * - DeepLinkingService: Gestión de deep linking para selección de contenido
 *
 * @controllers
 * - LtiConsumersController: 9 endpoints para gestión de consumers
 * - LtiSessionsController: 10 endpoints para gestión de sesiones
 * - LtiGradePassbacksController: 11 endpoints para grade passbacks
 * - OidcController: 4 endpoints para flujo OIDC
 * - DeepLinkingController: 6 endpoints para deep linking
 *
 * @totalEndpoints 40 endpoints RESTful con documentación Swagger completa
 *
 * @see Epic: EXT-007 (LTI Integration)
 * @see Standard: https://www.imsglobal.org/spec/lti/v1p3/
 * @created 2026-01-14 - Alineación BD-Backend
 * @updated 2026-01-16 - Implementación completa de services y controllers
 * @updated 2026-01-27 - Añadido OIDC login flow y Deep Linking
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Entities
import { LtiConsumer, LtiSession, LtiGradePassback } from './entities';

// Services
import * as services from './services';

// Controllers
import * as controllers from './controllers';

/**
 * LtiModule
 *
 * Módulo completo para integración LTI 1.3.
 * Implementa gestión de consumers, sesiones, OIDC login y deep linking.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature(
      [LtiConsumer, LtiSession, LtiGradePassback],
      'lti', // Conexión dedicada para schema lti_integration
    ),
    // JWT for signing LTI responses
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'dev-secret-change-in-production',
        signOptions: {
          expiresIn: (configService.get<string>('LTI_TOKEN_EXPIRES_IN') || '1h') as any,
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
  providers: [
    // Base services
    services.LtiConsumersService,
    services.LtiSessionsService,
    services.LtiGradePassbacksService,
    // OIDC and Deep Linking services
    services.OidcLoginService,
    services.DeepLinkingService,
  ],
  controllers: [
    // Base controllers
    controllers.LtiConsumersController,
    controllers.LtiSessionsController,
    controllers.LtiGradePassbacksController,
    // OIDC and Deep Linking controllers
    controllers.OidcController,
    controllers.DeepLinkingController,
  ],
  exports: [
    TypeOrmModule,
    // Base services
    services.LtiConsumersService,
    services.LtiSessionsService,
    services.LtiGradePassbacksService,
    // OIDC and Deep Linking services
    services.OidcLoginService,
    services.DeepLinkingService,
  ],
})
export class LtiModule {}
