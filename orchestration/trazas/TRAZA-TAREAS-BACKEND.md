# Trazas de Tareas - Backend

**Última actualización:** 2026-01-27 (TASK-022: Modelado Integral - Fixes Backend P1/P2)

> **NOTA ARCHIVO (2026-02-11):** Tareas anteriores a 2026 (BE-128 a BE-140, ~1,300 lineas)
> fueron archivadas en `_archive/TRAZA-TAREAS-BACKEND-HISTORICO.md`.
> Este archivo conserva las 8 tareas mas recientes (2026-01-14 a 2026-01-27).

---

## TASK-022: Modelado Integral - Fixes Backend P1/P2 ✅

**Estado:** COMPLETADA
**Prioridad:** P0
**Asignado:** CLAUDE-CODE (claude-opus-4-5-20251101)
**Fecha:** 2026-01-27
**Story Points:** 60 SP (tarea maestra)
**Tarea Padre:** TASK-022-MODELADO-INTEGRAL

### Resumen

Fixes de backend identificados durante auditoria integral del modelado de datos GAMILIT (9 areas). Incluye constantes DB_TABLES, entities faltantes, endpoints, types frontend, y reconciliacion de multiplicador con DB.

### Fixes Ejecutados

| ID | Fix | Commit | Descripcion |
|----|-----|--------|-------------|
| P1-1 | 10 entities → DB_TABLES constants | afe238f0 | Actualizar 10 entities con constantes centralizadas |
| P1-3 | 2 entities faltantes | dfd1ef5b | Crear content_tags y social_interactions entities |
| P1-5 | 24 endpoints en apiConfig.ts | 04b17062 | Agregar 24 endpoints faltantes a centralized apiConfig |
| P2-1 | 7 frontend type definitions | ef956e4b | Types para 7 TASK-021 entities + 2 P1-3 entities |
| P2-3 | Reconciliar multiplier con DB | 4c990dbb | ranks.service.ts lee xp_multiplier de DB (SSOT) |

### Archivos Modificados (P2-3 - ranks.service.ts)

| Archivo | Cambios |
|---------|---------|
| `modules/gamification/services/ranks.service.ts` | +MayaRankEntity import, +InjectRepository, +getMultiplierForRank() async |

### Metricas Post-TASK-022

- **Entities:** 137 (135 pre-existentes + 2 P1-3)
- **Endpoints:** 750+ (726 pre-existentes + 24 P1-5)
- **Build:** PASS (0 errors)
- **Lint:** 0 errors, 904 warnings
- **Coherencia DDL-Backend:** 100%

---

## TASK-021: Auditoría de Coherencia DDL-Entity - 7 Entities Nuevas ✅

**Estado:** COMPLETADA
**Prioridad:** P0
**Asignado:** CLAUDE-CODE (claude-opus-4-5-20251101)
**Fecha:** 2026-01-27
**Story Points:** 13 SP

### Resumen

Validación y corrección de coherencia DDL-Entity para alcanzar 100% de cobertura ORM. Se identificaron 7 tablas DDL sin entities TypeORM correspondientes y se crearon las entities con estructura exacta según DDL.

### Archivos Creados

| Archivo | Tipo | Schema DDL | Descripción |
|---------|------|------------|-------------|
| `modules/progress/entities/user-current-level.entity.ts` | Entity | progress_tracking | Nivel actual del usuario (PK: user_id) |
| `modules/progress/entities/user-difficulty-progress.entity.ts` | Entity | progress_tracking | Progreso por dificultad CEFR (PK compuesto) |
| `modules/progress/entities/module-completion-tracking.entity.ts` | Entity | progress_tracking | Seguimiento completitud módulos |
| `modules/educational/entities/content-metadata.entity.ts` | Entity | educational_content | Metadatos JSONB para contenido |
| `modules/educational/entities/module-dependencies.entity.ts` | Entity | educational_content | Prerrequisitos entre módulos |
| `modules/educational/entities/taxonomy.entity.ts` | Entity | educational_content | Taxonomías educativas (Bloom, etc.) |
| `modules/gamification/entities/comodin-usage-tracking.entity.ts` | Entity | gamification_system | Tracking uso comodines por intento |

### Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `modules/progress/entities/index.ts` | +3 exports (UserCurrentLevel, UserDifficultyProgress, ModuleCompletionTracking) |
| `modules/educational/entities/index.ts` | +3 exports (ContentMetadata, ModuleDependencies, Taxonomy) |
| `modules/gamification/entities/index.ts` | +1 export (ComodinUsageTracking) |

### Validaciones DDL Aplicadas

| Entity | Validación | Coherencia |
|--------|------------|------------|
| user-current-level | PrimaryColumn(user_id), varchar(50) types, indexes | 100% |
| user-difficulty-progress | Composite PK (user_id, difficulty_level) | 100% |
| module-completion-tracking | UNIQUE constraint, status enum | 100% |
| content-metadata | UNIQUE(content_type, content_id, metadata_key), JSONB | 100% |
| module-dependencies | dependency_type enum, minimum_completion_percentage | 100% |
| taxonomy | levels JSONB array, name UNIQUE | 100% |
| comodin-usage-tracking | UNIQUE(user_id, exercise_id, attempt_id), límites | 100% |

### Métricas

- **Entities antes:** 121
- **Entities después:** 128
- **Coherencia DDL-Entity:** 94.3% → 100%
- **Tablas cubiertas:** 141/141

### Impacto

- Entities: +7 (121 → 128)
- Index.ts exports: +7
- Build: PASS
- Lint: PASS (0 errores en entities nuevas)
- Tests: PASS

---

## GAP-BE-006: CRUD Completo de Roles Admin ✅

**Estado:** COMPLETADA
**Prioridad:** P2
**Asignado:** CLAUDE-CODE (claude-opus-4-5-20251101)
**Fecha:** 2026-01-25
**Tarea Padre:** TASK-2026-01-25-VALIDACION-INTEGRAL-GAMILIT

### Resumen

Implementación de endpoints faltantes para gestión completa de roles administrativos. Los endpoints GET existían, se agregaron POST (crear) y DELETE (eliminar) con protección de roles del sistema y audit logging.

### Archivos Creados

| Archivo | Tipo | Líneas | Descripción |
|---------|------|--------|-------------|
| `modules/admin/dto/roles/create-role.dto.ts` | DTOs | 124 | CreateRoleDto, CreateRoleResponseDto, DeleteRoleResponseDto |

### Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `modules/admin/dto/roles/index.ts` | +export create-role.dto |
| `modules/admin/services/admin-roles.service.ts` | +createRole(), +deleteRole(), +SYSTEM_ROLES |
| `modules/admin/controllers/admin-roles.controller.ts` | +POST /admin/roles, +DELETE /admin/roles/:id |

### Endpoints Implementados

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /admin/roles | Crear rol personalizado |
| DELETE | /admin/roles/:id | Eliminar (soft-delete) rol |

### Validaciones CreateRoleDto

| Campo | Validación |
|-------|------------|
| name | Required, 3-50 chars, /^[a-z][a-z0-9_]*$/ |
| description | Optional, max 500 chars |
| permissions | Optional, Record<string, boolean> |

### Roles del Sistema (Protegidos)

```typescript
const SYSTEM_ROLES = ['student', 'admin_teacher', 'super_admin'];
// Estos roles NO pueden ser eliminados
```

### Características

- **Soft-delete:** Roles se desactivan (is_active=false) en lugar de eliminarse
- **Audit logging:** Todas las operaciones se registran en audit log
- **Validación única:** Nombre de rol debe ser único
- **Protección:** Roles del sistema no pueden ser eliminados

### Impacto

- DTOs: +3 (337 → 340)
- Endpoints: +2 (627 → 629)
- Métodos servicio: +2 (createRole, deleteRole)

---

## TASK-019: US-PM-007 - Alert Configuration Service ✅

**Estado:** COMPLETADA
**Prioridad:** P1
**Asignado:** CLAUDE-CODE
**Fecha:** 2026-01-25
**Story Points:** 8 SP
**User Story:** US-PM-007

### Resumen

Implementación del backend para configuración de alertas de intervención personalizadas por maestro. Permite a los docentes ajustar umbrales y preferencias de notificación para 6 tipos de alertas.

### Archivos Creados

| Archivo | Tipo | Líneas | Descripción |
|---------|------|--------|-------------|
| `modules/progress/entities/teacher-alert-configuration.entity.ts` | Entity | 120 | TypeORM entity con 14 columnas |
| `modules/teacher/dto/alert-config.dto.ts` | DTOs | 150 | 6 DTOs: Create, Update, Query, Response, Defaults, List |
| `modules/teacher/services/alert-config.service.ts` | Service | 280 | CRUD + initializeDefaults + getDefaults |
| `modules/teacher/controllers/alert-config.controller.ts` | Controller | 200 | 7 endpoints REST |

### Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `shared/constants/database.constants.ts` | +1 constante TEACHER_ALERT_CONFIGURATIONS |
| `modules/progress/entities/index.ts` | Export TeacherAlertConfiguration |
| `modules/progress/progress.module.ts` | Registro entity en TypeOrmModule |
| `modules/teacher/teacher.module.ts` | Registro controller y service |
| `modules/teacher/services/index.ts` | Export AlertConfigService |
| `modules/teacher/dto/index.ts` | Export DTOs |

### Endpoints Implementados

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /teacher/alert-config | Listar configs del maestro |
| GET | /teacher/alert-config/defaults | Obtener defaults por tipo |
| GET | /teacher/alert-config/:id | Obtener config específica |
| POST | /teacher/alert-config | Crear nueva config |
| POST | /teacher/alert-config/initialize | Inicializar defaults |
| PUT | /teacher/alert-config/:id | Actualizar config |
| DELETE | /teacher/alert-config/:id | Eliminar config |

### Constantes de Defaults (ALERT_DEFAULTS)

```typescript
{
  NO_ACTIVITY: { threshold: 3, unit: 'days' },
  LOW_SCORE: { threshold: 60, unit: 'percentage' },
  DECLINING_TREND: { threshold: 10, unit: 'percentage' },
  REPEATED_FAILURES: { threshold: 3, unit: 'count' },
  EXCESSIVE_TIME: { threshold: 30, unit: 'minutes' },
  LOW_ENGAGEMENT: { threshold: 50, unit: 'percentage' }
}
```

### Guards Aplicados

- `JwtAuthGuard` - Autenticación requerida
- `RolesGuard` + `@Roles('teacher', 'admin_teacher')` - Solo maestros

### Impacto

- Entities: +1 (125 → 126)
- Services: +1 (105 → 106)
- Controllers: +1 (87 → 88)
- Endpoints: +7 (620 → 627)
- DTOs: +6 (331 → 337)

---

## TASK-012: Test Coverage Fixes - Gamification Module ✅

**Estado:** COMPLETADA
**Prioridad:** ALTA
**Asignado:** CLAUDE-CODE
**Fecha:** 2026-01-25
**Story Points:** 3 SP

### Resumen

Corrección de 45 tests fallidos en el módulo de gamification para mejorar cobertura de tests y estabilidad de CI/CD.

### Problema Identificado

Desalineación entre mocks de tests y código de producción:
- Controller tests usaban `req.user.sub` pero controllers usan `req.user.id`
- Service tests faltaba mock de método `query()` para getMayaRanks
- Missions tests tenían assertions incorrectas (userId vs profileId)
- MissionGenerator tenía provider incorrecto y método mockeado erróneo

### Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `admin/__tests__/admin-gamification-config-us-ae-005.controller.spec.ts` | `req.user.sub` → `req.user.id` (4x) |
| `admin/__tests__/gamification-config-us-ae-005.service.spec.ts` | +mock `query()`, +mockRanksQueryResult |
| `gamification/services/__tests__/missions.service.spec.ts` | Corregido assertions userId, método rank |
| `gamification/services/missions/__tests__/mission-generator.service.spec.ts` | +import, provider class, método correcto |

### Métricas

| Métrica | Antes | Después |
|---------|-------|---------|
| Tests fallidos | 45 | 0 |
| Tests pasados | 252 | 297 |
| Suites fallidas | 3 | 0 |
| Pass rate | 84% | 99.3% |

### Commits

- `9924eb27` - test(gamification): Fix failing tests and increase coverage
- `a7794926` - test(gamification): fix remaining failing test suites

---

## TASK-006: Implementar generación real de reportes PDF/Excel/CSV ✅

**Estado:** COMPLETADA
**Prioridad:** P0 CRÍTICO
**Asignado:** CLAUDE-CODE
**Fecha:** 2026-01-25
**Story Points:** 5 SP

### Resumen

Corrección del sistema de reportes administrativos que generaba archivos mock (texto plano) en lugar de archivos binarios reales. Los reportes PDF/Excel se descargaban corruptos.

### Problema Identificado

El método `generateMockReportContent()` en `admin-reports.service.ts` generaba texto plano que se guardaba con extensión PDF/XLSX pero contenía solo texto, causando que los visores lo marcaran como "archivo corrupto".

### Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `apps/backend/package.json` | +pdfkit, csv-stringify, @types/pdfkit |
| `modules/admin/services/admin-reports.service.ts` | +4 métodos: fetchReportData, generatePdfContent, generateExcelContent, generateCsvContent |
| `modules/admin/controllers/admin-reports.controller.ts` | StreamableFile + nuevo endpoint /info |

### Nuevos Métodos Implementados

| Método | Descripción |
|--------|-------------|
| `fetchReportData()` | Obtiene datos según tipo de reporte (users, system, etc.) |
| `generatePdfContent()` | Genera PDF con pdfkit (header, tabla, footer) |
| `generateExcelContent()` | Genera XLSX con exceljs (styled headers, auto-filter) |
| `generateCsvContent()` | Genera CSV con BOM para compatibilidad Excel |

### Endpoints Modificados

| Método | Ruta | Cambio |
|--------|------|--------|
| GET | /admin/reports/:id/download | Ahora devuelve StreamableFile con Content-Type correcto |
| GET | /admin/reports/:id/info | **NUEVO** - Metadata sin descargar archivo |

### Validación

| Check | Resultado |
|-------|-----------|
| TypeScript Build | ✅ Sin errores |
| ESLint | ✅ 0 errores |
| Commit + Push | ✅ Completado |

### Impacto

**Antes:**
- Reportes PDF/Excel: Corruptos (texto plano con extensión incorrecta)
- Descarga: Archivos no abrían en visores

**Después:**
- Reportes PDF: Generación real con pdfkit
- Reportes Excel: Generación real con exceljs (styled)
- Reportes CSV: Con BOM para Excel
- Streaming: Content-Type correcto

### Referencias

- Documentación: `orchestration/tareas/TASK-006-admin-reports-fix/`
- Commit: `646f767e`
- Epic: EXT-002 (Admin Extendido - Reports)

---

## TASK-001: Resolver 5 Gaps P0 Críticos en Student Portal ✅

**Estado:** COMPLETADA
**Prioridad:** P0 CRÍTICO
**Asignado:** CLAUDE-CODE
**Fecha:** 2026-01-24
**Story Points:** 21 SP

### Resumen

Implementación de 5 gaps de prioridad P0 identificados en el Student Portal de GAMILIT. Se implementaron funcionalidades críticas de autenticación, búsqueda de usuarios y notificaciones en tiempo real.

### Gaps Resueltos

| ID | Descripción | Esfuerzo |
|----|-------------|----------|
| P0-001 | 2FA Implementation (Full Stack) | 8 SP |
| P0-002 | Password Reset Validate | 2 SP |
| P0-003 | User Search | 3 SP |
| P0-004 | WebSocket Notifications | 5 SP |
| P0-005 | Email Verification UI | 3 SP |

### Archivos Creados

| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `modules/auth/entities/two-factor-token.entity.ts` | Entity | Entity para tokens 2FA con helpers |
| `modules/auth/services/two-factor-auth.service.ts` | Service | Lógica completa de 2FA (setup, verify, disable) |

### Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `modules/auth/controllers/password.controller.ts` | +endpoint GET /auth/reset-password/validate |
| `modules/auth/controllers/users.controller.ts` | +endpoint GET /users/search |
| `modules/auth/controllers/auth.controller.ts` | +6 endpoints de 2FA |
| `modules/auth/services/auth.service.ts` | +método searchUsers() |
| `modules/auth/services/index.ts` | Export TwoFactorAuthService |
| `modules/auth/entities/index.ts` | Export TwoFactorToken |
| `modules/auth/auth.module.ts` | Registro TwoFactorToken y TwoFactorAuthService |
| `shared/constants/database.constants.ts` | +TWO_FACTOR_TOKENS a DB_TABLES.AUTH |

### Endpoints Implementados

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /auth/reset-password/validate | Validar token de reset |
| GET | /users/search | Buscar usuarios |
| GET | /auth/2fa/status | Estado de 2FA del usuario |
| POST | /auth/2fa/setup | Iniciar configuración 2FA |
| POST | /auth/2fa/setup/verify | Completar configuración 2FA |
| POST | /auth/2fa/verify | Verificar código 2FA (login) |
| POST | /auth/2fa/disable | Deshabilitar 2FA |
| POST | /auth/2fa/resend | Reenviar código 2FA |

### Validación

| Check | Resultado |
|-------|-----------|
| TypeScript Build | ✅ Sin errores nuevos |
| Coherencia BD-Backend | ✅ Entity alineada con DDL |

### Impacto

**Antes:**
- 2FA: Completamente MOCK (código 123456)
- Password reset: Validación client-only
- User search: No existía
- WebSocket: No integrado en NotificationsPage

**Después:**
- 2FA: Implementación completa con OTP por email
- Password reset: Validación en backend
- User search: Búsqueda funcional en backend
- WebSocket: Integrado y funcional

### Referencias

- Documentación: `orchestration/tareas/TASK-001-fix-p0-gaps/`
- Commit: `430e2792`
- DDL: `apps/database/ddl/schemas/auth_management/tables/13-two_factor_tokens.sql`

---

## BE-ALIGN-2026-01-14: Alineación BD ↔ Backend (16 Entities) ✅

**Estado:** COMPLETADA
**Prioridad:** P1 ALTA
**Asignado:** Meta-Orquestador SIMCO
**Fecha:** 2026-01-14
**Ciclo:** CAPVED Completo
**Schemas:** audit_logging, auth_management, content_management, educational_content, lti_integration

### Resumen

Implementación de 16 entities faltantes para alinear el backend con las tablas de base de datos existentes. La cobertura BD-Backend pasó de 87.3% a 99%.

### Entities Creadas

| Schema | Entity | Tabla BD | Propósito |
|--------|--------|----------|-----------|
| audit_logging | `UserActivityLog` | user_activity_logs | Analytics de actividad de usuarios |
| audit_logging | `PendingUserInitialization` | pending_user_initialization | Control de inicialización fallida |
| auth_management | `ParentAccount` | parent_accounts | Portal de padres (EXT-010) |
| auth_management | `ParentStudentLink` | parent_student_links | Vinculación padre-estudiante |
| auth_management | `ParentNotification` | parent_notifications | Notificaciones a padres |
| content_management | `ContentVersion` | content_versions | Versionado de contenido |
| content_management | `FlaggedContent` | flagged_content | Moderación de contenido |
| content_management | `MediaMetadata` | media_metadata | Metadatos multimedia |
| content_management | `Tag` | tags | Etiquetas de contenido |
| content_management | `ModerationRule` | moderation_rules | Reglas de moderación automática |
| educational_content | `ExerciseValidationConfig` | exercise_validation_config | Sistema Dual ADR-008 |
| educational_content | `ExerciseTypeRubric` | exercise_type_rubrics | Rúbricas por tipo M4-M5 |
| educational_content | `ExerciseValidationAudit` | exercise_validation_audit | Auditoría de validaciones |
| lti_integration | `LtiConsumer` | lti_consumers | Consumidores LTI |
| lti_integration | `LtiSession` | lti_sessions | Sesiones LTI |
| lti_integration | `LtiGradePassback` | lti_grade_passback | Passback de calificaciones |

### Archivos Creados

```
modules/audit/entities/
├── user-activity-log.entity.ts
├── pending-user-initialization.entity.ts
└── index.ts (actualizado)

modules/auth/entities/
├── parent-account.entity.ts
├── parent-student-link.entity.ts
├── parent-notification.entity.ts
└── index.ts (actualizado)

modules/content/entities/
├── content-version.entity.ts
├── flagged-content.entity.ts
├── media-metadata.entity.ts
├── tag.entity.ts
├── moderation-rule.entity.ts
└── index.ts (actualizado)

modules/educational/entities/
├── exercise-validation-config.entity.ts
├── exercise-type-rubric.entity.ts
├── exercise-validation-audit.entity.ts
└── index.ts (actualizado)

modules/lti/ (NUEVO módulo)
├── entities/
│   ├── lti-consumer.entity.ts
│   ├── lti-session.entity.ts
│   ├── lti-grade-passback.entity.ts
│   └── index.ts
└── lti.module.ts
```

### Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `shared/constants/database.constants.ts` | +6 constantes de tablas |
| `modules/audit/audit.module.ts` | +2 entities en TypeORM |
| `modules/auth/auth.module.ts` | +3 entities en TypeORM |
| `modules/content/content.module.ts` | +5 entities en TypeORM |
| `modules/educational/educational.module.ts` | +3 entities en TypeORM |

### Validación

| Check | Resultado |
|-------|-----------|
| Build (`npm run build`) | ✅ PASSED |
| Lint (`npm run lint`) | ⚠️ 9 errores preexistentes (no en código nuevo) |
| Coherencia BD | 99% (129/134 tablas con entity) |

### Impacto

**Antes:**
- Cobertura BD-Backend: 87.3%
- Entities totales: 113
- Módulos: 17

**Después:**
- Cobertura BD-Backend: 99%
- Entities totales: 129 (+16)
- Módulos: 18 (+1 LTI)

### Próximos Pasos

1. **Servicios:** Implementar services para las nuevas entities cuando se activen los Epics correspondientes
2. **LTI:** Completar implementación del módulo LTI (EXT-007)
3. **Parent Portal:** Implementar controllers/services para Portal de Padres (EXT-010)

---

## TASK-DB125-TEACHER-FIX: Fix DB-125 Convention in Teacher Services ✅

**Estado:** COMPLETADA
**Prioridad:** P0
**Asignado:** Claude Opus 4.6
**Fecha:** 2026-03-01

### Resumen
Corrección de 4 instancias donde servicios del módulo teacher confundían `user_id` (auth.users.id) con `profile.id` (profiles.id). La convención DB-125 establece que `req.user.id = profiles.id` (JWT sub = profiles.id), pero `exercise-responses.service.ts` y `teacher-classrooms-crud.service.ts` trataban ese valor como `auth.users.id`, causando 404 en `/teacher/classrooms` y 500 en `/teacher/attempts`.

### Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `apps/backend/src/modules/teacher/services/exercise-responses.service.ts` | `getTeacherProfile()`: dual-lookup DB-125 (id first, user_id fallback). Catch block: re-throw typed HTTP exceptions. |
| `apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts` | `getClassrooms()`: profileRepo en vez de userRepo. `createClassroom()`: single lookup sin redundancia. `getClassroomTeachers()`: lookup por profiles.id, derivar userIds. JSDoc fix. |

### Validaciones Aplicadas

| Aspecto | Resultado |
|---------|-----------|
| Build (tsc) | PASS |
| PM2 restart | PASS (online, fork mode) |
| Health check | PASS (DB healthy, Redis degraded — expected) |
| HTTPS Nginx | PASS |
| Patrón DB-125 | Consistente con teacher-content.service.ts (referencia) |

### Métricas

- **Archivos modificados:** 2
- **Bugs corregidos:** 4 instancias
- **Build:** PASS
- **Deploy:** PM2 restart exitoso en producción

---


*Archivado: 2026-02-11 | Tareas anteriores en `_archive/TRAZA-TAREAS-BACKEND-HISTORICO.md`*
