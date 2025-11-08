# Índices y Optimización - GAMILIT Platform

**Plataforma:** GAMILIT(Gamified Learning Interactive Toolkit)
**Base de datos:** PostgreSQL 14+
**Última actualización:** 2025-10-27

---

## Resumen Ejecutivo

- **Total de Índices:** 150+
- **Índices B-Tree:** ~100
- **Índices GIN (JSONB/Arrays):** ~20
- **Índices Full-Text Search:** 3
- **Índices Parciales:** ~15
- **Vistas Materializadas:** 1 (leaderboards)

---

## 1. Tipos de Índices Utilizados

### 1.1 B-Tree (Default)
**Propósito:** Índices estándar para búsquedas exactas y rangos.
**Uso:** Claves primarias, foreign keys, búsquedas de igualdad.

### 1.2 GIN (Generalized Inverted Index)
**Propósito:** Índices para tipos de datos compuestos (JSONB, arrays, tsvector).
**Uso:** Búsqueda en JSONB, arrays, full-text search.

### 1.3 Partial Indexes
**Propósito:** Índices que cubren solo un subconjunto de filas.
**Uso:** Optimización de consultas con WHERE clauses comunes.

### 1.4 Composite Indexes
**Propósito:** Índices en múltiples columnas para consultas complejas.
**Uso:** Consultas con múltiples condiciones en WHERE.

---

## 2. Índices por Schema

### 2.1 Schema: `auth_management`

#### Tabla: `tenants`
```sql
-- Básicos
CREATE INDEX idx_tenants_slug ON auth_management.tenants(slug);
CREATE INDEX idx_tenants_is_active ON auth_management.tenants(is_active);
CREATE INDEX idx_tenants_subscription ON auth_management.tenants(subscription_tier);

-- JSONB
CREATE INDEX idx_tenants_settings_gin ON auth_management.tenants USING GIN(settings);
```

**Justificación:**
- `slug` - Búsqueda de tenants por URL-friendly identifier
- `is_active` - Filtrado de tenants activos
- `subscription_tier` - Agrupación por nivel de suscripción
- `settings` (GIN) - Búsqueda flexible en configuraciones JSONB

---

#### Tabla: `profiles`
```sql
-- Básicos
CREATE INDEX idx_profiles_email ON auth_management.profiles(email);
CREATE INDEX idx_profiles_tenant_id ON auth_management.profiles(tenant_id);
CREATE INDEX idx_profiles_role ON auth_management.profiles(role);
CREATE INDEX idx_profiles_status ON auth_management.profiles(status);
CREATE INDEX idx_profiles_last_activity ON auth_management.profiles(last_activity_at DESC);

-- Compuestos
CREATE INDEX idx_profiles_tenant_role_status
    ON auth_management.profiles(tenant_id, role, status);

-- Parciales
CREATE INDEX idx_profiles_email_status
    ON auth_management.profiles(email, status)
    WHERE status = 'active';

-- JSONB
CREATE INDEX idx_profiles_preferences_gin
    ON auth_management.profiles USING GIN(preferences);
```

**Justificación:**
- `email` - Login y búsqueda de usuarios
- `tenant_id` - Multi-tenancy filtering
- `role` - Filtrado por tipo de usuario
- `last_activity_at DESC` - Ordenamiento por actividad reciente
- `(tenant_id, role, status)` - Consultas combinadas comunes
- `(email, status) WHERE status='active'` - Login de usuarios activos (más frecuente)
- `preferences` (GIN) - Búsqueda en configuraciones de usuario

**Consultas optimizadas:**
```sql
-- Login de usuario activo
SELECT * FROM profiles
WHERE email = 'user@example.com' AND status = 'active';
-- Usa: idx_profiles_email_status (partial index)

-- Listado de estudiantes activos por tenant
SELECT * FROM profiles
WHERE tenant_id = ? AND role = 'student' AND status = 'active';
-- Usa: idx_profiles_tenant_role_status
```

---

#### Tabla: `user_sessions`
```sql
-- Básicos
CREATE INDEX idx_user_sessions_user_id ON auth_management.user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON auth_management.user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires ON auth_management.user_sessions(expires_at);

-- Parciales
CREATE INDEX idx_user_sessions_active
    ON auth_management.user_sessions(is_active)
    WHERE is_active = true;

CREATE INDEX idx_sessions_active_recent
    ON auth_management.user_sessions(user_id, last_activity_at DESC)
    WHERE is_active = true;
```

**Justificación:**
- `user_id` - Búsqueda de sesiones por usuario
- `session_token` - Validación de tokens (UNIQUE constraint ya crea índice)
- `expires_at` - Cleanup de sesiones expiradas
- Parciales en `is_active` - Solo sesiones activas (mayoría de consultas)

**Cleanup automático:**
```sql
-- Job periódico optimizado por expires_at index
DELETE FROM user_sessions WHERE expires_at < NOW();
```

---

#### Tabla: `auth_attempts`
```sql
-- Básicos
CREATE INDEX idx_auth_attempts_email ON auth_management.auth_attempts(email);
CREATE INDEX idx_auth_attempts_ip ON auth_management.auth_attempts(ip_address);
CREATE INDEX idx_auth_attempts_attempted_at
    ON auth_management.auth_attempts(attempted_at DESC);

-- Parciales (Seguridad)
CREATE INDEX idx_auth_attempts_failed
    ON auth_management.auth_attempts(email, attempted_at)
    WHERE success = false;
```

**Justificación:**
- `email` - Rastreo de intentos por usuario
- `ip_address` - Detección de ataques por IP
- `attempted_at DESC` - Logs recientes de autenticación
- Parcial en `success=false` - **Rate limiting y seguridad**

**Query de seguridad optimizado:**
```sql
-- Detectar intentos fallidos en últimos 15 minutos
SELECT COUNT(*) FROM auth_attempts
WHERE email = ? AND success = false
  AND attempted_at > NOW() - INTERVAL '15 minutes';
-- Usa: idx_auth_attempts_failed (partial index)
```

---

#### Tabla: `memberships`
```sql
CREATE INDEX idx_memberships_user_id ON auth_management.memberships(user_id);
CREATE INDEX idx_memberships_tenant_id ON auth_management.memberships(tenant_id);
CREATE INDEX idx_memberships_status ON auth_management.memberships(status);
```

---

### 2.2 Schema: `gamification_system`

#### Tabla: `user_stats`
```sql
-- Básicos
CREATE INDEX idx_user_stats_user_id ON gamification_system.user_stats(user_id);
CREATE INDEX idx_user_stats_tenant_id ON gamification_system.user_stats(tenant_id);
CREATE INDEX idx_user_stats_level ON gamification_system.user_stats(level DESC);
CREATE INDEX idx_user_stats_ml_coins ON gamification_system.user_stats(ml_coins DESC);
CREATE INDEX idx_user_stats_current_streak
    ON gamification_system.user_stats(current_streak DESC);
CREATE INDEX idx_user_stats_global_rank
    ON gamification_system.user_stats(global_rank_position);

-- Compuestos para leaderboards
CREATE INDEX idx_user_stats_tenant_level
    ON gamification_system.user_stats(tenant_id, level DESC);
```

**Justificación:**
- `user_id` - UNIQUE constraint ya crea índice
- Múltiples índices en columnas de ranking para leaderboards
- `level DESC` - Top niveles
- `ml_coins DESC` - Usuarios más ricos
- `current_streak DESC` - Mejores rachas
- `(tenant_id, level)` - Leaderboards por organización

**Leaderboards optimizados:**
```sql
-- Top 10 por nivel global
SELECT * FROM user_stats ORDER BY level DESC LIMIT 10;
-- Usa: idx_user_stats_level

-- Top 10 por nivel en tenant específico
SELECT * FROM user_stats
WHERE tenant_id = ? ORDER BY level DESC LIMIT 10;
-- Usa: idx_user_stats_tenant_level
```

---

#### Tabla: `user_ranks`
```sql
CREATE INDEX idx_user_ranks_user_id ON gamification_system.user_ranks(user_id);
CREATE INDEX idx_user_ranks_current_rank
    ON gamification_system.user_ranks(current_rank);
CREATE INDEX idx_user_ranks_is_current
    ON gamification_system.user_ranks(is_current)
    WHERE is_current = true;
```

**Justificación:**
- `is_current WHERE true` - Solo rangos actuales (consulta más frecuente)

---

#### Tabla: `achievements`
```sql
CREATE INDEX idx_achievements_category
    ON gamification_system.achievements(category);
CREATE INDEX idx_achievements_is_active
    ON gamification_system.achievements(is_active)
    WHERE is_active = true;
CREATE INDEX idx_achievements_is_secret
    ON gamification_system.achievements(is_secret);

-- JSONB
CREATE INDEX idx_achievements_conditions_gin
    ON gamification_system.achievements USING GIN(conditions);
```

**Justificación:**
- `category` - Filtrado por tipo de logro
- `is_active WHERE true` - Solo achievements activos
- `conditions` (GIN) - Búsqueda flexible en condiciones JSONB

---

#### Tabla: `user_achievements`
```sql
CREATE INDEX idx_user_achievements_user_id
    ON gamification_system.user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id
    ON gamification_system.user_achievements(achievement_id);
CREATE INDEX idx_user_achievements_is_completed
    ON gamification_system.user_achievements(is_completed);

-- Compuestos
CREATE INDEX idx_user_achievements_user_completed
    ON gamification_system.user_achievements(user_id, is_completed, completed_at);

-- Parciales
CREATE INDEX idx_user_achievements_unclaimed
    ON gamification_system.user_achievements(user_id)
    WHERE is_completed = true AND rewards_claimed = false;
```

**Justificación:**
- UNIQUE `(user_id, achievement_id)` ya indexado
- Parcial para **recompensas no reclamadas** (notificaciones)

**Query de notificaciones optimizado:**
```sql
-- Achievements completados sin reclamar recompensas
SELECT * FROM user_achievements
WHERE user_id = ? AND is_completed = true AND rewards_claimed = false;
-- Usa: idx_user_achievements_unclaimed
```

---

#### Tabla: `ml_coins_transactions`
```sql
CREATE INDEX idx_ml_transactions_user_id
    ON gamification_system.ml_coins_transactions(user_id);
CREATE INDEX idx_ml_transactions_created_at
    ON gamification_system.ml_coins_transactions(created_at DESC);
CREATE INDEX idx_ml_transactions_type
    ON gamification_system.ml_coins_transactions(transaction_type);

-- Compuestos
CREATE INDEX idx_ml_transactions_user_type_date
    ON gamification_system.ml_coins_transactions(user_id, transaction_type, created_at DESC);

CREATE INDEX idx_ml_transactions_reference
    ON gamification_system.ml_coins_transactions(reference_id, reference_type);

CREATE INDEX idx_ml_transactions_user_date
    ON gamification_system.ml_coins_transactions(user_id, created_at DESC);
```

**Justificación:**
- `(user_id, created_at)` - Historial de transacciones por usuario
- `(reference_id, reference_type)` - Lookup de transacciones relacionadas
- `(user_id, transaction_type, created_at)` - Filtrado de tipo específico

**Queries de auditoría optimizados:**
```sql
-- Historial de transacciones del usuario (últimos 30 días)
SELECT * FROM ml_coins_transactions
WHERE user_id = ? AND created_at > NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;
-- Usa: idx_ml_transactions_user_date

-- Transacciones relacionadas a un ejercicio
SELECT * FROM ml_coins_transactions
WHERE reference_type = 'exercise' AND reference_id = ?;
-- Usa: idx_ml_transactions_reference
```

---

#### Tabla: `comodines_inventory`
```sql
CREATE INDEX idx_comodines_user_id
    ON gamification_system.comodines_inventory(user_id);
-- UNIQUE en user_id ya crea índice
```

---

#### Tabla: `missions`
```sql
CREATE INDEX idx_missions_user_id ON gamification_system.missions(user_id);
CREATE INDEX idx_missions_status ON gamification_system.missions(status);
CREATE INDEX idx_missions_type ON gamification_system.missions(mission_type);
CREATE INDEX idx_missions_end_date ON gamification_system.missions(end_date);
CREATE INDEX idx_missions_template ON gamification_system.missions(template_id);

-- Compuestos
CREATE INDEX idx_missions_user_type_status
    ON gamification_system.missions(user_id, mission_type, status);
```

**Justificación:**
- `(user_id, mission_type, status)` - Dashboard de misiones por tipo

---

### 2.3 Schema: `educational_content`

#### Tabla: `modules`
```sql
-- Básicos
CREATE INDEX idx_modules_tenant_id ON educational_content.modules(tenant_id);
CREATE INDEX idx_modules_order_index ON educational_content.modules(order_index);
CREATE INDEX idx_modules_status ON educational_content.modules(status);
CREATE INDEX idx_modules_is_published ON educational_content.modules(is_published);
CREATE INDEX idx_modules_difficulty ON educational_content.modules(difficulty_level);
CREATE INDEX idx_modules_rango_required
    ON educational_content.modules(rango_maya_required);

-- Compuestos
CREATE INDEX idx_modules_status_published
    ON educational_content.modules(status, is_published, order_index);

-- Parciales
CREATE INDEX idx_modules_active_published
    ON educational_content.modules(order_index)
    WHERE is_published = true AND status = 'published';

-- Arrays
CREATE INDEX idx_modules_prerequisites_gin
    ON educational_content.modules USING GIN(prerequisites);
CREATE INDEX idx_modules_tags_gin
    ON educational_content.modules USING GIN(tags);

-- JSONB
CREATE INDEX idx_modules_content_gin
    ON educational_content.modules USING GIN(content);

-- Full-Text Search
CREATE INDEX idx_modules_search
    ON educational_content.modules
    USING GIN(to_tsvector('spanish', coalesce(title, '') || ' ' || coalesce(description, '')));
```

**Justificación:**
- `order_index` - Listado secuencial de módulos
- Parcial `WHERE is_published=true AND status='published'` - **Módulos visibles públicamente**
- `prerequisites` (GIN) - Validación de prerequisitos
- `tags` (GIN) - Búsqueda por etiquetas
- Full-text search en español para búsqueda de contenido

**Query de catálogo optimizado:**
```sql
-- Listado de módulos publicados ordenados
SELECT * FROM modules
WHERE is_published = true AND status = 'published'
ORDER BY order_index;
-- Usa: idx_modules_active_published

-- Búsqueda full-text en español
SELECT * FROM modules
WHERE to_tsvector('spanish', title || ' ' || description)
      @@ to_tsquery('spanish', 'marie & curie');
-- Usa: idx_modules_search
```

---

#### Tabla: `exercises`
```sql
-- Básicos
CREATE INDEX idx_exercises_module_id ON educational_content.exercises(module_id);
CREATE INDEX idx_exercises_type ON educational_content.exercises(exercise_type);
CREATE INDEX idx_exercises_order_index ON educational_content.exercises(order_index);
CREATE INDEX idx_exercises_is_active ON educational_content.exercises(is_active);
CREATE INDEX idx_exercises_difficulty ON educational_content.exercises(difficulty_level);

-- Compuestos
CREATE INDEX idx_exercises_module_type_active
    ON educational_content.exercises(module_id, exercise_type, is_active);

-- Parciales
CREATE INDEX idx_exercises_active_gradable
    ON educational_content.exercises(module_id, order_index)
    WHERE is_active = true AND auto_gradable = true;

-- JSONB
CREATE INDEX idx_exercises_content_gin
    ON educational_content.exercises USING GIN(content);
CREATE INDEX idx_exercises_config_gin
    ON educational_content.exercises USING GIN(config);

-- Full-Text Search
CREATE INDEX idx_exercises_search
    ON educational_content.exercises
    USING GIN(to_tsvector('spanish', coalesce(title, '') || ' ' || coalesce(description, '')));
```

**Justificación:**
- `(module_id, order_index)` - Listado de ejercicios por módulo
- Parcial `WHERE is_active=true AND auto_gradable=true` - **Ejercicios evaluables automáticamente**
- `content`, `config` (GIN) - Búsqueda flexible en estructura JSONB

---

#### Tabla: `assessment_rubrics`
```sql
CREATE INDEX idx_rubrics_exercise_id ON educational_content.assessment_rubrics(exercise_id);
CREATE INDEX idx_rubrics_module_id ON educational_content.assessment_rubrics(module_id);
CREATE INDEX idx_rubrics_is_active ON educational_content.assessment_rubrics(is_active);
```

---

#### Tabla: `media_resources`
```sql
CREATE INDEX idx_media_tenant_id ON educational_content.media_resources(tenant_id);
CREATE INDEX idx_media_type ON educational_content.media_resources(media_type);
CREATE INDEX idx_media_category ON educational_content.media_resources(category);
CREATE INDEX idx_media_is_active ON educational_content.media_resources(is_active);

-- Arrays
CREATE INDEX idx_media_used_in_modules_gin
    ON educational_content.media_resources USING GIN(used_in_modules);
CREATE INDEX idx_media_used_in_exercises_gin
    ON educational_content.media_resources USING GIN(used_in_exercises);
```

**Justificación:**
- Arrays `used_in_*` (GIN) - Búsqueda inversa de recursos usados

---

### 2.4 Schema: `progress_tracking`

#### Tabla: `module_progress`
```sql
-- Básicos
CREATE INDEX idx_module_progress_user_id
    ON progress_tracking.module_progress(user_id);
CREATE INDEX idx_module_progress_module_id
    ON progress_tracking.module_progress(module_id);
CREATE INDEX idx_module_progress_status
    ON progress_tracking.module_progress(status);
CREATE INDEX idx_module_progress_classroom
    ON progress_tracking.module_progress(classroom_id);

-- Compuestos
CREATE INDEX idx_module_progress_user_status_updated
    ON progress_tracking.module_progress(user_id, status, updated_at DESC);

-- Parciales
CREATE INDEX idx_module_progress_completed
    ON progress_tracking.module_progress(user_id, completed_at DESC)
    WHERE status = 'completed';

CREATE INDEX idx_module_progress_incomplete
    ON progress_tracking.module_progress(user_id, updated_at DESC)
    WHERE status IN ('not_started', 'in_progress');
```

**Justificación:**
- UNIQUE `(user_id, module_id)` ya indexado
- Parciales para estados específicos (completed vs incomplete)

**Dashboard queries optimizados:**
```sql
-- Módulos en progreso del usuario
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

#### Tabla: `exercise_attempts`
```sql
-- Básicos
CREATE INDEX idx_exercise_attempts_user_id
    ON progress_tracking.exercise_attempts(user_id);
CREATE INDEX idx_exercise_attempts_exercise_id
    ON progress_tracking.exercise_attempts(exercise_id);
CREATE INDEX idx_exercise_attempts_submitted_at
    ON progress_tracking.exercise_attempts(submitted_at DESC);

-- Compuestos
CREATE INDEX idx_exercise_attempts_user_exercise
    ON progress_tracking.exercise_attempts(user_id, exercise_id);

CREATE INDEX idx_exercise_attempts_user_exercise_date
    ON progress_tracking.exercise_attempts(user_id, exercise_id, submitted_at DESC);
```

**Justificación:**
- `(user_id, exercise_id, submitted_at)` - Historial de intentos por ejercicio
- `submitted_at DESC` - Actividad reciente

---

#### Tabla: `learning_sessions`
```sql
CREATE INDEX idx_sessions_user_id ON progress_tracking.learning_sessions(user_id);
CREATE INDEX idx_sessions_module_id ON progress_tracking.learning_sessions(module_id);
CREATE INDEX idx_sessions_started_at
    ON progress_tracking.learning_sessions(started_at DESC);
CREATE INDEX idx_sessions_is_active ON progress_tracking.learning_sessions(is_active);
```

---

### 2.5 Schema: `social_features`

#### Tabla: `schools`
```sql
CREATE INDEX idx_schools_tenant_id ON social_features.schools(tenant_id);
CREATE INDEX idx_schools_code ON social_features.schools(code);
CREATE INDEX idx_schools_is_active ON social_features.schools(is_active);
```

---

#### Tabla: `classrooms`
```sql
CREATE INDEX idx_classrooms_school_id ON social_features.classrooms(school_id);
CREATE INDEX idx_classrooms_teacher_id ON social_features.classrooms(teacher_id);
CREATE INDEX idx_classrooms_is_active ON social_features.classrooms(is_active);
CREATE INDEX idx_classrooms_code ON social_features.classrooms(code);
```

---

#### Tabla: `classroom_members`
```sql
CREATE INDEX idx_classroom_members_classroom
    ON social_features.classroom_members(classroom_id);
CREATE INDEX idx_classroom_members_student
    ON social_features.classroom_members(student_id);

-- Parciales
CREATE INDEX idx_classroom_members_active
    ON social_features.classroom_members(classroom_id, status)
    WHERE status = 'active';
```

**Justificación:**
- UNIQUE `(classroom_id, student_id)` ya indexado
- Parcial para estudiantes activos (listados de clase)

---

#### Tabla: `teams`
```sql
CREATE INDEX idx_teams_classroom_id ON social_features.teams(classroom_id);
CREATE INDEX idx_teams_leader_id ON social_features.teams(leader_id);
CREATE INDEX idx_teams_is_active ON social_features.teams(is_active);
CREATE INDEX idx_teams_total_xp ON social_features.teams(total_xp DESC);

-- Compuestos
CREATE INDEX idx_teams_classroom_active_xp
    ON social_features.teams(classroom_id, is_active, total_xp DESC)
    WHERE is_active = true;
```

**Justificación:**
- Compuesto para leaderboards de equipos por aula

---

#### Tabla: `friendships`
```sql
CREATE INDEX idx_friendships_user_id ON social_features.friendships(user_id);
CREATE INDEX idx_friendships_friend_id ON social_features.friendships(friend_id);
CREATE INDEX idx_friendships_status ON social_features.friendships(status);
```

---

#### Tabla: `team_members`
```sql
CREATE INDEX idx_team_members_team_id ON social_features.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON social_features.team_members(user_id);

-- Parciales
CREATE INDEX idx_team_members_active
    ON social_features.team_members(team_id)
    WHERE left_at IS NULL;
```

---

### 2.6 Schema: `content_management`

#### Tabla: `marie_curie_content`
```sql
CREATE INDEX idx_marie_content_tenant_id
    ON content_management.marie_curie_content(tenant_id);
CREATE INDEX idx_marie_content_category
    ON content_management.marie_curie_content(category);
CREATE INDEX idx_marie_content_status
    ON content_management.marie_curie_content(status);
CREATE INDEX idx_marie_content_is_featured
    ON content_management.marie_curie_content(is_featured);

-- Arrays
CREATE INDEX idx_marie_content_tags_gin
    ON content_management.marie_curie_content USING GIN(search_tags);

-- Full-Text Search
CREATE INDEX idx_marie_content_search
    ON content_management.marie_curie_content
    USING GIN(to_tsvector('spanish', coalesce(title, '') || ' ' || coalesce(description, '')));
```

---

#### Tabla: `media_files`
```sql
CREATE INDEX idx_media_files_tenant_id ON content_management.media_files(tenant_id);
CREATE INDEX idx_media_files_media_type ON content_management.media_files(media_type);
CREATE INDEX idx_media_files_category ON content_management.media_files(category);
CREATE INDEX idx_media_files_uploaded_by ON content_management.media_files(uploaded_by);
CREATE INDEX idx_media_files_is_active ON content_management.media_files(is_active);

-- Arrays
CREATE INDEX idx_media_files_tags_gin
    ON content_management.media_files USING GIN(tags);
```

---

#### Tabla: `content_templates`
```sql
CREATE INDEX idx_templates_tenant_id ON content_management.content_templates(tenant_id);
CREATE INDEX idx_templates_type ON content_management.content_templates(template_type);
CREATE INDEX idx_templates_is_public ON content_management.content_templates(is_public);
```

---

#### Tabla: `flagged_content`
```sql
CREATE INDEX idx_flagged_content_type ON content_management.flagged_content(content_type);
CREATE INDEX idx_flagged_content_id ON content_management.flagged_content(content_id);
CREATE INDEX idx_flagged_content_status ON content_management.flagged_content(status);
CREATE INDEX idx_flagged_priority ON content_management.flagged_content(priority);
CREATE INDEX idx_flagged_reported_by ON content_management.flagged_content(reported_by);
CREATE INDEX idx_flagged_reviewed_by ON content_management.flagged_content(reviewed_by);
CREATE INDEX idx_flagged_created_at ON content_management.flagged_content(created_at DESC);

-- Parciales
CREATE INDEX idx_flagged_pending
    ON content_management.flagged_content(priority, created_at DESC)
    WHERE status = 'pending';
```

**Justificación:**
- Parcial para **contenido pendiente de revisión** (dashboard de moderación)

---

### 2.7 Schema: `system_configuration`

#### Tabla: `system_settings`
```sql
CREATE INDEX idx_system_settings_key ON system_configuration.system_settings(setting_key);
CREATE INDEX idx_system_settings_category
    ON system_configuration.system_settings(setting_category);
CREATE INDEX idx_system_settings_is_public
    ON system_configuration.system_settings(is_public);
```

---

#### Tabla: `feature_flags`
```sql
CREATE INDEX idx_feature_flags_key ON system_configuration.feature_flags(feature_key);
CREATE INDEX idx_feature_flags_is_enabled
    ON system_configuration.feature_flags(is_enabled);

-- Parciales
CREATE INDEX idx_feature_flags_active
    ON system_configuration.feature_flags(feature_key)
    WHERE is_enabled = true
      AND (starts_at IS NULL OR starts_at <= NOW())
      AND (ends_at IS NULL OR ends_at > NOW());
```

**Justificación:**
- Parcial para **feature flags activos actualmente** (validación en runtime)

---

### 2.8 Schema: `audit_logging`

#### Tabla: `audit_logs`
```sql
CREATE INDEX idx_audit_logs_tenant_id ON audit_logging.audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_actor_id ON audit_logging.audit_logs(actor_id);
CREATE INDEX idx_audit_logs_event_type ON audit_logging.audit_logs(event_type);
CREATE INDEX idx_audit_logs_resource ON audit_logging.audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logging.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_correlation ON audit_logging.audit_logs(correlation_id);

-- Parciales
CREATE INDEX idx_audit_logs_errors
    ON audit_logging.audit_logs(created_at DESC)
    WHERE severity IN ('error', 'critical');
```

**Justificación:**
- `(resource_type, resource_id)` - Auditoría de recurso específico
- Parcial para **errores críticos** (alertas y dashboards de operaciones)

---

#### Tabla: `system_logs`
```sql
CREATE INDEX idx_system_logs_level ON audit_logging.system_logs(log_level);
CREATE INDEX idx_system_logs_created_at ON audit_logging.system_logs(created_at DESC);
CREATE INDEX idx_system_logs_user_id ON audit_logging.system_logs(user_id);

-- Parciales
CREATE INDEX idx_system_logs_errors
    ON audit_logging.system_logs(created_at DESC)
    WHERE log_level IN ('ERROR', 'FATAL');
```

---

#### Tabla: `performance_metrics`
```sql
CREATE INDEX idx_metrics_name ON audit_logging.performance_metrics(metric_name);
CREATE INDEX idx_metrics_type ON audit_logging.performance_metrics(metric_type);
CREATE INDEX idx_metrics_measured_at
    ON audit_logging.performance_metrics(measured_at DESC);
CREATE INDEX idx_metrics_category ON audit_logging.performance_metrics(category);

-- JSONB
CREATE INDEX idx_metrics_dimensions_gin
    ON audit_logging.performance_metrics USING GIN(dimensions);
```

---

#### Tabla: `user_activity_logs`
```sql
CREATE INDEX idx_activity_user_id ON audit_logging.user_activity_logs(user_id);
CREATE INDEX idx_activity_type ON audit_logging.user_activity_logs(activity_type);
CREATE INDEX idx_activity_created_at ON audit_logging.user_activity_logs(created_at DESC);
CREATE INDEX idx_activity_session ON audit_logging.user_activity_logs(session_id);
CREATE INDEX idx_activity_module ON audit_logging.user_activity_logs(module_id);
```

---

#### Tabla: `system_alerts`
```sql
CREATE INDEX idx_alerts_type ON audit_logging.system_alerts(alert_type);
CREATE INDEX idx_alerts_severity ON audit_logging.system_alerts(severity);
CREATE INDEX idx_alerts_status ON audit_logging.system_alerts(status);
CREATE INDEX idx_alerts_triggered_at ON audit_logging.system_alerts(triggered_at DESC);

-- Parciales
CREATE INDEX idx_alerts_open
    ON audit_logging.system_alerts(severity, triggered_at DESC)
    WHERE status = 'open';
```

---

#### Tabla: `user_activity`
```sql
CREATE INDEX idx_user_activity_user_id ON audit_logging.user_activity(user_id);
CREATE INDEX idx_user_activity_created_at ON audit_logging.user_activity(created_at DESC);
CREATE INDEX idx_user_activity_type ON audit_logging.user_activity(activity_type);

-- JSONB
CREATE INDEX idx_user_activity_metadata_gin
    ON audit_logging.user_activity USING GIN(metadata);
```

---

## 3. Vistas Materializadas

### 3.1 Vista: `leaderboards_view`

**Propósito:** Pre-calcular rankings para performance de leaderboards.

```sql
-- Creada en migration 009_create_leaderboards_views.sql
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
JOIN gamification_system.user_ranks ur ON p.id = ur.user_id AND ur.is_current = true
WHERE p.status = 'active';

-- Índices en la vista materializada
CREATE UNIQUE INDEX idx_leaderboards_user_id
    ON gamification_system.leaderboards_view(user_id);
CREATE INDEX idx_leaderboards_level
    ON gamification_system.leaderboards_view(level DESC);
CREATE INDEX idx_leaderboards_xp
    ON gamification_system.leaderboards_view(total_xp DESC);
CREATE INDEX idx_leaderboards_tenant_level
    ON gamification_system.leaderboards_view(tenant_id, level DESC);
```

**Refresh Strategy:**
```sql
-- Refresh periódico (cada 5 minutos)
REFRESH MATERIALIZED VIEW CONCURRENTLY gamification_system.leaderboards_view;
```

**Justificación:**
- Leaderboards son queries pesados con JOINs múltiples
- Consulta frecuente (cada visualización de ranking)
- Datos pueden ser eventually consistent (5 minutos de delay es aceptable)
- CONCURRENTLY permite actualizaciones sin bloqueo

---

## 4. Estrategias de Optimización

### 4.1 Índices Parciales (Partial Indexes)

**Cuándo usarlos:**
- WHERE clause muy selectiva y repetida
- Reduce tamaño del índice
- Mejora performance de write operations

**Ejemplos clave:**
```sql
-- Solo usuarios activos (mayoría de queries)
WHERE status = 'active'

-- Solo contenido publicado (público)
WHERE is_published = true AND status = 'published'

-- Solo misiones activas/expiradas
WHERE status IN ('active', 'in_progress')

-- Solo alertas abiertas
WHERE status = 'open'
```

---

### 4.2 Índices Compuestos (Composite Indexes)

**Orden de columnas (regla general):**
1. Equality checks primero (WHERE col =)
2. Range checks después (WHERE col >, <, BETWEEN)
3. Sort order al final (ORDER BY)

**Ejemplo:**
```sql
-- Query:
SELECT * FROM module_progress
WHERE user_id = ? AND status IN ('in_progress')
ORDER BY updated_at DESC;

-- Índice óptimo:
CREATE INDEX idx_module_progress_user_status_updated
    ON module_progress(user_id, status, updated_at DESC);
```

---

### 4.3 Índices GIN (JSONB y Arrays)

**Cuándo usarlos:**
- Búsquedas en JSONB con `@>`, `?`, `?&`, `?|`
- Búsquedas en arrays con `@>`, `<@`, `&&`
- Full-text search con `@@`

**Trade-offs:**
- **Ventajas:** Búsquedas rápidas en datos semi-estructurados
- **Desventajas:** Índices grandes, writes más lentos

**Columnas indexadas:**
- `settings`, `preferences`, `metadata` - Configuraciones flexibles
- `content`, `config` - Contenido educativo estructurado
- `conditions`, `rewards` - Gamificación dinámica
- `tags`, `prerequisites`, `used_in_*` - Arrays de relaciones

---

### 4.4 Full-Text Search (tsvector)

**Implementación:**
```sql
CREATE INDEX idx_modules_search
    ON educational_content.modules
    USING GIN(to_tsvector('spanish', coalesce(title, '') || ' ' || coalesce(description, '')));
```

**Uso:**
```sql
SELECT * FROM modules
WHERE to_tsvector('spanish', title || ' ' || description)
      @@ to_tsquery('spanish', 'marie & curie');
```

**Optimizaciones futuras:**
- Considerar columna `tsvector` generada para evitar cálculo en query time
- Soporte multiidioma (agregar índices en inglés también)

---

## 5. Mantenimiento y Monitoreo

### 5.1 ANALYZE periódico

```sql
-- Actualizar estadísticas de tablas principales
ANALYZE auth_management.profiles;
ANALYZE gamification_system.user_stats;
ANALYZE educational_content.modules;
ANALYZE educational_content.exercises;
ANALYZE progress_tracking.module_progress;
ANALYZE progress_tracking.exercise_attempts;
```

**Frecuencia recomendada:**
- Tablas de alta escritura: Diario
- Tablas de baja escritura: Semanal

---

### 5.2 VACUUM periódico

```sql
-- Vacuum manual (si autovacuum no es suficiente)
VACUUM ANALYZE auth_management.profiles;
VACUUM ANALYZE gamification_system.ml_coins_transactions;
```

---

### 5.3 Monitoreo de Índices

**Índices no utilizados:**
```sql
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_relation_size(indexrelid) DESC;
```

**Índices duplicados:**
```sql
SELECT
    pg_size_pretty(SUM(pg_relation_size(idx))::BIGINT) AS SIZE,
    (array_agg(idx))[1] AS idx1,
    (array_agg(idx))[2] AS idx2,
    (array_agg(idx))[3] AS idx3,
    (array_agg(idx))[4] AS idx4
FROM (
    SELECT indexrelid::regclass AS idx,
           (indrelid::text ||E'\n'|| indclass::text ||E'\n'|| indkey::text ||E'\n'||
            COALESCE(indexprs::text,'')||E'\n' || COALESCE(indpred::text,'')) AS KEY
    FROM pg_index
) sub
GROUP BY KEY
HAVING COUNT(*) > 1
ORDER BY SUM(pg_relation_size(idx)) DESC;
```

---

### 5.4 Tamaño de Índices

```sql
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    idx_scan as times_used
FROM pg_stat_user_indexes
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 20;
```

---

## 6. Recomendaciones de Performance

### 6.1 Queries Lentos

**Identificar:**
```sql
-- Habilitar pg_stat_statements
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Queries más lentos
SELECT
    query,
    calls,
    mean_exec_time,
    total_exec_time,
    rows
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

### 6.2 Connection Pooling

**Recomendado:** PgBouncer o similar
- Reduce overhead de conexiones
- Mejora throughput

---

### 6.3 Partitioning (Futuro)

**Tablas candidatas para partitioning:**
- `ml_coins_transactions` - Por fecha (monthly partitions)
- `exercise_attempts` - Por fecha (quarterly partitions)
- `audit_logs` - Por fecha (monthly partitions)
- `user_activity_logs` - Por fecha (weekly partitions)

**Razón:** Tablas de log con crecimiento constante

---

## 7. Archivos SQL de Referencia

```
/home/isem/workspace/projects/glit/database/clean_ddl/
├── 09_constraints_and_indexes.sql  # Índices adicionales y compuestos
└── [01-08]_*_tables.sql            # Índices básicos en definiciones de tabla

/home/isem/workspace/projects/glit/database/migrations/
└── 009_create_leaderboards_views.sql  # Vista materializada
```

---

**Documento generado:** 2025-10-27
**Versión de base de datos:** PostgreSQL 14+
**Plataforma:** GAMILIT(Gamified Learning Interactive Toolkit)
