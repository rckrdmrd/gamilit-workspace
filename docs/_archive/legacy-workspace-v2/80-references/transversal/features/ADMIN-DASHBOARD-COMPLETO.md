# Schema `admin_dashboard` - Vistas del Dashboard Administrativo

**Schema:** `admin_dashboard`
**Propósito:** Vistas materializadas y vistas para dashboard de administración
**Views:** 4
**Estado:** ✅ Documentado
**Última actualización:** 2025-11-08

---

## 📋 Resumen

El schema `admin_dashboard` proporciona vistas optimizadas para el panel administrativo:

| Vista | Tipo | Propósito | Refresh |
|-------|------|-----------|---------|
| `user_stats_summary` | Materialized | Estadísticas agregadas de usuarios | Cada 15 min |
| `organization_stats_summary` | Materialized | Estadísticas de organizaciones/tenants | Cada hora |
| `moderation_queue` | View | Cola de moderación en tiempo real | N/A (view) |
| `recent_admin_actions` | View | Acciones recientes de administradores | N/A (view) |

---

## 🗂️ Vistas

### 1. `user_stats_summary` (Materialized View)

**Propósito:** Dashboard de estadísticas de usuarios agregadas

**Columnas típicas:**
```sql
- total_users INT
- active_users_today INT
- active_users_week INT
- active_users_month INT
- new_signups_today INT
- new_signups_week INT
- avg_session_duration INTERVAL
- total_exercises_completed BIGINT
- avg_exercises_per_user NUMERIC
```

**Refresh:** `REFRESH MATERIALIZED VIEW CONCURRENTLY` cada 15 minutos

**Uso:** Dashboard principal de admin, métricas de engagement

---

### 2. `organization_stats_summary` (Materialized View)

**Propósito:** Estadísticas por organización/tenant

**Columnas típicas:**
```sql
- tenant_id UUID
- tenant_name TEXT
- total_students INT
- total_teachers INT
- total_classrooms INT
- exercises_completed_month BIGINT
- active_rate NUMERIC
- storage_used_mb NUMERIC
```

**Refresh:** `REFRESH MATERIALIZED VIEW CONCURRENTLY` cada hora

**Uso:** Multi-tenancy analytics, billing, capacity planning

---

### 3. `moderation_queue` (Regular View)

**Propósito:** Cola de moderación en tiempo real

**Fuentes de datos:**
- `content_management.flagged_content`
- `social_features.reported_users`
- Otros reportes del sistema

**Columnas típicas:**
```sql
- flag_id UUID
- content_type TEXT
- content_id UUID
- reported_by UUID
- reason TEXT
- severity TEXT
- created_at TIMESTAMP
- status TEXT
```

**Filtros comunes:**
- WHERE status = 'pending'
- ORDER BY severity DESC, created_at ASC

**Uso:** Moderadores procesan reportes

---

### 4. `recent_admin_actions` (Regular View)

**Propósito:** Auditoría de acciones administrativas recientes

**Fuente:** `audit_logging.audit_logs`

**Filtros:**
```sql
WHERE actor_type IN ('admin', 'admin_teacher')
  AND action IN ('create', 'update', 'delete')
  AND created_at > NOW() - INTERVAL '7 days'
```

**Columnas típicas:**
```sql
- admin_id UUID
- admin_name TEXT
- action TEXT
- resource_type TEXT
- resource_id UUID
- description TEXT
- created_at TIMESTAMP
```

**Uso:** Auditoría interna, compliance

---

## 🔄 Mantenimiento

### Refresh de Vistas Materializadas

**Automático (recomendado):**
```sql
-- pg_cron job
SELECT cron.schedule(
    'refresh-user-stats',
    '*/15 * * * *',  -- Cada 15 min
    $$REFRESH MATERIALIZED VIEW CONCURRENTLY admin_dashboard.user_stats_summary$$
);

SELECT cron.schedule(
    'refresh-org-stats',
    '0 * * * *',  -- Cada hora
    $$REFRESH MATERIALIZED VIEW CONCURRENTLY admin_dashboard.organization_stats_summary$$
);
```

**Manual:**
```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY admin_dashboard.user_stats_summary;
REFRESH MATERIALIZED VIEW CONCURRENTLY admin_dashboard.organization_stats_summary;
```

---

## 📊 Queries Útiles

```sql
-- Dashboard snapshot completo
SELECT * FROM admin_dashboard.user_stats_summary;

-- Top 10 organizaciones más activas
SELECT * FROM admin_dashboard.organization_stats_summary
ORDER BY exercises_completed_month DESC
LIMIT 10;

-- Cola de moderación urgente
SELECT * FROM admin_dashboard.moderation_queue
WHERE severity = 'high'
  AND status = 'pending'
ORDER BY created_at ASC;

-- Últimas acciones de admins
SELECT * FROM admin_dashboard.recent_admin_actions
ORDER BY created_at DESC
LIMIT 50;
```

---

## 🎯 Performance

**Vistas Materializadas:**
- ✅ Queries ultra-rápidas (pre-calculadas)
- ✅ No impacto en tablas origen
- ⚠️ Datos ligeramente desactualizados (hasta 15 min - 1 hora)

**Vistas Regulares:**
- ✅ Datos en tiempo real
- ⚠️ Pueden ser lentas si joins complejos
- 💡 Usar índices en tablas origen

---

## 🔗 Referencias

**Épica:** EAI-005 - Admin Base o EXT-002 - Admin Extendido
**Schemas relacionados:**
- `audit_logging` (audit_logs)
- `content_management` (flagged_content)
- `auth_management` (users, tenants)
- `educational_content` (exercises, modules)

---

**Issue:** ISSUE-006 ✅ RESUELTO
**Creado:** 2025-11-08
**Tipo:** Documentación transversal consolidada
