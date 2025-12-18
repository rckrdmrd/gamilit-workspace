# DIRECTIVA: DISENO DE BASE DE DATOS - GAMILIT

**Proyecto:** GAMILIT - Sistema de Gamificacion Educativa
**Extiende:** core/orchestration/directivas/DIRECTIVA-DISENO-BASE-DATOS.md
**Version:** 2.0.0
**Fecha:** 2025-12-05
**Ambito:** Database-Agent y subagentes del proyecto GAMILIT
**Tipo:** Directiva Especifica de Proyecto
**Stack:** PostgreSQL 15+ con PostGIS

---

## RELACION CON DIRECTIVA GLOBAL

Esta directiva **EXTIENDE** la directiva global de diseno de base de datos ubicada en:
```
core/orchestration/directivas/DIRECTIVA-DISENO-BASE-DATOS.md
```

**Principios heredados de la directiva global:**
- Normalizacion minimo 3NF
- UUIDs como primary keys
- Nomenclatura de constraints (fk_, uq_, chk_)
- Indexacion estrategica
- Columnas de auditoria obligatorias

**Esta directiva especifica:**
- Schemas del proyecto GAMILIT
- Contextos de negocio especificos
- Ejemplos concretos del dominio de gamificacion educativa

---

## PATHS ESPECIFICOS DE GAMILIT

```yaml
Variables resueltas para GAMILIT:
  PROJECT:           gamilit
  PROJECT_ROOT:      projects/gamilit
  APPS_ROOT:         projects/gamilit/apps
  DOCS_ROOT:         projects/gamilit/docs
  ORCHESTRATION:     projects/gamilit/orchestration

Base de Datos:
  DB_NAME:           gamilit_platform
  DB_DDL_PATH:       projects/gamilit/apps/database/ddl
  DB_SCRIPTS_PATH:   projects/gamilit/apps/database
  DB_SEEDS_PATH:     projects/gamilit/apps/database/seeds
  RECREATE_CMD:      drop-and-recreate-database.sh
```

---

## SCHEMAS DE GAMILIT

### Organizacion por Bounded Context

```yaml
Schemas del proyecto GAMILIT:

auth_management:
  Descripcion: Autenticacion, autorizacion y gestion de tenants
  Tablas principales:
    - users (usuarios del sistema)
    - roles (roles disponibles)
    - permissions (permisos granulares)
    - user_roles (asignacion de roles)
    - tenants (multi-tenancy)
    - sessions (sesiones activas)

academic_management:
  Descripcion: Gestion academica (instituciones, cursos, estudiantes)
  Tablas principales:
    - institutions (instituciones educativas)
    - courses (cursos/materias)
    - course_sections (secciones de cursos)
    - students (estudiantes)
    - teachers (profesores)
    - enrollments (inscripciones)

gamification_system:
  Descripcion: Nucleo de gamificacion (puntos, niveles, badges, challenges)
  Tablas principales:
    - user_points (puntos acumulados)
    - point_transactions (historial de puntos)
    - levels (niveles del sistema)
    - user_levels (nivel actual por usuario)
    - badges (insignias disponibles)
    - user_badges (badges ganados)
    - challenges (desafios)
    - user_challenges (progreso en desafios)
    - rewards (recompensas canjeables)
    - reward_redemptions (canjes realizados)

exercise_management:
  Descripcion: Gestion de ejercicios y evaluaciones
  Tablas principales:
    - exercise_types (tipos de ejercicios)
    - exercises (ejercicios)
    - exercise_variants (variantes por dificultad)
    - exercise_solutions (soluciones correctas)
    - exercise_submissions (entregas de estudiantes)
    - exercise_evaluations (evaluaciones automaticas/manuales)

progress_tracking:
  Descripcion: Seguimiento de progreso estudiantil
  Tablas principales:
    - student_progress (progreso general)
    - topic_mastery (dominio por tema)
    - skill_assessments (evaluacion de habilidades)
    - learning_paths (rutas de aprendizaje)
    - progress_milestones (hitos de progreso)

guild_management:
  Descripcion: Sistema de guildas y competencias grupales
  Tablas principales:
    - guilds (guildas/equipos)
    - guild_members (miembros de guildas)
    - guild_challenges (desafios de guilda)
    - guild_rankings (rankings por guilda)
    - guild_competitions (competencias entre guildas)

notification_management:
  Descripcion: Sistema de notificaciones y mensajeria
  Tablas principales:
    - notification_templates (plantillas)
    - notifications (notificaciones enviadas)
    - notification_preferences (preferencias por usuario)
    - in_app_messages (mensajes internos)
```

---

## EJEMPLOS ESPECIFICOS DE GAMILIT

### Tabla de Puntos (gamification_system.user_points)

```sql
-- File: apps/database/ddl/schemas/gamification_system/tables/01-user-points.sql

DROP TABLE IF EXISTS gamification_system.user_points CASCADE;

CREATE TABLE gamification_system.user_points (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relaciones
    user_id UUID NOT NULL,
    tenant_id UUID NOT NULL,

    -- Datos de puntos
    total_points INTEGER NOT NULL DEFAULT 0,
    available_points INTEGER NOT NULL DEFAULT 0,  -- Puntos para canjear
    lifetime_points INTEGER NOT NULL DEFAULT 0,   -- Puntos totales historicos

    -- Auditoria
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT fk_user_points_to_users
        FOREIGN KEY (user_id)
        REFERENCES auth_management.users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_user_points_to_tenants
        FOREIGN KEY (tenant_id)
        REFERENCES auth_management.tenants(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_user_points_user_tenant
        UNIQUE (user_id, tenant_id),

    CONSTRAINT chk_user_points_total_positive
        CHECK (total_points >= 0),

    CONSTRAINT chk_user_points_available_positive
        CHECK (available_points >= 0),

    CONSTRAINT chk_user_points_available_lte_total
        CHECK (available_points <= total_points)
);

-- Indices
CREATE INDEX idx_user_points_user_id ON gamification_system.user_points(user_id);
CREATE INDEX idx_user_points_tenant_id ON gamification_system.user_points(tenant_id);
CREATE INDEX idx_user_points_total_points ON gamification_system.user_points(total_points DESC);

-- Trigger para updated_at
CREATE TRIGGER trg_user_points_updated_at
BEFORE UPDATE ON gamification_system.user_points
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comentarios
COMMENT ON TABLE gamification_system.user_points IS
'Puntos acumulados por usuario. Soporta multi-tenancy para diferentes instituciones.';

COMMENT ON COLUMN gamification_system.user_points.available_points IS
'Puntos disponibles para canjear por recompensas. Puede ser menor que total_points si ya se canjearon algunos.';
```

### Tabla de Badges (gamification_system.badges)

```sql
-- File: apps/database/ddl/schemas/gamification_system/tables/03-badges.sql

DROP TABLE IF EXISTS gamification_system.badges CASCADE;

CREATE TABLE gamification_system.badges (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identificacion
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,

    -- Configuracion
    category VARCHAR(50) NOT NULL,
    rarity VARCHAR(20) NOT NULL DEFAULT 'common',
    points_value INTEGER NOT NULL DEFAULT 0,
    icon_url VARCHAR(500),

    -- Requisitos para obtener el badge
    requirement_type VARCHAR(50) NOT NULL,  -- 'points', 'exercises', 'streak', 'challenge'
    requirement_value INTEGER NOT NULL,
    requirement_config JSONB,  -- Configuracion adicional flexible

    -- Estado
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_secret BOOLEAN NOT NULL DEFAULT false,  -- Badges ocultos hasta obtenidos

    -- Auditoria
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by_id UUID,
    updated_by_id UUID,

    -- Constraints
    CONSTRAINT chk_badges_rarity_valid
        CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),

    CONSTRAINT chk_badges_category_valid
        CHECK (category IN ('achievement', 'participation', 'mastery', 'social', 'special')),

    CONSTRAINT chk_badges_requirement_type_valid
        CHECK (requirement_type IN ('points', 'exercises', 'streak', 'challenge', 'level', 'time', 'custom')),

    CONSTRAINT chk_badges_points_value_positive
        CHECK (points_value >= 0),

    CONSTRAINT fk_badges_created_by
        FOREIGN KEY (created_by_id) REFERENCES auth_management.users(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_badges_updated_by
        FOREIGN KEY (updated_by_id) REFERENCES auth_management.users(id)
        ON DELETE SET NULL
);

-- Indices
CREATE INDEX idx_badges_category ON gamification_system.badges(category);
CREATE INDEX idx_badges_rarity ON gamification_system.badges(rarity);
CREATE INDEX idx_badges_is_active ON gamification_system.badges(is_active) WHERE is_active = true;
CREATE INDEX idx_badges_requirement_config_gin ON gamification_system.badges USING GIN(requirement_config);

-- Trigger para updated_at
CREATE TRIGGER trg_badges_updated_at
BEFORE UPDATE ON gamification_system.badges
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comentarios
COMMENT ON TABLE gamification_system.badges IS
'Badges/insignias que los estudiantes pueden ganar. Incluye sistema de rareza y requisitos configurables.';

COMMENT ON COLUMN gamification_system.badges.requirement_config IS
'Configuracion adicional en JSON para requisitos complejos. Ej: {"exercise_type": "math", "min_score": 90}';
```

### Tabla de Desafios (gamification_system.challenges)

```sql
-- File: apps/database/ddl/schemas/gamification_system/tables/05-challenges.sql

DROP TABLE IF EXISTS gamification_system.challenges CASCADE;

CREATE TABLE gamification_system.challenges (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identificacion
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,

    -- Configuracion
    challenge_type VARCHAR(50) NOT NULL,  -- 'daily', 'weekly', 'special', 'guild'
    difficulty VARCHAR(20) NOT NULL DEFAULT 'medium',
    points_reward INTEGER NOT NULL DEFAULT 0,
    experience_reward INTEGER NOT NULL DEFAULT 0,

    -- Requisitos
    required_level_id UUID,
    requirements JSONB NOT NULL DEFAULT '{}',

    -- Duracion
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    duration_hours INTEGER,  -- Para challenges con tiempo limite

    -- Estado
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_repeatable BOOLEAN NOT NULL DEFAULT false,
    max_completions INTEGER,  -- null = sin limite

    -- Auditoria
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by_id UUID,

    -- Constraints
    CONSTRAINT fk_challenges_to_levels
        FOREIGN KEY (required_level_id)
        REFERENCES gamification_system.levels(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_challenges_created_by
        FOREIGN KEY (created_by_id) REFERENCES auth_management.users(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_challenges_type_valid
        CHECK (challenge_type IN ('daily', 'weekly', 'monthly', 'special', 'guild', 'event')),

    CONSTRAINT chk_challenges_difficulty_valid
        CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),

    CONSTRAINT chk_challenges_points_positive
        CHECK (points_reward >= 0),

    CONSTRAINT chk_challenges_dates_valid
        CHECK (end_date IS NULL OR start_date IS NULL OR end_date > start_date)
);

-- Indices
CREATE INDEX idx_challenges_type ON gamification_system.challenges(challenge_type);
CREATE INDEX idx_challenges_difficulty ON gamification_system.challenges(difficulty);
CREATE INDEX idx_challenges_required_level_id ON gamification_system.challenges(required_level_id);
CREATE INDEX idx_challenges_active ON gamification_system.challenges(is_active) WHERE is_active = true;
CREATE INDEX idx_challenges_dates ON gamification_system.challenges(start_date, end_date);
CREATE INDEX idx_challenges_requirements_gin ON gamification_system.challenges USING GIN(requirements);

-- Trigger para updated_at
CREATE TRIGGER trg_challenges_updated_at
BEFORE UPDATE ON gamification_system.challenges
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comentarios
COMMENT ON TABLE gamification_system.challenges IS
'Desafios del sistema de gamificacion. Pueden ser diarios, semanales, especiales o de guilda.';

COMMENT ON COLUMN gamification_system.challenges.requirements IS
'Requisitos en JSON. Ej: {"complete_exercises": 5, "exercise_type": "math", "min_score": 80}';
```

---

## VISTAS MATERIALIZADAS DE GAMILIT

### Dashboard de Estudiantes

```sql
-- File: apps/database/ddl/schemas/gamification_system/views/dashboard-student-summary.sql

DROP MATERIALIZED VIEW IF EXISTS gamification_system.dashboard_student_summary;

CREATE MATERIALIZED VIEW gamification_system.dashboard_student_summary AS
SELECT
    s.id AS student_id,
    s.user_id,
    u.username,
    u.email,
    s.tenant_id,

    -- Puntos
    COALESCE(up.total_points, 0) AS total_points,
    COALESCE(up.available_points, 0) AS available_points,

    -- Nivel
    COALESCE(ul.level_number, 1) AS current_level,
    l.name AS level_name,

    -- Estadisticas de ejercicios
    COUNT(DISTINCT es.id) FILTER (WHERE es.status = 'completed') AS exercises_completed,
    COALESCE(AVG(es.score) FILTER (WHERE es.status = 'completed'), 0) AS average_score,

    -- Badges
    COUNT(DISTINCT ub.badge_id) AS total_badges,

    -- Challenges
    COUNT(DISTINCT uc.challenge_id) FILTER (WHERE uc.status = 'completed') AS challenges_completed,

    -- Actividad reciente
    MAX(es.submitted_at) AS last_exercise_date,
    MAX(uc.completed_at) AS last_challenge_date

FROM academic_management.students s
JOIN auth_management.users u ON u.id = s.user_id
LEFT JOIN gamification_system.user_points up ON up.user_id = s.user_id AND up.tenant_id = s.tenant_id
LEFT JOIN gamification_system.user_levels ul ON ul.user_id = s.user_id AND ul.tenant_id = s.tenant_id
LEFT JOIN gamification_system.levels l ON l.id = ul.level_id
LEFT JOIN exercise_management.exercise_submissions es ON es.student_id = s.id
LEFT JOIN gamification_system.user_badges ub ON ub.user_id = s.user_id
LEFT JOIN gamification_system.user_challenges uc ON uc.user_id = s.user_id

WHERE s.deleted_at IS NULL
  AND u.deleted_at IS NULL

GROUP BY
    s.id, s.user_id, u.username, u.email, s.tenant_id,
    up.total_points, up.available_points,
    ul.level_number, l.name;

-- Indices en vista materializada
CREATE INDEX idx_dashboard_student_summary_student_id
    ON gamification_system.dashboard_student_summary(student_id);
CREATE INDEX idx_dashboard_student_summary_tenant_id
    ON gamification_system.dashboard_student_summary(tenant_id);
CREATE INDEX idx_dashboard_student_summary_total_points
    ON gamification_system.dashboard_student_summary(total_points DESC);
CREATE INDEX idx_dashboard_student_summary_current_level
    ON gamification_system.dashboard_student_summary(current_level);

-- Refrescar con:
-- REFRESH MATERIALIZED VIEW CONCURRENTLY gamification_system.dashboard_student_summary;
```

### Leaderboard Global

```sql
-- File: apps/database/ddl/schemas/gamification_system/views/leaderboard-global.sql

DROP MATERIALIZED VIEW IF EXISTS gamification_system.leaderboard_global;

CREATE MATERIALIZED VIEW gamification_system.leaderboard_global AS
SELECT
    ROW_NUMBER() OVER (PARTITION BY up.tenant_id ORDER BY up.total_points DESC) AS rank,
    up.user_id,
    u.username,
    up.tenant_id,
    t.name AS tenant_name,
    up.total_points,
    ul.level_number AS current_level,
    COUNT(DISTINCT ub.badge_id) AS badge_count,
    COUNT(DISTINCT uc.challenge_id) FILTER (WHERE uc.status = 'completed') AS challenges_completed

FROM gamification_system.user_points up
JOIN auth_management.users u ON u.id = up.user_id
JOIN auth_management.tenants t ON t.id = up.tenant_id
LEFT JOIN gamification_system.user_levels ul ON ul.user_id = up.user_id AND ul.tenant_id = up.tenant_id
LEFT JOIN gamification_system.user_badges ub ON ub.user_id = up.user_id
LEFT JOIN gamification_system.user_challenges uc ON uc.user_id = up.user_id

WHERE u.deleted_at IS NULL
  AND up.total_points > 0

GROUP BY
    up.user_id, u.username, up.tenant_id, t.name,
    up.total_points, ul.level_number

ORDER BY up.tenant_id, up.total_points DESC;

-- Indices
CREATE INDEX idx_leaderboard_global_tenant_rank
    ON gamification_system.leaderboard_global(tenant_id, rank);
CREATE INDEX idx_leaderboard_global_user_id
    ON gamification_system.leaderboard_global(user_id);
```

---

## FUNCIONES Y TRIGGERS ESPECIFICOS

### Funcion para Otorgar Puntos

```sql
-- File: apps/database/ddl/schemas/gamification_system/functions/award-points.sql

CREATE OR REPLACE FUNCTION gamification_system.award_points(
    p_user_id UUID,
    p_tenant_id UUID,
    p_points INTEGER,
    p_reason VARCHAR(100),
    p_reference_type VARCHAR(50) DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_transaction_id UUID;
BEGIN
    -- Insertar transaccion de puntos
    INSERT INTO gamification_system.point_transactions (
        user_id, tenant_id, points, reason,
        reference_type, reference_id, transaction_type
    ) VALUES (
        p_user_id, p_tenant_id, p_points, p_reason,
        p_reference_type, p_reference_id, 'earn'
    )
    RETURNING id INTO v_transaction_id;

    -- Actualizar puntos del usuario (upsert)
    INSERT INTO gamification_system.user_points (user_id, tenant_id, total_points, available_points, lifetime_points)
    VALUES (p_user_id, p_tenant_id, p_points, p_points, p_points)
    ON CONFLICT (user_id, tenant_id) DO UPDATE SET
        total_points = gamification_system.user_points.total_points + p_points,
        available_points = gamification_system.user_points.available_points + p_points,
        lifetime_points = gamification_system.user_points.lifetime_points + p_points,
        updated_at = now();

    -- Verificar si hay nuevo nivel (trigger separado manejara esto)
    PERFORM gamification_system.check_level_up(p_user_id, p_tenant_id);

    -- Verificar badges por puntos
    PERFORM gamification_system.check_point_badges(p_user_id, p_tenant_id);

    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION gamification_system.award_points IS
'Otorga puntos a un usuario, registra la transaccion, y verifica level-ups y badges.';
```

---

## REFERENCIA RAPIDA

### Comandos de Recreacion

```bash
# Ubicacion
cd ~/workspace/projects/gamilit/apps/database

# Recrear base de datos completa
./drop-and-recreate-database.sh

# Solo crear (sin drop)
./create-database.sh

# Reset a estado inicial
./reset-database.sh
```

### Estructura de DDL

```
projects/gamilit/apps/database/ddl/
├── 00-prerequisites.sql
└── schemas/
    ├── auth_management/
    │   ├── 00-schema.sql
    │   ├── tables/
    │   ├── functions/
    │   └── policies/
    ├── gamification_system/
    │   ├── 00-schema.sql
    │   ├── tables/
    │   ├── functions/
    │   ├── views/
    │   └── policies/
    ├── academic_management/
    ├── exercise_management/
    ├── progress_tracking/
    ├── guild_management/
    └── notification_management/
```

---

## DOCUMENTOS RELACIONADOS

- **Global:** `core/orchestration/directivas/DIRECTIVA-DISENO-BASE-DATOS.md`
- **Global:** `core/orchestration/directivas/DIRECTIVA-POLITICA-CARGA-LIMPIA.md`
- **Proyecto:** `orchestration/directivas/DIRECTIVA-POLITICA-CARGA-LIMPIA.md`
- **Proyecto:** `docs/database/` - Documentacion detallada de BD

---

**Version:** 2.0.0
**Fecha:** 2025-12-05
**Tipo:** Directiva Especifica de Proyecto (GAMILIT)
**Extiende:** core/orchestration/directivas/DIRECTIVA-DISENO-BASE-DATOS.md
