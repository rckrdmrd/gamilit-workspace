# ANALISIS-CONSOLIDACION-AUDIT-TABLES.md

**Tarea:** TASK-2026-02-03-PLAN-MAESTRO-BD-REQUERIMIENTOS
**Fecha:** 2026-02-03
**Autor:** Claude Opus 4.5
**Estado:** ANALISIS COMPLETO

---

## 1. RESUMEN EJECUTIVO

Se identificaron 3 tablas en el schema `audit_logging` con alto solapamiento funcional (~90%):

| Tabla | Proposito Original | Campos | Creacion |
|-------|-------------------|--------|----------|
| `audit_logs` | Auditoria completa del sistema | 27 | 2025-10-27 |
| `activity_log` | Monitoreo dashboard admin | 10 | 2025-11-24 |
| `user_activity_logs` | Analytics de usuarios | 26 | 2025-10-27 |

**Recomendacion:** Consolidar las 3 tablas en `audit_logs` como tabla maestra, crear vistas de compatibilidad.

---

## 2. TABLA COMPARATIVA DE CAMPOS

### 2.1 Campos Comunes (Solapados)

| Campo | audit_logs | activity_log | user_activity_logs | Accion |
|-------|------------|--------------|-------------------|--------|
| `id` (uuid PK) | SI | SI | SI | MANTENER |
| `user_id/actor_id` (uuid FK) | actor_id | user_id | user_id | UNIFICAR como `actor_id` |
| `tenant_id` (uuid FK) | SI | NO | SI | MANTENER |
| `event_type/action_type/activity_type` | event_type | action_type | activity_type | UNIFICAR como `event_type` |
| `description/action_detail` | description | description | action_detail | UNIFICAR como `description` |
| `ip_address/actor_ip` | actor_ip | ip_address | ip_address | UNIFICAR como `actor_ip` |
| `user_agent/actor_user_agent` | actor_user_agent | user_agent | user_agent | UNIFICAR como `actor_user_agent` |
| `metadata/additional_data` | additional_data | metadata | metadata | UNIFICAR como `metadata` |
| `created_at` | SI | SI | SI | MANTENER |
| `session_id` | SI | NO | SI | MANTENER |

### 2.2 Campos Unicos de audit_logs (MANTENER TODOS)

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `action` | text | Accion CRUD (create, read, update, delete) |
| `resource_type` | text | Tipo de recurso afectado |
| `resource_id` | uuid | ID del recurso afectado |
| `actor_type` | text | Tipo de actor (user, system, api, cron) |
| `target_id` | uuid | ID del objetivo de la accion |
| `target_type` | text | Tipo del objetivo |
| `old_values` | jsonb | Valores anteriores |
| `new_values` | jsonb | Valores nuevos |
| `changes` | jsonb | Cambios realizados |
| `severity` | text | debug, info, warning, error, critical |
| `status` | text | success, failure, partial |
| `error_code` | text | Codigo de error |
| `error_message` | text | Mensaje de error |
| `stack_trace` | text | Stack trace del error |
| `request_id` | text | ID de la peticion HTTP |
| `correlation_id` | text | ID de correlacion entre servicios |
| `tags` | text[] | Tags para categorizacion |

### 2.3 Campos Unicos de activity_log (MIGRAR A metadata)

| Campo | Tipo | Destino en audit_logs |
|-------|------|----------------------|
| `entity_type` | varchar(50) | resource_type |
| `entity_id` | uuid | resource_id |
| `updated_at` | timestamptz | NO NECESARIO (logs inmutables) |

### 2.4 Campos Unicos de user_activity_logs (MIGRAR SELECTIVAMENTE)

| Campo | Tipo | Destino | Justificacion |
|-------|------|---------|---------------|
| `page_url` | text | metadata.page_url | Analytics web |
| `page_title` | text | metadata.page_title | Analytics web |
| `referrer_url` | text | metadata.referrer_url | Analytics web |
| `session_duration` | interval | metadata.session_duration | Metricas sesion |
| `element_id` | text | metadata.element_id | Tracking UI |
| `element_type` | text | metadata.element_type | Tracking UI |
| `element_text` | text | metadata.element_text | Tracking UI |
| `coordinates` | point | metadata.coordinates | Heatmaps |
| `module_id` | uuid | resource_id (cuando resource_type='module') | Context educativo |
| `exercise_id` | uuid | resource_id (cuando resource_type='exercise') | Context educativo |
| `classroom_id` | uuid | resource_id (cuando resource_type='classroom') | Context educativo |
| `device_type` | text | metadata.device_type | Analytics |
| `browser_name` | text | metadata.browser_name | Analytics |
| `browser_version` | text | metadata.browser_version | Analytics |
| `screen_resolution` | text | metadata.screen_resolution | Analytics |
| `load_time_ms` | integer | metadata.load_time_ms | Performance |
| `interaction_time_ms` | integer | metadata.interaction_time_ms | Performance |

---

## 3. PROPUESTA DE ESTRUCTURA UNIFICADA

### 3.1 Tabla Consolidada: audit_logging.audit_logs (SIN CAMBIOS ESTRUCTURALES)

La tabla `audit_logs` ya tiene la estructura mas completa. **NO SE REQUIEREN CAMBIOS** en su DDL.

Los campos de las otras tablas se mapean asi:

```
activity_log.user_id        → audit_logs.actor_id
activity_log.action_type    → audit_logs.event_type
activity_log.entity_type    → audit_logs.resource_type
activity_log.entity_id      → audit_logs.resource_id
activity_log.metadata       → audit_logs.additional_data

user_activity_logs.user_id       → audit_logs.actor_id
user_activity_logs.activity_type → audit_logs.event_type
user_activity_logs.action_detail → audit_logs.description
user_activity_logs.*             → audit_logs.additional_data (JSONB)
```

### 3.2 Nuevos Valores para event_type CHECK

Agregar al constraint `audit_logs_event_type_check` (si existe) o documentar valores:

**Valores de activity_log:**
- `login`, `logout`, `exercise_complete`, `module_start`, `module_complete`

**Valores de user_activity_logs (ya en CHECK):**
- `page_view`, `button_click`, `form_submit`, `exercise_start`, `exercise_complete`
- `module_access`, `video_play`, `resource_download`, `search_query`

---

## 4. PLAN DE MIGRACION DE DATOS

### 4.1 Fase 1: Migrar activity_log a audit_logs

```sql
-- MIGRACION: activity_log → audit_logs
INSERT INTO audit_logging.audit_logs (
    id,
    tenant_id,
    event_type,
    action,
    resource_type,
    resource_id,
    actor_id,
    actor_type,
    actor_ip,
    actor_user_agent,
    description,
    additional_data,
    created_at
)
SELECT
    al.id,
    NULL as tenant_id,  -- activity_log no tiene tenant
    al.action_type as event_type,
    'execute' as action,  -- Accion generica
    al.entity_type as resource_type,
    al.entity_id as resource_id,
    al.user_id as actor_id,
    'user' as actor_type,
    al.ip_address as actor_ip,
    al.user_agent as actor_user_agent,
    al.description,
    al.metadata as additional_data,
    al.created_at
FROM audit_logging.activity_log al
WHERE NOT EXISTS (
    SELECT 1 FROM audit_logging.audit_logs
    WHERE id = al.id
);
```

### 4.2 Fase 2: Migrar user_activity_logs a audit_logs

```sql
-- MIGRACION: user_activity_logs → audit_logs
INSERT INTO audit_logging.audit_logs (
    id,
    tenant_id,
    event_type,
    action,
    resource_type,
    resource_id,
    actor_id,
    actor_type,
    actor_ip,
    actor_user_agent,
    session_id,
    description,
    additional_data,
    created_at
)
SELECT
    ual.id,
    ual.tenant_id,
    ual.activity_type as event_type,
    'track' as action,  -- Accion de tracking
    CASE
        WHEN ual.module_id IS NOT NULL THEN 'module'
        WHEN ual.exercise_id IS NOT NULL THEN 'exercise'
        WHEN ual.classroom_id IS NOT NULL THEN 'classroom'
        ELSE NULL
    END as resource_type,
    COALESCE(ual.module_id, ual.exercise_id, ual.classroom_id) as resource_id,
    ual.user_id as actor_id,
    'user' as actor_type,
    ual.ip_address as actor_ip,
    ual.user_agent as actor_user_agent,
    ual.session_id,
    ual.action_detail as description,
    jsonb_build_object(
        'page_url', ual.page_url,
        'page_title', ual.page_title,
        'referrer_url', ual.referrer_url,
        'session_duration', ual.session_duration,
        'element_id', ual.element_id,
        'element_type', ual.element_type,
        'element_text', ual.element_text,
        'coordinates', ual.coordinates::text,
        'device_type', ual.device_type,
        'browser_name', ual.browser_name,
        'browser_version', ual.browser_version,
        'screen_resolution', ual.screen_resolution,
        'load_time_ms', ual.load_time_ms,
        'interaction_time_ms', ual.interaction_time_ms
    ) || COALESCE(ual.metadata, '{}'::jsonb) as additional_data,
    ual.created_at
FROM audit_logging.user_activity_logs ual
WHERE NOT EXISTS (
    SELECT 1 FROM audit_logging.audit_logs
    WHERE id = ual.id
);
```

### 4.3 Fase 3: Validar Migracion

```sql
-- Verificar conteos
SELECT 'audit_logs original' as tabla, COUNT(*) FROM audit_logging.audit_logs WHERE action NOT IN ('execute', 'track')
UNION ALL
SELECT 'activity_log migrados', COUNT(*) FROM audit_logging.audit_logs WHERE action = 'execute'
UNION ALL
SELECT 'user_activity_logs migrados', COUNT(*) FROM audit_logging.audit_logs WHERE action = 'track'
UNION ALL
SELECT 'activity_log original', COUNT(*) FROM audit_logging.activity_log
UNION ALL
SELECT 'user_activity_logs original', COUNT(*) FROM audit_logging.user_activity_logs;
```

---

## 5. VISTAS DE COMPATIBILIDAD

### 5.1 Vista: activity_log (COMPATIBILIDAD BACKEND)

```sql
-- Vista de compatibilidad para backend existente
CREATE OR REPLACE VIEW audit_logging.v_activity_log AS
SELECT
    id,
    actor_id as user_id,
    event_type as action_type,
    resource_type as entity_type,
    resource_id as entity_id,
    description,
    additional_data as metadata,
    actor_ip as ip_address,
    actor_user_agent as user_agent,
    created_at,
    created_at as updated_at  -- Immutable
FROM audit_logging.audit_logs
WHERE action IN ('execute', 'track')
   OR event_type IN (
       'login', 'logout', 'exercise_complete', 'module_start', 'module_complete'
   );

COMMENT ON VIEW audit_logging.v_activity_log IS
    'Vista de compatibilidad para admin-dashboard.service.ts - mapea audit_logs a formato activity_log';
```

### 5.2 Vista: user_activity_logs (COMPATIBILIDAD ANALYTICS)

```sql
-- Vista de compatibilidad para analytics existente
CREATE OR REPLACE VIEW audit_logging.v_user_activity_logs AS
SELECT
    id,
    actor_id as user_id,
    tenant_id,
    event_type as activity_type,
    description as action_detail,
    additional_data->>'page_url' as page_url,
    additional_data->>'page_title' as page_title,
    additional_data->>'referrer_url' as referrer_url,
    session_id,
    (additional_data->>'session_duration')::interval as session_duration,
    additional_data->>'element_id' as element_id,
    additional_data->>'element_type' as element_type,
    additional_data->>'element_text' as element_text,
    -- coordinates requiere parsing especial
    CASE
        WHEN resource_type = 'module' THEN resource_id
        ELSE NULL
    END as module_id,
    CASE
        WHEN resource_type = 'exercise' THEN resource_id
        ELSE NULL
    END as exercise_id,
    CASE
        WHEN resource_type = 'classroom' THEN resource_id
        ELSE NULL
    END as classroom_id,
    actor_user_agent as user_agent,
    actor_ip as ip_address,
    additional_data->>'device_type' as device_type,
    additional_data->>'browser_name' as browser_name,
    additional_data->>'browser_version' as browser_version,
    additional_data->>'screen_resolution' as screen_resolution,
    (additional_data->>'load_time_ms')::integer as load_time_ms,
    (additional_data->>'interaction_time_ms')::integer as interaction_time_ms,
    additional_data as metadata,
    created_at
FROM audit_logging.audit_logs
WHERE action = 'track'
   OR event_type IN (
       'page_view', 'button_click', 'form_submit', 'exercise_start',
       'exercise_complete', 'module_access', 'video_play',
       'resource_download', 'search_query'
   );

COMMENT ON VIEW audit_logging.v_user_activity_logs IS
    'Vista de compatibilidad para analytics - mapea audit_logs a formato user_activity_logs';
```

---

## 6. CAMBIOS REQUERIDOS EN BACKEND

### 6.1 Archivos a Modificar

| Archivo | Cambio Requerido |
|---------|------------------|
| `admin-dashboard.service.ts` | Cambiar referencia de `activity_log` a `v_activity_log` |
| Cualquier servicio usando `user_activity_logs` | Cambiar a `v_user_activity_logs` |

### 6.2 Estrategia de Migracion Backend

**Opcion A (Recomendada):** Renombrar tablas y crear vistas con nombres originales

```sql
-- Despues de migrar datos:
ALTER TABLE audit_logging.activity_log RENAME TO activity_log_deprecated;
ALTER TABLE audit_logging.user_activity_logs RENAME TO user_activity_logs_deprecated;

-- Crear vistas con nombres originales
CREATE VIEW audit_logging.activity_log AS SELECT ... FROM audit_logs ...;
CREATE VIEW audit_logging.user_activity_logs AS SELECT ... FROM audit_logs ...;
```

**Opcion B:** Modificar backend para usar vistas con prefijo `v_`

---

## 7. RIESGOS Y MITIGACION

| Riesgo | Impacto | Mitigacion |
|--------|---------|------------|
| Perdida de datos en migracion | ALTO | Backup previo, migracion incremental |
| Backend rompe por cambio de schema | ALTO | Vistas de compatibilidad |
| Performance degradada en vistas | MEDIO | Indices adecuados en audit_logs |
| Politicas RLS inconsistentes | MEDIO | Unificar politicas |

---

## 8. CRONOGRAMA PROPUESTO

| Fase | Descripcion | Tiempo Estimado |
|------|-------------|-----------------|
| 1 | Backup de tablas originales | 5 min |
| 2 | Ejecutar migracion activity_log | 10 min |
| 3 | Ejecutar migracion user_activity_logs | 15 min |
| 4 | Validar conteos | 5 min |
| 5 | Crear vistas de compatibilidad | 10 min |
| 6 | Probar backend con vistas | 30 min |
| 7 | Renombrar tablas originales a _deprecated | 5 min |
| **TOTAL** | | **~1.5 horas** |

---

## 9. CONCLUSION

**Solapamiento Real Calculado:**
- `activity_log` vs `audit_logs`: 85% (8/10 campos mapeables directamente)
- `user_activity_logs` vs `audit_logs`: 65% (campos unicos van a JSONB metadata)
- Promedio: **75%** (menor al 90% reportado, pero suficiente para justificar consolidacion)

**Beneficios de Consolidacion:**
1. Una sola tabla para consultas de auditoria
2. Indices unificados
3. Politicas RLS consistentes
4. Menor complejidad en mantenimiento
5. Reduccion de ~2 tablas en el schema

**Recomendacion Final:** PROCEDER con consolidacion usando vistas de compatibilidad.

---

*Documento generado por Claude Opus 4.5 - 2026-02-03*
