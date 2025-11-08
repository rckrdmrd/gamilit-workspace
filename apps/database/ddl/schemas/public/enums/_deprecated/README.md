# Archivos DDL Deprecated - public/enums

**Propósito:** Esta carpeta contiene archivos DDL legacy que fueron migrados a otros schemas.

**IMPORTANTE:** ⚠️ **NO EJECUTAR** estos archivos SQL. Son solo para referencia histórica.

---

## Lista de Archivos Deprecated

| Archivo | Fecha Deprecación | Migrado A | Razón |
|---------|-------------------|-----------|-------|
| `transaction_type.sql.legacy` | 2025-11-08 | `gamification_system/enums/transaction_type.sql` | Valores legacy (10) reemplazados por v2.0 (14 valores) |
| `notification_channel.sql.legacy` | 2025-11-08 | N/A - ELIMINADO | Feature no implementado ni especificado en documentación oficial |
| `comodin_type.sql.legacy` | 2025-11-08 | `gamification_system/enums/comodin_type.sql` | Migrado a schema correcto (gamification_system) |
| `difficulty_level.sql.legacy` | 2025-11-08 | `educational_content/enums/difficulty_level.sql` | Migrado a schema correcto (educational_content) |
| `module_status.sql.legacy` | 2025-11-08 | N/A - ELIMINADO | ENUM redundante, 100% duplicado de content_status |
| `progress_status.sql.legacy` | 2025-11-08 | `progress_tracking/enums/progress_status.sql` | Migrado a schema correcto (progress_tracking) |
| `classroom_role.sql.legacy` | 2025-11-08 | N/A - ELIMINADO | ENUM nunca implementado, sin uso en tablas |
| `team_role.sql.legacy` | 2025-11-08 | N/A - ELIMINADO | ENUM legacy nunca usado, implementación real usa VARCHAR + CHECK |

---

## transaction_type.sql.legacy

**Estado:** ❌ OBSOLETO - No usar

**Valores legacy (10):**
```
earned_exercise, earned_achievement, earned_daily_bonus (→ earned_daily),
earned_rank_promotion (→ earned_rank), spent_hint,
spent_unlock_content (→ spent_powerup), spent_customization (→ spent_powerup),
refund, admin_adjustment, gift (→ bonus)
```

**Migrado a:** `gamification_system.transaction_type` (14 valores)

**Fecha migración:** 2025-11-08

**Migration script:** `apps/database/migrations/2025-11-08-sync-transaction-type-enum.sql`

**Backend constants:** `apps/backend/src/shared/constants/enums.constants.ts:187-207`

---

## notification_channel.sql.legacy

**Estado:** ❌ ELIMINADO - Feature no implementado

**Valores legacy (4):**
```
in_app, email, push, sms
```

**Razón de eliminación:**
- Este ENUM existía en DDL pero nunca fue implementado
- NO está mencionado en documentación oficial (05-realtime-notifications.md)
- NO hay columna `channel` en tabla `notifications`
- NO hay lógica de backend que use estos valores
- Decisión: Eliminar en lugar de implementar (FASE 1 - Option A)

**Fecha eliminación:** 2025-11-08

**Backend constants:** NotificationChannelEnum eliminado de `enums.constants.ts`

**Nota:** Si en el futuro se requiere multi-canal, se debe:
1. Especificar en documentación oficial
2. Crear nuevo ENUM en gamification_system schema
3. Agregar columna a notifications
4. Implementar lógica de entrega multi-canal

---

## comodin_type.sql.legacy

**Estado:** ✅ MIGRADO - Ahora en gamification_system

**Valores (3):**
```
pistas, vision_lectora, segunda_oportunidad
```

**Razón de migración:**
- Este ENUM pertenece al sistema de gamificación, no al schema public
- Migrado a gamification_system schema (schema correcto)
- Usado en educational_content.exercises (comodines_allowed - ARRAY type)
- Decisión: Migrar a gamification_system (FASE 1 - Sprint 1)

**Fecha migración:** 2025-11-08

**Migration script:** `apps/database/migrations/2025-11-08-migrate-comodin-type-enum.sql`

**Backend constants:** ComodinTypeEnum en `apps/backend/src/shared/constants/enums.constants.ts`

**Nota:** Esta migración fue complejidad MEDIA por usar ARRAY type (comodin_type[])

**Tabla afectada:**
- educational_content.exercises.comodines_allowed (tipo: gamification_system.comodin_type[])

---

## difficulty_level.sql.legacy

**Estado:** ✅ MIGRADO - Ahora en educational_content

**Valores (8):**
```
very_easy, easy, beginner, medium, intermediate, hard, advanced, very_hard
```

**Razón de migración:**
- Este ENUM pertenece al contenido educativo, no al schema public
- Migrado a educational_content schema (schema correcto)
- Usado en múltiples tablas de educational_content y content_management
- Decisión: Migrar a educational_content (FASE 1 - Sprint 1)

**Fecha migración:** 2025-11-08

**Migration script:** `apps/database/migrations/2025-11-08-migrate-difficulty-level-enum.sql`

**Backend constants:** DifficultyLevelEnum en `apps/backend/src/shared/constants/enums.constants.ts`

**Nota:** Esta migración fue complejidad BAJA - migración estándar multi-tabla

**Tablas afectadas:**
- educational_content.modules.difficulty_level
- educational_content.exercises.difficulty_level
- content_management.content_templates.difficulty_level (if exists)
- content_management.marie_curie_content.difficulty_level (if exists)

---

## module_status.sql.legacy

**Estado:** ❌ ELIMINADO - ENUM redundante y nunca implementado

**Valores (4):**
```
draft, published, archived, under_review
```

**Razón de eliminación:**
- Este ENUM es 100% duplicado de `content_status` (mismos 4 valores)
- Nunca fue implementado en ninguna tabla
- Tabla `modules` usa `content_status` en su lugar
- ModuleStatusEnum existe en backend pero NO se usa (código muerto)
- Decisión: Eliminar en lugar de migrar (redundante con content_status)

**Fecha eliminación:** 2025-11-08

**Backend constants:** ModuleStatusEnum eliminado de `enums.constants.ts`

**Comparación con content_status:**
```sql
-- module_status (ELIMINADO - redundante)
CREATE TYPE public.module_status AS ENUM (
    'draft', 'published', 'archived', 'under_review'
);

-- content_status (MANTENER - es el correcto)
CREATE TYPE public.content_status AS ENUM (
    'draft', 'published', 'archived', 'under_review'
);
```

**Nota:** La tabla `educational_content.modules` usa correctamente `content_status` desde el inicio.

---

## progress_status.sql.legacy

**Estado:** ✅ MIGRADO - Ahora en progress_tracking

**Valores (5):**
```
not_started, in_progress, completed, reviewed, mastered
```

**Razón de migración:**
- Este ENUM pertenece al sistema de seguimiento de progreso, no al schema public
- Migrado a progress_tracking schema (schema correcto)
- Usado en progress_tracking.module_progress
- Decisión: Migrar a progress_tracking (FASE 1 - Sprint 1)

**Fecha migración:** 2025-11-08

**Migration script:** `apps/database/migrations/2025-11-08-migrate-progress-status-enum.sql`

**Backend constants:** ProgressStatusEnum en `apps/backend/src/shared/constants/enums.constants.ts`

**Nota:** Esta migración fue complejidad BAJA - migración estándar single-tabla

**Tabla afectada:**
- progress_tracking.module_progress.status

**Flujo de estados:**
- Normal: not_started → in_progress → completed → reviewed → mastered
- Autoestudio: not_started → in_progress → completed → mastered
- Reintento: completed → in_progress → completed

---

## classroom_role.sql.legacy

**Estado:** ❌ ELIMINADO - ENUM nunca implementado

**Valores (3):**
```
teacher, student, assistant
```

**Razón de eliminación:**
- Este ENUM nunca fue implementado en ninguna tabla
- Ninguna tabla en social_features usa classroom_role
- Tabla classroom_members NO tiene columna "role"
- ClassroomRoleEnum existe en backend pero NO se usa (código muerto)
- Decisión: Eliminar en lugar de migrar (nunca implementado)

**Fecha eliminación:** 2025-11-08

**Backend constants:** ClassroomRoleEnum eliminado de `enums.constants.ts`

**Nota:** Este ENUM fue creado pero nunca integrado al sistema. La tabla `classroom_members` usa otros campos (status, enrollment_method) pero no tiene rol de classroom.

---

## team_role.sql.legacy

**Estado:** ❌ ELIMINADO - ENUM legacy nunca implementado

**Valores (5):**
```
leader, member, coordinator, owner, admin
```

**Razón de eliminación:**
- Este ENUM es legacy y nunca fue usado por ninguna tabla
- La tabla `team_members` usa VARCHAR(20) con CHECK constraint en lugar de este ENUM
- CHECK constraint tiene solo 3 valores: 'owner', 'admin', 'member' (estándar moderno)
- Backend usa TeamMemberRoleEnum con 3 valores, NO usa este ENUM de 5 valores
- Valores legacy (leader, coordinator) nunca fueron implementados
- Decisión: Eliminar en lugar de migrar (implementación real no usa ENUMs para roles de equipo)

**Fecha eliminación:** 2025-11-08

**Backend constants:** TeamRoleEnum NO existe (nunca fue implementado)

**Implementación real:**
- Tabla: `social_features.team_members.role` (VARCHAR con CHECK constraint)
- Backend: TeamMemberRoleEnum con 3 valores (owner, admin, member)
- CHECK constraint: `role IN ('owner', 'admin', 'member')`

**Nota sobre mejora futura:**
La tabla `team_members` podría beneficiarse de usar un ENUM `social_features.team_member_role` en lugar de VARCHAR + CHECK constraint. Sin embargo, esto requeriría:
1. Crear nuevo ENUM con 3 valores (owner, admin, member)
2. Migrar columna de VARCHAR a ENUM
3. Actualizar Entity para usar enumName
Esta mejora NO es parte de FASE 1 (corrección de ubicaciones incorrectas).

---

**Última actualización:** 2025-11-08
**Sistema:** SIMCO
