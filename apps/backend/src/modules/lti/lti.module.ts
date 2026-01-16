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
 * @see Epic: EXT-007 (LTI Integration)
 * @see Standard: https://www.imsglobal.org/spec/lti/v1p3/
 * @created 2026-01-14 - Alineación BD-Backend
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { LtiConsumer, LtiSession, LtiGradePassback } from './entities';

/**
 * LtiModule
 *
 * Módulo base para integración LTI.
 * Actualmente solo registra entities - servicios y controllers
 * serán implementados cuando se active el Epic EXT-007.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature(
      [LtiConsumer, LtiSession, LtiGradePassback],
      'lti', // Conexión dedicada para schema lti_integration
    ),
  ],
  providers: [],
  controllers: [],
  exports: [TypeOrmModule],
})
export class LtiModule {}
