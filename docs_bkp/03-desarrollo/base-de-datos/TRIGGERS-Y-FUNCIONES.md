# Triggers y Funciones - GAMILIT Platform

**Plataforma:** GAMILIT(Gamified Learning Interactive Toolkit)
**Base de datos:** PostgreSQL 14+
**Última actualización:** 2025-10-27

---

## Resumen Ejecutivo

- **Total de Triggers:** 30
- **Total de Funciones:** 26
- **Trigger Functions:** 7
- **Business Logic Functions:** 6
- **Utility Functions:** 2
- **Cleanup Functions:** 2

---

## 1. Funciones Utilitarias (Utility Functions)

### 1.1 `gamilit.now_mexico()`

**Propósito:** Retorna timestamp actual en zona horaria de México (America/Mexico_City).

```sql
CREATE OR REPLACE FUNCTION gamilit.now_mexico()
RETURNS TIMESTAMPTZ AS $$
BEGIN
    RETURN NOW() AT TIME ZONE 'America/Mexico_City';
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

**Uso:**
- Defaults en columnas `created_at` y `updated_at`
- Cualquier operación que requiera timestamp en zona horaria México

**Ejemplo:**
```sql
created_at TIMESTAMPTZ DEFAULT gamilit.now_mexico()
```

---

### 1.2 `gamilit.update_updated_at_column()`

**Propósito:** Función trigger para actualizar automáticamente campo `updated_at`.

```sql
CREATE OR REPLACE FUNCTION gamilit.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = gamilit.now_mexico();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Uso:**
- Trigger `BEFORE UPDATE` en 22+ tablas
- Mantiene `updated_at` sincronizado automáticamente

---

## 2. Triggers de Timestamp Automático

### 2.1 Listado Completo de Triggers `updated_at`

**Total:** 22 triggers aplicados a tablas principales.

#### Schema: auth_management
```sql
CREATE TRIGGER trg_tenants_updated_at
    BEFORE UPDATE ON auth_management.tenants
    FOR EACH ROW EXECUTE FUNCTION gamilit.update_updated_at_column();

CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON auth_management.profiles
    FOR EACH ROW EXECUTE FUNCTION gamilit.update_updated_at_column();

CREATE TRIGGER trg_user_roles_updated_at
    BEFORE UPDATE ON auth_management.user_roles
    FOR EACH ROW EXECUTE FUNCTION gamilit.update_updated_at_column();

CREATE TRIGGER trg_memberships_updated_at
    BEFORE UPDATE ON auth_management.memberships
    FOR EACH ROW EXECUTE FUNCTION gamilit.update_updated_at_column();
```

#### Schema: gamification_system
```sql
CREATE TRIGGER trg_user_stats_updated_at
    BEFORE UPDATE ON gamification_system.user_stats
    FOR EACH ROW EXECUTE FUNCTION gamilit.update_updated_at_column();

CREATE TRIGGER trg_user_ranks_updated_at
    BEFORE UPDATE ON gamification_system.user_ranks
    FOR EACH ROW EXECUTE FUNCTION gamilit.update_updated_at_column();

CREATE TRIGGER trg_achievements_updated_at
    BEFORE UPDATE ON gamification_system.achievements
    FOR EACH ROW EXECUTE FUNCTION gamilit.update_updated_at_column();

CREATE TRIGGER trg_comodines_inventory_updated_at
    BEFORE UPDATE ON gamification_system.comodines_inventory
    FOR EACH ROW EXECUTE FUNCTION gamilit.update_updated_at_column();
```

#### Schema: educational_content
```sql
CREATE TRIGGER trg_modules_updated_at
    BEFORE UPDATE ON educational_content.modules
    FOR EACH ROW EXECUTE FUNCTION gamilit.update_updated_at_column();

CREATE TRIGGER trg_exercises_updated_at
    BEFORE UPDATE ON educational_content.exercises
    FOR EACH ROW EXECUTE FUNCTION gamilit.update_updated_at_column();

CREATE TRIGGER trg_assessment_rubrics_updated_at
    BEFORE UPDATE ON educational_content.assessment_rubrics
    FOR EACH ROW EXECUTE FUNCTION gamilit.update_updated_at_column();

CREATE TRIGGER trg_media_resources_updated_at
    BEFORE UPDATE ON educational_content.media_resources
    FOR EACH ROW EXECUTE FUNCTION gamilit.update_updated_at_column();
```

#### Schema: progress_tracking
```sql
CREATE TRIGGER trg_module_progress_updated_at
    BEFORE UPDATE ON progress_tracking.module_progress
    FOR EACH ROW EXECUTE FUNCTION gamilit.update_updated_at_column();
```

#### Schema: social_features
```sql
CREATE TRIGGER trg_schools_updated_at
    BEFORE UPDATE ON social_features.schools
    FOR EACH ROW EXECUTE FUNCTION gamilit.update_updated_at_column();

CREATE TRIGGER trg_classrooms_updated_at
    BEFORE UPDATE ON social_features.classrooms
    FOR EACH ROW EXECUTE FUNCTION gamilit.update_updated_at_column();

CREATE TRIGGER trg_classroom_members_updated_at
    BEFORE UPDATE ON social_features.classroom_members
    FOR EACH ROW EXECUTE FUNCTION gamilit.update_updated_at_column();

CREATE TRIGGER trg_teams_updated_at
    BEFORE UPDATE ON social_features.teams
    FOR EACH ROW EXECUTE FUNCTION gamilit.update_updated_at_column();
```

#### Schema: content_management
```sql
CREATE TRIGGER trg_marie_curie_content_updated_at
    BEFORE UPDATE ON content_management.marie_curie_content
    FOR EACH ROW EXECUTE FUNCTION gamilit.update_updated_at_column();

CREATE TRIGGER trg_media_files_updated_at
    BEFORE UPDATE ON content_management.media_files
    FOR EACH ROW EXECUTE FUNCTION gamilit.update_updated_at_column();

CREATE TRIGGER trg_content_templates_updated_at
    BEFORE UPDATE ON content_management.content_templates
    FOR EACH ROW EXECUTE FUNCTION gamilit.update_updated_at_column();
```

#### Schema: system_configuration
```sql
CREATE TRIGGER trg_system_settings_updated_at
    BEFORE UPDATE ON system_configuration.system_settings
    FOR EACH ROW EXECUTE FUNCTION gamilit.update_updated_at_column();

CREATE TRIGGER trg_feature_flags_updated_at
    BEFORE UPDATE ON system_configuration.feature_flags
    FOR EACH ROW EXECUTE FUNCTION gamilit.update_updated_at_column();
```

#### Schema: audit_logging
```sql
CREATE TRIGGER trg_system_alerts_updated_at
    BEFORE UPDATE ON audit_logging.system_alerts
    FOR EACH ROW EXECUTE FUNCTION gamilit.update_updated_at_column();
```

---

## 3. Triggers de Lógica de Negocio

### 3.1 `trg_audit_profile_changes`

**Tabla:** `auth_management.profiles`
**Timing:** `AFTER UPDATE`
**Propósito:** Auditar cambios importantes en perfiles (rol, status).

**Función:**
```sql
CREATE OR REPLACE FUNCTION gamilit.audit_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        -- Log role changes
        IF OLD.role != NEW.role THEN
            INSERT INTO audit_logging.audit_logs (
                event_type,
                action,
                resource_type,
                resource_id,
                actor_id,
                old_values,
                new_values,
                description
            ) VALUES (
                'role_changed',
                'UPDATE',
                'profile',
                NEW.id,
                NEW.id,
                jsonb_build_object('role', OLD.role),
                jsonb_build_object('role', NEW.role),
                format('User role changed from %s to %s', OLD.role, NEW.role)
            );
        END IF;

        -- Log status changes
        IF OLD.status != NEW.status THEN
            INSERT INTO audit_logging.audit_logs (
                event_type,
                action,
                resource_type,
                resource_id,
                actor_id,
                old_values,
                new_values,
                description
            ) VALUES (
                'status_changed',
                'UPDATE',
                'profile',
                NEW.id,
                NEW.id,
                jsonb_build_object('status', OLD.status),
                jsonb_build_object('status', NEW.status),
                format('User status changed from %s to %s', OLD.status, NEW.status)
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Casos de uso:**
- Auditoría de cambios de rol (student → admin_teacher)
- Auditoría de suspensiones/bans (active → suspended/banned)
- Compliance y seguridad

---

### 3.2 `trg_set_profile_defaults`

**Tabla:** `auth_management.profiles`
**Timing:** `BEFORE INSERT`
**Propósito:** Establecer valores por defecto para nuevos usuarios.

**Función:**
```sql
CREATE OR REPLACE FUNCTION gamilit.set_profile_defaults()
RETURNS TRIGGER AS $$
BEGIN
    -- Set default authentication values if not provided
    IF NEW.is_active IS NULL THEN
        NEW.is_active := true;
    END IF;

    IF NEW.email_verified IS NULL THEN
        NEW.email_verified := true;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Casos de uso:**
- Usuarios activos por defecto (nuevo modelo de autenticación)
- Email verificado por defecto (confianza en SSO)

---

### 3.3 `trg_initialize_user_stats`

**Tabla:** `auth_management.profiles`
**Timing:** `AFTER INSERT`
**Propósito:** Inicializar datos de gamificación para nuevos usuarios.

**Función:**
```sql
CREATE OR REPLACE FUNCTION gamilit.initialize_user_stats()
RETURNS TRIGGER AS $$
DECLARE
    initial_coins INTEGER;
    initial_level INTEGER;
BEGIN
    -- Determine initial ML coins and level based on role
    IF NEW.role = 'super_admin' THEN
        initial_coins := 1000;
        initial_level := 10;
    ELSIF NEW.role = 'admin_teacher' THEN
        initial_coins := 500;
        initial_level := 5;
    ELSE -- student and any other roles
        initial_coins := 100;
        initial_level := 1;
    END IF;

    -- Create user stats for ALL roles
    INSERT INTO gamification_system.user_stats (
        user_id,
        tenant_id,
        ml_coins,
        ml_coins_earned_total,
        level
    ) VALUES (
        NEW.id,
        NEW.tenant_id,
        initial_coins,
        initial_coins,
        initial_level
    );

    -- Create comodines inventory
    INSERT INTO gamification_system.comodines_inventory (
        user_id
    ) VALUES (
        NEW.id
    );

    -- Create initial user rank (Ajaw)
    INSERT INTO gamification_system.user_ranks (
        user_id,
        tenant_id,
        current_rank
    ) VALUES (
        NEW.id,
        NEW.tenant_id,
        'nacom'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Casos de uso:**
- Nuevo estudiante: 100 ML Coins, nivel 1, rango Ajaw
- Nuevo profesor: 500 ML Coins, nivel 5, rango Ajaw
- Nuevo super_admin: 1000 ML Coins, nivel 10, rango Ajaw

**Nota:** Todos los usuarios reciben datos de gamificación (incluyendo profesores para engagement).

---

### 3.4 `trg_update_user_stats_on_exercise`

**Tabla:** `progress_tracking.exercise_attempts`
**Timing:** `AFTER INSERT`
**Propósito:** Actualizar estadísticas de usuario al completar ejercicio.

**Función:**
```sql
CREATE OR REPLACE FUNCTION gamilit.update_user_stats_on_exercise_complete()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_correct = true THEN
        -- Update user stats
        UPDATE gamification_system.user_stats
        SET
            exercises_completed = exercises_completed + 1,
            total_xp = total_xp + COALESCE(NEW.xp_earned, 0),
            ml_coins = ml_coins + COALESCE(NEW.ml_coins_earned, 0),
            ml_coins_earned_total = ml_coins_earned_total + COALESCE(NEW.ml_coins_earned, 0),
            last_activity_at = gamilit.now_mexico(),
            updated_at = gamilit.now_mexico()
        WHERE user_id = NEW.user_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Flujo:**
1. Estudiante completa ejercicio correctamente
2. Se inserta registro en `exercise_attempts` con `is_correct = true`
3. Trigger se dispara automáticamente
4. Actualiza contadores, XP y ML Coins en `user_stats`

**Nota:** El multiplicador de rango se aplica en la función `award_ml_coins()`, no en este trigger.

---

### 3.5 `trg_recalculate_level_on_xp_change`

**Tabla:** `gamification_system.user_stats`
**Timing:** `BEFORE UPDATE OF total_xp`
**Propósito:** Recalcular nivel automáticamente cuando cambia el XP total.

**Función:**
```sql
CREATE OR REPLACE FUNCTION gamification_system.calculate_level_from_xp()
RETURNS TRIGGER AS $$
DECLARE
    v_new_level INTEGER;
BEGIN
    -- Calculate level using formula: level = floor(sqrt(xp / 100)) + 1
    v_new_level := FLOOR(SQRT(NEW.total_xp::numeric / 100.0)) + 1;

    -- Update level if it has changed
    IF v_new_level != NEW.level THEN
        NEW.level := v_new_level;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Trigger:**
```sql
CREATE TRIGGER trg_recalculate_level_on_xp_change
BEFORE UPDATE OF total_xp ON gamification_system.user_stats
FOR EACH ROW
WHEN (NEW.total_xp IS DISTINCT FROM OLD.total_xp)
EXECUTE FUNCTION gamification_system.calculate_level_from_xp();
```

**Fórmula de nivel:**
```
level = floor(sqrt(total_xp / 100)) + 1

Ejemplos:
  0 XP → nivel 1
100 XP → nivel 2
400 XP → nivel 3
900 XP → nivel 4
```

**Casos de uso:**
- Actualización automática de nivel al ganar XP
- No requiere cálculo manual en código de aplicación
- Consistencia garantizada a nivel de base de datos

---

### 3.6 `trg_update_classroom_count`

**Tabla:** `social_features.classroom_members`
**Timing:** `AFTER INSERT OR DELETE`
**Propósito:** Mantener contador de estudiantes por aula actualizado.

**Función:**
```sql
CREATE OR REPLACE FUNCTION gamilit.update_classroom_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE social_features.classrooms
        SET current_students_count = current_students_count + 1
        WHERE id = NEW.classroom_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE social_features.classrooms
        SET current_students_count = GREATEST(0, current_students_count - 1)
        WHERE id = OLD.classroom_id;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;
```

**Casos de uso:**
- Estudiante se une a aula → incrementa contador
- Estudiante sale de aula → decrementa contador (mínimo 0)
- Dashboard de profesores muestra count correcto

---

### 3.7 `log_user_login_activity`

**Tabla:** `auth.users` (tabla de Supabase/externa)
**Timing:** `AFTER UPDATE`
**Propósito:** Registrar actividad de login automáticamente.

**Nota:** Este trigger aplica a tabla externa de autenticación.

---

## 4. Funciones de Negocio (Business Logic)

### 4.1 `gamification_system.calculate_level_from_xp(p_xp INTEGER)`

**Tipo:** Función pura (no trigger)
**Retorna:** INTEGER

```sql
CREATE OR REPLACE FUNCTION gamification_system.calculate_level_from_xp(p_xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN FLOOR(SQRT(p_xp::numeric / 100.0)) + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

**Uso:**
- Cálculos de nivel en queries
- Validación de nivel esperado

**Ejemplo:**
```sql
SELECT gamification_system.calculate_level_from_xp(900);
-- Retorna: 4
```

---

### 4.2 `gamification_system.calculate_xp_for_next_level(p_current_level INTEGER)`

**Tipo:** Función pura
**Retorna:** INTEGER (XP necesaria para siguiente nivel)

```sql
CREATE OR REPLACE FUNCTION gamification_system.calculate_xp_for_next_level(p_current_level INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN (p_current_level * p_current_level * 100) - ((p_current_level - 1) * (p_current_level - 1) * 100);
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

**Ejemplo:**
```sql
SELECT gamification_system.calculate_xp_for_next_level(3);
-- Retorna: 500 XP (de nivel 3 a nivel 4)
```

---

### 4.3 `gamification_system.get_user_rank_requirements(p_current_rank rango_maya)`

**Tipo:** Función de tabla (TABLE function)
**Retorna:** TABLE (next_rank, modules_required, xp_required, ml_coins_bonus)

```sql
CREATE OR REPLACE FUNCTION gamification_system.get_user_rank_requirements(p_current_rank rango_maya)
RETURNS TABLE (
    next_rank rango_maya,
    modules_required INTEGER,
    xp_required INTEGER,
    ml_coins_bonus INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        CASE p_current_rank
            WHEN 'nacom' THEN 'batab'::rango_maya
            WHEN 'batab' THEN 'holcatte'::rango_maya
            WHEN 'holcatte' THEN 'guerrero'::rango_maya
            WHEN 'guerrero' THEN 'mercenario'::rango_maya
            ELSE NULL::rango_maya
        END,
        CASE p_current_rank
            WHEN 'nacom' THEN 1
            WHEN 'batab' THEN 2
            WHEN 'holcatte' THEN 3
            WHEN 'guerrero' THEN 5
            ELSE 0
        END,
        CASE p_current_rank
            WHEN 'nacom' THEN 500
            WHEN 'batab' THEN 1500
            WHEN 'holcatte' THEN 3000
            WHEN 'guerrero' THEN 5000
            ELSE 0
        END,
        CASE p_current_rank
            WHEN 'nacom' THEN 100
            WHEN 'batab' THEN 250
            WHEN 'holcatte' THEN 500
            WHEN 'guerrero' THEN 1000
            ELSE 0
        END;
END;
$$ LANGUAGE plpgsql STABLE;
```

**Ejemplo:**
```sql
SELECT * FROM gamification_system.get_user_rank_requirements('nacom');

-- Resultado:
-- next_rank | modules_required | xp_required | ml_coins_bonus
-- ----------|------------------|-------------|----------------
-- batab     | 1                | 500         | 100
```

---

### 4.4 `gamification_system.award_ml_coins()`

**Tipo:** Función transaccional
**Retorna:** UUID (transaction_id)

**Parámetros:**
- `p_user_id` UUID
- `p_amount` INTEGER (cantidad base)
- `p_transaction_type` TEXT
- `p_description` TEXT
- `p_reference_id` UUID (opcional)
- `p_reference_type` TEXT (opcional)

```sql
CREATE OR REPLACE FUNCTION gamification_system.award_ml_coins(
    p_user_id UUID,
    p_amount INTEGER,
    p_transaction_type TEXT,
    p_description TEXT,
    p_reference_id UUID DEFAULT NULL,
    p_reference_type TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_transaction_id UUID;
    v_current_balance INTEGER;
    v_new_balance INTEGER;
    v_current_rank rango_maya;
    v_multiplier DECIMAL(3,2);
    v_final_amount INTEGER;
BEGIN
    -- Get current balance
    SELECT ml_coins INTO v_current_balance
    FROM gamification_system.user_stats
    WHERE user_id = p_user_id;

    -- Get current rank
    SELECT current_rank INTO v_current_rank
    FROM gamification_system.user_ranks
    WHERE user_id = p_user_id AND is_current = true;

    -- Calculate multiplier based on rank
    v_multiplier := CASE v_current_rank
        WHEN 'nacom' THEN 1.00
        WHEN 'batab' THEN 1.25
        WHEN 'holcatte' THEN 1.50
        WHEN 'guerrero' THEN 1.75
        WHEN 'mercenario' THEN 2.00
        ELSE 1.00
    END;

    -- Apply rank multiplier to base amount
    v_final_amount := FLOOR(p_amount * v_multiplier);

    -- Calculate new balance
    v_new_balance := v_current_balance + v_final_amount;

    -- Update user stats
    UPDATE gamification_system.user_stats
    SET ml_coins = v_new_balance,
        ml_coins_earned_total = ml_coins_earned_total + v_final_amount,
        updated_at = gamilit.now_mexico()
    WHERE user_id = p_user_id;

    -- Create transaction record with metadata
    INSERT INTO gamification_system.ml_coins_transactions (
        user_id,
        amount,
        balance_before,
        balance_after,
        transaction_type,
        description,
        reference_id,
        reference_type,
        multiplier,
        metadata
    ) VALUES (
        p_user_id,
        v_final_amount,
        v_current_balance,
        v_new_balance,
        p_transaction_type,
        p_description,
        p_reference_id,
        p_reference_type,
        v_multiplier,
        jsonb_build_object(
            'base_amount', p_amount,
            'rank', v_current_rank::text,
            'multiplier', v_multiplier,
            'final_amount', v_final_amount
        )
    ) RETURNING id INTO v_transaction_id;

    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;
```

**Características clave:**
- **Multiplicador de rango:** Aplica automáticamente según rango Maya
- **Auditoría completa:** Registra balance_before y balance_after
- **Metadata JSONB:** Almacena detalles del cálculo
- **Atómica:** Todo en una transacción

**Ejemplo de uso:**
```sql
SELECT gamification_system.award_ml_coins(
    'user-uuid',
    50,  -- Base amount
    'earned_exercise',
    'Ejercicio completado: Marie Curie',
    'exercise-uuid',
    'exercise'
);

-- Usuario con rango Ah K'in (1.5x):
-- Base: 50 ML
-- Multiplicador: 1.5x
-- Final: 75 ML Coins otorgados
```

---

### 4.5 `gamification_system.spend_ml_coins()`

**Tipo:** Función transaccional
**Retorna:** UUID (transaction_id)

**Parámetros:** Similares a `award_ml_coins()` pero monto es negativo.

```sql
CREATE OR REPLACE FUNCTION gamification_system.spend_ml_coins(
    p_user_id UUID,
    p_amount INTEGER,
    p_transaction_type TEXT,
    p_description TEXT,
    p_reference_id UUID DEFAULT NULL,
    p_reference_type TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_transaction_id UUID;
    v_current_balance INTEGER;
    v_new_balance INTEGER;
BEGIN
    -- Get current balance
    SELECT ml_coins INTO v_current_balance
    FROM gamification_system.user_stats
    WHERE user_id = p_user_id;

    -- Validate sufficient funds
    IF v_current_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient ML Coins. Current: %, Required: %', v_current_balance, p_amount;
    END IF;

    -- Calculate new balance
    v_new_balance := v_current_balance - p_amount;

    -- Update user stats
    UPDATE gamification_system.user_stats
    SET ml_coins = v_new_balance,
        ml_coins_spent_total = ml_coins_spent_total + p_amount,
        updated_at = gamilit.now_mexico()
    WHERE user_id = p_user_id;

    -- Create transaction record
    INSERT INTO gamification_system.ml_coins_transactions (
        user_id,
        amount,
        balance_before,
        balance_after,
        transaction_type,
        description,
        reference_id,
        reference_type
    ) VALUES (
        p_user_id,
        -p_amount,
        v_current_balance,
        v_new_balance,
        p_transaction_type,
        p_description,
        p_reference_id,
        p_reference_type
    ) RETURNING id INTO v_transaction_id;

    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;
```

**Validaciones:**
- **Fondos suficientes:** Lanza excepción si no hay ML Coins
- **Monto negativo:** Se registra con `-p_amount`

**Ejemplo de uso:**
```sql
-- Compra de comodín "Pistas" (15 ML)
SELECT gamification_system.spend_ml_coins(
    'user-uuid',
    15,
    'spent_hint',
    'Compra de comodín Pistas',
    'exercise-uuid',
    'comodin'
);
```

---

### 4.6 `progress_tracking.calculate_module_progress(p_user_id, p_module_id)`

**Tipo:** Función calculada
**Retorna:** NUMERIC (porcentaje 0-100)

```sql
CREATE OR REPLACE FUNCTION progress_tracking.calculate_module_progress(
    p_user_id UUID,
    p_module_id UUID
)
RETURNS NUMERIC AS $$
DECLARE
    v_total_exercises INTEGER;
    v_completed_exercises INTEGER;
    v_progress NUMERIC;
BEGIN
    -- Count total exercises in module
    SELECT COUNT(*)
    INTO v_total_exercises
    FROM educational_content.exercises
    WHERE module_id = p_module_id AND is_active = true;

    -- Count completed exercises by user
    SELECT COUNT(DISTINCT ea.exercise_id)
    INTO v_completed_exercises
    FROM progress_tracking.exercise_attempts ea
    JOIN educational_content.exercises e ON e.id = ea.exercise_id
    WHERE ea.user_id = p_user_id
      AND e.module_id = p_module_id
      AND ea.is_correct = true;

    -- Calculate percentage
    IF v_total_exercises = 0 THEN
        RETURN 0;
    END IF;

    v_progress := (v_completed_exercises::numeric / v_total_exercises::numeric) * 100;
    RETURN ROUND(v_progress, 2);
END;
$$ LANGUAGE plpgsql STABLE;
```

**Ejemplo:**
```sql
SELECT progress_tracking.calculate_module_progress(
    'user-uuid',
    'module-uuid'
);
-- Retorna: 75.00 (75% completado)
```

---

### 4.7 `progress_tracking.get_user_progress_summary(p_user_id)`

**Tipo:** Función de tabla agregada
**Retorna:** TABLE con resumen completo de progreso

```sql
CREATE OR REPLACE FUNCTION progress_tracking.get_user_progress_summary(p_user_id UUID)
RETURNS TABLE (
    total_modules INTEGER,
    completed_modules INTEGER,
    in_progress_modules INTEGER,
    total_exercises_attempted INTEGER,
    total_exercises_completed INTEGER,
    average_score NUMERIC,
    total_time_spent_hours NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(DISTINCT mp.module_id)::INTEGER,
        COUNT(DISTINCT mp.module_id) FILTER (WHERE mp.status = 'completed')::INTEGER,
        COUNT(DISTINCT mp.module_id) FILTER (WHERE mp.status = 'in_progress')::INTEGER,
        COUNT(ea.id)::INTEGER,
        COUNT(ea.id) FILTER (WHERE ea.is_correct = true)::INTEGER,
        AVG(ea.score)::NUMERIC(5,2),
        EXTRACT(EPOCH FROM SUM(mp.time_spent))::NUMERIC / 3600
    FROM progress_tracking.module_progress mp
    LEFT JOIN progress_tracking.exercise_attempts ea ON ea.user_id = mp.user_id
    WHERE mp.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql STABLE;
```

**Ejemplo:**
```sql
SELECT * FROM progress_tracking.get_user_progress_summary('user-uuid');

-- Resultado:
-- total_modules | completed | in_progress | attempted | completed | avg_score | hours
-- --------------|-----------|-------------|-----------|-----------|-----------|-------
-- 5             | 2         | 3           | 45        | 38        | 85.50     | 12.50
```

---

## 5. Funciones de Limpieza (Cleanup Functions)

### 5.1 `cleanup_old_user_activity(days_to_keep INTEGER)`

**Propósito:** Limpiar logs antiguos de actividad de usuario.

```sql
CREATE OR REPLACE FUNCTION cleanup_old_user_activity(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM audit_logging.user_activity_logs
    WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
```

**Uso:**
```sql
-- Eliminar actividad mayor a 90 días
SELECT cleanup_old_user_activity(90);
-- Retorna: 12450 (registros eliminados)
```

---

### 5.2 `cleanup_old_system_logs(days_to_keep INTEGER)`

**Propósito:** Limpiar logs de sistema manteniendo errores más tiempo.

```sql
CREATE OR REPLACE FUNCTION cleanup_old_system_logs(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete old logs, keeping errors/warnings longer
    DELETE FROM audit_logging.system_logs
    WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL
      AND log_level NOT IN ('ERROR', 'FATAL');

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
```

**Política de retención:**
- Logs INFO/DEBUG: 30 días
- Logs ERROR/FATAL: Se mantienen (cleanup manual)

---

## 6. Diagrama de Flujo de Triggers

```
┌─────────────────────────────────────────────────────────────┐
│            CREACIÓN DE NUEVO USUARIO                        │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
    INSERT INTO profiles (email, role='student')
                          │
                          ▼
    ┌─────────────────────────────────────────────────┐
    │ BEFORE INSERT: trg_set_profile_defaults        │
    │ - is_active = true                              │
    │ - email_verified = true                         │
    └─────────────────────────────────────────────────┘
                          │
                          ▼
            Registro insertado en profiles
                          │
                          ▼
    ┌─────────────────────────────────────────────────┐
    │ AFTER INSERT: trg_initialize_user_stats        │
    │ - user_stats (100 ML, nivel 1)                 │
    │ - comodines_inventory (vacío)                  │
    │ - user_ranks (Ajaw)                           │
    └─────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│            COMPLETAR EJERCICIO                              │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
    INSERT INTO exercise_attempts (is_correct=true, xp_earned=20, ml_coins_earned=5)
                          │
                          ▼
    ┌─────────────────────────────────────────────────┐
    │ AFTER INSERT: trg_update_user_stats_on_exercise│
    │ - exercises_completed += 1                      │
    │ - total_xp += 20                                │
    │ - ml_coins += 5 (con multiplicador aplicado)   │
    └─────────────────────────────────────────────────┘
                          │
                          ▼
    UPDATE user_stats SET total_xp = total_xp + 20
                          │
                          ▼
    ┌─────────────────────────────────────────────────┐
    │ BEFORE UPDATE: trg_recalculate_level_on_xp_change│
    │ - Recalcula nivel si XP cambió                  │
    │ - level = floor(sqrt(total_xp/100)) + 1         │
    └─────────────────────────────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────────────────┐
    │ BEFORE UPDATE: trg_user_stats_updated_at       │
    │ - updated_at = NOW()                            │
    └─────────────────────────────────────────────────┘
```

---

## 7. Buenas Prácticas

### 7.1 Triggers
- **Evitar lógica compleja:** Delegar a funciones reutilizables
- **Performance:** Minimizar queries dentro de triggers
- **Idempotencia:** Triggers deben ser seguros de ejecutar múltiples veces
- **Testing:** Probar casos edge (NULL, valores extremos)

### 7.2 Funciones
- **Documentación:** Comentarios SQL claros con propósito
- **Manejo de errores:** RAISE EXCEPTION para casos inválidos
- **Transaccionalidad:** Funciones que modifican datos deben ser atómicas
- **Clasificación:**
  - `IMMUTABLE` - Siempre mismo resultado (ej: cálculos matemáticos)
  - `STABLE` - Mismo resultado en misma transacción (ej: lecturas)
  - `VOLATILE` - Puede cambiar (default, para writes)

---

## 8. Archivos SQL de Referencia

```
/home/isem/workspace/projects/glit/database/clean_ddl/
├── 10_functions.sql  # Todas las funciones de negocio
└── 11_triggers.sql   # Todos los triggers
```

---

**Documento generado:** 2025-10-27
**Versión de base de datos:** PostgreSQL 14+
**Plataforma:** GAMILIT(Gamified Learning Interactive Toolkit)
