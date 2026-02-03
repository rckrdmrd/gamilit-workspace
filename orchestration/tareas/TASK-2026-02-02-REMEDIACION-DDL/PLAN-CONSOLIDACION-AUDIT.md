# PLAN-CONSOLIDACION-AUDIT.md
# Consolidación de Tablas de Auditoría/Actividad

**Tarea:** TASK-2026-02-02-REMEDIACION-DDL
**Fase:** P2-A
**Prioridad:** P2
**Esfuerzo Estimado:** 8 horas (3 sprints)
**Fecha:** 2026-02-02

---

## 1. PROBLEMA IDENTIFICADO

### 1.1 Tablas Redundantes Encontradas

| Tabla | Schema | Columnas | Propósito | Redundancia |
|-------|--------|----------|-----------|-------------|
| audit_logs | audit_logging | 41 | Auditoría completa | BASE |
| system_logs | audit_logging | 26 | Logs de sistema | 70% overlap |
| user_activity_logs | audit_logging | 28 | Analytics frontend | 65% overlap |
| activity_log | audit_logging | 9 | Dashboard admin | 75% overlap |
| security_events | auth_management | 9 | Eventos seguridad | 50% overlap |

### 1.2 Impacto Actual

- **Storage:** ~5x redundancia en datos de auditoría
- **Mantenimiento:** 5 tablas que mantener
- **Queries:** Deben elegir entre 5 fuentes
- **Consistencia:** Riesgo de datos divergentes

---

## 2. SOLUCIÓN PROPUESTA

### 2.1 Tabla Unificada: unified_audit_log

```sql
CREATE TABLE audit_logging.unified_audit_log (
    -- PRIMARY
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT gamilit.now_mexico(),

    -- CLASSIFICATION
    event_category TEXT CHECK (event_category IN
        ('audit', 'system_error', 'user_activity', 'security')),
    event_type TEXT NOT NULL,
    action TEXT,
    severity TEXT CHECK (severity IN
        ('debug', 'info', 'warning', 'error', 'critical')),
    status TEXT CHECK (status IN ('success', 'failure', 'partial')),

    -- ACTOR
    actor_id UUID,
    actor_type TEXT DEFAULT 'user',
    actor_ip INET,
    actor_user_agent TEXT,
    session_id TEXT,
    request_id TEXT,
    correlation_id TEXT,

    -- RESOURCE
    resource_type TEXT,
    resource_id UUID,
    target_type TEXT,
    target_id UUID,
    description TEXT,

    -- CHANGES (para event_category='audit')
    old_values JSONB,
    new_values JSONB,
    changes JSONB,

    -- ERRORS (para event_category='system_error')
    error_code TEXT,
    error_message TEXT,
    stack_trace TEXT,
    exception_type TEXT,

    -- PERFORMANCE
    execution_time_ms INTEGER,
    validation_duration_ms INTEGER,
    load_time_ms INTEGER,

    -- ENVIRONMENT (para system_error)
    environment TEXT,
    server_name TEXT,
    module_name TEXT,
    function_name TEXT,
    line_number INTEGER,
    file_path TEXT,

    -- FRONTEND ANALYTICS (para user_activity)
    page_url TEXT,
    page_title TEXT,
    element_id TEXT,
    element_type TEXT,
    device_type TEXT,
    browser_name TEXT,
    screen_resolution TEXT,
    module_id UUID,
    exercise_id UUID,
    classroom_id UUID,

    -- FLEXIBLE
    metadata JSONB,
    tags TEXT[],

    -- CONSTRAINTS
    FOREIGN KEY (actor_id) REFERENCES auth_management.profiles(id),
    FOREIGN KEY (tenant_id) REFERENCES auth_management.tenants(id) ON DELETE CASCADE
);
```

### 2.2 Índices Recomendados

```sql
CREATE INDEX idx_unified_audit_created ON unified_audit_log(created_at DESC);
CREATE INDEX idx_unified_audit_actor ON unified_audit_log(actor_id);
CREATE INDEX idx_unified_audit_category ON unified_audit_log(event_category, event_type);
CREATE INDEX idx_unified_audit_errors ON unified_audit_log(event_category, severity)
    WHERE event_category = 'system_error' AND severity IN ('error', 'critical');
CREATE INDEX idx_unified_audit_resource ON unified_audit_log(resource_type, resource_id);
CREATE INDEX idx_unified_audit_correlation ON unified_audit_log(correlation_id);
CREATE INDEX idx_unified_audit_metadata ON unified_audit_log USING gin(metadata);
```

### 2.3 Vistas de Compatibilidad

```sql
-- Vista para auditoría
CREATE VIEW audit_logging.audit_events AS
SELECT * FROM unified_audit_log WHERE event_category = 'audit';

-- Vista para errores de sistema
CREATE VIEW audit_logging.system_errors AS
SELECT * FROM unified_audit_log WHERE event_category = 'system_error';

-- Vista para analytics
CREATE VIEW audit_logging.user_analytics AS
SELECT * FROM unified_audit_log WHERE event_category = 'user_activity';

-- Vista para seguridad
CREATE VIEW audit_logging.security_audit AS
SELECT * FROM unified_audit_log WHERE event_category = 'security';

-- Vista admin dashboard (reemplaza recent_activity)
CREATE VIEW admin_dashboard.recent_activity_v2 AS
SELECT
    id, actor_id, event_type, resource_type, resource_id,
    description, metadata, actor_ip, actor_user_agent, created_at
FROM unified_audit_log
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

---

## 3. PLAN DE MIGRACIÓN

### 3.1 Fase A: Preparación (Sprint 1)

| Paso | Descripción | Esfuerzo |
|------|-------------|----------|
| A.1 | Crear tabla unified_audit_log | 30 min |
| A.2 | Crear índices | 15 min |
| A.3 | Crear vistas de compatibilidad | 30 min |
| A.4 | Crear RLS policies | 45 min |
| A.5 | Testing de esquema | 1 hora |

### 3.2 Fase B: ETL de Datos Históricos (Sprint 2)

```sql
-- Migrar audit_logs
INSERT INTO unified_audit_log (
    id, tenant_id, created_at, event_category, event_type, action,
    severity, status, actor_id, actor_ip, actor_user_agent,
    session_id, request_id, correlation_id, resource_type, resource_id,
    target_type, target_id, description, old_values, new_values, changes,
    error_code, error_message, stack_trace, metadata, tags
)
SELECT
    id, tenant_id, created_at, 'audit', event_type, action,
    severity, status, actor_id, actor_ip, actor_user_agent,
    session_id, request_id, correlation_id, resource_type, resource_id,
    target_type, target_id, description, old_values, new_values, changes,
    error_code, error_message, stack_trace, additional_data, tags
FROM audit_logging.audit_logs;

-- Migrar system_logs (similar para las otras tablas)
-- Migrar user_activity_logs
-- Migrar activity_log
-- Migrar security_events
```

| Paso | Descripción | Esfuerzo |
|------|-------------|----------|
| B.1 | Script ETL audit_logs | 1 hora |
| B.2 | Script ETL system_logs | 1 hora |
| B.3 | Script ETL user_activity_logs | 1 hora |
| B.4 | Script ETL activity_log | 30 min |
| B.5 | Script ETL security_events | 30 min |
| B.6 | Validación de integridad | 2 horas |

### 3.3 Fase C: Actualización de Backend (Sprint 2-3)

| Archivo | Cambio |
|---------|--------|
| audit.service.ts | Usar unified_audit_log |
| admin-dashboard.service.ts | Usar vista recent_activity_v2 |
| security.service.ts | Usar vista security_audit |
| logger.service.ts | Usar unified_audit_log |

### 3.4 Fase D: Deprecación (Sprint 3+)

| Fase | Acción | Timeline |
|------|--------|----------|
| D.1 | Marcar tablas antiguas como deprecated | Inmediato |
| D.2 | Crear triggers de sincronización (old→new) | Sprint 3 |
| D.3 | Monitorear uso de tablas antiguas | 1 mes |
| D.4 | Eliminar tablas antiguas | 3 meses |

---

## 4. ISSUE CRÍTICO: FK Inconsistente

```sql
-- PROBLEMA: security_events referencia auth.users en lugar de profiles
ALTER TABLE auth_management.security_events
DROP CONSTRAINT security_events_user_id_fkey;

ALTER TABLE auth_management.security_events
ADD CONSTRAINT security_events_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth_management.profiles(id);
```

**Estado:** PENDIENTE - Ejecutar antes de migración

---

## 5. BENEFICIOS ESPERADOS

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Tablas | 5 | 1 + 4 vistas | 80% reducción |
| Storage | ~5x | ~1.8x | 64% ahorro |
| Queries | Elegir tabla | Filtrar por category | Simplificado |
| Mantenimiento | 5 schemas | 1 schema | 80% reducción |
| Consistencia | Riesgo | Garantizada | 100% |

---

## 6. RIESGOS Y MITIGACIÓN

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Pérdida de datos en ETL | Baja | Alta | Validación pre/post |
| Backend incompatible | Media | Media | Vistas de compatibilidad |
| Performance degradada | Baja | Media | Índices optimizados |
| Rollback necesario | Baja | Media | Mantener tablas originales 3 meses |

---

## 7. PRÓXIMOS PASOS

1. [ ] Aprobar diseño de tabla unificada
2. [ ] Crear DDL y tests
3. [ ] Ejecutar ETL en ambiente dev
4. [ ] Validar integridad
5. [ ] Actualizar backend
6. [ ] Deploy a staging
7. [ ] Monitoreo 1 semana
8. [ ] Deploy a producción
9. [ ] Deprecar tablas antiguas

---

*Generado por: TASK-2026-02-02-REMEDIACION-DDL*
*Fase: P2-A - Plan Consolidación Audit*
*Fecha: 2026-02-02*
