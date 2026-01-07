-- =====================================================
-- Function: gamilit.initialize_module_progress_for_users
-- Description: Inicializa registros de progress para un módulo nuevo
--              Crea module_progress para todos los usuarios elegibles
-- Parameters: p_module_id UUID - ID del módulo a inicializar
-- Returns: INTEGER - Número de registros creados
-- Created: 2026-01-04
-- Issue: CORR-2026-01-04-001 - Error 404 en progress/modules
-- =====================================================
--
-- CONTEXTO:
-- El trigger trg_initialize_user_stats crea module_progress cuando se
-- crea un NUEVO USUARIO. Sin embargo, cuando se crea un NUEVO MÓDULO,
-- los usuarios existentes no tienen registros de progress.
--
-- Esta función complementa el trigger existente, creando registros
-- de module_progress para usuarios existentes cuando se publica
-- un nuevo módulo.
--
-- USO:
-- 1. Llamada automática via trigger trg_initialize_module_progress
-- 2. Llamada manual: SELECT gamilit.initialize_module_progress_for_users('module-uuid');
--
-- ROLES ELEGIBLES:
-- - student
-- - admin_teacher
-- - super_admin
-- =====================================================

CREATE OR REPLACE FUNCTION gamilit.initialize_module_progress_for_users(
    p_module_id UUID DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = gamilit, auth_management, educational_content, progress_tracking
AS $function$
DECLARE
    v_records_created INTEGER := 0;
    v_module_exists BOOLEAN;
BEGIN
    -- Si no se especifica módulo, inicializar TODOS los módulos publicados
    IF p_module_id IS NULL THEN
        -- Crear registros para TODOS los módulos publicados y usuarios elegibles
        INSERT INTO progress_tracking.module_progress (
            user_id,
            module_id,
            status,
            progress_percentage,
            created_at,
            updated_at
        )
        SELECT
            p.id AS user_id,
            m.id AS module_id,
            'not_started'::progress_tracking.progress_status,
            0,
            NOW(),
            NOW()
        FROM auth_management.profiles p
        CROSS JOIN educational_content.modules m
        WHERE p.role IN ('student', 'admin_teacher', 'super_admin')
          AND m.is_published = true
          AND m.status = 'published'
          AND NOT EXISTS (
              SELECT 1 FROM progress_tracking.module_progress mp
              WHERE mp.user_id = p.id AND mp.module_id = m.id
          )
        ON CONFLICT (user_id, module_id) DO NOTHING;

        GET DIAGNOSTICS v_records_created = ROW_COUNT;

        IF v_records_created > 0 THEN
            RAISE NOTICE '[initialize_module_progress] Created % records for all published modules', v_records_created;
        END IF;

        RETURN v_records_created;
    END IF;

    -- Verificar que el módulo existe y está publicado
    SELECT EXISTS (
        SELECT 1 FROM educational_content.modules
        WHERE id = p_module_id
          AND is_published = true
          AND status = 'published'
    ) INTO v_module_exists;

    IF NOT v_module_exists THEN
        RAISE NOTICE '[initialize_module_progress] Module % not found or not published', p_module_id;
        RETURN 0;
    END IF;

    -- Crear registros de progress para todos los usuarios elegibles
    INSERT INTO progress_tracking.module_progress (
        user_id,
        module_id,
        status,
        progress_percentage,
        created_at,
        updated_at
    )
    SELECT
        p.id AS user_id,
        p_module_id AS module_id,
        'not_started'::progress_tracking.progress_status,
        0,
        NOW(),
        NOW()
    FROM auth_management.profiles p
    WHERE p.role IN ('student', 'admin_teacher', 'super_admin')
      AND NOT EXISTS (
          SELECT 1 FROM progress_tracking.module_progress mp
          WHERE mp.user_id = p.id AND mp.module_id = p_module_id
      )
    ON CONFLICT (user_id, module_id) DO NOTHING;

    GET DIAGNOSTICS v_records_created = ROW_COUNT;

    IF v_records_created > 0 THEN
        RAISE NOTICE '[initialize_module_progress] Created % progress records for module %',
            v_records_created, p_module_id;
    END IF;

    RETURN v_records_created;
END;
$function$;

COMMENT ON FUNCTION gamilit.initialize_module_progress_for_users(UUID) IS
'Inicializa registros de module_progress para un módulo nuevo o todos los módulos publicados.
Complementa trg_initialize_user_stats para mantener sincronizados usuarios y módulos.';
