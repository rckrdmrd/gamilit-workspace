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
 *
 * @controllers
 * - LtiConsumersController: 9 endpoints para gestión de consumers
 * - LtiSessionsController: 10 endpoints para gestión de sesiones
 * - LtiGradePassbacksController: 11 endpoints para grade passbacks
 *
 * @totalEndpoints 30 endpoints RESTful con documentación Swagger completa
 *
 * @see Epic: EXT-007 (LTI Integration)
 * @see Standard: https://www.imsglobal.org/spec/lti/v1p3/
 * @created 2026-01-14 - Alineación BD-Backend
 * @updated 2026-01-16 - Implementación completa de services y controllers
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

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
 * Implementa gestión de consumers, sesiones y grade passbacks.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature(
      [LtiConsumer, LtiSession, LtiGradePassback],
      'lti', // Conexión dedicada para schema lti_integration
    ),
  ],
  providers: [
    services.LtiConsumersService,
    services.LtiSessionsService,
    services.LtiGradePassbacksService,
  ],
  controllers: [
    controllers.LtiConsumersController,
    controllers.LtiSessionsController,
    controllers.LtiGradePassbacksController,
  ],
  exports: [
    TypeOrmModule,
    services.LtiConsumersService,
    services.LtiSessionsService,
    services.LtiGradePassbacksService,
  ],
})
export class LtiModule {}
