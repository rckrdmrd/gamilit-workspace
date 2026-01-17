-- ============================================================================
-- FUNCIONES HELPER PARA RETRY DE INICIALIZACION
-- Schema: gamilit
-- Descripcion: Funciones callable (no trigger) para reintentar inicializacion
-- Autor: Claude (TASK-2026-01-17-001)
-- Fecha: 2026-01-17
-- Dependencias: gamilit.initialize_user_stats(), gamilit.assign_default_classroom()
-- ============================================================================
--
-- PROPOSITO:
-- Las funciones initialize_user_stats() y assign_default_classroom() son TRIGGER
-- functions que esperan un registro NEW. Para el sistema de retry (ver
-- audit_logging.retry_pending_initializations), necesitamos versiones callable
-- que acepten un user_id como parametro.
--
-- ESTAS FUNCIONES:
-- - initialize_user_stats_for_user(p_user_id) - Reinicializa stats para un usuario
-- - assign_default_classroom_for_user(p_user_id) - Reasigna classroom default
--
-- ============================================================================

SET search_path TO gamilit, public;

-- ============================================================================
-- FUNCION: initialize_user_stats_for_user
-- ============================================================================

CREATE OR REPLACE FUNCTION gamilit.initialize_user_stats_for_user(
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = gamilit, auth_management, gamification_system, progress_tracking, social_features
AS $$
DECLARE
    v_profile RECORD;
BEGIN
    -- Obtener perfil del usuario
    SELECT id, user_id, tenant_id, role
    INTO v_profile
    FROM auth_management.profiles
    WHERE id = p_user_id;

    IF NOT FOUND THEN
        RAISE WARNING 'Profile not found for user_id: %', p_user_id;
        RETURN FALSE;
    END IF;

    -- Solo procesar roles con gamificacion
    IF v_profile.role NOT IN ('student', 'admin_teacher', 'super_admin') THEN
        RETURN TRUE;  -- OK, no requiere inicializacion
    END IF;

    -- Inicializar user_stats si no existe
    INSERT INTO gamification_system.user_stats (
        user_id,
        tenant_id,
        ml_coins,
        ml_coins_earned_total
    ) VALUES (
        v_profile.id,
        v_profile.tenant_id,
        100,
        100
    )
    ON CONFLICT (user_id) DO NOTHING;

    -- Inicializar comodines_inventory si no existe
    INSERT INTO gamification_system.comodines_inventory (user_id)
    VALUES (v_profile.id)
    ON CONFLICT (user_id) DO NOTHING;

    -- Inicializar user_preferences si no existe
    INSERT INTO auth_management.user_preferences (
        user_id,
        theme,
        language,
        notifications_enabled,
        email_notifications,
        sound_enabled,
        tutorial_completed,
        preferences
    ) VALUES (
        v_profile.id,
        'light',
        'es',
        true,
        true,
        true,
        false,
        jsonb_build_object(
            'gamification_hints', true,
            'show_leaderboard', true,
            'auto_play_audio', false
        )
    )
    ON CONFLICT (user_id) DO NOTHING;

    -- Inicializar user_ranks si no existe
    INSERT INTO gamification_system.user_ranks (
        user_id,
        tenant_id,
        current_rank,
        is_current,
        achieved_at
    )
    SELECT
        v_profile.id,
        v_profile.tenant_id,
        'Ajaw'::gamification_system.maya_rank,
        true,
        gamilit.now_mexico()
    WHERE NOT EXISTS (
        SELECT 1 FROM gamification_system.user_ranks WHERE user_id = v_profile.id
    );

    -- Inicializar module_progress para modulos publicados
    INSERT INTO progress_tracking.module_progress (
        user_id,
        module_id,
        status,
        progress_percentage,
        created_at,
        updated_at
    )
    SELECT
        v_profile.id,
        m.id,
        'not_started'::progress_tracking.progress_status,
        0,
        NOW(),
        NOW()
    FROM educational_content.modules m
    WHERE m.is_published = true
      AND m.status = 'published'
    ON CONFLICT (user_id, module_id) DO NOTHING;

    -- Inicializar misiones
    PERFORM gamilit.initialize_user_missions(v_profile.id);

    RETURN TRUE;

EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error in initialize_user_stats_for_user(%): %', p_user_id, SQLERRM;
    RETURN FALSE;
END;
$$;

COMMENT ON FUNCTION gamilit.initialize_user_stats_for_user(UUID) IS
'Wrapper callable para reintentar inicializacion de user_stats.
Usado por audit_logging.retry_pending_initializations() para usuarios que fallaron durante trigger.
A diferencia de initialize_user_stats() (trigger), esta funcion recibe user_id directamente.';

-- ============================================================================
-- FUNCION: assign_default_classroom_for_user
-- ============================================================================

CREATE OR REPLACE FUNCTION gamilit.assign_default_classroom_for_user(
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = gamilit, auth_management, social_features
AS $$
DECLARE
    v_profile RECORD;
    v_default_classroom_id UUID;
BEGIN
    -- Obtener perfil del usuario
    SELECT id, user_id, tenant_id, role
    INTO v_profile
    FROM auth_management.profiles
    WHERE id = p_user_id;

    IF NOT FOUND THEN
        RAISE WARNING 'Profile not found for user_id: %', p_user_id;
        RETURN FALSE;
    END IF;

    -- Solo procesar estudiantes
    IF v_profile.role != 'student' THEN
        RETURN TRUE;  -- OK, no requiere asignacion
    END IF;

    -- Verificar si ya tiene classroom activo
    IF EXISTS (
        SELECT 1 FROM social_features.classroom_members
        WHERE student_id = v_profile.id AND is_active = TRUE
    ) THEN
        RETURN TRUE;  -- Ya tiene classroom
    END IF;

    -- Buscar classroom default por metadata
    SELECT id INTO v_default_classroom_id
    FROM social_features.classrooms
    WHERE metadata->>'is_default' = 'true'
      AND is_active = true
    LIMIT 1;

    -- Fallback: buscar por codigo DEFAULT
    IF v_default_classroom_id IS NULL THEN
        SELECT id INTO v_default_classroom_id
        FROM social_features.classrooms
        WHERE code = 'DEFAULT'
          AND is_active = true
        LIMIT 1;
    END IF;

    IF v_default_classroom_id IS NULL THEN
        RAISE WARNING 'No default classroom found for user: %', p_user_id;
        RETURN FALSE;
    END IF;

    -- Asignar al classroom default
    INSERT INTO social_features.classroom_members (
        id,
        classroom_id,
        student_id,
        enrollment_date,
        enrollment_method,
        status,
        metadata,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        v_default_classroom_id,
        v_profile.id,
        NOW(),
        'admin_add',
        'active',
        jsonb_build_object(
            'auto_assigned', true,
            'assigned_at', NOW()::text,
            'reason', 'Reasignacion via retry_pending_initializations'
        ),
        NOW(),
        NOW()
    )
    ON CONFLICT (classroom_id, student_id) DO NOTHING;

    RETURN TRUE;

EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error in assign_default_classroom_for_user(%): %', p_user_id, SQLERRM;
    RETURN FALSE;
END;
$$;

COMMENT ON FUNCTION gamilit.assign_default_classroom_for_user(UUID) IS
'Wrapper callable para reintentar asignacion de classroom default.
Usado por audit_logging.retry_pending_initializations() para usuarios que fallaron durante trigger.
A diferencia de assign_default_classroom() (trigger), esta funcion recibe user_id directamente.';

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT EXECUTE ON FUNCTION gamilit.initialize_user_stats_for_user(UUID) TO gamilit_user;
GRANT EXECUTE ON FUNCTION gamilit.initialize_user_stats_for_user(UUID) TO service_role;

GRANT EXECUTE ON FUNCTION gamilit.assign_default_classroom_for_user(UUID) TO gamilit_user;
GRANT EXECUTE ON FUNCTION gamilit.assign_default_classroom_for_user(UUID) TO service_role;
