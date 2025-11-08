# Mapa Maestro de Incidencias - Base de Datos GAMILIT

**Fecha creación:** 2025-11-07
**Versión:** 1.0
**Sistema:** SIMCO (Sistema Indexado Modular por Contexto)
**Propósito:** Documento maestro de rastreo para correcciones de base de datos
**Para:** Agente especializado en análisis de base de datos

---

## 📋 Índice Rápido

- [1. Resumen Ejecutivo](#1-resumen-ejecutivo)
- [2. Incidencias por Tipo](#2-incidencias-por-tipo)
- [3. Mapa de Referencias](#3-mapa-de-referencias)
- [4. Estado de Correcciones](#4-estado-de-correcciones)
- [5. Incidencias Detalladas](#5-incidencias-detalladas)
- [6. Contexto para Siguiente Agente](#6-contexto-para-siguiente-agente)

---

## 1. Resumen Ejecutivo

### 1.1 Estado General

| Categoría | Total | Completado | Pendiente | % |
|-----------|-------|------------|-----------|---|
| Duplicaciones | 13 | 5 | 8 | 38% |
| ENUMs mal ubicados | 33 | 5 | 28 | 15% |
| Tablas mal ubicadas | 9 | 0 | 9 | 0% |
| Triggers duplicados | 10 | 0 | 10 | 0% |
| Índices mal ubicados | 64 | 0 | 64 | 0% |
| Funciones mal ubicadas | 7 | 0 | 7 | 0% |
| Vistas mal ubicadas | 3 | 0 | 3 | 0% |
| **TOTAL** | **142** | **8** | **134** | **5.6%** |

### 1.2 Principio Establecido

**"Documentación como Fuente de Verdad"**
- Cuando hay conflicto: Documentación > Código
- Especificaciones en `docs/02-especificaciones-tecnicas/` son autoritativas

### 1.3 Documentos Base

| Documento | Ubicación | Propósito |
|-----------|-----------|-----------|
| Tracking Principal | `apps/database/docs/TRACKING-CORRECCIONES.md` | Estado general de correcciones |
| Tipos Notifications | `docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-NOTIFICATIONS.md` | Especificación NotificationType |
| Tipos Gamification | `docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-GAMIFICATION.md` | Especificación MayaRank, Achievements, Transactions |
| Análisis ENUMs | `apps/database/docs/ANALISIS-ENUMS-GAMIFICATION-2025-11-07.md` | Análisis detallado de ENUMs gamification |
| Fuente de Verdad | `apps/database/docs/REPORTE-FUENTE-DE-VERDAD-2025-11-07.md` | Plan de correcciones detallado |

---

## 2. Incidencias por Tipo

### 2.1 DUPLICACIONES (13 incidencias)

#### 2.1.1 Tablas Duplicadas (3) - ✅ RESUELTAS (Falsos Positivos)

| ID | Tabla | Schemas Reportados | Estado | Hallazgo Real |
|----|-------|-------------------|--------|---------------|
| C1.1 | classrooms | social_features vs public | ✅ FALSO POSITIVO | Solo existe en social_features |
| C1.2 | classroom_members/students | social_features vs public | ✅ FALSO POSITIVO | Solo existe en social_features |
| C1.3 | notifications | gamification_system vs public | ✅ FALSO POSITIVO | Solo existe en gamification_system |

**Referencias:**
- Reporte: `apps/database/docs/REPORTE-VALIDACION-DUPLICACIONES-2025-11-07.md`
- DDL classrooms: `apps/database/ddl/schemas/social_features/tables/03-classrooms.sql`
- DDL notifications: `apps/database/ddl/schemas/gamification_system/tables/08-notifications.sql`

---

#### 2.1.2 ENUMs Duplicados (2) - ✅ COMPLETADAS

| ID | ENUM | Schemas | Estado | Fecha Corrección |
|----|------|---------|--------|------------------|
| C2.1 | maya_rank | gamification_system vs public | ✅ COMPLETADO | 2025-11-07 (sesión anterior) |
| C2.2 | rango_maya | public (legacy) | ✅ COMPLETADO | 2025-11-07 (sesión anterior) |

**Referencias:**
- DDL correcto: `apps/database/ddl/schemas/gamification_system/enums/maya_rank.sql`
- Valores: `'Ajaw', 'Nacom', 'Ah K''in', 'Halach Uinic', 'K''uk''ulkan'`

---

#### 2.1.3 Triggers Duplicados (10) - ⏳ PENDIENTE

Todos los triggers duplicados están en `public` vs schema correcto debido a que las tablas estaban duplicadas (falso positivo).

| ID | Trigger | Schemas | Acción |
|----|---------|---------|--------|
| C3.1 | trg_classroom_members_updated_at | social_features vs public | ⚠️ VALIDAR si public tiene trigger legacy |
| C3.2 | trg_update_classroom_count | social_features vs public | ⚠️ VALIDAR |
| C3.3 | trg_classrooms_updated_at | social_features vs public | ⚠️ VALIDAR |
| C3.4 | trg_schools_updated_at | social_features vs public | ⚠️ VALIDAR |
| C3.5 | trg_teams_updated_at | social_features vs public | ⚠️ VALIDAR |
| C3.6 | trg_feature_flags_updated_at | system_configuration vs public | ⚠️ VALIDAR |
| C3.7 | trg_system_settings_updated_at | system_configuration vs public | ⚠️ VALIDAR |
| C3.8 | 21-trg_update_user_stats_on_exercise | progress_tracking vs public | ⚠️ VALIDAR |
| C3.9 | 22-exercise_submissions_updated_at | progress_tracking vs public | ⚠️ VALIDAR |
| C3.10 | 23-trg_module_progress_updated_at | progress_tracking vs public | ⚠️ VALIDAR |

**Acción sugerida:** Ejecutar query para verificar triggers en public schema:
```sql
SELECT schemaname, tablename, trigger_name
FROM information_schema.triggers
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Referencias:**
- DDL triggers social_features: `apps/database/ddl/schemas/social_features/triggers/`
- DDL triggers public: `apps/database/ddl/schemas/public/triggers/`

---

### 2.2 ENUMs MAL UBICADOS (33 incidencias)

#### 2.2.1 ENUMs → gamification_system (12 ENUMs)

| ID | ENUM | Estado | DDL Ubicación Actual | Uso en Tabla | Prioridad |
|----|------|--------|---------------------|--------------|-----------|
| P1.1.1 | achievement_category | ✅ COMPLETADO | gamification_system | achievements | P0 |
| P1.1.2 | achievement_type | ✅ COMPLETADO | gamification_system | *(no usado)* | P0 |
| P1.1.3 | comodin_type | ⏳ PENDIENTE | **public** | exercises (ARRAY) | P1 |
| P1.1.4 | transaction_type | ⏳ PENDIENTE | **public** + TEXT+CHECK | ml_coins_transactions | P0 |
| P1.1.5 | notification_type | ✅ COMPLETADO | gamification_system | notifications | P0 |
| P1.1.6 | notification_priority | ⏳ PENDIENTE | public | *(no usado - huérfano)* | P2 |
| P1.1.7 | notification_channel | ⏳ PENDIENTE | public | *(no usado - huérfano)* | P2 |
| P1.1.8 | metric_type | ⏳ PENDIENTE | public | performance_metrics | P2 |
| P1.1.9 | aggregation_period | ⏳ PENDIENTE | public | leaderboard_metadata | P2 |
| P1.1.10 | social_event_type | ⏳ PENDIENTE | public | user_activity | P2 |
| P1.1.11 | maya_rank | ✅ COMPLETADO | gamification_system | user_ranks | - |
| P1.1.12 | rango_maya | ✅ COMPLETADO | *(eliminado)* | - | - |

**Referencias detalladas P1.1.3 - comodin_type:**
- DDL ENUM: `apps/database/ddl/schemas/public/enums/comodin_type.sql`
- Valores: `'pistas', 'vision_lectora', 'segunda_oportunidad'`
- Uso: `educational_content.exercises.comodines_allowed public.comodin_type[]`
- DDL tabla: `apps/database/ddl/schemas/educational_content/tables/02-exercises.sql:46`
- Acción: Crear `gamification_system.comodin_type`, migrar columna ARRAY
- Complejidad: MEDIA (tipo ARRAY requiere conversión especial)

**Referencias detalladas P1.1.4 - transaction_type:**
- DDL ENUM public: `apps/database/ddl/schemas/public/enums/transaction_type.sql` (10 valores legacy)
- DDL ENUM correcto: `apps/database/ddl/schemas/gamification_system/enums/transaction_type.sql` ✅ **YA CREADO** (14 valores)
- DDL tabla: `apps/database/ddl/schemas/gamification_system/tables/05-ml_coins_transactions.sql` ✅ **YA ACTUALIZADO**
- Problema: Tabla usa `transaction_type TEXT` con CHECK constraint (12 valores)
- Valores correctos (14): Ver `TYPES-GAMIFICATION.md:217-230`
- Acción: Crear migration para convertir TEXT→ENUM
- Migration: ⏳ PENDIENTE crear `2025-11-0X-sync-transaction-type-enum.sql`
- Complejidad: ALTA (desincronización entre 3 fuentes, mapeo de valores legacy)

**Mapeo de valores legacy transaction_type:**
```
public.transaction_type (10 valores legacy) → gamification_system.transaction_type (14 valores)

MANTENER:
- earned_exercise → earned_exercise
- earned_achievement → earned_achievement
- spent_hint → spent_hint
- refund → refund
- admin_adjustment → admin_adjustment

MAPEAR:
- earned_daily_bonus → earned_daily
- earned_rank_promotion → earned_rank
- spent_unlock_content → spent_powerup (o admin_adjustment según contexto)
- spent_customization → spent_powerup (o admin_adjustment según contexto)
- gift → bonus

AGREGAR (nuevos en v2.0):
- earned_module (nuevo)
- earned_streak (nuevo)
- earned_bonus (nuevo)
- spent_powerup (nuevo)
- spent_retry (nuevo)
- welcome_bonus (nuevo)
```

**Referencias detalladas P1.1.6 y P1.1.7 - notification_priority/channel:**
- DDL: `apps/database/ddl/schemas/public/enums/notification_priority.sql`
- DDL: `apps/database/ddl/schemas/public/enums/notification_channel.sql`
- Estado: ENUMs huérfanos (NO usados en ninguna tabla)
- Tabla notifications: NO tiene columnas priority ni channel
- Decisión requerida:
  1. Verificar en `TYPES-NOTIFICATIONS.md` si deben existir
  2. Si SÍ: Agregar columnas a tabla notifications + migrar ENUMs
  3. Si NO: Eliminar ENUMs huérfanos
- Acción: Consultar documentación oficial primero

---

#### 2.2.2 ENUMs → educational_content (8 ENUMs)

| ID | ENUM | Ubicación Actual | Debe ir a | Tablas Afectadas | Estado |
|----|------|-----------------|-----------|------------------|--------|
| P1.2.1 | exercise_type | public | educational_content | exercises | ⏳ PENDIENTE |
| P1.2.2 | cognitive_level | public | educational_content | exercises | ⏳ PENDIENTE |
| P1.2.3 | difficulty_level | public | educational_content | exercises, achievements | ⏳ PENDIENTE |
| P1.2.4 | module_status | public | educational_content | modules | ⏳ PENDIENTE |
| P1.2.5 | progress_status | public | progress_tracking | module_progress | ⏳ PENDIENTE |
| P1.2.6 | attempt_status | public | progress_tracking | exercise_attempts | ⏳ PENDIENTE |
| P1.2.7 | attempt_result | public | progress_tracking | exercise_attempts | ⏳ PENDIENTE |
| P1.2.8 | processing_status | public | content_management | media_files | ⏳ PENDIENTE |

**Nota:** difficulty_level es usado por dos schemas (educational_content.exercises y gamification_system.achievements). Decidir ubicación final o mantener en public.

---

#### 2.2.3 ENUMs → content_management (4 ENUMs)

| ID | ENUM | Ubicación Actual | Debe ir a | Tablas Afectadas | Estado |
|----|------|-----------------|-----------|------------------|--------|
| P1.3.1 | content_type | public | content_management | content_items | ⏳ PENDIENTE |
| P1.3.2 | content_status | public | content_management | content_items | ⏳ PENDIENTE |
| P1.3.3 | media_type | public | content_management o storage | media_files | ⏳ PENDIENTE |
| P1.3.4 | processing_status | public | content_management | *(duplicado de P1.2.8)* | ⏳ PENDIENTE |

---

#### 2.2.4 ENUMs → auth_management / social_features (6 ENUMs)

| ID | ENUM | Ubicación Actual | Debe ir a | Tablas Afectadas | Estado |
|----|------|-----------------|-----------|------------------|--------|
| P1.4.1 | gamilit_role | public | auth_management | user_roles | ⏳ PENDIENTE |
| P1.4.2 | user_status | public | auth_management | users | ⏳ PENDIENTE |
| P1.4.3 | classroom_role | public | social_features | classroom_members | ⏳ PENDIENTE |
| P1.4.4 | team_role | public | social_features | team_members | ⏳ PENDIENTE |
| P1.4.5 | friendship_status | public | social_features | friendships | ⏳ PENDIENTE |
| P1.4.6 | setting_type | public | system_configuration | system_settings | ⏳ PENDIENTE |

---

#### 2.2.5 ENUMs → audit_logging (4 ENUMs)

| ID | ENUM | Ubicación Actual | Debe ir a | Tablas Afectadas | Estado |
|----|------|-----------------|-----------|------------------|--------|
| P1.5.1 | audit_action | public | audit_logging | audit_logs | ⏳ PENDIENTE |
| P1.5.2 | log_level | public | audit_logging | system_logs | ⏳ PENDIENTE |
| P1.5.3 | alert_severity | public | audit_logging | system_alerts | ⏳ PENDIENTE |
| P1.5.4 | alert_status | public | audit_logging | system_alerts | ⏳ PENDIENTE |

---

### 2.3 TABLAS MAL UBICADAS (9 incidencias)

#### 2.3.1 Sistema de Assignments (6 tablas) - public → educational_content

| ID | Tabla | Ubicación Actual | Debe ir a | Razón | Estado |
|----|-------|-----------------|-----------|-------|--------|
| P2.1 | assignments | public | educational_content | Funcionalidad educativa | ⏳ PENDIENTE |
| P2.2 | assignment_classrooms | public | educational_content | Relación con assignments | ⏳ PENDIENTE |
| P2.3 | assignment_exercises | public | educational_content | Relación con assignments | ⏳ PENDIENTE |
| P2.4 | assignment_students | public | educational_content | Relación con assignments | ⏳ PENDIENTE |
| P2.5 | assignment_submissions | public | educational_content | Relación con assignments | ⏳ PENDIENTE |
| P2.9 | teacher_notes | public | educational_content | Funcionalidad educativa | ⏳ PENDIENTE |

**Referencias:**
- DDL: `apps/database/ddl/schemas/public/tables/assignments.sql`
- DDL: `apps/database/ddl/schemas/public/tables/assignment_classrooms.sql`
- DDL: `apps/database/ddl/schemas/public/tables/assignment_exercises.sql`
- DDL: `apps/database/ddl/schemas/public/tables/assignment_students.sql`
- DDL: `apps/database/ddl/schemas/public/tables/assignment_submissions.sql`
- DDL: `apps/database/ddl/schemas/public/tables/teacher_notes.sql`

**Acción:** Mover todo el sistema de assignments en bloque (6 tablas + índices + triggers relacionados)

**Complejidad:** ALTA
- 6 tablas con relaciones FK entre ellas
- Índices asociados
- Posibles triggers
- Backend entities a actualizar

**Prioridad:** P1 - ALTO (arquitectura inconsistente)

---

#### 2.3.2 Tablas Duplicadas (3 tablas) - ✅ FALSOS POSITIVOS

Documentadas en sección 2.1.1

---

### 2.4 CONTRADICCIONES CRÍTICAS RESUELTAS

#### CC1: NotificationType - 3 Definiciones Diferentes ✅ COMPLETADO

**Problema:** 0% de coincidencia entre 3 fuentes
- DDL: 7 valores legacy + TEXT con CHECK (6 valores incorrectos)
- Backend Constants: 6 valores incompletos
- Entity: Definición local desactualizada

**Solución aplicada:**
- ✅ DDL ENUM: `apps/database/ddl/schemas/public/enums/notification_type.sql` → 11 valores
- ✅ DDL tabla: `apps/database/ddl/schemas/gamification_system/tables/08-notifications.sql` → usa ENUM
- ✅ Migration: `apps/database/migrations/2025-11-07-align-notification-type-with-docs.sql`
- ✅ Constants: `apps/backend/src/shared/constants/enums.constants.ts` → NotificationTypeEnum (11)
- ✅ Entity: `apps/backend/src/modules/notifications/entities/notification.entity.ts` → usa constants

**Valores finales (11):**
```typescript
'achievement_unlocked', 'rank_up', 'friend_request', 'guild_invitation',
'mission_completed', 'level_up', 'message_received', 'system_announcement',
'ml_coins_earned', 'streak_milestone', 'exercise_feedback'
```

**Documentación:** `docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-NOTIFICATIONS.md`

---

#### CC2: Notification Entity Duplicada ✅ COMPLETADO

**Problema:** Entity en 2 ubicaciones
- `/modules/notifications/entities/notification.entity.ts` (correcta)
- `/modules/gamification/entities/notification.entity.ts` (duplicada)

**Solución:** Ya eliminada en sesión anterior, validado 2025-11-07

---

#### CC3: MayaRank - Documentación Desactualizada ✅ COMPLETADO

**Problema:** Docs advertían migración pendiente pero ya estaba corregida (2025-11-03)

**Solución aplicada:**
- ✅ Docs actualizados: `docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-GAMIFICATION.md`
- ✅ Estado actual: DDL correcto desde 2025-11-03
- ✅ Valores: `'Ajaw', 'Nacom', 'Ah K''in', 'Halach Uinic', 'K''uk''ulkan'`

---

#### CC4: Guild vs Team Terminology ⏳ PENDIENTE (P1)

**Problema:** Documentación usa "Guild", código usa "Team"

**Afectados:** 21+ archivos
- Tablas: `teams`, `team_members`, `team_challenges`, `team_role`
- ENUM: notification_type valor `guild_invitation` ✅ ya corregido en notification
- Pero tablas de teams aún usan "team"

**Decisión:** P1-ALTO, requiere refactoring mayor (8-12 horas estimadas)

**Plan detallado:** Ver `apps/database/docs/REPORTE-FUENTE-DE-VERDAD-2025-11-07.md` sección C4

**Prioridad:** P1 - Breaking changes

---

## 3. Mapa de Referencias

### 3.1 Estructura de Directorios

```
apps/database/
├── ddl/
│   ├── 00-prerequisites.sql              # ENUMs base (algunos desactualizados)
│   └── schemas/
│       ├── public/
│       │   ├── enums/                    # 26 ENUMs (20 activos, 2 migrados, 4+ huérfanos)
│       │   │   ├── _MAP.md              # ✅ ACTUALIZADO con migraciones
│       │   │   ├── notification_type.sql # ✅ ACTUALIZADO v2.0
│       │   │   ├── comodin_type.sql      # ⏳ MIGRAR
│       │   │   ├── transaction_type.sql  # ⏳ MIGRAR (legacy 10 valores)
│       │   │   └── ...
│       │   └── tables/                   # 6 tablas de assignments
│       │       ├── assignments.sql
│       │       ├── assignment_*.sql
│       │       └── teacher_notes.sql
│       ├── gamification_system/
│       │   ├── enums/
│       │   │   ├── maya_rank.sql         # ✅ CORRECTO
│       │   │   ├── achievement_category.sql # ✅ CREADO
│       │   │   ├── achievement_type.sql  # ✅ CREADO
│       │   │   └── transaction_type.sql  # ✅ CREADO (14 valores)
│       │   └── tables/
│       │       ├── 03-achievements.sql   # ✅ ACTUALIZADO usa gamification_system ENUMs
│       │       ├── 05-ml_coins_transactions.sql # ✅ ACTUALIZADO usa transaction_type ENUM
│       │       ├── 07-comodines_inventory.sql
│       │       └── 08-notifications.sql  # ✅ ACTUALIZADO usa notification_type ENUM
│       ├── educational_content/
│       │   └── tables/
│       │       └── 02-exercises.sql      # Usa public.comodin_type[] ⏳ PENDIENTE
│       └── ...
├── migrations/
│   ├── 2025-11-07-align-notification-type-with-docs.sql # ✅ COMPLETO
│   ├── 2025-11-07-fix-achievement-enums-schema.sql      # ✅ COMPLETO
│   └── 2025-11-0X-sync-transaction-type-enum.sql        # ⏳ PENDIENTE CREAR
└── docs/
    ├── TRACKING-CORRECCIONES.md          # ✅ v1.4 - Tracking principal
    ├── REPORTE-VALIDACION-2025-11-07.md
    ├── REPORTE-CONTRADICCIONES-CRITICAS-2025-11-07.md
    ├── REPORTE-FUENTE-DE-VERDAD-2025-11-07.md
    ├── REPORTE-VALIDACION-DUPLICACIONES-2025-11-07.md
    ├── RESUMEN-EJECUTIVO-SESION-2025-11-07.md
    ├── ANALISIS-ENUMS-GAMIFICATION-2025-11-07.md # ✅ Análisis detallado ENUMs
    └── MAPA-INCIDENCIAS-BASE-DATOS.md    # 📍 ESTE DOCUMENTO

docs/02-especificaciones-tecnicas/
├── tipos-compartidos/
│   ├── TYPES-NOTIFICATIONS.md            # 📖 Fuente verdad NotificationType (11 valores)
│   └── TYPES-GAMIFICATION.md             # 📖 Fuente verdad TransactionType (14 valores)
└── trazabilidad/
    └── 05-realtime-notifications.md      # 📖 Arquitectura notifications

apps/backend/src/
├── shared/constants/
│   └── enums.constants.ts                # ✅ ACTUALIZADO NotificationTypeEnum (11)
└── modules/
    ├── notifications/entities/
    │   └── notification.entity.ts        # ✅ ACTUALIZADO usa constants
    └── gamification/entities/
        ├── achievement.entity.ts         # ⏳ VALIDAR usa gamification_system ENUMs
        └── ml-coins-transaction.entity.ts # ⏳ VALIDAR transaction_type
```

### 3.2 Índice de Archivos por Incidencia

#### NotificationType (CC1) - ✅ COMPLETADO
```
DDL:
  apps/database/ddl/schemas/public/enums/notification_type.sql ✅
  apps/database/ddl/schemas/gamification_system/tables/08-notifications.sql ✅
Migration:
  apps/database/migrations/2025-11-07-align-notification-type-with-docs.sql ✅
Backend:
  apps/backend/src/shared/constants/enums.constants.ts ✅
  apps/backend/src/modules/notifications/entities/notification.entity.ts ✅
Docs:
  docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-NOTIFICATIONS.md 📖
```

#### Achievement ENUMs (P1.1.1, P1.1.2) - ✅ COMPLETADO
```
DDL:
  apps/database/ddl/schemas/gamification_system/enums/achievement_category.sql ✅
  apps/database/ddl/schemas/gamification_system/enums/achievement_type.sql ✅
  apps/database/ddl/schemas/gamification_system/tables/03-achievements.sql ✅
  apps/database/ddl/schemas/public/enums/_MAP.md ✅ (marcado como migrado)
Migration:
  apps/database/migrations/2025-11-07-fix-achievement-enums-schema.sql ✅
Backend:
  apps/backend/src/modules/gamification/entities/achievement.entity.ts ⏳ VALIDAR
Docs:
  docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-GAMIFICATION.md 📖
```

#### TransactionType (P1.1.4) - ⏳ DDL LISTO, FALTA MIGRATION
```
DDL:
  apps/database/ddl/schemas/public/enums/transaction_type.sql (legacy 10 valores)
  apps/database/ddl/schemas/gamification_system/enums/transaction_type.sql ✅ NUEVO (14)
  apps/database/ddl/schemas/gamification_system/tables/05-ml_coins_transactions.sql ✅
Migration:
  apps/database/migrations/2025-11-0X-sync-transaction-type-enum.sql ⏳ CREAR
Backend:
  apps/backend/src/modules/gamification/entities/ml-coins-transaction.entity.ts ⏳ VALIDAR
Docs:
  docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-GAMIFICATION.md:217-230 📖
  apps/database/docs/ANALISIS-ENUMS-GAMIFICATION-2025-11-07.md 📋
```

#### ComodinType (P1.1.3) - ⏳ PENDIENTE
```
DDL:
  apps/database/ddl/schemas/public/enums/comodin_type.sql (3 valores)
  apps/database/ddl/schemas/educational_content/tables/02-exercises.sql:46 (usa ARRAY)
Migration:
  ⏳ CREAR: 2025-11-0X-migrate-comodin-type-enum.sql
Backend:
  apps/backend/src/modules/exercises/entities/exercise.entity.ts ⏳ VALIDAR
Docs:
  docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-GAMIFICATION.md 📖
```

#### Assignments (P2.1-P2.5, P2.9) - ⏳ PENDIENTE
```
DDL:
  apps/database/ddl/schemas/public/tables/assignments.sql
  apps/database/ddl/schemas/public/tables/assignment_classrooms.sql
  apps/database/ddl/schemas/public/tables/assignment_exercises.sql
  apps/database/ddl/schemas/public/tables/assignment_students.sql
  apps/database/ddl/schemas/public/tables/assignment_submissions.sql
  apps/database/ddl/schemas/public/tables/teacher_notes.sql
Migration:
  ⏳ CREAR: 2025-11-XX-migrate-assignments-to-educational-content.sql
Backend:
  ⏳ BUSCAR entities de assignments
```

---

## 4. Estado de Correcciones

### 4.1 Completadas (8)

| ID | Incidencia | Tipo | Fecha | Archivos |
|----|-----------|------|-------|----------|
| C2.1 | maya_rank duplicado | ENUM | 2025-11-07 | 1 migration |
| C2.2 | rango_maya legacy | ENUM | 2025-11-07 | - |
| C1.1 | classrooms duplicado | Tabla | 2025-11-07 | Falso positivo |
| C1.2 | classroom_members duplicado | Tabla | 2025-11-07 | Falso positivo |
| C1.3 | notifications duplicado | Tabla | 2025-11-07 | Falso positivo |
| P1.1.5 | notification_type sincronización | ENUM | 2025-11-07 | 5 archivos |
| P1.1.1 | achievement_category referencia | ENUM | 2025-11-07 | 4 archivos |
| P1.1.2 | achievement_type validación | ENUM | 2025-11-07 | 2 archivos |

### 4.2 En Progreso (1)

| ID | Incidencia | Tipo | Estado Actual | Falta |
|----|-----------|------|---------------|-------|
| P1.1.4 | transaction_type | ENUM | DDL listo | Migration |

### 4.3 Pendientes P0-Críticas (0)

Todas las P0 completadas o en progreso.

### 4.4 Pendientes P1-Alto (3)

| ID | Incidencia | Complejidad | Estimado |
|----|-----------|-------------|----------|
| P1.1.3 | comodin_type migración | MEDIA | 2-3h |
| P2.1-P2.9 | Assignments migración | ALTA | 6-8h |
| CC4 | Guild vs Team refactoring | MUY ALTA | 8-12h |

### 4.5 Pendientes P2-Medio (28 ENUMs)

Ver secciones 2.2.2, 2.2.3, 2.2.4, 2.2.5 para lista completa

---

## 5. Incidencias Detalladas

### 5.1 CRÍTICO: transaction_type - Desincronización entre 3 fuentes

**ID:** P1.1.4
**Tipo:** ENUM mal ubicado + Desincronización
**Prioridad:** P0 - CRÍTICO
**Estado:** ⏳ DDL listo, falta migration

**Problema:**
1. ENUM en `public.transaction_type` con 10 valores legacy
2. Tabla usa `TEXT` con CHECK constraint de 12 valores
3. Documentación especifica 14 valores oficiales
4. 0% de coincidencia entre las 3 fuentes

**Fuentes:**

**A) public.transaction_type (10 valores - legacy):**
```sql
-- apps/database/ddl/schemas/public/enums/transaction_type.sql
'earned_exercise', 'earned_achievement', 'earned_daily_bonus', 'earned_rank_promotion',
'spent_hint', 'spent_unlock_content', 'spent_customization',
'refund', 'admin_adjustment', 'gift'
```

**B) ml_coins_transactions CHECK constraint (12 valores - tabla):**
```sql
-- apps/database/ddl/schemas/gamification_system/tables/05-ml_coins_transactions.sql:47
'earned_exercise', 'earned_module', 'earned_achievement', 'earned_rank', 'earned_streak',
'spent_powerup', 'spent_hint', 'spent_retry',
'admin_adjustment', 'refund', 'bonus', 'welcome_bonus'
```

**C) TYPES-GAMIFICATION.md (14 valores - documentación oficial):**
```typescript
// docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-GAMIFICATION.md:217-230
'earned_exercise', 'earned_module', 'earned_achievement', 'earned_rank', 'earned_streak',
'earned_daily', 'earned_bonus',
'spent_powerup', 'spent_hint', 'spent_retry',
'admin_adjustment', 'refund', 'bonus', 'welcome_bonus'
```

**Solución implementada:**

✅ **1. Creado ENUM correcto (14 valores):**
```
apps/database/ddl/schemas/gamification_system/enums/transaction_type.sql
```

✅ **2. Actualizado DDL tabla:**
```
apps/database/ddl/schemas/gamification_system/tables/05-ml_coins_transactions.sql
- Cambiado: transaction_type text → transaction_type gamification_system.transaction_type
- Eliminado: CHECK constraint
```

⏳ **3. FALTA: Migration script**
```
Crear: apps/database/migrations/2025-11-0X-sync-transaction-type-enum.sql
Debe incluir:
  - Pre-validación de valores actuales en tabla
  - Mapeo de valores legacy (ver mapeo en sección 2.2.1)
  - Conversión TEXT → ENUM
  - Eliminación CHECK constraint
  - Post-validación
  - Rollback documentado
```

**Mapeo de valores legacy → v2.0:**
```sql
-- Valores que se mantienen igual (5):
'earned_exercise' → 'earned_exercise'
'earned_achievement' → 'earned_achievement'
'spent_hint' → 'spent_hint'
'refund' → 'refund'
'admin_adjustment' → 'admin_adjustment'

-- Valores a mapear (5):
'earned_daily_bonus' → 'earned_daily'
'earned_rank_promotion' → 'earned_rank'
'spent_unlock_content' → 'spent_powerup' (o 'admin_adjustment' según metadata)
'spent_customization' → 'spent_powerup' (o 'admin_adjustment' según metadata)
'gift' → 'bonus'

-- Valores del CHECK constraint ya compatibles (7):
'earned_module', 'earned_rank', 'earned_streak', 'spent_powerup', 'spent_retry', 'bonus', 'welcome_bonus'

-- Valores nuevos en v2.0 (no requieren mapeo, son futuros):
'earned_daily', 'earned_bonus'
```

**Query de pre-validación sugerida:**
```sql
-- Ver distribución actual de valores
SELECT transaction_type, COUNT(*) as count
FROM gamification_system.ml_coins_transactions
GROUP BY transaction_type
ORDER BY count DESC;

-- Verificar valores que NO están en v2.0
SELECT DISTINCT transaction_type
FROM gamification_system.ml_coins_transactions
WHERE transaction_type NOT IN (
  'earned_exercise', 'earned_module', 'earned_achievement', 'earned_rank', 'earned_streak',
  'earned_daily', 'earned_bonus',
  'spent_powerup', 'spent_hint', 'spent_retry',
  'admin_adjustment', 'refund', 'bonus', 'welcome_bonus'
);
```

**Archivos a validar en backend:**
```
apps/backend/src/modules/gamification/entities/ml-coins-transaction.entity.ts
apps/backend/src/modules/gamification/services/ml-coins.service.ts
apps/backend/src/shared/constants/enums.constants.ts (crear TransactionTypeEnum)
```

**Estimado:** 3-4 horas (migration + validación + testing)

---

### 5.2 ALTO: comodin_type - Migración con ARRAY type

**ID:** P1.1.3
**Tipo:** ENUM mal ubicado
**Prioridad:** P1 - ALTO
**Estado:** ⏳ PENDIENTE

**Problema:**
- ENUM en `public.comodin_type` pero debe estar en `gamification_system`
- Usado en `exercises.comodines_allowed` como **ARRAY type** (`public.comodin_type[]`)
- Conversión ARRAY requiere estrategia especial

**Ubicación actual:**
```sql
-- apps/database/ddl/schemas/public/enums/comodin_type.sql
CREATE TYPE public.comodin_type AS ENUM ('pistas', 'vision_lectora', 'segunda_oportunidad');
```

**Uso:**
```sql
-- apps/database/ddl/schemas/educational_content/tables/02-exercises.sql:46
comodines_allowed public.comodin_type[] DEFAULT ARRAY['pistas'::public.comodin_type, 'vision_lectora'::public.comodin_type, 'segunda_oportunidad'::public.comodin_type]
```

**Solución:**

1. **Crear ENUM en gamification_system:**
```sql
CREATE TYPE gamification_system.comodin_type AS ENUM ('pistas', 'vision_lectora', 'segunda_oportunidad');
```

2. **Migration con conversión ARRAY:**
```sql
-- Paso 1: Convertir a text[]
ALTER TABLE educational_content.exercises
  ALTER COLUMN comodines_allowed TYPE text[]
  USING comodines_allowed::text[];

-- Paso 2: Aplicar nuevo ENUM
ALTER TABLE educational_content.exercises
  ALTER COLUMN comodines_allowed TYPE gamification_system.comodin_type[]
  USING comodines_allowed::text[]::gamification_system.comodin_type[];

-- Paso 3: Eliminar public.comodin_type
DROP TYPE IF EXISTS public.comodin_type CASCADE;
```

3. **Actualizar DDL:**
```
apps/database/ddl/schemas/gamification_system/enums/comodin_type.sql (crear)
apps/database/ddl/schemas/educational_content/tables/02-exercises.sql (actualizar referencia)
```

**Archivos a validar en backend:**
```
apps/backend/src/modules/exercises/entities/exercise.entity.ts
```

**Complejidad:** MEDIA (conversión ARRAY)
**Estimado:** 2-3 horas

---

### 5.3 ALTO: Assignments - Sistema completo a migrar

**ID:** P2.1-P2.9
**Tipo:** Tablas mal ubicadas
**Prioridad:** P1 - ALTO
**Estado:** ⏳ PENDIENTE

**Problema:**
- 6 tablas del sistema de assignments en `public` schema
- Funcionalidad educativa → debe estar en `educational_content`
- Rompe arquitectura modular

**Tablas a migrar:**
1. `assignments` - Tabla principal
2. `assignment_classrooms` - Relación N:N assignments ↔ classrooms
3. `assignment_exercises` - Relación N:N assignments ↔ exercises
4. `assignment_students` - Relación N:N assignments ↔ students
5. `assignment_submissions` - Entregas de estudiantes
6. `teacher_notes` - Notas de profesores

**DDL ubicaciones actuales:**
```
apps/database/ddl/schemas/public/tables/assignments.sql
apps/database/ddl/schemas/public/tables/assignment_classrooms.sql
apps/database/ddl/schemas/public/tables/assignment_exercises.sql
apps/database/ddl/schemas/public/tables/assignment_students.sql
apps/database/ddl/schemas/public/tables/assignment_submissions.sql
apps/database/ddl/schemas/public/tables/teacher_notes.sql
```

**Objetos relacionados:**
- Índices: `apps/database/ddl/schemas/public/indexes/idx_assignment_*.sql`
- Triggers: Posiblemente `trg_assignment_*.sql`
- Vistas: `apps/database/ddl/schemas/public/views/01-assignment_submission_stats.sql`

**Complejidad:** ALTA
- 6 tablas con FKs entre ellas
- FK a otras schemas (classrooms → social_features, students → auth_management)
- Índices y triggers asociados
- Vista materializada posible
- Backend entities

**Estrategia de migración:**
1. Crear tablas en `educational_content` schema
2. Copiar datos (INSERT SELECT)
3. Actualizar FKs en otras tablas que apuntan a assignments
4. Actualizar backend entities
5. Testing exhaustivo
6. Deprecar tablas en public
7. Eliminar después de período de gracia

**Migration script:** `2025-11-XX-migrate-assignments-to-educational-content.sql`

**Estimado:** 6-8 horas (alta complejidad por FKs y datos)

---

### 5.4 MEDIO: notification_priority y notification_channel - ENUMs huérfanos

**ID:** P1.1.6, P1.1.7
**Tipo:** ENUMs huérfanos (no usados)
**Prioridad:** P2 - MEDIO
**Estado:** ⏳ REQUIERE DECISIÓN

**Problema:**
- ENUMs existen en public pero NO son usados por ninguna tabla
- Tabla `notifications` NO tiene columnas `priority` ni `channel`
- Decisión requerida: ¿eliminar o implementar?

**Ubicación actual:**
```sql
-- apps/database/ddl/schemas/public/enums/notification_priority.sql
CREATE TYPE public.notification_priority AS ENUM ('low', 'medium', 'high', 'critical');

-- apps/database/ddl/schemas/public/enums/notification_channel.sql
CREATE TYPE public.notification_channel AS ENUM ('in_app', 'email', 'push', 'sms');
```

**Verificación:**
```sql
-- Tabla notifications NO tiene estas columnas
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'gamification_system'
  AND table_name = 'notifications';

-- Resultado: id, user_id, type, title, message, data, read, created_at, updated_at
-- NO hay: priority, channel
```

**Opciones:**

**Opción A: Eliminar ENUMs huérfanos**
- Si no están en `TYPES-NOTIFICATIONS.md`
- Si no se planea sistema multi-canal
- Limpiar deuda técnica

**Opción B: Implementar funcionalidad**
- Si están en especificación oficial
- Agregar columnas a tabla notifications
- Migration para agregar columnas + valores default
- Migrar ENUMs a gamification_system

**Opción C: Mantener para futuro**
- Si funcionalidad está planeada
- Migrar a gamification_system pero no usar aún
- Documentar como "futuro"

**Acción inmediata:**
1. Consultar `TYPES-NOTIFICATIONS.md` y `05-realtime-notifications.md`
2. Verificar si NotificationPriority o NotificationChannel están especificados
3. Decidir opción A, B o C

**Referencias a verificar:**
```
docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-NOTIFICATIONS.md
docs/02-especificaciones-tecnicas/trazabilidad/05-realtime-notifications.md
```

**Si Opción B (implementar):**
```sql
-- Migration agregar columnas
ALTER TABLE gamification_system.notifications
  ADD COLUMN priority gamification_system.notification_priority DEFAULT 'medium',
  ADD COLUMN channel gamification_system.notification_channel DEFAULT 'in_app';

-- Crear índices
CREATE INDEX idx_notifications_priority ON gamification_system.notifications(priority);
CREATE INDEX idx_notifications_channel ON gamification_system.notifications(channel);
```

**Estimado:** 1-2 horas (decisión + implementación si aplica)

---

## 6. Contexto para Siguiente Agente

### 6.1 Trabajo Completado (Sesión 2025-11-07)

**Principio establecido:**
- "Documentación como Fuente de Verdad"
- Cuando hay conflicto: Docs > Código

**Correcciones P0 completadas:**
1. ✅ NotificationType: Sincronizado DDL ↔ Constants ↔ Entity ↔ Docs (11 valores)
2. ✅ Achievement ENUMs: Corregidas referencias de public a gamification_system
3. ✅ MayaRank: Documentación actualizada
4. ✅ Validación duplicaciones: 3 falsos positivos identificados

**ENUMs migrados (5):**
- notification_type (11 valores)
- achievement_category (7 valores)
- achievement_type (4 valores)
- maya_rank (5 valores) - sesión anterior
- rango_maya (eliminado)

**DDL actualizados:**
- notification_type.sql (ENUM)
- notifications.sql (tabla)
- achievement_category.sql (ENUM)
- achievement_type.sql (ENUM)
- achievements.sql (tabla)
- transaction_type.sql (ENUM) - NUEVO 14 valores
- ml_coins_transactions.sql (tabla) - usa ENUM

**Migrations creados (2):**
1. 2025-11-07-align-notification-type-with-docs.sql (completo y probado lógicamente)
2. 2025-11-07-fix-achievement-enums-schema.sql (completo y probado lógicamente)

**Documentación creada (6 reportes):**
1. REPORTE-VALIDACION-2025-11-07.md
2. REPORTE-CONTRADICCIONES-CRITICAS-2025-11-07.md
3. REPORTE-FUENTE-DE-VERDAD-2025-11-07.md
4. REPORTE-VALIDACION-DUPLICACIONES-2025-11-07.md
5. RESUMEN-EJECUTIVO-SESION-2025-11-07.md
6. ANALISIS-ENUMS-GAMIFICATION-2025-11-07.md

---

### 6.2 Próximos Pasos Recomendados (Prioridad)

#### **PASO 1: Completar transaction_type (P0)**
**Estimado:** 3-4 horas
**Estado:** DDL listo, falta migration

**Tareas:**
1. Crear migration: `2025-11-0X-sync-transaction-type-enum.sql`
   - Pre-validación con query de distribución actual
   - Mapeo de valores legacy (ver sección 5.1)
   - Conversión TEXT → ENUM
   - Eliminación CHECK constraint
   - Post-validación
   - Rollback documentado

2. Actualizar backend:
   - Crear `TransactionTypeEnum` en constants
   - Actualizar entity ml-coins-transaction.entity.ts
   - Validar services que usan transaction_type

3. Testing en staging

**Archivos:**
```
CREAR: apps/database/migrations/2025-11-0X-sync-transaction-type-enum.sql
VALIDAR: apps/backend/src/modules/gamification/entities/ml-coins-transaction.entity.ts
CREAR: apps/backend/src/shared/constants/enums.constants.ts (agregar TransactionTypeEnum)
```

**Referencias:**
- Sección 5.1 de este documento (mapeo detallado)
- `ANALISIS-ENUMS-GAMIFICATION-2025-11-07.md`
- `TYPES-GAMIFICATION.md:217-230`

---

#### **PASO 2: Decidir sobre notification_priority/channel (P2)**
**Estimado:** 1-2 horas
**Estado:** Requiere decisión

**Tareas:**
1. Leer `TYPES-NOTIFICATIONS.md` completo
2. Leer `05-realtime-notifications.md` (trazabilidad)
3. Determinar si priority/channel son parte de especificación
4. Elegir Opción A (eliminar), B (implementar), o C (mantener futuro)
5. Implementar decisión

**Si Opción A (eliminar):**
```sql
-- Verificar que nadie usa
SELECT COUNT(*) FROM information_schema.columns
WHERE udt_name IN ('notification_priority', 'notification_channel');

-- Si 0, eliminar
DROP TYPE IF EXISTS public.notification_priority;
DROP TYPE IF EXISTS public.notification_channel;
```

**Si Opción B (implementar):**
- Ver sección 5.4 para migration de agregar columnas
- Migrar ENUMs a gamification_system
- Actualizar entity

**Referencias:**
- Sección 5.4 de este documento
- `TYPES-NOTIFICATIONS.md`
- `05-realtime-notifications.md`

---

#### **PASO 3: Migrar comodin_type (P1)**
**Estimado:** 2-3 horas
**Estado:** Pendiente, complejidad media (ARRAY type)

**Tareas:**
1. Crear ENUM en gamification_system
2. Crear migration con conversión ARRAY
3. Actualizar DDL exercises.sql
4. Validar backend entity

**Archivos:**
```
CREAR: apps/database/ddl/schemas/gamification_system/enums/comodin_type.sql
CREAR: apps/database/migrations/2025-11-0X-migrate-comodin-type-enum.sql
ACTUALIZAR: apps/database/ddl/schemas/educational_content/tables/02-exercises.sql
VALIDAR: apps/backend/src/modules/exercises/entities/exercise.entity.ts
```

**Referencias:**
- Sección 5.2 de este documento (estrategia ARRAY)
- `ANALISIS-ENUMS-GAMIFICATION-2025-11-07.md`

---

#### **PASO 4: Migrar sistema assignments (P1)**
**Estimado:** 6-8 horas
**Estado:** Pendiente, complejidad alta

**Tareas:**
1. Analizar FKs y dependencias
2. Crear DDL en educational_content
3. Crear migration completo (6 tablas)
4. Validar backend entities
5. Testing exhaustivo

**Archivos:**
```
CREAR: apps/database/ddl/schemas/educational_content/tables/*.sql (6 tablas)
CREAR: apps/database/migrations/2025-11-XX-migrate-assignments-to-educational-content.sql
BUSCAR: Backend entities de assignments
```

**Referencias:**
- Sección 5.3 de este documento
- `TRACKING-CORRECCIONES.md` sección P2.1-P2.9

---

#### **PASO 5: Resto de ENUMs (P2)**
**Estimado:** Variable, 20-30 horas total
**Estado:** 28 ENUMs pendientes

**Priorizar en orden:**
1. ENUMs de gamification_system (metric_type, aggregation_period, social_event_type)
2. ENUMs de educational_content (exercise_type, cognitive_level, difficulty_level, module_status)
3. ENUMs de auth/social (gamilit_role, user_status, classroom_role, team_role, friendship_status)
4. ENUMs de audit (audit_action, log_level, alert_severity, alert_status)

**Estrategia:** Migrar por grupos temáticos (todos los de un schema en un mismo sprint)

**Referencias:**
- Secciones 2.2.2, 2.2.3, 2.2.4, 2.2.5 de este documento
- `TRACKING-CORRECCIONES.md`

---

### 6.3 Herramientas y Comandos Útiles

#### Verificar ENUMs en BD actual:
```sql
SELECT n.nspname as schema, t.typname as enum_name, e.enumlabel as value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname IN ('public', 'gamification_system', 'educational_content', 'auth_management')
ORDER BY schema, enum_name, e.enumsortorder;
```

#### Ver qué columnas usan un ENUM:
```sql
SELECT
    c.table_schema,
    c.table_name,
    c.column_name,
    c.udt_schema,
    c.udt_name
FROM information_schema.columns c
WHERE c.udt_name = 'transaction_type';  -- cambiar por ENUM deseado
```

#### Verificar triggers duplicados:
```sql
SELECT schemaname, tablename, trigger_name
FROM information_schema.triggers
WHERE schemaname = 'public'
ORDER BY tablename;
```

#### Ver distribución de valores en columna:
```sql
SELECT column_name, COUNT(*)
FROM table_name
GROUP BY column_name
ORDER BY COUNT(*) DESC;
```

#### Inventarios automáticos:
```bash
# Regenerar inventarios
cd apps/database/scripts/inventory
./generate-all-inventories.sh

# Ver ENUMs
cat apps/database/docs/inventarios/03-ENUMS-INVENTORY.md

# Ver tablas
cat apps/database/docs/inventarios/02-TABLES-INVENTORY.md
```

---

### 6.4 Puntos de Atención

#### ⚠️ No ejecutar migrations en producción directamente
- Siempre probar en staging primero
- Hacer backup completo antes de cualquier migration
- Validar que post-migration queries no fallen

#### ⚠️ Verificar backend entities después de cambios DDL
- TypeORM entities pueden tener decoradores específicos de schema
- Ejemplo: `@Column({ type: 'enum', enum: NotificationTypeEnum })`
- Si se cambia schema del ENUM, entity debe especificarlo

#### ⚠️ Values en ENUMs son case-sensitive
- PostgreSQL ENUMs distinguen mayúsculas
- Mapeo debe ser exacto
- Ejemplo: `'earned_exercise'` ≠ `'EARNED_EXERCISE'`

#### ⚠️ ARRAY types requieren conversión especial
- No se puede cambiar `type[]` directamente
- Requiere conversión a text[] intermedia
- Ver sección 5.2 para estrategia

#### ⚠️ CHECK constraints y ENUMs no pueden coexistir
- Si tabla tiene CHECK constraint, eliminarlo al convertir a ENUM
- ENUM ya provee validación type-safe
- No necesitar ambos

---

### 6.5 Métricas de Progreso

**Para tracking continuo:**

Actualizar `TRACKING-CORRECCIONES.md` después de cada corrección:
1. Cambiar estado de [PENDIENTE] a [COMPLETADO] ✅
2. Agregar fecha de corrección
3. Listar archivos modificados
4. Actualizar dashboard de progreso (tabla de %)
5. Actualizar sección de "Métricas de Progreso" semanal

**Formato de actualización:**
```markdown
| P1.1.X | enum_name | public | dest_schema | tabla | [COMPLETADO] ✅ | P1 - Completado YYYY-MM-DD |
```

---

## 7. Checklist de Validación

### Pre-Migration
- [ ] Backup de BD staging
- [ ] Backup de BD producción (si aplica)
- [ ] Leer documentación oficial relacionada
- [ ] Verificar uso actual del ENUM/tabla con queries
- [ ] Identificar funciones/triggers/vistas que usan objeto
- [ ] Notificar al equipo

### Durante Migration
- [ ] Crear branch git: `db/corrections-YYYY-MM-DD-nombre`
- [ ] Migration tiene pre-validación
- [ ] Migration tiene post-validación
- [ ] Migration tiene rollback documentado
- [ ] Testing en staging exitoso
- [ ] Validar datos migrados correctamente
- [ ] No hay valores NULL inesperados
- [ ] Distribución de valores es coherente

### Post-Migration
- [ ] Actualizar DDL files
- [ ] Actualizar backend entities si aplica
- [ ] Actualizar constants si aplica
- [ ] Actualizar TRACKING-CORRECCIONES.md
- [ ] Actualizar _MAP.md si es ENUM
- [ ] Commit con mensaje descriptivo
- [ ] Testing integration/e2e si es posible
- [ ] Deploy a producción (con plan de rollback)

---

## 8. Glosario y Abreviaciones

| Término | Significado |
|---------|-------------|
| DDL | Data Definition Language (CREATE, ALTER, DROP) |
| ENUM | Enumerated Type (tipo de dato con valores fijos) |
| FK | Foreign Key (llave foránea) |
| SIMCO | Sistema Indexado Modular por Contexto |
| P0 | Prioridad 0 - Crítico |
| P1 | Prioridad 1 - Alto |
| P2 | Prioridad 2 - Medio |
| CHECK constraint | Constraint que valida valores con condición SQL |
| RLS | Row Level Security (políticas de seguridad a nivel fila) |
| Migration | Script SQL para evolucionar schema de BD |
| Rollback | Deshacer cambios (revertir migration) |
| Huérfano | ENUM/objeto que no es usado por ninguna tabla |

---

## 9. Contactos y Referencias

### Documentación Oficial (Fuentes de Verdad)
```
docs/02-especificaciones-tecnicas/tipos-compartidos/
├── TYPES-NOTIFICATIONS.md       # 11 notification types
├── TYPES-GAMIFICATION.md         # MayaRank, Achievements, Transactions (14 types)
└── ...

docs/02-especificaciones-tecnicas/trazabilidad/
└── 05-realtime-notifications.md  # Arquitectura notifications
```

### Reportes Generados (Esta Sesión)
```
apps/database/docs/
├── TRACKING-CORRECCIONES.md      # Tracking principal (v1.4)
├── REPORTE-VALIDACION-2025-11-07.md
├── REPORTE-CONTRADICCIONES-CRITICAS-2025-11-07.md
├── REPORTE-FUENTE-DE-VERDAD-2025-11-07.md
├── REPORTE-VALIDACION-DUPLICACIONES-2025-11-07.md
├── RESUMEN-EJECUTIVO-SESION-2025-11-07.md
├── ANALISIS-ENUMS-GAMIFICATION-2025-11-07.md
└── MAPA-INCIDENCIAS-BASE-DATOS.md  # Este documento
```

### Scripts Útiles
```bash
# Inventarios
apps/database/scripts/inventory/generate-all-inventories.sh
apps/database/scripts/inventory/list-enums.sh
apps/database/scripts/inventory/list-tables.sh

# DDL
apps/database/ddl/00-prerequisites.sql  # ENUMs base

# Migrations
apps/database/migrations/2025-11-07-*.sql
```

---

**Documento generado:** 2025-11-07
**Versión:** 1.0
**Para:** Agente especializado en base de datos
**Próxima revisión:** Después de completar Pasos 1-3
**Mantenedor:** Actualizar después de cada corrección

---

**FIN DEL MAPA DE INCIDENCIAS**

Este documento debe ser actualizado cada vez que se complete una corrección para mantener el tracking preciso.
