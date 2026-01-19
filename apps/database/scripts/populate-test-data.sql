-- =============================================================================
-- SCRIPT: populate-test-data.sql
-- TASK: TASK-2026-01-19-007
-- PURPOSE: Poblar datos de prueba para module_progress y exercise_submissions
-- =============================================================================

-- Variables
DO $$
DECLARE
    v_tenant_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    v_classroom_id UUID := 'a0000000-0000-4000-a000-000000000001';
    v_student_record RECORD;
    v_exercise_record RECORD;
    v_module_id UUID;
    v_random_score NUMERIC;
    v_random_days INTEGER;
    v_submission_count INTEGER;
    v_students_processed INTEGER := 0;
BEGIN
    RAISE NOTICE '=== Iniciando poblacion de datos de prueba ===';

    -- =========================================================================
    -- PASO 1: Actualizar last_accessed_at en module_progress
    -- =========================================================================
    RAISE NOTICE 'PASO 1: Actualizando last_accessed_at...';

    UPDATE progress_tracking.module_progress
    SET last_accessed_at = NOW() - (floor(random() * 30) || ' days')::INTERVAL
    WHERE last_accessed_at IS NULL;

    RAISE NOTICE '  -> module_progress.last_accessed_at actualizado';

    -- =========================================================================
    -- PASO 2: Actualizar classroom_id faltantes en module_progress
    -- =========================================================================
    RAISE NOTICE 'PASO 2: Actualizando classroom_id faltantes...';

    UPDATE progress_tracking.module_progress mp
    SET classroom_id = cm.classroom_id
    FROM social_features.classroom_members cm
    WHERE mp.user_id = cm.student_id
      AND mp.classroom_id IS NULL
      AND cm.status = 'active';

    -- Si aun quedan sin classroom_id, asignar el DEFAULT
    UPDATE progress_tracking.module_progress
    SET classroom_id = v_classroom_id
    WHERE classroom_id IS NULL;

    RAISE NOTICE '  -> module_progress.classroom_id actualizado';

    -- =========================================================================
    -- PASO 3: Crear exercise_submissions para estudiantes sin actividad
    -- =========================================================================
    RAISE NOTICE 'PASO 3: Creando exercise_submissions para estudiantes...';

    -- Iterar sobre estudiantes que no tienen submissions
    FOR v_student_record IN
        SELECT DISTINCT p.id as student_id
        FROM auth_management.profiles p
        WHERE p.role = 'student'
          AND p.tenant_id = v_tenant_id
          AND NOT EXISTS (
              SELECT 1 FROM progress_tracking.exercise_submissions es
              WHERE es.user_id = p.id
          )
        LIMIT 30  -- Procesar hasta 30 estudiantes
    LOOP
        v_students_processed := v_students_processed + 1;
        v_submission_count := 0;

        -- Para cada estudiante, crear submissions aleatorias
        FOR v_exercise_record IN
            SELECT e.id as exercise_id, e.module_id
            FROM educational_content.exercises e
            WHERE e.is_active = true
            ORDER BY RANDOM()
            LIMIT 5 + floor(random() * 10)::INTEGER  -- Entre 5 y 15 ejercicios por estudiante
        LOOP
            -- Generar score aleatorio (algunos buenos, algunos malos)
            v_random_score := CASE
                WHEN random() < 0.3 THEN 20 + random() * 40   -- 30% con bajo score (20-60)
                WHEN random() < 0.7 THEN 60 + random() * 25   -- 40% con score medio (60-85)
                ELSE 85 + random() * 15                        -- 30% con score alto (85-100)
            END;

            v_random_days := floor(random() * 30)::INTEGER;

            -- Insertar submission
            INSERT INTO progress_tracking.exercise_submissions (
                user_id,
                exercise_id,
                answer_data,
                score,
                max_score,
                is_correct,
                attempt_number,
                time_spent_seconds,
                submitted_at,
                created_at,
                status
            ) VALUES (
                v_student_record.student_id,
                v_exercise_record.exercise_id,
                jsonb_build_object('type', 'auto-generated', 'source', 'test-data'),
                ROUND(v_random_score)::INTEGER,
                100,
                v_random_score >= 60,
                1,
                120 + floor(random() * 300)::INTEGER,
                NOW() - (v_random_days || ' days')::INTERVAL,
                NOW() - (v_random_days || ' days')::INTERVAL,
                'graded'
            )
            ON CONFLICT DO NOTHING;

            v_submission_count := v_submission_count + 1;
        END LOOP;

        IF v_students_processed <= 5 THEN
            RAISE NOTICE '  -> Estudiante % : % submissions creadas', v_student_record.student_id, v_submission_count;
        END IF;
    END LOOP;

    RAISE NOTICE '  -> Total: % estudiantes procesados', v_students_processed;

    -- =========================================================================
    -- PASO 4: Ejecutar sync de average_score (usar la funcion existente)
    -- =========================================================================
    RAISE NOTICE 'PASO 4: Sincronizando average_score en module_progress...';

    -- La funcion sync_all_module_progress_scores() fue creada en TASK-005
    PERFORM progress_tracking.sync_all_module_progress_scores();

    RAISE NOTICE '  -> average_score sincronizado';

    -- =========================================================================
    -- PASO 5: Generar alertas basadas en nuevos datos
    -- =========================================================================
    RAISE NOTICE 'PASO 5: Generando alertas de intervencion...';

    PERFORM progress_tracking.generate_student_alerts();

    RAISE NOTICE '  -> Alertas generadas';

    -- =========================================================================
    -- RESUMEN FINAL
    -- =========================================================================
    RAISE NOTICE '';
    RAISE NOTICE '=== RESUMEN FINAL ===';
    RAISE NOTICE 'module_progress con last_accessed_at: %',
        (SELECT COUNT(*) FROM progress_tracking.module_progress WHERE last_accessed_at IS NOT NULL);
    RAISE NOTICE 'module_progress con classroom_id: %',
        (SELECT COUNT(*) FROM progress_tracking.module_progress WHERE classroom_id IS NOT NULL);
    RAISE NOTICE 'module_progress con average_score: %',
        (SELECT COUNT(*) FROM progress_tracking.module_progress WHERE average_score IS NOT NULL);
    RAISE NOTICE 'exercise_submissions total: %',
        (SELECT COUNT(*) FROM progress_tracking.exercise_submissions);
    RAISE NOTICE 'usuarios con submissions: %',
        (SELECT COUNT(DISTINCT user_id) FROM progress_tracking.exercise_submissions);
    RAISE NOTICE 'alertas activas: %',
        (SELECT COUNT(*) FROM progress_tracking.student_intervention_alerts WHERE status = 'active');
    RAISE NOTICE '=== FIN ===';

END $$;
