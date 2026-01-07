# CHANGELOG - Auditoría y Migración de Base de Datos GAMILIT

**Fecha:** 2026-01-04 (Sesión 2)
**Tipo:** Auditoría completa, correcciones y migración de duplicados
**Ejecutado por:** Database-Agent (Orquestador)
**Perfil:** PERFIL-DATABASE

---

## Resumen Ejecutivo

Se realizó una auditoría completa de la base de datos con las siguientes acciones:

1. **Correcciones DDL** - 3 archivos con FKs rotas y schema faltante
2. **Correcciones Seeds** - 3 archivos con encoding UTF-8 corrupto
3. **Análisis de Duplicados** - 3 tablas identificadas como deprecadas
4. **Migración Backend** - 2 entidades/servicios migrados al sistema consolidado
5. **Documentación** - 2 archivos de plan de migración creados

**Resultado Final:** Todas las correcciones aplicadas. Requiere recreación de BD para validar.

---

## Fase 1: Correcciones DDL

### 1.1 FK Rota en Función `get_classroom_analytics`

**Archivo:** `ddl/schemas/progress_tracking/functions/05-get_classroom_analytics.sql`

| Línea | Antes | Después |
|-------|-------|---------|
| 10 | `auth.profiles` | `auth_management.profiles` |
| 62 | `SELECT full_name FROM auth.profiles` | `SELECT full_name FROM auth_management.profiles` |

**Problema:** La función referenciaba `auth.profiles` que no existe.
**Solución:** Actualizado a `auth_management.profiles` que es el schema correcto.

---

### 1.2 Schema Faltante en Prerequisites

**Archivo:** `ddl/00-prerequisites.sql`

| Línea | Cambio |
|-------|--------|
| 72-73 | Agregado `CREATE SCHEMA IF NOT EXISTS communication;` |

**Problema:** Schema `communication` creado en FASE 10.5 pero no declarado en prerequisites.
**Solución:** Agregado después de `storage` schema para mantener orden lógico.

---

### 1.3 FK Rota en Tabla `notifications.notifications`

**Archivo:** `ddl/schemas/notifications/tables/01-notifications.sql`

| Línea | Antes | Después |
|-------|-------|---------|
| 13-14 | `REFERENCES auth.users(id)` | `REFERENCES auth_management.profiles(id)` |

**Problema:** La tabla referenciaba `auth.users` que es el schema de Supabase, no el de perfiles.
**Solución:** Actualizado a `auth_management.profiles`.

---

## Fase 2: Correcciones de Encoding UTF-8

### 2.1 Archivos Afectados

| Archivo | Caracteres Corruptos | Estado |
|---------|---------------------|--------|
| `seeds/prod/gamification_system/04-achievements.sql` | ~50+ | Corregido |
| `seeds/prod/gamification_system/07-ml_coins_transactions.sql` | ~10 | Corregido |
| `seeds/prod/gamification_system/08-user_achievements.sql` | ~5 | Corregido |

### 2.2 Patrones Corregidos

```bash
# Ejemplos de sustituciones realizadas:
producción → producción (U+FFFD → ó)
Comprensión → Comprensión (U+FFFD → ó)
Crítica → Crítica (U+FFFD → í)
VERIFICACIÓN → VERIFICACIÓN (U+FFFD → Ó)
¡Felicidades! → ¡Felicidades! (U+FFFD → ¡)
# ... 60+ patrones en total
```

**Comando de verificación:**
```bash
grep -c "�" seeds/prod/gamification_system/04-achievements.sql
# Resultado esperado: 0
```

---

## Fase 3: Análisis de Tablas Duplicadas

### 3.1 Tablas Identificadas como Deprecadas

| Tabla Deprecada | Migrar a | Referencias en Backend | Estado |
|-----------------|----------|------------------------|--------|
| `audit_logging.user_activity` | `audit_logging.activity_log` | 13+ archivos | Marcada DEPRECATED |
| `gamification_system.notifications` | `notifications.notifications` | 6+ archivos | Marcada DEPRECATED |
| `audit_logging.activity_log` | N/A (Canónica) | Dashboard Admin | CANÓNICA |

### 3.2 Archivos de Documentación Creados

| Archivo | Contenido |
|---------|-----------|
| `ddl/schemas/audit_logging/MIGRATION-DUPLICATE-TABLES.md` | Plan migración user_activity → activity_log |
| `ddl/schemas/gamification_system/MIGRATION-NOTIFICATIONS.md` | Plan migración notifications |

### 3.3 Tablas DDL Marcadas como Deprecated

**Archivo:** `ddl/schemas/audit_logging/tables/07-user_activity.sql`
- Agregado header de deprecación con fecha 2026-01-04
- COMMENT ON TABLE actualizado a "DEPRECATED"
- Referencia al plan de migración

**Archivo:** `ddl/schemas/gamification_system/tables/08-notifications.sql`
- Agregado header de deprecación con fecha 2026-01-04
- COMMENT ON TABLE actualizado a "DEPRECATED"
- CHANGELOG interno actualizado a v3.2

---

## Fase 4: Migración Backend (apps/backend)

### 4.1 Migración user_activity → activity_log

| Archivo Backend | Cambio |
|-----------------|--------|
| `shared/constants/database.constants.ts` | Agregado `ACTIVITY_LOG`, marcado `USER_ACTIVITY` deprecated |
| `modules/admin/entities/user-activity.entity.ts` | Renombrado a `activity-log.entity.ts` |
| `modules/admin/entities/activity-log.entity.ts` | Entity migrada a `activity_log` con alias `UserActivity` |
| `modules/admin/entities/index.ts` | Exporta `ActivityLog` y `UserActivity` (alias) |

**Compatibilidad:** `UserActivity` sigue disponible como alias deprecated.

### 4.2 Migración NotificationsService → NotificationService

| Archivo Backend | Cambio |
|-----------------|--------|
| `modules/notifications/entities/notification.entity.ts` | Agregado aviso DEPRECATED |
| `modules/notifications/services/notifications.service.ts` | Agregado aviso DEPRECATED |
| `modules/progress/services/exercise-submission.service.ts` | Migrado a `NotificationService.create()` |
| `modules/teacher/services/student-risk-alert.service.ts` | Migrado a `NotificationService.create()` |

**Cambio de API:**
```typescript
// Antes (deprecated):
await this.notificationsService.sendNotification({ userId, type, title, message, data });

// Después (consolidado):
await this.notificationService.create({ userId, type, title, message, data, metadata, priority });
```

---

## Fase 5: Verificación de Triggers

### 5.1 Triggers de Misiones

**Hallazgo:** Los triggers 27-29 en `gamification_system` NO están obsoletos.

| Trigger | Archivo Wrapper | Estado |
|---------|-----------------|--------|
| `27-trg_earn_xp_trigger_missions.sql` | `51-mission_trigger_wrappers.sql` | Válido |
| `28-trg_use_comodines_trigger_missions.sql` | `51-mission_trigger_wrappers.sql` | Válido |
| `29-trg_daily_streak_trigger_missions.sql` | `51-mission_trigger_wrappers.sql` | Válido |

**Conclusión:** Las funciones wrapper existen en `gamilit/functions/51-mission_trigger_wrappers.sql`.

---

## Validación Post-Corrección

### Comandos de Verificación

```bash
# Verificar FKs corregidas
grep -r "auth\.profiles" apps/database/ddl/schemas/ --include="*.sql" | grep -v "_deprecated"
# Resultado esperado: 0 coincidencias

# Verificar schema communication en prerequisites
grep "communication" apps/database/ddl/00-prerequisites.sql
# Resultado esperado: CREATE SCHEMA IF NOT EXISTS communication;

# Verificar encoding UTF-8
grep -c "�" apps/database/seeds/prod/gamification_system/*.sql
# Resultado esperado: 0 para todos los archivos

# Verificar deprecación en DDL
grep -l "DEPRECATED" apps/database/ddl/schemas/*/tables/*.sql
# Resultado esperado: 07-user_activity.sql, 08-notifications.sql
```

---

## Archivos Modificados - Resumen

### DDL (apps/database/ddl/)

| Archivo | Tipo de Cambio |
|---------|----------------|
| `00-prerequisites.sql` | Agregado schema communication |
| `schemas/progress_tracking/functions/05-get_classroom_analytics.sql` | FK corregida |
| `schemas/notifications/tables/01-notifications.sql` | FK corregida |
| `schemas/audit_logging/tables/07-user_activity.sql` | Marcado DEPRECATED |
| `schemas/gamification_system/tables/08-notifications.sql` | Marcado DEPRECATED |

### Seeds (apps/database/seeds/prod/)

| Archivo | Tipo de Cambio |
|---------|----------------|
| `gamification_system/04-achievements.sql` | Encoding UTF-8 corregido |
| `gamification_system/07-ml_coins_transactions.sql` | Encoding UTF-8 corregido |
| `gamification_system/08-user_achievements.sql` | Encoding UTF-8 corregido |

### Documentación (apps/database/ddl/schemas/)

| Archivo | Contenido |
|---------|-----------|
| `audit_logging/MIGRATION-DUPLICATE-TABLES.md` | Plan migración activity |
| `gamification_system/MIGRATION-NOTIFICATIONS.md` | Plan migración notifications |

### Backend (apps/backend/src/)

| Archivo | Tipo de Cambio |
|---------|----------------|
| `shared/constants/database.constants.ts` | Agregado ACTIVITY_LOG |
| `modules/admin/entities/activity-log.entity.ts` | Nuevo (renombrado) |
| `modules/admin/entities/index.ts` | Actualizado exports |
| `modules/notifications/entities/notification.entity.ts` | Aviso DEPRECATED |
| `modules/notifications/services/notifications.service.ts` | Aviso DEPRECATED |
| `modules/progress/services/exercise-submission.service.ts` | Migrado a NotificationService |
| `modules/teacher/services/student-risk-alert.service.ts` | Migrado a NotificationService |

---

## Próximos Pasos (Manual)

### Para completar migración de duplicados:

1. **Backend Team:**
   - Revisar y aprobar cambios en entities/services
   - Actualizar tests unitarios para nuevos services
   - Validar en ambiente de staging

2. **Database Team:**
   - Ejecutar recreación de BD para validar DDL
   - Monitorear logs por 48h post-deployment
   - Ejecutar scripts de migración de datos cuando backend esté listo

3. **Limpieza Final (después de 2 sprints):**
   - Eliminar tablas deprecated
   - Remover aliases de compatibilidad

---

## Fase 6: Corrección DB-166 - Trigger explore_modules

### 6.1 Problema Detectado

Durante la recreación de la base de datos se detectaron warnings repetidos:

```
Error in trigger_missions_on_explore_modules: record "new" has no field "modules_explored"
```

### 6.2 Causa Raíz

La función `trigger_missions_on_explore_modules()` referenciaba una columna `modules_explored` que no existe en la tabla `progress_tracking.module_progress`.

### 6.3 Correcciones Aplicadas

| Archivo | Cambio |
|---------|--------|
| `gamilit/functions/51-mission_trigger_wrappers.sql` | Eliminada condición `IF NEW.modules_explored...`, ahora llama directamente a `update_mission_progress()` |
| `progress_tracking/triggers/30-trg_update_missions_on_explore_modules.sql` | Cambiado de `AFTER INSERT OR UPDATE` a `AFTER INSERT` |

### 6.4 Lógica Corregida

```sql
-- ANTES (bug):
IF NEW.modules_explored > COALESCE(OLD.modules_explored, 0) THEN
    PERFORM gamilit.update_mission_progress(NEW.user_id, 'explore_modules', 1);
END IF;

-- DESPUÉS (correcto):
-- Trigger solo se dispara en INSERT (primera interacción con módulo)
PERFORM gamilit.update_mission_progress(NEW.user_id, 'explore_modules', 1);
```

### 6.5 Documentación

- **Análisis detallado:** `ddl/schemas/gamilit/functions/DB-166-ANALISIS-TRIGGER-EXPLORE-MODULES.md`

---

## Referencias

- **Análisis inicial:** Sesión de auditoría 2026-01-04
- **CHANGELOG anterior:** CHANGELOG-CORRECCIONES-2026-01-04.md
- **Directiva DDL-First:** /orchestration/directivas/DIRECTIVA-POLITICA-CARGA-LIMPIA.md
- **Script de creación:** apps/database/create-database.sh

---

**FIN DEL CHANGELOG**
