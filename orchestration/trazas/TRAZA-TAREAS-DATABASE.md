# Traza de Tareas: ATLAS-DATABASE

**Última actualización:** 2026-01-27 (5 Tareas P2 completadas - BD Analysis)
**Estado:** ✅ PRODUCTION READY - Validación integral completada

---

## 📋 Tareas Actuales (2026)

### ✅ TASK-P2-RLS-EXPANSION-2026-01-27: RLS Fase 2 - COMPLETADO

**Fecha:** 2026-01-27
**Agente:** CLAUDE-CODE (Opus 4.5)
**Prioridad:** P2
**Story Points:** 13 SP
**Gap:** RLS-P1-001

**Objetivo:**
Expandir cobertura de Row Level Security de 25 tablas (Fase 1) a 59 tablas (Fase 2).

**Archivo DDL Creado:**
`apps/database/ddl/07b-enable-rls-phase2.sql`

**Tablas con RLS Habilitado (34 nuevas):**
- gamification_system: 8 tablas (user_stats, user_achievements, ml_coins_transactions, comodines_inventory, user_ranks, comodin_usage_log, comodin_usage_tracking, classroom_missions)
- notifications: 4 tablas (notifications, notification_preferences, notification_logs, user_devices)
- communication: 1 tabla (messages)
- progress_tracking: 8 tablas (learning_sessions, exercise_attempts, exercise_submissions, scheduled_missions, user_difficulty_progress, module_progress, teacher_notes, certificates)
- social_features: 6 tablas (classroom_members, team_members, friendships, team_challenges, social_interactions, classrooms)
- audit_logging: 2 tablas (audit_logs, user_activity_logs)
- auth_management: 4 tablas (user_preferences, user_sessions, security_events, email_verification_tokens)
- admin_dashboard: 1 tabla (bulk_operations)

**Métricas:**
- Tablas Fase 1: 25
- Tablas Fase 2: 34
- Total RLS: 59 (~41% cobertura)

---

### ✅ TASK-P2-SEEDS-COMODINES-2026-01-27: Seeds Comodines - COMPLETADO

**Fecha:** 2026-01-27
**Agente:** CLAUDE-CODE (Opus 4.5)
**Prioridad:** P2
**Story Points:** 3 SP
**Gap:** SEED-P2-001

**Objetivo:**
Crear seeds para tabla gamification_system.comodines_inventory con datos de prueba.

**Archivos Seeds Creados:**
- `apps/database/seeds/dev/gamification_system/09-comodines_inventory.sql`
- `apps/database/seeds/prod/gamification_system/09-comodines_inventory.sql`

---

### ✅ TASK-P2-SEEDS-COMMUNICATION-2026-01-27: Seeds Communication - COMPLETADO

**Fecha:** 2026-01-27
**Agente:** CLAUDE-CODE (Opus 4.5)
**Prioridad:** P2
**Story Points:** 3 SP
**Gap:** SEED-P2-002

**Objetivo:**
Crear seeds para sistema de mensajería (messages + message_participants).

**Archivos Seeds Creados/Modificados:**
- `apps/database/seeds/dev/communication/01-messages.sql`
- `apps/database/seeds/dev/communication/02-message_participants.sql`

**Nota:** Schema usa messages+message_participants (NO tabla conversations).

---

### ✅ TASK-P2-SEEDS-PEDAGOGY-2026-01-27: Seeds Pedagógicos - COMPLETADO

**Fecha:** 2026-01-27
**Agente:** CLAUDE-CODE (Opus 4.5)
**Prioridad:** P2
**Story Points:** 8 SP
**Gap:** SEED-P2-003

**Objetivo:**
Poblar campos pedagógicos (objective, how_to_solve, recommended_strategy, pedagogical_notes) en seeds de ejercicios M4 y M5.

**Archivos Seeds Modificados:**
- `apps/database/seeds/dev/educational_content/05-exercises-module4.sql` (5 ejercicios)
- `apps/database/seeds/dev/educational_content/06-exercises-module5.sql` (3 ejercicios)

**Hallazgo:** M1-M3 ya tenían campos pedagógicos completos.

---

### ✅ TASK-P2-ROLES-CONSOLIDATION-2026-01-27: Análisis Roles - COMPLETADO

**Fecha:** 2026-01-27
**Agente:** CLAUDE-CODE (Opus 4.5)
**Prioridad:** P2
**Story Points:** 5 SP
**Gap:** ARCH-P2-001
**Tipo:** ANALYSIS (sin cambios de código)

**Objetivo:**
Analizar coexistencia de sistema ENUM (gamilit_role) vs RBAC tables y recomendar consolidación.

**Hallazgo Principal:**
El sistema YA es híbrido funcional - user_roles usa el ENUM para la columna role.

**Documentos Creados:**
- `orchestration/tareas/TASK-P2-ROLES-CONSOLIDATION-2026-01-27/ROLES-SYSTEM-ANALYSIS.md`
- `docs/97-adr/ADR-028-roles-system-hybrid-design.md`

**Recomendación:** Mantener sistema híbrido actual (by design).

---

### ✅ TASK-019: Tabla teacher_alert_configurations para US-PM-007 - COMPLETADO

**Fecha:** 2026-01-25
**Agente:** CLAUDE-CODE
**Prioridad:** P1
**Story Points:** 8 SP (incluye Backend + Frontend)
**User Story:** US-PM-007

**Objetivo:**
Crear tabla para almacenar configuraciones de alertas personalizadas por maestro, permitiendo ajustar umbrales y preferencias de notificación para 6 tipos de alertas de intervención.

**Archivo DDL Creado:**
`apps/database/ddl/schemas/progress_tracking/tables/20-teacher_alert_configurations.sql`

**Estructura de la Tabla:**

```sql
CREATE TABLE progress_tracking.teacher_alert_configurations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id uuid NOT NULL REFERENCES auth_management.profiles(id),
    classroom_id uuid REFERENCES social_features.classrooms(id),
    alert_type text NOT NULL,  -- CHECK constraint con 6 tipos
    is_enabled boolean DEFAULT true,
    threshold_value numeric(5,2),
    threshold_unit text,  -- 'percentage', 'days', 'count', 'minutes'
    notify_email boolean DEFAULT false,
    notify_in_app boolean DEFAULT true,
    cooldown_hours integer DEFAULT 24,
    custom_settings jsonb DEFAULT '{}',
    tenant_id uuid NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(teacher_id, classroom_id, alert_type)
);
```

**Tipos de Alerta Soportados:**
- `no_activity` - Sin actividad por X días
- `low_score` - Puntaje bajo (< X%)
- `declining_trend` - Tendencia de declive (> X%)
- `repeated_failures` - Fallos repetidos (> X veces)
- `excessive_time` - Tiempo excesivo (> X minutos)
- `low_engagement` - Bajo engagement (< X%)

**Políticas RLS (2):**
1. `teacher_manage_own_config` - Maestros gestionan sus propias configs
2. `admin_manage_tenant_config` - Admins gestionan configs del tenant

**Índices Creados:**
- `idx_teacher_alert_config_teacher` (teacher_id)
- `idx_teacher_alert_config_classroom` (classroom_id)
- `idx_teacher_alert_config_type` (alert_type)

**Backend Entity:** `teacher-alert-configuration.entity.ts`
**Backend Service:** `alert-config.service.ts`
**Frontend API:** `alertConfigApi.ts`
**Frontend Page:** `TeacherAlertConfigPage.tsx`

**Para Aplicar:**
```bash
wsl -d Ubuntu-24.04 -u developer -- bash '/mnt/c/Empresas/ISEM/workspace-v2/scripts/database/unified-recreate-db.sh' gamilit --drop
```

---

### ✅ TASK-010: Fix RLS Policies para teacher_content - COMPLETADO

**Fecha:** 2026-01-25
**Agente:** CLAUDE-CODE
**Prioridad:** P1 (Hallazgo ALTA-001)
**Story Points:** 2 SP

**Problema:**
Existían 2 archivos de políticas RLS para `teacher_content` con sintaxis incompatible:
- `02-teacher_content-policies.sql` usaba `auth.uid()` (Supabase - NO funciona)
- `02-teacher_content-policies-fixed.sql` usaba `current_setting()` (correcto)

**Solución:**
Consolidar en archivo único `03-teacher_content-policies.sql` con:
- Sintaxis correcta (`current_setting()`)
- `DROP IF EXISTS` para todas las políticas (idempotente)
- Documentación del patrón correcto

**Archivo DDL Creado:**
`apps/database/ddl/schemas/educational_content/rls-policies/03-teacher_content-policies.sql`

**Políticas RLS (10):**
1. `teacher_content_view_own` - SELECT propio contenido
2. `teacher_content_view_public` - SELECT público
3. `teacher_content_view_school` - SELECT mismo tenant
4. `teacher_content_view_shared` - SELECT compartido
5. `teacher_content_create_own` - INSERT en tenant
6. `teacher_content_update_own` - UPDATE propio
7. `teacher_content_update_shared` - UPDATE compartido
8. `teacher_content_delete_own` - DELETE propio
9. `teacher_content_admin_manage_all` - ALL para admins
10. `teacher_content_student_view_classroom` - SELECT para estudiantes

**Archivos Eliminados:**
- `02-teacher_content-policies.sql` (sintaxis incorrecta)
- `02-teacher_content-policies-fixed.sql` (consolidado)

**Commit:** `499edb23`

**Para Aplicar:**
```bash
wsl -d Ubuntu-24.04 -u developer -- bash '/mnt/c/Empresas/ISEM/workspace-v2/scripts/database/unified-recreate-db.sh' gamilit --drop
```

---

### ✅ TASK-001: Tabla two_factor_tokens para 2FA - COMPLETADO

**Fecha:** 2026-01-24
**Agente:** CLAUDE-CODE
**Prioridad:** P0 CRÍTICO
**Duración:** ~1.5 horas (parte de implementación 5 gaps P0)
**Estimación:** 8 SP (como parte del gap P0-001)

**Objetivo:**
Crear tabla para almacenar tokens de autenticación de dos factores (2FA) como parte de la implementación del gap P0-001.

**Archivo DDL Creado:**
`apps/database/ddl/schemas/auth_management/tables/13-two_factor_tokens.sql`

**Estructura de la Tabla:**

```sql
CREATE TABLE auth_management.two_factor_tokens (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    method varchar(20) NOT NULL,  -- 'email', 'sms', 'authenticator'
    secret_key varchar(255),
    token_hash varchar(255),
    is_enabled boolean DEFAULT false,
    is_verified boolean DEFAULT false,
    verified_at timestamptz,
    expires_at timestamptz,
    attempts_count int DEFAULT 0,
    last_attempt_at timestamptz,
    locked_until timestamptz,
    backup_codes_encrypted text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
```

**Índices:**
- `idx_2fa_user_id` ON (user_id)
- `idx_2fa_token_hash` ON (token_hash)
- `idx_2fa_enabled` ON (user_id, is_enabled)

**Coherencia:**
- ✅ Entity correspondiente: `two-factor-token.entity.ts`
- ✅ Constante: `DB_TABLES.AUTH.TWO_FACTOR_TOKENS`

**Referencias:**
- Documentación: `orchestration/tareas/TASK-001-fix-p0-gaps/`
- Backend: Ver TRAZA-TAREAS-BACKEND.md (TASK-001)
- Commit: `430e2792`

---

### ✅ TASK-2026-01-16-005: Validación Integral BD, Seeds y Scripts - COMPLETADO

**Fecha:** 2026-01-16
**Agente:** Database-Agent + Validation
**Prioridad:** P1 VALIDACIÓN
**Duración:** ~4 horas

**Objetivo:**
Validación completa de base de datos: duplicados en DDL, cobertura de seeds, scripts de carga y documentación.

**Hallazgos y Acciones:**

#### 1. Validación DDL
- **Tablas:** 137 (0 duplicados) ✅
- **Funciones:** 121 (0 duplicados) ✅
- **Naming convention:** 100% snake_case ✅
- **Issue corregido:** `15-student_intervention_alerts.sql` → `19-student_intervention_alerts.sql`

#### 2. Validación Seeds
- **Prod:** 101 seeds (baseline) ✅
- **Dev:** 94 seeds (93% cobertura) ✅
- **Staging:** 56 seeds (55% intencional) ✅
- **Deprecación:** Organizada en `_deprecated/` folders ✅

#### 3. Scripts Creados/Actualizados
- **NUEVO:** `load-dev-seeds.sh` (18 fases) - Script completo para dev
- **NUEVO:** `staging/README.md` - Documentación de cobertura staging
- **VALIDADO:** `create-database.sh`, `load-staging-seeds.sh`

#### 4. Documentación
- **Carpeta tarea:** `orchestration/tareas/TASK-2026-01-16-005/`
- **Reporte:** `DATABASE-VALIDATION-REPORT.md`
- **Inventarios:** SEEDS_INVENTORY, FRONTEND_INVENTORY, BACKEND_INVENTORY actualizados

**Estado:** ✅ TODAS LAS RECOMENDACIONES COMPLETADAS

---

### ✅ DB-138: Eliminación Tabla Deprecated user_activity - COMPLETADO

**Fecha:** 2026-01-07
**Agente:** Database-Agent
**Prioridad:** P1 MEJORA
**Duración:** 30 minutos
**Estimación:** 0.5 SP

**Objetivo:**
Eliminar tabla deprecated `audit_logging.user_activity` identificada como duplicado de `user_activity_logs` durante análisis de consolidación de tablas de auditoría.

**Contexto:**
- Análisis de 8 tablas de auditoría reveló que `user_activity` era duplicado de `user_activity_logs`
- `user_activity_logs` tiene estructura más completa (9 cols vs 6 cols)
- Ambas registran acciones de usuario con timestamps
- Arquitectura general del proyecto validada como correcta (sin otros duplicados reales)

**Solución Implementada:**

#### 1. DDL Movido a _deprecated
**Archivo original:** `apps/database/ddl/schemas/audit_logging/tables/07-user_activity.sql`
**Destino:** `apps/database/ddl/schemas/audit_logging/_deprecated/07-user_activity.sql`

#### 2. Backend Actualizado
**Archivo:** `apps/backend/src/shared/constants/database.constants.ts`
**Cambio:** Constante `USER_ACTIVITY` comentada con nota de deprecación

```typescript
// DEPRECATED 2026-01-07: Tabla duplicada de USER_ACTIVITY_LOGS
// Movida a _deprecated/ - Usar USER_ACTIVITY_LOGS en su lugar
// USER_ACTIVITY: 'user_activity',
```

#### 3. Documentación Actualizada
- **_MAP.md:** Actualizado para reflejar 6 tablas activas (era 7)
- **MIGRATION-DUPLICATE-TABLES.md:** Marcado como COMPLETADO

#### 4. Validación Script
**Script:** `validate-create-database.sh`
**Resultado:** PASSED
- Línea 142 excluye `_deprecated/` con patrón: `! -path "*/_deprecated/*"`
- 7 archivos detectados en audit_logging/tables (excluyendo deprecated)

**Tablas activas en audit_logging:**
1. 01-audit_logs.sql
2. 02-performance_metrics.sql
3. 03-system_alerts.sql
4. 04-system_logs.sql
5. 05-user_activity_logs.sql (tabla preferida)
6. 06-activity_log.sql
7. 08-pending_user_initialization.sql

**Archivos Modificados:**
| Archivo | Tipo | Cambio |
|---------|------|--------|
| audit_logging/tables/07-user_activity.sql | DDL | Movido a _deprecated/ |
| database.constants.ts | Backend | Constante comentada |
| audit_logging/_MAP.md | Docs | Tablas 7→6 activas |
| audit_logging/MIGRATION-DUPLICATE-TABLES.md | Docs | Marcado COMPLETADO |

**Acción Pendiente en Producción:**
```sql
-- Ejecutar solo si la tabla existe en BD de producción
DROP TABLE IF EXISTS audit_logging.user_activity CASCADE;
```

**Impacto:**
- **Limpieza:** 1 tabla deprecated eliminada del flujo DDL
- **Consistencia:** 0 referencias huérfanas en TypeScript
- **Arquitectura:** Validada como correcta (tablas de progreso son complementarias)

**Reporte completo:** `orchestration/reportes/REPORTE-FINAL-SESION-2026-01-07.md`

---

## 📦 Historial Archivado

Las tareas anteriores a 2026 han sido archivadas para mantener este archivo en un tamaño manejable.

| Archivo | Período | Tareas |
|---------|---------|--------|
| `_archive/TRAZA-DATABASE-2025.md` | 2025-11 a 2025-12 | ~44 tareas |

**Contenido archivado incluye:**
- DB-137: M4-M5 Tablas Media Attachments
- DB-136: Implementación Soft Delete
- DB-111 a DB-100: Reconciliaciones y validaciones
- DB-099 a DB-089: Seeds y correcciones
- Microciclos 1-9: Implementación inicial DDL
- Sesiones de validación y corrección

Para consultar el historial completo, ver: `_archive/TRAZA-DATABASE-2025.md`

---

*Archivo reorganizado: 2026-01-24 (Auditoría P2 GAMILIT)*
*Tamaño reducido: 318KB → ~12KB*
