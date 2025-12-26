-- ============================================================================
-- SCRIPT DE CORRECCIÓN PARA PRODUCCIÓN - GAMILIT
-- ============================================================================
-- Fecha: 2025-12-18
-- Propósito: Crear objetos faltantes en BD de producción
-- Ejecutar como: psql -U gamilit_user -d gamilit_platform -f SCRIPT-CORRECCION-PRODUCCION.sql
-- ============================================================================

\echo '=============================================='
\echo 'INICIO: Corrección de BD Producción - Gamilit'
\echo '=============================================='
\echo ''

-- ============================================================================
-- FASE 0: VERIFICACIÓN INICIAL
-- ============================================================================
\echo 'FASE 0: Verificación inicial...'

SELECT 'Verificando conexión...' as status;
SELECT current_database() as database, current_user as usuario, now() as timestamp;

-- ============================================================================
-- FASE 1: VERIFICAR/CREAR SCHEMAS
-- ============================================================================
\echo ''
\echo 'FASE 1: Verificando schemas...'

CREATE SCHEMA IF NOT EXISTS gamilit;
CREATE SCHEMA IF NOT EXISTS gamification_system;
CREATE SCHEMA IF NOT EXISTS progress_tracking;
CREATE SCHEMA IF NOT EXISTS educational_content;
CREATE SCHEMA IF NOT EXISTS notifications;

SELECT 'Schemas verificados' as status;

-- ============================================================================
-- FASE 2: CREAR ENUMs (si no existen)
-- ============================================================================
\echo ''
\echo 'FASE 2: Creando ENUMs...'

-- ENUM: maya_rank
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'maya_rank' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'gamification_system')) THEN
        CREATE TYPE gamification_system.maya_rank AS ENUM (
            'Ajaw',
            'Nacom',
            'Ah K''in',
            'Halach Uinic',
            'K''uk''ulkan'
        );
        RAISE NOTICE 'ENUM maya_rank creado';
    ELSE
        RAISE NOTICE 'ENUM maya_rank ya existe';
    END IF;
END $$;

-- ENUM: notification_type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'gamification_system')) THEN
        CREATE TYPE gamification_system.notification_type AS ENUM (
            'achievement_unlocked',
            'rank_up',
            'friend_request',
            'guild_invitation',
            'mission_completed',
            'level_up',
            'message_received',
            'system_announcement',
            'ml_coins_earned',
            'streak_milestone',
            'exercise_feedback'
        );
        RAISE NOTICE 'ENUM notification_type creado';
    ELSE
        RAISE NOTICE 'ENUM notification_type ya existe';
    END IF;
END $$;

-- ENUM: notification_priority
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_priority' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'gamification_system')) THEN
        CREATE TYPE gamification_system.notification_priority AS ENUM (
            'low',
            'medium',
            'high',
            'critical'
        );
        RAISE NOTICE 'ENUM notification_priority creado';
    ELSE
        RAISE NOTICE 'ENUM notification_priority ya existe';
    END IF;
END $$;

-- ENUM: progress_status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'progress_status' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'progress_tracking')) THEN
        CREATE TYPE progress_tracking.progress_status AS ENUM (
            'not_started',
            'in_progress',
            'completed',
            'reviewed',
            'mastered'
        );
        RAISE NOTICE 'ENUM progress_status creado';
    ELSE
        RAISE NOTICE 'ENUM progress_status ya existe';
    END IF;
END $$;

-- ENUM: difficulty_level
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'difficulty_level' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'educational_content')) THEN
        CREATE TYPE educational_content.difficulty_level AS ENUM (
            'beginner',
            'intermediate',
            'advanced'
        );
        RAISE NOTICE 'ENUM difficulty_level creado';
    ELSE
        RAISE NOTICE 'ENUM difficulty_level ya existe';
    END IF;
END $$;

-- ENUM: module_status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'module_status' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'educational_content')) THEN
        CREATE TYPE educational_content.module_status AS ENUM (
            'draft',
            'published',
            'archived',
            'backlog'
        );
        RAISE NOTICE 'ENUM module_status creado';
    ELSE
        RAISE NOTICE 'ENUM module_status ya existe';
    END IF;
END $$;

SELECT 'ENUMs verificados/creados' as status;

-- ============================================================================
-- FASE 3: FUNCIONES BASE
-- ============================================================================
\echo ''
\echo 'FASE 3: Creando funciones base...'

-- Función: now_mexico
CREATE OR REPLACE FUNCTION gamilit.now_mexico()
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE sql
STABLE
AS $$
    SELECT NOW() AT TIME ZONE 'America/Mexico_City';
$$;

-- Función: update_updated_at_column
CREATE OR REPLACE FUNCTION gamilit.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = gamilit.now_mexico();
    RETURN NEW;
END;
$$;

SELECT 'Funciones base creadas' as status;

-- ============================================================================
-- FASE 4: TABLAS CRÍTICAS
-- ============================================================================
\echo ''
\echo 'FASE 4: Creando tablas críticas...'

-- Tabla: user_stats
CREATE TABLE IF NOT EXISTS gamification_system.user_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    tenant_id UUID,
    total_xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    current_rank gamification_system.maya_rank DEFAULT 'Ajaw',
    ml_coins INTEGER DEFAULT 0,
    ml_coins_earned_total INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    total_exercises_completed INTEGER DEFAULT 0,
    total_correct_answers INTEGER DEFAULT 0,
    total_time_spent_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico()
);

-- Tabla: maya_ranks
CREATE TABLE IF NOT EXISTS gamification_system.maya_ranks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rank_name gamification_system.maya_rank NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    min_xp INTEGER NOT NULL,
    max_xp INTEGER,
    xp_multiplier DECIMAL(3,2) DEFAULT 1.00,
    ml_coins_bonus INTEGER DEFAULT 0,
    icon_url TEXT,
    badge_url TEXT,
    color_primary TEXT DEFAULT '#4A90A4',
    color_secondary TEXT DEFAULT '#2C5F6E',
    perks JSONB DEFAULT '{}',
    next_rank gamification_system.maya_rank,
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico()
);

-- Tabla: user_ranks
CREATE TABLE IF NOT EXISTS gamification_system.user_ranks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    tenant_id UUID,
    current_rank gamification_system.maya_rank NOT NULL DEFAULT 'Ajaw',
    previous_rank gamification_system.maya_rank,
    rank_achieved_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico(),
    is_current BOOLEAN DEFAULT true,
    total_xp_at_rank INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico(),
    UNIQUE(user_id, current_rank)
);

-- Tabla: notifications
CREATE TABLE IF NOT EXISTS gamification_system.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type gamification_system.notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    priority gamification_system.notification_priority DEFAULT 'medium',
    read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico()
);

-- Tabla: mission_templates
CREATE TABLE IF NOT EXISTS gamification_system.mission_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'special', 'classroom')),
    category TEXT DEFAULT 'general',
    target_type TEXT NOT NULL,
    target_value INTEGER NOT NULL,
    xp_reward INTEGER DEFAULT 0,
    ml_coins_reward INTEGER DEFAULT 0,
    icon TEXT,
    difficulty TEXT DEFAULT 'medium',
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico()
);

-- Tabla: missions
CREATE TABLE IF NOT EXISTS gamification_system.missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    template_id TEXT,
    name TEXT NOT NULL,
    description TEXT,
    mission_type TEXT NOT NULL CHECK (mission_type IN ('daily', 'weekly', 'special')),
    target_type TEXT NOT NULL,
    target_value INTEGER NOT NULL,
    current_value INTEGER DEFAULT 0,
    progress DECIMAL(5,2) DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'in_progress', 'completed', 'claimed', 'expired')),
    xp_reward INTEGER DEFAULT 0,
    ml_coins_reward INTEGER DEFAULT 0,
    icon TEXT,
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico(),
    expires_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    claimed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico()
);

-- Tabla: modules (educational_content)
CREATE TABLE IF NOT EXISTS educational_content.modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    summary TEXT,
    content JSONB DEFAULT '{}',
    order_index INTEGER NOT NULL,
    module_code TEXT,
    difficulty_level educational_content.difficulty_level DEFAULT 'beginner',
    status educational_content.module_status DEFAULT 'draft',
    is_published BOOLEAN DEFAULT false,
    estimated_duration_minutes INTEGER DEFAULT 30,
    xp_reward INTEGER DEFAULT 100,
    ml_coins_reward INTEGER DEFAULT 50,
    thumbnail_url TEXT,
    icon_url TEXT,
    subjects TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    prerequisites UUID[] DEFAULT '{}',
    maya_rank_required gamification_system.maya_rank,
    maya_rank_granted gamification_system.maya_rank,
    created_by UUID,
    reviewed_by UUID,
    approved_by UUID,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico()
);

-- Tabla: module_progress (progress_tracking)
CREATE TABLE IF NOT EXISTS progress_tracking.module_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    module_id UUID NOT NULL,
    classroom_id UUID,
    status progress_tracking.progress_status DEFAULT 'not_started',
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    completed_exercises INTEGER DEFAULT 0,
    total_exercises INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    total_attempts INTEGER DEFAULT 0,
    time_spent_minutes INTEGER DEFAULT 0,
    last_exercise_id UUID,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    score DECIMAL(5,2),
    xp_earned INTEGER DEFAULT 0,
    ml_coins_earned INTEGER DEFAULT 0,
    analytics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico(),
    UNIQUE(user_id, module_id)
);

SELECT 'Tablas críticas creadas' as status;

-- ============================================================================
-- FASE 5: ÍNDICES
-- ============================================================================
\echo ''
\echo 'FASE 5: Creando índices...'

CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON gamification_system.user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ranks_user_id ON gamification_system.user_ranks(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON gamification_system.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON gamification_system.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_missions_user_id ON gamification_system.missions(user_id);
CREATE INDEX IF NOT EXISTS idx_missions_status ON gamification_system.missions(status);
CREATE INDEX IF NOT EXISTS idx_module_progress_user ON progress_tracking.module_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_module_progress_module ON progress_tracking.module_progress(module_id);

SELECT 'Índices creados' as status;

-- ============================================================================
-- FASE 6: SEEDS - MAYA RANKS
-- ============================================================================
\echo ''
\echo 'FASE 6: Cargando seed de maya_ranks...'

INSERT INTO gamification_system.maya_ranks (
    rank_name, display_name, description, min_xp, max_xp,
    xp_multiplier, ml_coins_bonus, order_index, next_rank,
    color_primary, color_secondary, perks
) VALUES
    ('Ajaw', 'Ajaw - Semilla', 'Inicio del camino del conocimiento maya', 0, 499, 1.00, 0, 1, 'Nacom', '#8B4513', '#654321', '{"unlocks": ["basic_exercises"]}'),
    ('Nacom', 'Nacom - Guerrero', 'Demostración de dedicación al aprendizaje', 500, 999, 1.10, 100, 2, 'Ah K''in', '#CD853F', '#8B4513', '{"unlocks": ["intermediate_exercises", "daily_bonus"]}'),
    ('Ah K''in', 'Ah K''in - Sacerdote', 'Dominio de conocimientos intermedios', 1000, 1499, 1.15, 250, 3, 'Halach Uinic', '#DAA520', '#B8860B', '{"unlocks": ["advanced_exercises", "weekly_challenges"]}'),
    ('Halach Uinic', 'Halach Uinic - Líder', 'Sabiduría reconocida por la comunidad', 1500, 1899, 1.20, 500, 4, 'K''uk''ulkan', '#FFD700', '#FFA500', '{"unlocks": ["special_content", "mentor_mode"]}'),
    ('K''uk''ulkan', 'K''uk''ulkan - Serpiente Emplumada', 'Máximo nivel de conocimiento alcanzado', 1900, NULL, 1.25, 1000, 5, NULL, '#00CED1', '#008B8B', '{"unlocks": ["all_content", "exclusive_rewards", "legend_badge"]}')
ON CONFLICT (rank_name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    min_xp = EXCLUDED.min_xp,
    max_xp = EXCLUDED.max_xp,
    xp_multiplier = EXCLUDED.xp_multiplier,
    ml_coins_bonus = EXCLUDED.ml_coins_bonus,
    next_rank = EXCLUDED.next_rank,
    updated_at = gamilit.now_mexico();

SELECT 'maya_ranks cargados: ' || COUNT(*) as status FROM gamification_system.maya_ranks;

-- ============================================================================
-- FASE 7: SEEDS - MISSION TEMPLATES
-- ============================================================================
\echo ''
\echo 'FASE 7: Cargando seed de mission_templates...'

INSERT INTO gamification_system.mission_templates (
    id, name, description, type, target_type, target_value,
    xp_reward, ml_coins_reward, icon, difficulty, is_active
) VALUES
    -- Daily missions
    ('20000001-0000-0000-0000-000000000001', 'Calentamiento Científico', 'Completa 3 ejercicios hoy', 'daily', 'complete_exercises', 3, 50, 10, 'science', 'easy', true),
    ('20000001-0000-0000-0000-000000000002', 'Mente Brillante', 'Responde 5 ejercicios correctos seguidos', 'daily', 'correct_streak', 5, 75, 15, 'brain', 'medium', true),
    ('20000001-0000-0000-0000-000000000003', 'Acumulador de Sabiduría', 'Gana 100 XP hoy', 'daily', 'earn_xp', 100, 30, 5, 'star', 'easy', true),
    ('20000001-0000-0000-0000-000000000004', 'Perfeccionista del Día', 'Obtén puntuación perfecta en 1 ejercicio', 'daily', 'perfect_scores', 1, 100, 25, 'trophy', 'hard', true),
    -- Weekly missions
    ('20000002-0000-0000-0000-000000000001', 'Maratón de Conocimiento', 'Completa 15 ejercicios esta semana', 'weekly', 'complete_exercises', 15, 200, 50, 'running', 'medium', true),
    ('20000002-0000-0000-0000-000000000002', 'Constancia Científica', 'Mantén una racha de 5 días', 'weekly', 'daily_streak', 5, 300, 75, 'fire', 'hard', true),
    ('20000002-0000-0000-0000-000000000003', 'Ascenso Semanal', 'Gana 500 XP esta semana', 'weekly', 'earn_xp', 500, 150, 40, 'chart', 'medium', true),
    ('20000002-0000-0000-0000-000000000004', 'Explorador Curioso', 'Explora 3 módulos diferentes', 'weekly', 'explore_modules', 3, 175, 45, 'compass', 'medium', true),
    ('20000002-0000-0000-0000-000000000005', 'Semana de Excelencia', 'Obtén 5 puntuaciones perfectas', 'weekly', 'perfect_scores', 5, 400, 100, 'medal', 'hard', true),
    -- Special missions
    ('20000003-0000-0000-0000-000000000001', 'Dominio del Módulo', 'Completa un módulo completo', 'special', 'complete_modules', 1, 500, 150, 'certificate', 'hard', true),
    ('20000003-0000-0000-0000-000000000002', 'Estratega Sabio', 'Usa 3 comodines estratégicamente', 'special', 'use_comodines', 3, 75, 20, 'lightbulb', 'easy', true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    target_value = EXCLUDED.target_value,
    xp_reward = EXCLUDED.xp_reward,
    ml_coins_reward = EXCLUDED.ml_coins_reward,
    updated_at = gamilit.now_mexico();

SELECT 'mission_templates cargados: ' || COUNT(*) as status FROM gamification_system.mission_templates;

-- ============================================================================
-- FASE 8: SEEDS - MODULES
-- ============================================================================
\echo ''
\echo 'FASE 8: Cargando seed de modules...'

INSERT INTO educational_content.modules (
    id, title, subtitle, description, order_index, module_code,
    difficulty_level, status, is_published, estimated_duration_minutes,
    xp_reward, ml_coins_reward, subjects
) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Comprensión Literal', 'Entendiendo lo que lees', 'Desarrolla habilidades para identificar información explícita en textos', 1, 'MOD-01-LITERAL', 'beginner', 'published', true, 45, 100, 50, ARRAY['lectura', 'comprensión']),
    ('22222222-2222-2222-2222-222222222222', 'Comprensión Inferencial', 'Leyendo entre líneas', 'Aprende a deducir información implícita y hacer inferencias', 2, 'MOD-02-INFERENCIAL', 'intermediate', 'published', true, 60, 150, 75, ARRAY['lectura', 'inferencia']),
    ('33333333-3333-3333-3333-333333333333', 'Comprensión Crítica', 'Análisis profundo', 'Desarrolla pensamiento crítico para evaluar y analizar textos', 3, 'MOD-03-CRITICA', 'advanced', 'published', true, 75, 200, 100, ARRAY['lectura', 'análisis crítico']),
    ('44444444-4444-4444-4444-444444444444', 'Lectura Digital y Multimodal', 'Navegando el mundo digital', 'Comprende textos digitales y contenido multimedia', 4, 'MOD-04-DIGITAL', 'intermediate', 'published', true, 60, 175, 85, ARRAY['lectura digital', 'multimedia']),
    ('55555555-5555-5555-5555-555555555555', 'Producción y Expresión Escrita', 'Comunicando tus ideas', 'Desarrolla habilidades de escritura y expresión', 5, 'MOD-05-PRODUCCION', 'advanced', 'published', true, 90, 250, 125, ARRAY['escritura', 'expresión'])
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    xp_reward = EXCLUDED.xp_reward,
    ml_coins_reward = EXCLUDED.ml_coins_reward,
    updated_at = gamilit.now_mexico();

SELECT 'modules cargados: ' || COUNT(*) as status FROM educational_content.modules;

-- ============================================================================
-- FASE 9: FUNCIÓN DE INICIALIZACIÓN DE USUARIOS
-- ============================================================================
\echo ''
\echo 'FASE 9: Creando función de inicialización...'

CREATE OR REPLACE FUNCTION gamilit.initialize_user_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Solo inicializar para roles elegibles
    IF NEW.role IN ('student', 'admin_teacher', 'super_admin') THEN
        -- Crear user_stats
        INSERT INTO gamification_system.user_stats (
            user_id, tenant_id, ml_coins, ml_coins_earned_total
        ) VALUES (NEW.user_id, NEW.tenant_id, 100, 100)
        ON CONFLICT (user_id) DO NOTHING;

        -- Crear user_ranks
        INSERT INTO gamification_system.user_ranks (
            user_id, tenant_id, current_rank, is_current
        ) VALUES (NEW.user_id, NEW.tenant_id, 'Ajaw', true)
        ON CONFLICT (user_id, current_rank) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$;

SELECT 'Función initialize_user_stats creada' as status;

-- ============================================================================
-- FASE 10: TRIGGER DE INICIALIZACIÓN
-- ============================================================================
\echo ''
\echo 'FASE 10: Creando trigger de inicialización...'

DROP TRIGGER IF EXISTS trg_initialize_user_stats ON auth_management.profiles;

CREATE TRIGGER trg_initialize_user_stats
    AFTER INSERT ON auth_management.profiles
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.initialize_user_stats();

SELECT 'Trigger trg_initialize_user_stats creado' as status;

-- ============================================================================
-- FASE 11: INICIALIZAR USUARIOS EXISTENTES
-- ============================================================================
\echo ''
\echo 'FASE 11: Inicializando usuarios existentes...'

-- Crear user_stats para usuarios que no tienen
INSERT INTO gamification_system.user_stats (user_id, tenant_id, ml_coins, ml_coins_earned_total)
SELECT p.user_id, p.tenant_id, 100, 100
FROM auth_management.profiles p
WHERE p.role IN ('student', 'admin_teacher', 'super_admin')
  AND NOT EXISTS (SELECT 1 FROM gamification_system.user_stats us WHERE us.user_id = p.user_id)
ON CONFLICT (user_id) DO NOTHING;

-- Crear user_ranks para usuarios que no tienen
INSERT INTO gamification_system.user_ranks (user_id, tenant_id, current_rank, is_current)
SELECT p.user_id, p.tenant_id, 'Ajaw'::gamification_system.maya_rank, true
FROM auth_management.profiles p
WHERE p.role IN ('student', 'admin_teacher', 'super_admin')
  AND NOT EXISTS (SELECT 1 FROM gamification_system.user_ranks ur WHERE ur.user_id = p.user_id)
ON CONFLICT (user_id, current_rank) DO NOTHING;

SELECT 'Usuarios inicializados' as status;

-- ============================================================================
-- FASE 12: VERIFICACIÓN FINAL
-- ============================================================================
\echo ''
\echo 'FASE 12: Verificación final...'
\echo ''

SELECT '=== RESUMEN DE OBJETOS CREADOS ===' as titulo;

SELECT 'Tablas' as tipo, table_schema || '.' || table_name as objeto
FROM information_schema.tables
WHERE (table_schema = 'gamification_system' AND table_name IN ('user_stats', 'user_ranks', 'notifications', 'mission_templates', 'missions', 'maya_ranks'))
   OR (table_schema = 'progress_tracking' AND table_name = 'module_progress')
   OR (table_schema = 'educational_content' AND table_name = 'modules')
ORDER BY table_schema, table_name;

\echo ''
SELECT '=== CONTEO DE SEEDS ===' as titulo;

SELECT 'mission_templates' as tabla, COUNT(*) as registros FROM gamification_system.mission_templates
UNION ALL SELECT 'maya_ranks', COUNT(*) FROM gamification_system.maya_ranks
UNION ALL SELECT 'modules', COUNT(*) FROM educational_content.modules
UNION ALL SELECT 'user_stats', COUNT(*) FROM gamification_system.user_stats
UNION ALL SELECT 'user_ranks', COUNT(*) FROM gamification_system.user_ranks;

\echo ''
SELECT '=== TRIGGER VERIFICADO ===' as titulo;

SELECT tgname as trigger_name,
       CASE tgenabled WHEN 'O' THEN 'ACTIVO' ELSE 'INACTIVO' END as estado
FROM pg_trigger
WHERE tgname = 'trg_initialize_user_stats';

\echo ''
\echo '=============================================='
\echo 'CORRECCIÓN COMPLETADA EXITOSAMENTE'
\echo '=============================================='
\echo ''
\echo 'Próximos pasos:'
\echo '1. Reiniciar el backend (PM2): pm2 restart gamilit-backend'
\echo '2. Probar registro de nuevo usuario'
\echo '3. Verificar que el dashboard carga sin errores'
\echo ''
