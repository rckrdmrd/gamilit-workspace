-- =====================================================
-- Function: gamilit.assign_default_classroom
-- Description: Asigna automáticamente estudiantes nuevos al classroom default
-- Parameters: None
-- Returns: trigger
-- Created: 2025-11-29
-- =====================================================
--
-- PROPÓSITO:
-- Cuando se crea un nuevo perfil de estudiante, automáticamente
-- se crea un registro en classroom_members asignándolo al
-- classroom "Sin Asignar - Aula Default".
--
-- Esto permite:
-- 1. Que todos los estudiantes tengan un classroom desde el inicio
-- 2. Que los administradores puedan ver estudiantes "sin asignar"
-- 3. Que se puedan reasignar fácilmente a otras aulas
--
-- DEPENDENCIAS:
-- - social_features.classrooms con metadata->>'is_default' = 'true'
-- - social_features.classroom_members
-- - auth_management.profiles
-- =====================================================

CREATE OR REPLACE FUNCTION gamilit.assign_default_classroom()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
    v_default_classroom_id UUID;
    v_error_message TEXT;
    v_error_detail TEXT;
    v_error_code TEXT;
BEGIN
    -- Solo procesar estudiantes
    IF NEW.role != 'student' THEN
        RETURN NEW;
    END IF;

    -- Buscar el classroom default
    SELECT id INTO v_default_classroom_id
    FROM social_features.classrooms
    WHERE metadata->>'is_default' = 'true'
      AND is_active = true
    LIMIT 1;

    -- Si no existe classroom default, buscar por código
    IF v_default_classroom_id IS NULL THEN
        SELECT id INTO v_default_classroom_id
        FROM social_features.classrooms
        WHERE code = 'DEFAULT'
          AND is_active = true
        LIMIT 1;
    END IF;

    -- Si no hay classroom default, no hacer nada (warning silencioso)
    IF v_default_classroom_id IS NULL THEN
        RAISE WARNING 'No se encontró classroom default. Estudiante % no asignado automáticamente.', NEW.id;
        RETURN NEW;
    END IF;

    -- Crear membership en classroom default
    -- Nota: enrollment_method usa 'admin_add' porque es asignación automática del sistema
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
        NEW.id,  -- profiles.id
        NOW(),
        'admin_add',  -- Válido según CHECK constraint
        'active',
        jsonb_build_object(
            'auto_assigned', true,
            'assigned_at', NOW()::text,
            'reason', 'Asignación automática a classroom default en registro'
        ),
        NOW(),
        NOW()
    )
    ON CONFLICT (classroom_id, student_id) DO NOTHING;  -- Evitar duplicados

    RETURN NEW;

EXCEPTION
    WHEN OTHERS THEN
        -- P1-001: Capturar error sin bloquear creación de perfil
        GET STACKED DIAGNOSTICS
            v_error_message = MESSAGE_TEXT,
            v_error_detail = PG_EXCEPTION_DETAIL,
            v_error_code = RETURNED_SQLSTATE;

        RAISE WARNING '[P1-001] Error asignando classroom default para usuario %: % (SQLSTATE: %)',
            NEW.id, v_error_message, v_error_code;

        -- Registrar en pending_user_initialization para retry posterior
        BEGIN
            INSERT INTO audit_logging.pending_user_initialization (
                user_id,
                profile_id,
                tenant_id,
                error_message,
                error_code,
                error_detail,
                trigger_name,
                function_name,
                status,
                next_retry_at
            ) VALUES (
                NEW.user_id,
                NEW.id,
                NEW.tenant_id,
                v_error_message,
                v_error_code,
                v_error_detail,
                TG_NAME,
                'gamilit.assign_default_classroom',
                'pending',
                gamilit.now_mexico() + INTERVAL '5 minutes'
            );
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING '[P1-001] No se pudo registrar error de classroom: %', SQLERRM;
        END;

        RETURN NEW;  -- Permite creación de perfil aunque falle asignación
END;
$function$;

COMMENT ON FUNCTION gamilit.assign_default_classroom() IS
'Asigna automáticamente estudiantes nuevos al classroom default (Sin Asignar)';
