# PLAN DE CONSOLIDACIÓN DE BASE DE DATOS - GAMILIT
## Fecha: 2026-01-07
## Autor: Claude Code (Arquitecto de Datos)
## Estado: BORRADOR PARA APROBACIÓN

---

## RESUMEN EJECUTIVO

Este plan aborda la consolidación de objetos duplicados en la base de datos del proyecto GAMILIT, identificados durante el análisis exhaustivo de la FASE 1 y FASE 2.

### Métricas Clave

| Métrica | Actual | Objetivo | Mejora |
|---------|--------|----------|--------|
| Líneas duplicadas | 2,400+ | ~400 | -83% |
| Archivos duplicados | 52+ | 15 | -71% |
| ENUMs mal ubicados | 22 | 0 | -100% |
| Tablas redundantes | 2 | 1 | -50% |
| Funciones duplicadas | 8 | 1 (consolidada) | ✅ Ya hecho |

---

## FASE 1: CONSOLIDACIÓN DE TRIGGERS updated_at

### 1.1 Estado Actual
- **22 triggers** idénticos distribuidos en 8 esquemas
- **1 función** centralizada: `gamilit.update_updated_at_column()`
- **410 líneas** de código en 22 archivos separados

### 1.2 Objetivo
- Consolidar en **8 archivos** (uno por esquema)
- Mantener compatibilidad total
- Reducir a **~150 líneas** totales

### 1.3 Archivos a Consolidar

#### Esquema: audit_logging (1 trigger → 1 archivo)
```
ANTES:
├── triggers/01-trg_system_alerts_updated_at.sql

DESPUÉS:
├── triggers/00-batch_updated_at_triggers.sql (1 trigger)
```

#### Esquema: auth_management (4 triggers → 1 archivo)
```
ANTES:
├── triggers/02-trg_memberships_updated_at.sql
├── triggers/05-trg_profiles_updated_at.sql
├── triggers/06-trg_tenants_updated_at.sql
├── triggers/07-trg_user_roles_updated_at.sql

DESPUÉS:
├── triggers/00-batch_updated_at_triggers.sql (4 triggers)
```

#### Esquema: content_management (3 triggers → 1 archivo)
```
ANTES:
├── triggers/08-trg_content_templates_updated_at.sql
├── triggers/09-trg_marie_curie_content_updated_at.sql
├── triggers/10-trg_media_files_updated_at.sql

DESPUÉS:
├── triggers/00-batch_updated_at_triggers.sql (3 triggers)
```

#### Esquema: educational_content (4 triggers → 1 archivo)
```
ANTES:
├── triggers/11-trg_assessment_rubrics_updated_at.sql
├── triggers/12-trg_exercises_updated_at.sql
├── triggers/13-trg_media_resources_updated_at.sql
├── triggers/14-trg_modules_updated_at.sql

DESPUÉS:
├── triggers/00-batch_updated_at_triggers.sql (4 triggers)
```

#### Esquema: gamification_system (6 triggers → 1 archivo)
```
ANTES:
├── triggers/15-trg_achievements_updated_at.sql
├── triggers/16-trg_comodines_inventory_updated_at.sql
├── triggers/17-missions_updated_at.sql
├── triggers/18-notifications_updated_at.sql
├── triggers/19-trg_user_ranks_updated_at.sql
├── triggers/20-trg_user_stats_updated_at.sql

DESPUÉS:
├── triggers/00-batch_updated_at_triggers.sql (6 triggers)
```

#### Esquema: progress_tracking (2 triggers → 1 archivo + 1 especial)
```
ANTES:
├── triggers/20-exercise_submissions_updated_at.sql (ESPECIAL)
├── triggers/23-trg_module_progress_updated_at.sql
├── triggers/32-trg_certificates_updated_at.sql

DESPUÉS:
├── triggers/00-batch_updated_at_triggers.sql (2 triggers)
├── triggers/20-exercise_submissions_updated_at.sql (MANTENER - usa función específica)
```

#### Esquema: social_features (5 triggers → 1 archivo)
```
ANTES:
├── triggers/24-trg_classroom_members_updated_at.sql
├── triggers/26-trg_classrooms_updated_at.sql
├── triggers/27-trg_schools_updated_at.sql
├── triggers/28-trg_teams_updated_at.sql
├── triggers/29-trg_teacher_reports_updated_at.sql

DESPUÉS:
├── triggers/00-batch_updated_at_triggers.sql (5 triggers)
```

#### Esquema: system_configuration (2 triggers → 1 archivo)
```
ANTES:
├── triggers/29-trg_feature_flags_updated_at.sql
├── triggers/30-trg_system_settings_updated_at.sql

DESPUÉS:
├── triggers/00-batch_updated_at_triggers.sql (2 triggers)
```

### 1.4 Formato Estándar del Archivo Consolidado

```sql
-- =====================================================
-- Archivo: 00-batch_updated_at_triggers.sql
-- Schema: <SCHEMA_NAME>
-- Descripción: Triggers de actualización automática de updated_at
-- Función: gamilit.update_updated_at_column()
-- Última actualización: 2026-01-07
-- =====================================================

-- =====================================================
-- TRIGGERS DE ACTUALIZACIÓN DE TIMESTAMP
-- =====================================================

-- Tabla: <schema>.<table1>
DROP TRIGGER IF EXISTS trg_<table1>_updated_at ON <schema>.<table1>;
CREATE TRIGGER trg_<table1>_updated_at
    BEFORE UPDATE ON <schema>.<table1>
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();

COMMENT ON TRIGGER trg_<table1>_updated_at ON <schema>.<table1>
    IS 'Actualiza updated_at automáticamente en cada UPDATE';

-- Tabla: <schema>.<table2>
DROP TRIGGER IF EXISTS trg_<table2>_updated_at ON <schema>.<table2>;
CREATE TRIGGER trg_<table2>_updated_at
    BEFORE UPDATE ON <schema>.<table2>
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();

COMMENT ON TRIGGER trg_<table2>_updated_at ON <schema>.<table2>
    IS 'Actualiza updated_at automáticamente en cada UPDATE';

-- ... más triggers ...
```

### 1.5 Impacto
- **Reducción:** 22 archivos → 9 archivos (8 consolidados + 1 especial)
- **Líneas:** 410 → ~150 (-63%)
- **Riesgo:** BAJO (solo reorganización, misma lógica)

---

## FASE 2: MIGRACIÓN DE ENUMs A SCHEMAS CORRECTOS

### 2.1 Estado Actual
- **22 ENUMs** definidos en `00-prerequisites.sql`
- Violan política de Carga Limpia (DB-111)
- Dificultan mantenimiento y auditoría

### 2.2 Objetivo
- Mover cada ENUM a archivo específico en su schema
- Crear estructura de directorios `enums/` donde no exista
- Mantener compatibilidad total

### 2.3 Plan de Migración por Prioridad

#### PRIORIDAD 1: ENUMs Críticos (Impacto Alto)

| ENUM | Schema Destino | Archivo | Dependencias |
|------|---------------|---------|--------------|
| gamilit_role | auth_management | enums/gamilit_role.sql | 13+ |
| maya_rank | gamification_system | enums/maya_rank.sql | 11+ |
| exercise_type | educational_content | enums/exercise_type.sql | 8+ |

#### PRIORIDAD 2: ENUMs Educativos

| ENUM | Schema Destino | Archivo |
|------|---------------|---------|
| module_status | educational_content | enums/module_status.sql |
| cognitive_level | educational_content | enums/cognitive_level.sql |

#### PRIORIDAD 3: ENUMs de Gamificación

| ENUM | Schema Destino | Archivo |
|------|---------------|---------|
| achievement_category | gamification_system | enums/achievement_category.sql |
| achievement_type | gamification_system | enums/achievement_type.sql |
| comodin_type | gamification_system | enums/comodin_type.sql |
| shop_item_category | gamification_system | enums/shop_item_category.sql |

#### PRIORIDAD 4: ENUMs de Autenticación

| ENUM | Schema Destino | Archivo |
|------|---------------|---------|
| user_status | auth_management | enums/user_status.sql |
| auth_provider | auth_management | enums/auth_provider.sql |

#### PRIORIDAD 5: ENUMs Sociales

| ENUM | Schema Destino | Archivo |
|------|---------------|---------|
| classroom_role | social_features | enums/classroom_role.sql |
| team_role | social_features | enums/team_role.sql |
| friendship_status | social_features | enums/friendship_status.sql |

#### PRIORIDAD 6: ENUMs de Contenido

| ENUM | Schema Destino | Archivo |
|------|---------------|---------|
| media_type | content_management | enums/media_type.sql |
| processing_status | content_management | enums/processing_status.sql |

#### PRIORIDAD 7: ENUMs de Sistema

| ENUM | Schema Destino | Archivo |
|------|---------------|---------|
| setting_type | system_configuration | enums/setting_type.sql |
| attempt_status | progress_tracking | enums/attempt_status.sql |

#### PRIORIDAD 8: ENUMs de Auditoría

| ENUM | Schema Destino | Archivo |
|------|---------------|---------|
| log_level | audit_logging | enums/log_level.sql |
| audit_action | audit_logging | enums/audit_action.sql |
| alert_severity | audit_logging | enums/alert_severity.sql |
| alert_status | audit_logging | enums/alert_status.sql |

### 2.4 Directorios a Crear

```bash
mkdir -p apps/database/ddl/schemas/auth_management/enums
mkdir -p apps/database/ddl/schemas/system_configuration/enums
```

### 2.5 Formato Estándar de Archivo ENUM

```sql
-- =====================================================
-- ENUM: <schema>.<enum_name>
-- Descripción: <descripción del enum>
-- Migrado de: 00-prerequisites.sql
-- Fecha de migración: 2026-01-07
-- =====================================================

DO $$ BEGIN
    CREATE TYPE <schema>.<enum_name> AS ENUM (
        'valor1',
        'valor2',
        'valor3'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

COMMENT ON TYPE <schema>.<enum_name> IS '<descripción>';
```

### 2.6 Impacto
- **Archivos nuevos:** 22
- **Directorios nuevos:** 2
- **Archivo modificado:** 00-prerequisites.sql (eliminar definiciones duplicadas)
- **Riesgo:** MEDIO (requiere validación de referencias)

---

## FASE 3: ELIMINACIÓN DE TABLA DUPLICADA notifications

### 3.1 Estado Actual
- **gamification_system.notifications** - DEPRECADA (desde 2025-01-04)
- **notifications.notifications** - CANÓNICA (sistema moderno)
- Triggers de gamificación YA migrados a usar tabla canónica

### 3.2 Plan de Eliminación

#### Paso 1: Verificar Migración Completa de Datos
```sql
-- Contar registros legacy pendientes de migrar
SELECT COUNT(*) as legacy_pendientes
FROM gamification_system.notifications n
WHERE n.id NOT IN (SELECT id FROM notifications.notifications);
```

#### Paso 2: Script de Migración de Datos Legacy
```sql
INSERT INTO notifications.notifications (
    id, user_id, type, title, message, data, priority,
    status, read_at, created_at, metadata, channels
)
SELECT
    n.id,
    n.user_id,
    CASE n.type::TEXT
        WHEN 'achievement_unlocked' THEN 'achievement'
        WHEN 'mission_completed' THEN 'mission'
        WHEN 'friend_request' THEN 'social'
        WHEN 'message_received' THEN 'social'
        WHEN 'guild_invitation' THEN 'social'
        WHEN 'system_announcement' THEN 'system'
        ELSE 'gamification'
    END,
    n.title,
    n.message,
    COALESCE(n.data, '{}'),
    CASE n.priority::TEXT
        WHEN 'medium' THEN 'normal'
        WHEN 'critical' THEN 'urgent'
        ELSE n.priority::TEXT
    END,
    CASE WHEN n.read THEN 'read' ELSE 'pending' END,
    CASE WHEN n.read THEN n.created_at ELSE NULL END,
    n.created_at,
    '{}'::jsonb,
    ARRAY['in_app']::varchar[]
FROM gamification_system.notifications n
ON CONFLICT (id) DO NOTHING;
```

#### Paso 3: Crear RLS Policies en notifications.notifications
```sql
-- Crear policies equivalentes
CREATE POLICY notifications_read_own ON notifications.notifications
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY notifications_update_own ON notifications.notifications
    FOR UPDATE
    USING (user_id = auth.uid());
```

#### Paso 4: Validación
```sql
-- Verificar conteos coinciden
SELECT
    (SELECT COUNT(*) FROM gamification_system.notifications) as legacy,
    (SELECT COUNT(*) FROM notifications.notifications) as nuevo;
```

#### Paso 5: Eliminación (después de 2 sprints de validación)
```sql
-- Eliminar tabla deprecada
DROP TABLE IF EXISTS gamification_system.notifications CASCADE;

-- Eliminar ENUMs huérfanos
DROP TYPE IF EXISTS gamification_system.notification_type CASCADE;
DROP TYPE IF EXISTS gamification_system.notification_priority CASCADE;
```

### 3.3 Impacto
- **Tablas eliminadas:** 1
- **ENUMs eliminados:** 2
- **Archivos eliminados:** ~5 (tabla, RLS, índices, triggers, enums)
- **Riesgo:** MEDIO (requiere validación exhaustiva)

---

## FASE 4: LIMPIEZA DE FUNCIONES DEPRECATED

### 4.1 Funciones a Eliminar

#### Ya Consolidadas (en _deprecated/)
```
gamilit/functions/_deprecated/
├── 17-update_missions_on_exercise_complete.sql
├── 19-update_missions_on_correct_streak.sql
├── 21-update_missions_on_use_comodines.sql
├── 22-update_missions_on_earn_xp.sql
├── 23-update_missions_on_daily_streak.sql
├── 24-update_missions_on_perfect_scores.sql
├── 25-update_missions_on_complete_modules.sql
└── 26-update_missions_on_explore_modules.sql

gamification_system/functions/_deprecated/
├── 06-update_missions_updated_at.sql
└── 07-update_notifications_updated_at.sql
```

### 4.2 Acciones
1. Verificar que NO hay triggers usando estas funciones
2. Eliminar archivos de _deprecated/ después de validación
3. Actualizar inventarios de funciones

---

## CRONOGRAMA DE EJECUCIÓN

### Semana 1: Preparación y FASE 1
| Día | Actividad | Responsable | Riesgo |
|-----|-----------|-------------|--------|
| L | Crear directorios faltantes | DevOps | Bajo |
| L | Backup completo de BD | DBA | Bajo |
| M | Consolidar triggers audit_logging | Dev | Bajo |
| M | Consolidar triggers auth_management | Dev | Bajo |
| Mi | Consolidar triggers content_management | Dev | Bajo |
| Mi | Consolidar triggers educational_content | Dev | Bajo |
| J | Consolidar triggers gamification_system | Dev | Bajo |
| J | Consolidar triggers progress_tracking | Dev | Bajo |
| V | Consolidar triggers social_features | Dev | Bajo |
| V | Consolidar triggers system_configuration | Dev | Bajo |

### Semana 2: FASE 2 (ENUMs)
| Día | Actividad | Responsable | Riesgo |
|-----|-----------|-------------|--------|
| L | Migrar ENUMs PRIORIDAD 1 (críticos) | Dev | Medio |
| M | Migrar ENUMs PRIORIDAD 2-3 | Dev | Medio |
| Mi | Migrar ENUMs PRIORIDAD 4-5 | Dev | Bajo |
| J | Migrar ENUMs PRIORIDAD 6-8 | Dev | Bajo |
| V | Validar todas las migraciones | QA | N/A |

### Semana 3: FASE 3-4 (Notificaciones + Limpieza)
| Día | Actividad | Responsable | Riesgo |
|-----|-----------|-------------|--------|
| L | Migrar datos notificaciones | DBA | Medio |
| M | Crear RLS policies | Dev | Bajo |
| Mi | Validación exhaustiva | QA | N/A |
| J | Eliminar funciones deprecated | Dev | Bajo |
| V | Documentar cambios | Tech Writer | N/A |

### Semana 4: Validación y Cierre
| Día | Actividad | Responsable | Riesgo |
|-----|-----------|-------------|--------|
| L-Mi | Validación en staging | QA | N/A |
| J | Actualizar inventarios | Dev | N/A |
| V | Documentación final | Tech Writer | N/A |

---

## VALIDACIONES REQUERIDAS

### Pre-Ejecución
- [ ] Backup completo de base de datos
- [ ] Snapshot de ambiente staging
- [ ] Notificar al equipo de desarrollo
- [ ] Freeze de cambios en DDL

### Durante Ejecución
- [ ] Ejecutar cada script en staging primero
- [ ] Validar con `\dt`, `\df`, `\dT` en psql
- [ ] Verificar logs de errores
- [ ] Confirmar funcionalidad de aplicación

### Post-Ejecución
- [ ] Ejecutar suite de tests
- [ ] Verificar endpoints de API
- [ ] Confirmar flujos de usuario críticos
- [ ] Actualizar documentación de inventarios

---

## RIESGOS Y MITIGACIÓN

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Dependencia no detectada | Media | Alto | Análisis exhaustivo de dependencias |
| Conflicto de nombres ENUM | Baja | Medio | Usar `CREATE TYPE IF NOT EXISTS` |
| Pérdida de datos notificaciones | Baja | Alto | Backup + Script de migración |
| Regresión funcional | Media | Medio | Tests automatizados en staging |
| Tiempo de downtime | Baja | Bajo | Ejecución en ventana de mantenimiento |

---

## MÉTRICAS DE ÉXITO

### Cuantitativas
- [ ] 0 errores de sintaxis SQL en producción
- [ ] 100% de tests pasando post-migración
- [ ] Reducción de 80%+ en líneas duplicadas
- [ ] 0 ENUMs en schema public

### Cualitativas
- [ ] Documentación actualizada y completa
- [ ] Inventarios reflejando estado real
- [ ] Arquitectura alineada con políticas

---

## APROBACIONES REQUERIDAS

| Rol | Nombre | Fecha | Firma |
|-----|--------|-------|-------|
| Tech Lead | __________ | ____/____/2026 | ______ |
| DBA | __________ | ____/____/2026 | ______ |
| QA Lead | __________ | ____/____/2026 | ______ |
| Product Owner | __________ | ____/____/2026 | ______ |

---

## ANEXOS

### Anexo A: Reporte Completo de Triggers
Ver: `REPORTE-TRIGGERS-UPDATED_AT-2026-01-07.md`

### Anexo B: Reporte Completo de Funciones Misiones
Ver: `REPORTE-FUNCIONES-MISIONES-2026-01-07.md`

### Anexo C: Reporte de ENUMs
Ver: `REPORTE-ENUMS-MIGRACION-2026-01-07.md`

### Anexo D: Reporte de Notificaciones Duplicadas
Ver: `REPORTE-NOTIFICACIONES-DUPLICADAS-2026-01-07.md`

---

**FIN DEL PLAN DE CONSOLIDACIÓN**

*Generado por Claude Code - Arquitecto de Datos*
*Fecha: 2026-01-07*
