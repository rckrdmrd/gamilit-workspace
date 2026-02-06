# Inventario de ENUMs - Base de Datos GAMILIT

**Fecha generación:** 2025-11-07
**Última actualización:** 2025-11-07 (Post-validación)
**Versión:** 1.1
**Total ENUMs:** 35 (✅ 2 duplicados eliminados)
**Estado:** 🚨 **REQUIERE CORRECCIÓN URGENTE** (31 ENUMs mal ubicados)
**Método:** Análisis de archivos DDL

---

## ⚠️ ADVERTENCIA - Estado Actual Problemático

**PROBLEMA CRÍTICO:** 31 de 35 ENUMs (89%) están incorrectamente ubicados en el schema `public`.

**✅ PROGRESO:** 2 ENUMs duplicados eliminados exitosamente (2025-11-07):
- ~~`public.maya_rank`~~ → Eliminado (duplicado de `gamification_system.maya_rank`)
- ~~`public.rango_maya`~~ → Eliminado (duplicado legacy)

**Marcadores de problemas en este documento:**
- 🚨 **[CRÍTICO]** - Requiere corrección inmediata
- ⚠️ **[MAL-UBICADO]** - Objeto en schema incorrecto
- ❌ **[DUPLICADO]** - Objeto duplicado que debe consolidarse
- ✅ **[CORRECTO]** - Objeto correctamente ubicado
- 📝 **[FALTA-DOC]** - Requiere documentación

---

## 📊 Resumen Estadístico

### Distribución por Schema

| Schema | ENUMs | % | Estado |
|--------|-------|---|--------|
| **public** | 31 | 89% | 🚨 **[MAL-UBICADO]** (✅ 2 eliminados) |
| auth | 2 | 6% | ✅ **[CORRECTO]** |
| gamification_system | 1 | 3% | ✅ **[CORRECTO]** |
| storage | 1 | 3% | ✅ **[CORRECTO]** |

### Ubicación Correcta vs Actual

```
Estado Actual (después de eliminar 2 duplicados):
public          ███████████████████████████████  31 (89%) 🚨
auth            ██                                2 (6%)   ✅
gamification    █                                 1 (3%)   ✅
storage         █                                 1 (3%)   ✅
TOTAL: 35 ENUMs

Estado Esperado (después de correcciones completas):
gamification    ████████████                     12 (34%)
educational     ████████                          8 (23%)
auth_mgmt       ██████                            6 (17%)
content_mgmt    ████                              4 (11%)
audit           ███                               3 (9%)
auth            ██                                2 (6%)
TOTAL: 35 ENUMs
```

---

## 📋 Inventario Detallado de ENUMs

### Schema: auth (2 ENUMs) ✅ **[CORRECTO]**

**Ubicación:** `apps/database/ddl/schemas/auth/enums/`
**Estado:** ✅ Correctamente ubicado

| # | ENUM | Valores | Uso | Estado |
|---|------|---------|-----|--------|
| 1 | `aal_level` | `aal1`, `aal2`, `aal3` | Niveles de autenticación (AAL = Authenticator Assurance Level) | ✅ **[CORRECTO]** |
| 2 | `code_challenge_method` | `s256`, `plain` | Métodos PKCE para OAuth | ✅ **[CORRECTO]** |

**Referencias SIMCO:**
- Backend: `apps/backend/src/modules/auth/`
- Docs: `docs/03-desarrollo/base-de-datos/schemas/auth/`

---

### Schema: gamification_system (1 ENUM) ✅ **[CORRECTO]**

**Ubicación:** `apps/database/ddl/schemas/gamification_system/enums/`
**Estado:** ✅ Correctamente ubicado (pero ver duplicado en public)

| # | ENUM | Valores | Uso | Estado |
|---|------|---------|-----|--------|
| 1 | `maya_rank` | `NACOM`, `BATAB`, `HOLCATTE`, `GUERRERO`, `MERCENARIO` | Sistema de rangos maya | ✅ **[CORRECTO]** ⚠️ Ver duplicado `public.rango_maya` |

**⚠️ ALERTA DE DUPLICACIÓN:**
- Existe `public.rango_maya` que es DUPLICADO de este ENUM
- Existe también `public.maya_rank` (duplicado exacto)
- **Acción requerida:** Consolidar en `gamification_system.maya_rank`

**Referencias SIMCO:**
- Backend: `apps/backend/src/modules/gamification/`
- Tabla: `gamification_system.user_ranks`
- Docs: `docs/03-desarrollo/base-de-datos/schemas/gamification_system/`

---

### Schema: storage (1 ENUM) ✅ **[CORRECTO]**

**Ubicación:** `apps/database/ddl/schemas/storage/enums/`
**Estado:** ✅ Correctamente ubicado

| # | ENUM | Valores | Uso | Estado |
|---|------|---------|-----|--------|
| 1 | `buckettype` | (valores por determinar) | Tipos de buckets de almacenamiento | ✅ **[CORRECTO]** 📝 **[FALTA-DOC]** |

**📝 Acción requerida:**
- Documentar valores posibles del ENUM
- Integración con MinIO/S3

**Referencias SIMCO:**
- Backend: `apps/backend/src/modules/storage/`
- Schema: Sin documentar (`storage` schema no documentado)

---

### Schema: public (31 ENUMs) 🚨 **[MAL-UBICADO]** **[CRÍTICO]**

**Ubicación:** `apps/database/ddl/schemas/public/enums/`
**Estado:** 🚨 **TODOS MAL UBICADOS** - Requiere migración urgente
**✅ Progreso:** 2 ENUMs duplicados eliminados (maya_rank, rango_maya)

---

#### Grupo 1: ENUMs de Gamification (10 ENUMs activos)
**Ubicación actual:** `public`
**Ubicación correcta:** `gamification_system`

| # | ENUM | Valores Ejemplo | Uso | Estado |
|---|------|-----------------|-----|--------|
| 1 | `achievement_category` | `learning`, `social`, `milestone`, `special` | Categorías de logros | 🚨 **[MAL-UBICADO]** → gamification_system |
| 2 | `achievement_type` | `bronze`, `silver`, `gold`, `platinum` | Tipos de logros | 🚨 **[MAL-UBICADO]** → gamification_system |
| 3 | `comodin_type` | `skip_question`, `extra_time`, `hint`, `double_points` | Tipos de comodines/power-ups | 🚨 **[MAL-UBICADO]** → gamification_system |
| 4 | `transaction_type` | `earn`, `spend`, `refund`, `admin_adjustment` | Tipos de transacciones ML coins | 🚨 **[MAL-UBICADO]** → gamification_system |
| 5 | ~~`maya_rank`~~ | - | - | ✅ **[COMPLETADO]** Eliminado 2025-11-07 |
| 6 | ~~`rango_maya`~~ | - | - | ✅ **[COMPLETADO]** Eliminado 2025-11-07 |
| 7 | `notification_type` | `achievement`, `rank_up`, `mission_complete`, `friend_request` | Tipos de notificaciones gamificadas | 🚨 **[MAL-UBICADO]** → gamification_system |
| 8 | `notification_priority` | `low`, `medium`, `high`, `urgent` | Prioridad de notificaciones | 🚨 **[MAL-UBICADO]** → gamification_system |
| 9 | `notification_channel` | `in_app`, `email`, `push`, `sms` | Canales de notificación | 🚨 **[MAL-UBICADO]** → gamification_system |
| 10 | `metric_type` | `counter`, `gauge`, `histogram` | Tipos de métricas | 🚨 **[MAL-UBICADO]** → gamification_system o audit_logging |
| 11 | `aggregation_period` | `daily`, `weekly`, `monthly`, `yearly` | Períodos de agregación para stats | 🚨 **[MAL-UBICADO]** → gamification_system |
| 12 | `social_event_type` | `friend_added`, `challenge_issued`, `team_created` | Eventos sociales | 🚨 **[MAL-UBICADO]** → social_features |

**Referencias:**
- Tablas afectadas: `gamification_system.achievements`, `user_achievements`, `ml_coins_transactions`, `notifications`
- Backend: `apps/backend/src/modules/gamification/`

---

#### Grupo 2: ENUMs de Educational Content (8 ENUMs)
**Ubicación actual:** `public`
**Ubicación correcta:** `educational_content`

| # | ENUM | Valores Ejemplo | Uso | Estado |
|---|------|-----------------|-----|--------|
| 13 | `exercise_type` | `multiple_choice`, `true_false`, `fill_blank`, `matching`, `ordering` | Tipos de ejercicios | 🚨 **[MAL-UBICADO]** → educational_content |
| 14 | `cognitive_level` | `remember`, `understand`, `apply`, `analyze`, `evaluate`, `create` | Niveles cognitivos Bloom | 🚨 **[MAL-UBICADO]** → educational_content |
| 15 | `difficulty_level` | `beginner`, `intermediate`, `advanced`, `expert` | Dificultad de ejercicios | 🚨 **[MAL-UBICADO]** → educational_content |
| 16 | `module_status` | `draft`, `published`, `archived`, `deprecated` | Estado de módulos | 🚨 **[MAL-UBICADO]** → educational_content |
| 17 | `progress_status` | `not_started`, `in_progress`, `completed`, `failed` | Estado de progreso | 🚨 **[MAL-UBICADO]** → progress_tracking |
| 18 | `attempt_status` | `started`, `submitted`, `graded`, `expired` | Estado de intentos | 🚨 **[MAL-UBICADO]** → progress_tracking |
| 19 | `attempt_result` | `correct`, `incorrect`, `partial`, `skipped` | Resultado de intentos | 🚨 **[MAL-UBICADO]** → progress_tracking |
| 20 | `processing_status` | `pending`, `processing`, `completed`, `failed` | Estado de procesamiento | 🚨 **[MAL-UBICADO]** → content_management |

**Referencias:**
- Tablas afectadas: `educational_content.exercises`, `modules`, `progress_tracking.exercise_attempts`
- Backend: `apps/backend/src/modules/exercises/`, `apps/backend/src/modules/progress/`

---

#### Grupo 3: ENUMs de Content Management (4 ENUMs)
**Ubicación actual:** `public`
**Ubicación correcta:** `content_management`

| # | ENUM | Valores Ejemplo | Uso | Estado |
|---|------|-----------------|-----|--------|
| 21 | `content_type` | `text`, `image`, `video`, `audio`, `document`, `interactive` | Tipos de contenido | 🚨 **[MAL-UBICADO]** → content_management |
| 22 | `content_status` | `draft`, `review`, `published`, `archived` | Estado de contenido | 🚨 **[MAL-UBICADO]** → content_management |
| 23 | `media_type` | `image/jpeg`, `image/png`, `video/mp4`, `audio/mp3` | MIME types | 🚨 **[MAL-UBICADO]** → content_management o storage |
| 24 | `processing_status` | (ver arriba) | Procesamiento de media | ❌ **[DUPLICADO]** ver #20 |

**Referencias:**
- Tablas afectadas: `content_management.marie_curie_content`, `media_files`
- Backend: `apps/backend/src/modules/content/`

---

#### Grupo 4: ENUMs de Auth Management (6 ENUMs)
**Ubicación actual:** `public`
**Ubicación correcta:** `auth_management`

| # | ENUM | Valores Ejemplo | Uso | Estado |
|---|------|-----------------|-----|--------|
| 25 | `gamilit_role` | `admin`, `teacher`, `student`, `parent`, `content_creator` | Roles del sistema | 🚨 **[MAL-UBICADO]** → auth_management |
| 26 | `user_status` | `active`, `inactive`, `suspended`, `pending_verification`, `deleted` | Estados de usuario | 🚨 **[MAL-UBICADO]** → auth_management |
| 27 | `classroom_role` | `teacher`, `student`, `assistant`, `observer` | Roles en clase | 🚨 **[MAL-UBICADO]** → social_features |
| 28 | `team_role` | `leader`, `member`, `co_leader` | Roles en equipos | 🚨 **[MAL-UBICADO]** → social_features |
| 29 | `friendship_status` | `pending`, `accepted`, `rejected`, `blocked` | Estados de amistad | 🚨 **[MAL-UBICADO]** → social_features |
| 30 | `setting_type` | `string`, `number`, `boolean`, `json` | Tipos de settings | 🚨 **[MAL-UBICADO]** → system_configuration |

**Referencias:**
- Tablas afectadas: `auth_management.roles`, `social_features.friendships`, `system_configuration.system_settings`
- Backend: `apps/backend/src/modules/auth/`, `apps/backend/src/modules/social/`

---

#### Grupo 5: ENUMs de Audit & System (3 ENUMs)
**Ubicación actual:** `public`
**Ubicación correcta:** `audit_logging` / `system_configuration`

| # | ENUM | Valores Ejemplo | Uso | Estado |
|---|------|-----------------|-----|--------|
| 31 | `audit_action` | `create`, `update`, `delete`, `login`, `logout`, `access` | Acciones auditables | 🚨 **[MAL-UBICADO]** → audit_logging |
| 32 | `log_level` | `debug`, `info`, `warning`, `error`, `critical` | Niveles de log | 🚨 **[MAL-UBICADO]** → audit_logging |
| 33 | `alert_severity` | `low`, `medium`, `high`, `critical` | Severidad de alertas | 🚨 **[MAL-UBICADO]** → audit_logging |
| 34 | `alert_status` | `open`, `acknowledged`, `resolved`, `closed` | Estado de alertas | 🚨 **[MAL-UBICADO]** → audit_logging |

**Referencias:**
- Tablas afectadas: `audit_logging.audit_logs`, `system_alerts`
- Backend: `apps/backend/src/modules/audit/`

---

## 🎯 Plan de Migración de ENUMs

### Fase 1: Crear ENUMs en Schemas Correctos

```sql
-- EJEMPLO: Migrar achievement_category
-- 1. Crear en schema correcto
CREATE TYPE gamification_system.achievement_category AS ENUM (
    'learning',
    'social',
    'milestone',
    'special'
);

-- 2. Actualizar referencias en tablas
ALTER TABLE gamification_system.achievements
    ALTER COLUMN category TYPE gamification_system.achievement_category
    USING category::text::gamification_system.achievement_category;

-- 3. Deprecar ENUM antiguo (NO eliminar aún)
-- COMMENT ON TYPE public.achievement_category IS 'DEPRECATED - Use gamification_system.achievement_category';

-- 4. Eliminar después de período de gracia
-- DROP TYPE public.achievement_category;
```

### Fase 2: Orden de Migración (Respetando Dependencias)

**Nivel 1:** ENUMs sin dependencias
1. `auth.aal_level`, `auth.code_challenge_method` ✅ Ya correcto
2. `storage.buckettype` ✅ Ya correcto
3. Migrar ENUMs de `audit_logging` (no dependen de nada)
4. Migrar ENUMs de `system_configuration`

**Nivel 2:** ENUMs de features base
5. Migrar ENUMs de `auth_management` (depende de auth)
6. Migrar ENUMs de `educational_content` (depende de auth_management)

**Nivel 3:** ENUMs de features avanzadas
7. Migrar ENUMs de `gamification_system` (depende de educational_content)
8. Migrar ENUMs de `social_features` (depende de auth_management)
9. Migrar ENUMs de `content_management` (depende de storage)

**Nivel 4:** ENUMs de tracking
10. Migrar ENUMs de `progress_tracking` (depende de educational + gamification)

### Fase 3: Validación

- [ ] Verificar backend constants sincronizados
- [ ] Ejecutar `npm run sync:enums`
- [ ] Testing completo de funcionalidades
- [ ] Validar que no hay referencias a `public.*` ENUMs
- [ ] Eliminar ENUMs deprecados de public

---

## 📊 Matriz de Correcciones Requeridas

| ENUM en public | Schema Destino | Tablas Afectadas | Prioridad | Estado |
|----------------|----------------|------------------|-----------|--------|
| `achievement_category` | gamification_system | achievements | P0 | [PENDIENTE] |
| `achievement_type` | gamification_system | achievements | P0 | [PENDIENTE] |
| ~~`maya_rank`~~ | ❌ DUPLICADO | - | P0 | ✅ [COMPLETADO] 2025-11-07 |
| ~~`rango_maya`~~ | ❌ DUPLICADO | - | P0 | ✅ [COMPLETADO] 2025-11-07 |
| `exercise_type` | educational_content | exercises | P0 | [PENDIENTE] |
| `gamilit_role` | auth_management | user_roles | P0 | [PENDIENTE] |
| `user_status` | auth_management | users | P0 | [PENDIENTE] |
| `cognitive_level` | educational_content | exercises | P1 | [PENDIENTE] |
| `difficulty_level` | educational_content | exercises | P1 | [PENDIENTE] |
| `module_status` | educational_content | modules | P1 | [PENDIENTE] |
| `progress_status` | progress_tracking | module_progress | P1 | [PENDIENTE] |
| `attempt_status` | progress_tracking | exercise_attempts | P1 | [PENDIENTE] |
| `attempt_result` | progress_tracking | exercise_attempts | P1 | [PENDIENTE] |
| `content_type` | content_management | content_items | P1 | [PENDIENTE] |
| `content_status` | content_management | content_items | P1 | [PENDIENTE] |
| `media_type` | content_management | media_files | P1 | [PENDIENTE] |
| `processing_status` | content_management | media_files | P1 | [PENDIENTE] |
| `comodin_type` | gamification_system | comodines_inventory | P2 | [PENDIENTE] |
| `transaction_type` | gamification_system | ml_coins_transactions | P2 | [PENDIENTE] |
| `notification_type` | gamification_system | notifications | P2 | [PENDIENTE] |
| `notification_priority` | gamification_system | notifications | P2 | [PENDIENTE] |
| `notification_channel` | gamification_system | notifications | P2 | [PENDIENTE] |
| `classroom_role` | social_features | classroom_members | P2 | [PENDIENTE] |
| `team_role` | social_features | team_members | P2 | [PENDIENTE] |
| `friendship_status` | social_features | friendships | P2 | [PENDIENTE] |
| `social_event_type` | social_features | user_activity | P2 | [PENDIENTE] |
| `audit_action` | audit_logging | audit_logs | P2 | [PENDIENTE] |
| `log_level` | audit_logging | system_logs | P2 | [PENDIENTE] |
| `alert_severity` | audit_logging | system_alerts | P2 | [PENDIENTE] |
| `alert_status` | audit_logging | system_alerts | P2 | [PENDIENTE] |
| `setting_type` | system_configuration | system_settings | P2 | [PENDIENTE] |
| `metric_type` | audit_logging | performance_metrics | P2 | [PENDIENTE] |
| `aggregation_period` | gamification_system | leaderboard_metadata | P2 | [PENDIENTE] |

**Total:** 33 correcciones identificadas
**Completadas:** 2 (maya_rank, rango_maya) ✅
**Pendientes:** 31

---

## 🔍 Verificación de Sincronización con Backend

### ENUMs que DEBEN estar en backend constants

Archivo: `apps/backend/src/shared/constants/enums.constants.ts`

**✅ Verificar que existen:**
- [x] `maya_rank` (NACOM, BATAB, HOLCATTE, GUERRERO, MERCENARIO)
- [ ] `achievement_category`
- [ ] `exercise_type`
- [ ] `gamilit_role`
- [ ] `cognitive_level`
- [ ] `difficulty_level`
- [ ] Todos los demás ENUMs

**⚠️ Acción requerida:**
Después de migrar ENUMs, ejecutar:
```bash
npm run sync:enums
npm run validate:constants
```

---

## 📎 Referencias SIMCO

**Este documento es parte del sistema SIMCO (Sistema Indexado Modular por Contexto)**

### Referencias Cruzadas
- **Inventario anterior:** `02-TABLES-INVENTORY.md`
- **Siguiente inventario:** `04-FUNCTIONS-INVENTORY.md`
- **Reporte maestro:** `INVENTORY-MASTER-REPORT.md`
- **Plan de corrección:** Ver sección "Plan de Migración" arriba

### Scripts Relacionados
- **Inventario:** `apps/database/scripts/inventory/list-enums.sh`
- **DDL Source:** `apps/database/ddl/schemas/*/enums/*.sql`
- **Backend Sync:** `apps/devops/scripts/sync-enums.ts`

### Documentación
- **Backend Constants:** `apps/backend/src/shared/constants/enums.constants.ts`
- **Docs schemas:** `docs/03-desarrollo/base-de-datos/schemas/`

---

## ✅ Checklist de Corrección

Usar este checklist durante la migración:

### Pre-migración
- [ ] Backup completo de la base de datos
- [ ] Identificar todas las tablas que usan cada ENUM
- [ ] Generar queries de validación de datos

### Migración
- [ ] Crear ENUM en schema correcto
- [ ] Verificar valores coinciden exactamente
- [ ] Actualizar ALTER TABLE de todas las tablas afectadas
- [ ] Actualizar funciones que usan el ENUM
- [ ] Actualizar triggers que usan el ENUM
- [ ] Marcar ENUM antiguo como DEPRECATED (no eliminar)

### Post-migración
- [ ] Ejecutar `npm run sync:enums`
- [ ] Actualizar backend entities
- [ ] Testing funcional completo
- [ ] Validar en staging
- [ ] Deploy a producción
- [ ] Esperar período de gracia (1-2 semanas)
- [ ] Eliminar ENUMs deprecados de public

---

**Generado por:** Sistema de Inventario Automatizado SIMCO
**Estado:** 🚨 Requiere corrección urgente - 33 ENUMs mal ubicados
**Próxima acción:** Crear scripts de migración SQL
**Estimación:** 3-5 días de trabajo para migrar todos los ENUMs
