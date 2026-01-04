-- ============================================================================
-- Funcion: create_manual_review_on_submission
-- Schema: progress_tracking
-- Descripcion: Crea ManualReview automaticamente cuando se inserta un
--              ExerciseSubmission para ejercicios que requieren revision manual
-- Autor: Requirements-Analyst (P0-001)
-- Fecha: 2025-12-28
-- Gap: TP-001 - Trigger automatico ManualReview faltante
-- ============================================================================
--
-- PROPOSITO:
-- Cuando un estudiante envia un ejercicio (INSERT en exercise_submissions),
-- si el ejercicio tiene requires_manual_grading=true, se crea automaticamente
-- un registro en manual_reviews para que el teacher pueda revisarlo.
--
-- FLUJO:
-- 1. Verificar si el ejercicio requiere revision manual
-- 2. Obtener el classroom del estudiante
-- 3. Obtener el teacher del classroom
-- 4. Si no hay teacher, asignar admin por defecto
-- 5. Crear registro en manual_reviews
--
-- DEPENDENCIAS:
-- - progress_tracking.exercise_submissions (tabla)
-- - progress_tracking.manual_reviews (tabla)
-- - educational_content.exercises (tabla)
-- - social_features.classroom_members (tabla)
-- - social_features.classrooms (tabla)
-- - auth_management.profiles (tabla)
--
-- ============================================================================

SET search_path TO progress_tracking, public;

CREATE OR REPLACE FUNCTION progress_tracking.create_manual_review_on_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = progress_tracking, educational_content, social_features, auth_management, public
AS $$
DECLARE
    v_requires_manual BOOLEAN;
    v_teacher_id UUID;
    v_classroom_id UUID;
BEGIN
    -- =========================================================================
    -- PASO 1: Verificar si el ejercicio requiere revision manual
    -- =========================================================================
    SELECT requires_manual_grading INTO v_requires_manual
    FROM educational_content.exercises
    WHERE id = NEW.exercise_id;

    -- Si no requiere revision manual, salir sin hacer nada
    IF NOT COALESCE(v_requires_manual, FALSE) THEN
        RETURN NEW;
    END IF;

    -- =========================================================================
    -- PASO 2: Obtener el classroom activo del estudiante
    -- =========================================================================
    SELECT classroom_id INTO v_classroom_id
    FROM social_features.classroom_members
    WHERE student_id = NEW.user_id
      AND is_active = TRUE
    ORDER BY created_at DESC
    LIMIT 1;

    -- =========================================================================
    -- PASO 3: Obtener el teacher del classroom
    -- =========================================================================
    IF v_classroom_id IS NOT NULL THEN
        SELECT teacher_id INTO v_teacher_id
        FROM social_features.classrooms
        WHERE id = v_classroom_id;
    END IF;

    -- =========================================================================
    -- PASO 4: Si no hay teacher asignado, buscar admin por defecto
    -- =========================================================================
    IF v_teacher_id IS NULL THEN
        SELECT id INTO v_teacher_id
        FROM auth_management.profiles
        WHERE role IN ('admin_teacher', 'super_admin')
          AND is_active = TRUE
        ORDER BY created_at ASC
        LIMIT 1;
    END IF;

    -- =========================================================================
    -- PASO 5: Crear el ManualReview
    -- =========================================================================
    -- Usar ON CONFLICT DO NOTHING para evitar duplicados (constraint unique_submission_review)
    INSERT INTO progress_tracking.manual_reviews (
        submission_id,
        reviewer_id,
        status,
        rubric_scores,
        created_at
    ) VALUES (
        NEW.id,
        v_teacher_id,
        'pending',
        '{}'::jsonb,
        gamilit.now_mexico()
    ) ON CONFLICT (submission_id) DO NOTHING;

    -- Log para debugging (solo en desarrollo)
    RAISE NOTICE 'ManualReview created for submission % with reviewer %', NEW.id, v_teacher_id;

    RETURN NEW;

EXCEPTION WHEN OTHERS THEN
    -- =========================================================================
    -- MANEJO DE ERRORES: No bloquear el submission, solo loguear
    -- =========================================================================
    RAISE WARNING 'Error creating ManualReview for submission %: %', NEW.id, SQLERRM;

    -- Opcionalmente, insertar en tabla de errores para retry posterior
    BEGIN
        INSERT INTO audit_logging.pending_user_initialization (
            user_id,
            profile_id,
            error_message,
            error_code,
            trigger_name,
            function_name,
            status
        ) VALUES (
            NEW.user_id,
            NEW.user_id,
            SQLERRM,
            'P0-001',
            'trg_create_manual_review_on_submission',
            'progress_tracking.create_manual_review_on_submission',
            'pending'
        );
    EXCEPTION WHEN OTHERS THEN
        -- Ignorar errores al insertar en audit_logging
        NULL;
    END;

    RETURN NEW;
END;
$$;

-- ============================================================================
-- COMENTARIOS
-- ============================================================================

COMMENT ON FUNCTION progress_tracking.create_manual_review_on_submission() IS
    'Crea automaticamente un ManualReview cuando se inserta un ExerciseSubmission '
    'para ejercicios con requires_manual_grading=true. Asigna el teacher del classroom '
    'del estudiante, o un admin por defecto si no hay teacher asignado.';

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT EXECUTE ON FUNCTION progress_tracking.create_manual_review_on_submission()
    TO gamilit_user;

GRANT EXECUTE ON FUNCTION progress_tracking.create_manual_review_on_submission()
    TO service_role;
