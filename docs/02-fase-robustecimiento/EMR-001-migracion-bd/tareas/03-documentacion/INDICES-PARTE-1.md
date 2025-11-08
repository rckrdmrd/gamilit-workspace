# Índices y Optimización - Parte 1: Índices Principales

**Épica:** EMR-001 - Migración y Robustecimiento de BD
**Fecha:** 2025-11-02
**Origen:** `/docs/03-desarrollo/base-de-datos/INDICES-Y-OPTIMIZACION.md`

---

## Resumen Ejecutivo

- **Total de Índices:** 150+
- **Índices B-Tree:** ~100
- **Índices GIN (JSONB/Arrays):** ~20
- **Índices Full-Text Search:** 3 (español)
- **Índices Parciales:** ~15
- **Vistas Materializadas:** 1 (leaderboards)

---

## 1. Tipos de Índices

### 1.1 B-Tree (Default)
**Uso:** Claves primarias, foreign keys, búsquedas de igualdad y rangos

### 1.2 GIN (Generalized Inverted Index)
**Uso:** JSONB, arrays, full-text search

### 1.3 Partial Indexes
**Uso:** Queries con WHERE clauses selectivas

### 1.4 Composite Indexes
**Orden:** Equality → Range → Sort

---

## 2. Índices de Autenticación

### 2.1 auth_management.profiles
```sql
-- Básicos
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_tenant_id ON profiles(tenant_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Compuestos
CREATE INDEX idx_profiles_tenant_role_status
    ON profiles(tenant_id, role, status);

-- Parciales (CRÍTICO para login)
CREATE INDEX idx_profiles_email_status
    ON profiles(email, status)
    WHERE status = 'active';

-- JSONB
CREATE INDEX idx_profiles_preferences_gin
    ON profiles USING GIN(preferences);
```

**Query optimizado:**
```sql
-- Login de usuario activo
SELECT * FROM profiles
WHERE email = ? AND status = 'active';
-- Usa: idx_profiles_email_status (partial index)
```

---

### 2.2 auth_management.user_sessions
```sql
-- Sesiones activas
CREATE INDEX idx_user_sessions_active
    ON user_sessions(is_active)
    WHERE is_active = true;

CREATE INDEX idx_sessions_active_recent
    ON user_sessions(user_id, last_activity_at DESC)
    WHERE is_active = true;
```

---

### 2.3 auth_management.auth_attempts
```sql
-- SEGURIDAD: Rate limiting
CREATE INDEX idx_auth_attempts_failed
    ON auth_attempts(email, attempted_at)
    WHERE success = false;
```

**Query de seguridad:**
```sql
-- Detectar intentos fallidos (últimos 15 min)
SELECT COUNT(*) FROM auth_attempts
WHERE email = ? AND success = false
  AND attempted_at > NOW() - INTERVAL '15 minutes';
-- Usa: idx_auth_attempts_failed
```

---

## 3. Índices de Gamificación

### 3.1 gamification_system.user_stats
```sql
-- Leaderboards
CREATE INDEX idx_user_stats_level
    ON user_stats(level DESC);

CREATE INDEX idx_user_stats_ml_coins
    ON user_stats(ml_coins DESC);

CREATE INDEX idx_user_stats_current_streak
    ON user_stats(current_streak DESC);

-- Por organización
CREATE INDEX idx_user_stats_tenant_level
    ON user_stats(tenant_id, level DESC);
```

**Queries optimizados:**
```sql
-- Top 10 por nivel global
SELECT * FROM user_stats ORDER BY level DESC LIMIT 10;
-- Usa: idx_user_stats_level

-- Top 10 por nivel en tenant
SELECT * FROM user_stats
WHERE tenant_id = ? ORDER BY level DESC LIMIT 10;
-- Usa: idx_user_stats_tenant_level
```

---

### 3.2 gamification_system.user_ranks
```sql
CREATE INDEX idx_user_ranks_current_rank
    ON user_ranks(current_rank);

CREATE INDEX idx_user_ranks_is_current
    ON user_ranks(is_current)
    WHERE is_current = true;
```

---

### 3.3 gamification_system.achievements
```sql
CREATE INDEX idx_achievements_category
    ON achievements(category);

CREATE INDEX idx_achievements_is_active
    ON achievements(is_active)
    WHERE is_active = true;

-- JSONB
CREATE INDEX idx_achievements_conditions_gin
    ON achievements USING GIN(conditions);
```

---

### 3.4 gamification_system.user_achievements
```sql
-- Notificaciones de recompensas no reclamadas
CREATE INDEX idx_user_achievements_unclaimed
    ON user_achievements(user_id)
    WHERE is_completed = true AND rewards_claimed = false;
```

**Query optimizado:**
```sql
-- Achievements completados sin reclamar
SELECT * FROM user_achievements
WHERE user_id = ? AND is_completed = true AND rewards_claimed = false;
-- Usa: idx_user_achievements_unclaimed
```

---

### 3.5 gamification_system.ml_coins_transactions
```sql
-- Historial de transacciones
CREATE INDEX idx_ml_transactions_user_date
    ON ml_coins_transactions(user_id, created_at DESC);

-- Auditoría
CREATE INDEX idx_ml_transactions_reference
    ON ml_coins_transactions(reference_id, reference_type);

-- Por tipo
CREATE INDEX idx_ml_transactions_user_type_date
    ON ml_coins_transactions(user_id, transaction_type, created_at DESC);
```

**Queries optimizados:**
```sql
-- Historial (últimos 30 días)
SELECT * FROM ml_coins_transactions
WHERE user_id = ? AND created_at > NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;
-- Usa: idx_ml_transactions_user_date

-- Transacciones relacionadas a ejercicio
SELECT * FROM ml_coins_transactions
WHERE reference_type = 'exercise' AND reference_id = ?;
-- Usa: idx_ml_transactions_reference
```

---

## 4. Índices de Contenido Educativo

### 4.1 educational_content.modules
```sql
-- Listado ordenado
CREATE INDEX idx_modules_order_index
    ON modules(order_index);

-- Parciales (CRÍTICO para catálogo público)
CREATE INDEX idx_modules_active_published
    ON modules(order_index)
    WHERE is_published = true AND status = 'published';

-- Arrays
CREATE INDEX idx_modules_prerequisites_gin
    ON modules USING GIN(prerequisites);

CREATE INDEX idx_modules_tags_gin
    ON modules USING GIN(tags);

-- JSONB
CREATE INDEX idx_modules_content_gin
    ON modules USING GIN(content);

-- Full-Text Search (español)
CREATE INDEX idx_modules_search
    ON modules
    USING GIN(to_tsvector('spanish',
        coalesce(title, '') || ' ' || coalesce(description, '')));
```

**Queries optimizados:**
```sql
-- Catálogo público
SELECT * FROM modules
WHERE is_published = true AND status = 'published'
ORDER BY order_index;
-- Usa: idx_modules_active_published

-- Búsqueda full-text
SELECT * FROM modules
WHERE to_tsvector('spanish', title || ' ' || description)
      @@ to_tsquery('spanish', 'marie & curie');
-- Usa: idx_modules_search
```

---

### 4.2 educational_content.exercises
```sql
-- Por módulo y tipo
CREATE INDEX idx_exercises_module_type_active
    ON exercises(module_id, exercise_type, is_active);

-- Parciales (ejercicios auto-evaluables)
CREATE INDEX idx_exercises_active_gradable
    ON exercises(module_id, order_index)
    WHERE is_active = true AND auto_gradable = true;

-- JSONB
CREATE INDEX idx_exercises_content_gin
    ON exercises USING GIN(content);

CREATE INDEX idx_exercises_config_gin
    ON exercises USING GIN(config);

-- Full-Text Search (español)
CREATE INDEX idx_exercises_search
    ON exercises
    USING GIN(to_tsvector('spanish',
        coalesce(title, '') || ' ' || coalesce(description, '')));
```

---

## 5. Referencias

- **Parte 2:** `INDICES-PARTE-2.md` (Progress Tracking, Social, Auditoría)
- **Esquema:** `ESQUEMA-44-TABLAS.md`
- **Migraciones:** `../01-migraciones/MIGRACIONES-HISTORICO.md`

---

**Última actualización:** 2025-11-02
**Consolidado por:** ARTEMIS (Agente de Migración)
