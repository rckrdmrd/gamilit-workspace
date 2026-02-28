---
titulo: "Índices y Optimización - Parte 2: Progress, Social y Mantenimiento"
tipo: requerimiento-funcional
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# Índices y Optimización - Parte 2: Progress, Social y Mantenimiento

**Épica:** EMR-001 - Migración y Robustecimiento de BD
**Fecha:** 2025-11-02
**Origen:** `/docs/03-desarrollo/base-de-datos/INDICES-Y-OPTIMIZACION.md`

---

## 1. Índices de Progress Tracking

### 1.1 progress_tracking.module_progress
```sql
-- Dashboard de usuario
CREATE INDEX idx_module_progress_user_status_updated
    ON module_progress(user_id, status, updated_at DESC);

-- Parciales (OPTIMIZACIÓN CLAVE)
CREATE INDEX idx_module_progress_completed
    ON module_progress(user_id, completed_at DESC)
    WHERE status = 'completed';

CREATE INDEX idx_module_progress_incomplete
    ON module_progress(user_id, updated_at DESC)
    WHERE status IN ('not_started', 'in_progress');
```

**Queries optimizados:**
```sql
-- Módulos en progreso
SELECT * FROM module_progress
WHERE user_id = ? AND status IN ('not_started', 'in_progress')
ORDER BY updated_at DESC;
-- Usa: idx_module_progress_incomplete

-- Módulos completados recientemente
SELECT * FROM module_progress
WHERE user_id = ? AND status = 'completed'
ORDER BY completed_at DESC LIMIT 10;
-- Usa: idx_module_progress_completed
```

---

### 1.2 progress_tracking.exercise_attempts
```sql
-- Historial de intentos
CREATE INDEX idx_exercise_attempts_user_exercise_date
    ON exercise_attempts(user_id, exercise_id, submitted_at DESC);

-- Actividad reciente
CREATE INDEX idx_exercise_attempts_submitted_at
    ON exercise_attempts(submitted_at DESC);
```

---

### 1.3 progress_tracking.learning_sessions
```sql
CREATE INDEX idx_sessions_user_id
    ON learning_sessions(user_id);

CREATE INDEX idx_sessions_started_at
    ON learning_sessions(started_at DESC);

CREATE INDEX idx_sessions_is_active
    ON learning_sessions(is_active);
```

---

## 2. Índices de Social Features

### 2.1 social_features.schools
```sql
CREATE INDEX idx_schools_tenant_id ON schools(tenant_id);
CREATE INDEX idx_schools_code ON schools(code);
CREATE INDEX idx_schools_is_active ON schools(is_active);
```

### 2.2 social_features.classrooms
```sql
CREATE INDEX idx_classrooms_school_id ON classrooms(school_id);
CREATE INDEX idx_classrooms_teacher_id ON classrooms(teacher_id);
CREATE INDEX idx_classrooms_code ON classrooms(code);
```

---

### 2.3 social_features.classroom_members
```sql
-- Listado de estudiantes activos
CREATE INDEX idx_classroom_members_active
    ON classroom_members(classroom_id, status)
    WHERE status = 'active';
```

---

### 2.4 social_features.teams
```sql
-- Leaderboards de equipos
CREATE INDEX idx_teams_classroom_active_xp
    ON teams(classroom_id, is_active, total_xp DESC)
    WHERE is_active = true;
```

---

### 2.5 social_features.team_members
```sql
-- Miembros actuales
CREATE INDEX idx_team_members_active
    ON team_members(team_id)
    WHERE left_at IS NULL;
```

---

## 3. Índices de Content Management

### 3.1 content_management (Marie Curie, Media, Flagged)
```sql
-- Marie Curie Content
CREATE INDEX idx_marie_content_tags_gin ON marie_curie_content USING GIN(search_tags);
CREATE INDEX idx_marie_content_search ON marie_curie_content
    USING GIN(to_tsvector('spanish', coalesce(title, '') || ' ' || coalesce(description, '')));

-- Media Files
CREATE INDEX idx_media_files_media_type ON media_files(media_type);
CREATE INDEX idx_media_files_uploaded_by ON media_files(uploaded_by);
CREATE INDEX idx_media_files_tags_gin ON media_files USING GIN(tags);

-- Flagged Content (moderación)
CREATE INDEX idx_flagged_pending ON flagged_content(priority, created_at DESC)
    WHERE status = 'pending';
```

---

## 4. Índices de System Configuration

```sql
-- System Settings
CREATE INDEX idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX idx_system_settings_category ON system_settings(setting_category);

-- Feature Flags (activos actualmente)
CREATE INDEX idx_feature_flags_active ON feature_flags(feature_key)
    WHERE is_enabled = true
      AND (starts_at IS NULL OR starts_at <= NOW())
      AND (ends_at IS NULL OR ends_at > NOW());
```

---

## 5. Índices de Audit Logging

### 5.1 audit_logging.audit_logs
```sql
CREATE INDEX idx_audit_logs_tenant_id
    ON audit_logs(tenant_id);

CREATE INDEX idx_audit_logs_actor_id
    ON audit_logs(actor_id);

CREATE INDEX idx_audit_logs_resource
    ON audit_logs(resource_type, resource_id);

CREATE INDEX idx_audit_logs_created_at
    ON audit_logs(created_at DESC);

-- Parciales (errores críticos)
CREATE INDEX idx_audit_logs_errors
    ON audit_logs(created_at DESC)
    WHERE severity IN ('error', 'critical');
```

---

### 5.2 audit_logging.system_logs
```sql
-- Errores
CREATE INDEX idx_system_logs_errors
    ON system_logs(created_at DESC)
    WHERE log_level IN ('ERROR', 'FATAL');
```

---

### 5.3 audit_logging.performance_metrics
```sql
CREATE INDEX idx_metrics_name ON performance_metrics(metric_name);
CREATE INDEX idx_metrics_measured_at ON performance_metrics(measured_at DESC);
CREATE INDEX idx_metrics_dimensions_gin ON performance_metrics USING GIN(dimensions);
```

---

### 5.4 audit_logging.system_alerts
```sql
CREATE INDEX idx_alerts_open ON system_alerts(severity, triggered_at DESC)
    WHERE status = 'open';
```

---

## 6. Vista Materializada: Leaderboards

```sql
CREATE MATERIALIZED VIEW gamification_system.leaderboards_view AS
SELECT
    p.id as user_id,
    p.display_name,
    p.avatar_url,
    us.level,
    us.total_xp,
    us.ml_coins,
    us.current_streak,
    us.global_rank_position,
    ur.current_rank as maya_rank,
    p.tenant_id
FROM auth_management.profiles p
JOIN gamification_system.user_stats us ON p.id = us.user_id
JOIN gamification_system.user_ranks ur ON p.id = ur.user_id
  AND ur.is_current = true
WHERE p.status = 'active';

-- Índices en la vista
CREATE UNIQUE INDEX idx_leaderboards_user_id
    ON leaderboards_view(user_id);

CREATE INDEX idx_leaderboards_level
    ON leaderboards_view(level DESC);

CREATE INDEX idx_leaderboards_xp
    ON leaderboards_view(total_xp DESC);

CREATE INDEX idx_leaderboards_tenant_level
    ON leaderboards_view(tenant_id, level DESC);
```

**Refresh Strategy:**
```sql
-- Refresh periódico (cada 5 minutos)
REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboards_view;
```

**Justificación:**
- Leaderboards requieren JOINs pesados
- Query muy frecuente
- Eventually consistent OK (5 min delay)
- CONCURRENTLY permite updates sin bloqueo

---

## 7. Estrategias de Optimización

### 7.1 Índices Parciales - Patrones Comunes

**Usuarios activos:**
```sql
WHERE status = 'active'
```

**Contenido publicado:**
```sql
WHERE is_published = true AND status = 'published'
```

**Sesiones activas:**
```sql
WHERE is_active = true
```

**Alertas abiertas:**
```sql
WHERE status = 'open'
```

**Intentos fallidos (seguridad):**
```sql
WHERE success = false
```

---

### 7.2 Índices GIN - Cuándo Usar

**JSONB:**
- Operadores: `@>`, `?`, `?&`, `?|`
- Ejemplos: `settings`, `preferences`, `metadata`, `content`

**Arrays:**
- Operadores: `@>`, `<@`, `&&`
- Ejemplos: `tags`, `prerequisites`, `used_in_modules`

**Full-Text Search:**
- Operador: `@@`
- Columnas: `tsvector` en español

**Trade-offs:**
- ✅ Búsquedas rápidas en datos semi-estructurados
- ❌ Índices grandes, writes más lentos

---

### 7.3 Full-Text Search (español)

**Implementación:**
```sql
CREATE INDEX idx_modules_search
    ON modules
    USING GIN(to_tsvector('spanish',
        coalesce(title, '') || ' ' || coalesce(description, '')));
```

**Uso:**
```sql
SELECT * FROM modules
WHERE to_tsvector('spanish', title || ' ' || description)
      @@ to_tsquery('spanish', 'marie & curie');
```

**Optimizaciones futuras:**
- Columna `tsvector` generada (evita cálculo en query time)
- Soporte multiidioma (inglés)

---

## 8. Mantenimiento

### 8.1 ANALYZE periódico
```sql
ANALYZE auth_management.profiles;
ANALYZE gamification_system.user_stats;
ANALYZE educational_content.modules;
ANALYZE progress_tracking.module_progress;
```

**Frecuencia:**
- Tablas alta escritura: Diario
- Tablas baja escritura: Semanal

---

### 8.2 Monitoreo de Índices

**Índices no utilizados:**
```sql
SELECT schemaname, tablename, indexname, idx_scan as scans,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE idx_scan = 0 AND schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_relation_size(indexrelid) DESC;
```

**Tamaño de índices:**
```sql
SELECT schemaname, tablename, indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as size, idx_scan
FROM pg_stat_user_indexes
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_relation_size(indexrelid) DESC LIMIT 20;
```

---

## 9. Partitioning (Futuro)

**Tablas candidatas:**
- `ml_coins_transactions` - Monthly partitions
- `exercise_attempts` - Quarterly partitions
- `audit_logs` - Monthly partitions
- `user_activity_logs` - Weekly partitions

**Razón:** Tablas de log con crecimiento constante

---

## 10. Referencias

- **Parte 1:** `INDICES-PARTE-1.md` (Auth, Gamificación, Contenido)
- **Esquema:** `ESQUEMA-44-TABLAS.md`
- **Migraciones:** `../01-migraciones/MIGRACIONES-HISTORICO.md`

---

**Última actualización:** 2025-11-02
**Consolidado por:** ARTEMIS (Agente de Migración)
