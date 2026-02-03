# EXT-007: LTI Integration - Implementation Checklist

**Version:** 1.0
**Fecha:** 2026-01-27
**Estado:** 40% Completo
**Metodologia:** CAPVED

---

## Resumen Ejecutivo

| Metrica | Valor |
|---------|-------|
| **Progreso Total** | 40% |
| **Horas Implementadas** | ~48h |
| **Horas Restantes** | ~72h |
| **Backend Completitud** | 65% |
| **Frontend Completitud** | 15% |
| **Testing Completitud** | 20% |
| **Documentation** | 60% |

---

## Componentes Implementados (40%)

### Backend - Entities (100% Completo)

| Archivo | Ubicacion | Estado |
|---------|-----------|--------|
| LtiConsumer | `apps/backend/src/modules/lti/entities/lti-consumer.entity.ts` | COMPLETO |
| LtiSession | `apps/backend/src/modules/lti/entities/lti-session.entity.ts` | COMPLETO |
| LtiGradePassback | `apps/backend/src/modules/lti/entities/lti-grade-passback.entity.ts` | COMPLETO |
| Index | `apps/backend/src/modules/lti/entities/index.ts` | COMPLETO |

### Backend - Services (100% Completo)

| Archivo | Ubicacion | Estado |
|---------|-----------|--------|
| LtiConsumersService | `apps/backend/src/modules/lti/services/lti-consumers.service.ts` | COMPLETO |
| LtiSessionsService | `apps/backend/src/modules/lti/services/lti-sessions.service.ts` | COMPLETO |
| LtiGradePassbacksService | `apps/backend/src/modules/lti/services/lti-grade-passbacks.service.ts` | COMPLETO |
| Index | `apps/backend/src/modules/lti/services/index.ts` | COMPLETO |

### Backend - Controllers (100% Completo)

| Archivo | Ubicacion | Estado |
|---------|-----------|--------|
| LtiConsumersController | `apps/backend/src/modules/lti/controllers/lti-consumers.controller.ts` | COMPLETO |
| LtiSessionsController | `apps/backend/src/modules/lti/controllers/lti-sessions.controller.ts` | COMPLETO |
| LtiGradePassbacksController | `apps/backend/src/modules/lti/controllers/lti-grade-passbacks.controller.ts` | COMPLETO |
| Index | `apps/backend/src/modules/lti/controllers/index.ts` | COMPLETO |

### Backend - DTOs (100% Completo)

| Archivo | Ubicacion | Estado |
|---------|-----------|--------|
| CreateLtiConsumerDto | `apps/backend/src/modules/lti/dto/create-lti-consumer.dto.ts` | COMPLETO |
| UpdateLtiConsumerDto | `apps/backend/src/modules/lti/dto/update-lti-consumer.dto.ts` | COMPLETO |
| LtiConsumerResponseDto | `apps/backend/src/modules/lti/dto/lti-consumer-response.dto.ts` | COMPLETO |
| CreateLtiSessionDto | `apps/backend/src/modules/lti/dto/create-lti-session.dto.ts` | COMPLETO |
| LtiSessionResponseDto | `apps/backend/src/modules/lti/dto/lti-session-response.dto.ts` | COMPLETO |
| CreateLtiGradePassbackDto | `apps/backend/src/modules/lti/dto/create-lti-grade-passback.dto.ts` | COMPLETO |
| UpdateLtiGradePassbackDto | `apps/backend/src/modules/lti/dto/update-lti-grade-passback.dto.ts` | COMPLETO |
| LtiGradePassbackResponseDto | `apps/backend/src/modules/lti/dto/lti-grade-passback-response.dto.ts` | COMPLETO |
| Index | `apps/backend/src/modules/lti/dto/index.ts` | COMPLETO |

### Backend - Module (100% Completo)

| Archivo | Ubicacion | Estado |
|---------|-----------|--------|
| LtiModule | `apps/backend/src/modules/lti/lti.module.ts` | COMPLETO |

### Frontend - API Client (100% Completo)

| Archivo | Ubicacion | Estado |
|---------|-----------|--------|
| ltiAPI | `apps/frontend/src/services/api/ltiAPI.ts` | COMPLETO |

### Tests - Entity Tests (100% Completo)

| Archivo | Ubicacion | Estado |
|---------|-----------|--------|
| lti-entities.spec.ts | `apps/backend/src/modules/lti/__tests__/lti-entities.spec.ts` | COMPLETO |

---

## Componentes Faltantes (60%)

### Backend - Servicios Adicionales

| Componente | Descripcion | Horas | Prioridad |
|------------|-------------|-------|-----------|
| LtiOidcService | OIDC login flow handler | 8h | P0 |
| LtiJwtService | JWT validation y signing | 4h | P0 |
| LtiAgsService | AGS score submission a LMS | 8h | P1 |
| LtiDeepLinkingService | Deep linking handler | 6h | P1 |
| LtiKeyManagementService | RSA key generation/storage | 4h | P1 |
| LtiConnectionTestService | Test connection a LMS | 3h | P2 |
| LtiNrpsService | Names and Role Provisioning | 6h | P2 |

### Backend - Controllers Adicionales

| Componente | Descripcion | Horas | Prioridad |
|------------|-------------|-------|-----------|
| LtiOidcController | `/lti/login`, `/lti/callback` | 4h | P0 |
| LtiDeepLinkingController | `/lti/deep-linking/*` | 4h | P1 |
| LtiLaunchController | `/lti/launch` | 2h | P0 |

### Backend - Queue Processors

| Componente | Descripcion | Horas | Prioridad |
|------------|-------------|-------|-----------|
| GradePassbackProcessor | BullMQ processor para AGS | 4h | P1 |
| SessionCleanupProcessor | Cleanup de sesiones expiradas | 2h | P2 |

### Frontend - Pages

| Componente | Descripcion | Horas | Prioridad |
|------------|-------------|-------|-----------|
| LtiConsumersPage | Admin list/management | 4h | P1 |
| LtiConsumerFormPage | Create/edit consumer | 4h | P1 |
| LtiLoadingPage | Loading durante OIDC | 1h | P0 |
| LtiErrorPage | Error handling LTI | 1h | P0 |
| ContentPickerPage | Deep linking selection | 8h | P1 |

### Frontend - Components

| Componente | Descripcion | Horas | Prioridad |
|------------|-------------|-------|-----------|
| LtiConsumerTable | Tabla de consumers | 2h | P1 |
| LtiConsumerForm | Formulario CRUD | 3h | P1 |
| LtiStatusBadge | Badge active/verified | 0.5h | P2 |
| LtiConnectionTester | Test modal | 2h | P2 |
| LtiJwkModal | Display JWK publico | 1h | P2 |
| ModuleBrowser | Navegador de modulos | 3h | P1 |
| ExerciseGrid | Grid de ejercicios | 3h | P1 |
| GradePassbackDashboard | Admin view passbacks | 4h | P2 |

### Testing

| Componente | Descripcion | Horas | Prioridad |
|------------|-------------|-------|-----------|
| Service unit tests | Jest tests para services | 8h | P1 |
| Controller tests | Supertest integration | 4h | P1 |
| E2E tests | Cypress flows | 12h | P2 |
| LMS mock server | Mock Canvas/Moodle | 6h | P1 |
| Load tests | K6 scripts | 4h | P3 |

---

## Subtareas con Metodologia CAPVED

### FASE 1: OIDC Login Flow (P0) - 20h Total

#### C - Contextualizar (2h)
- [ ] Revisar IMS Security Framework specification
- [ ] Analizar flujo actual de autenticacion en GAMILIT
- [ ] Identificar puntos de integracion con auth existente

#### A - Analizar (4h)
- [ ] Disenar flow OIDC completo (sequence diagram)
- [ ] Definir estructura de state/nonce en Redis
- [ ] Mapear claims LTI a user creation

#### P - Planificar (2h)
- [ ] Crear tareas atomicas (<50 lineas cada una)
- [ ] Establecer orden de implementacion
- [ ] Identificar dependencias con otros modulos

#### V - Validar Plan (1h)
- [ ] Review con Tech Lead
- [ ] Verificar seguridad con Security Engineer
- [ ] Confirmar compatibilidad con Canvas/Moodle

#### E - Ejecutar (10h)
- [ ] Implementar LtiOidcService (4h)
- [ ] Implementar LtiJwtService (2h)
- [ ] Implementar LtiOidcController (2h)
- [ ] Implementar LtiLaunchController (1h)
- [ ] Frontend: LtiLoadingPage y LtiErrorPage (1h)

#### D - Documentar (1h)
- [ ] Actualizar ET documentation
- [ ] Swagger annotations completas
- [ ] Actualizar README con setup instructions

---

### FASE 2: Grade Passback (P1) - 16h Total

#### C - Contextualizar (1h)
- [ ] Revisar AGS 2.0 specification
- [ ] Analizar exercise completion flow actual

#### A - Analizar (2h)
- [ ] Disenar flujo de passback asincrono
- [ ] Definir estrategia de retry
- [ ] Mapear scoring GAMILIT a AGS

#### P - Planificar (1h)
- [ ] Crear tareas atomicas
- [ ] Definir queue configuration

#### V - Validar Plan (0.5h)
- [ ] Review tecnico

#### E - Ejecutar (10h)
- [ ] Implementar LtiAgsService (6h)
- [ ] Implementar GradePassbackProcessor (2h)
- [ ] Implementar trigger en exercise completion (1h)
- [ ] Frontend: GradePassbackDashboard (1h)

#### D - Documentar (1.5h)
- [ ] Actualizar ET-LTI-001
- [ ] Documentar retry logic

---

### FASE 3: Deep Linking (P1) - 20h Total

#### C - Contextualizar (1h)
- [ ] Revisar Deep Linking 2.0 spec
- [ ] Analizar content structure existente

#### A - Analizar (2h)
- [ ] Disenar content picker UX
- [ ] Definir JWT response structure

#### P - Planificar (1h)
- [ ] Crear tareas atomicas

#### V - Validar Plan (0.5h)
- [ ] Review UX

#### E - Ejecutar (14h)
- [ ] Implementar LtiDeepLinkingService (4h)
- [ ] Implementar LtiDeepLinkingController (2h)
- [ ] Frontend: ContentPickerPage (4h)
- [ ] Frontend: ModuleBrowser + ExerciseGrid (4h)

#### D - Documentar (1.5h)
- [ ] Actualizar ET-LTI-002

---

### FASE 4: Consumer Management UI (P1) - 16h Total

#### C - Contextualizar (0.5h)
- [ ] Revisar UI de admin existente

#### A - Analizar (1h)
- [ ] Disenar wireframes

#### P - Planificar (0.5h)
- [ ] Crear tareas atomicas

#### V - Validar Plan (0.5h)
- [ ] Review UX

#### E - Ejecutar (12h)
- [ ] Implementar LtiKeyManagementService (2h)
- [ ] Implementar LtiConnectionTestService (2h)
- [ ] Frontend: LtiConsumersPage (3h)
- [ ] Frontend: LtiConsumerForm (3h)
- [ ] Frontend: LtiConnectionTester + JwkModal (2h)

#### D - Documentar (1.5h)
- [ ] Actualizar ET-LTI-003

---

### FASE 5: Testing y Validacion (P2) - 20h Total

#### E - Ejecutar (18h)
- [ ] Service unit tests (6h)
- [ ] Controller integration tests (4h)
- [ ] LMS mock server (4h)
- [ ] E2E tests basicos (4h)

#### D - Documentar (2h)
- [ ] Actualizar ET-LTI-004
- [ ] Documentar test setup

---

## LMS Compatibility Matrix

### Canvas

| Feature | Status | Notes |
|---------|--------|-------|
| OIDC Login | Pendiente | Alta prioridad |
| Deep Linking 2.0 | Pendiente | |
| AGS (Grades) | Pendiente | |
| NRPS | Pendiente | Baja prioridad |

**Configuracion Requerida:**
- Developer Key en Canvas admin
- LTI 1.3 configuration
- Public key exchange

**Testing:**
- Canvas Free for Teachers
- Canvas Beta environment

### Moodle

| Feature | Status | Notes |
|---------|--------|-------|
| OIDC Login | Pendiente | |
| Deep Linking 2.0 | Pendiente | |
| AGS (Grades) | Pendiente | |
| NRPS | Pendiente | |

**Configuracion Requerida:**
- External Tool registration
- LTI 1.3 plugin enabled
- Tool configuration URL

**Testing:**
- Moodle Sandbox (sandbox.moodledemo.net)
- Local Docker instance

### Blackboard

| Feature | Status | Notes |
|---------|--------|-------|
| OIDC Login | Pendiente | |
| Deep Linking 2.0 | Pendiente | |
| AGS (Grades) | Pendiente | Partial support |
| NRPS | Pendiente | Limited |

**Configuracion Requerida:**
- REST API application
- LTI 1.3 placement

**Testing:**
- Blackboard Developer Portal
- AWS AMI sandbox

### Google Classroom

| Feature | Status | Notes |
|---------|--------|-------|
| OIDC Login | No aplica | Usa Google SSO |
| Assignments API | Pendiente | Custom integration |
| Grades Sync | Pendiente | Via Classroom API |

**Nota:** Google Classroom no soporta LTI 1.3 completo. Requiere integracion custom via Google APIs.

---

## Estimacion Total

| Fase | Horas | Prioridad | Sprint |
|------|-------|-----------|--------|
| OIDC Login Flow | 20h | P0 | S1 |
| Grade Passback | 16h | P1 | S1-S2 |
| Deep Linking | 20h | P1 | S2 |
| Consumer Management UI | 16h | P1 | S2 |
| Testing y Validacion | 20h | P2 | S3 |
| **TOTAL** | **92h** | | |

### Distribucion por Sprint (40h/sprint)

**Sprint 1 (S1):** OIDC Login + Grade Passback inicio
- OIDC Login Flow completo (20h)
- Grade Passback backend (12h)
- Buffer (8h)

**Sprint 2 (S2):** Grade Passback + Deep Linking + Consumer UI
- Grade Passback frontend (4h)
- Deep Linking (20h)
- Consumer Management UI inicio (12h)
- Buffer (4h)

**Sprint 3 (S3):** Consumer UI + Testing
- Consumer Management UI final (4h)
- Testing y Validacion (20h)
- E2E integration tests (12h)
- Buffer (4h)

---

## Criterios de Completitud (Definition of Done)

### Por Feature
- [ ] Codigo implementado y revisado
- [ ] Unit tests >80% coverage
- [ ] Integration test passing
- [ ] Swagger documentation completa
- [ ] Manual testing con Canvas sandbox
- [ ] ET documentation actualizada

### Para Epic Completo (100%)
- [ ] Todas las features implementadas
- [ ] E2E tests pasando
- [ ] IMS Validator certification
- [ ] Performance benchmarks cumplidos
- [ ] Security review aprobado
- [ ] Documentation completa

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| Incompatibilidad LMS | Media | Alto | Testing temprano con sandboxes |
| JWT validation issues | Baja | Alto | Seguir spec estrictamente |
| Performance en grade passback | Media | Medio | Queue asincrono con retry |
| Seguridad OIDC | Baja | Critico | Security review, IMS Validator |
| UX content picker | Media | Medio | Wireframes, user testing |

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-27 | Architecture Analyst | Creacion inicial |

---

*Documento: IMPLEMENTATION-CHECKLIST.md*
*Generado: 2026-01-27*
*Epic: EXT-007 - LTI Integration*
