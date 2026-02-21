-- =====================================================================================
-- SEED: Student Intervention Alerts for Progress Tracking Schema
-- =====================================================================================
-- Description: Demo intervention alerts for Teacher Portal Monitoring page
-- Dependencies: auth_management.profiles (teacher + students), social_features.classrooms
-- Idempotency: Uses DELETE + INSERT pattern with dynamic lookups
-- AUDIT-D2-2: Created to populate TeacherMonitoring alerts section
-- =====================================================================================

SET search_path TO progress_tracking, auth_management, social_features, auth, public;

DO $$
DECLARE
    v_teacher_id UUID;
    v_student1_id UUID;
    v_student2_id UUID;
    v_student3_id UUID;
    v_classroom_id UUID;
    v_tenant_id UUID;
BEGIN
    -- Get teacher profile
    SELECT p.id, p.tenant_id INTO v_teacher_id, v_tenant_id
    FROM auth.users u
    JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'teacher@gamilit.com'
    LIMIT 1;

    -- Get student profiles
    SELECT p.id INTO v_student1_id
    FROM auth.users u
    JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'estudiante1@demo.glit.edu.mx';

    SELECT p.id INTO v_student2_id
    FROM auth.users u
    JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'estudiante2@demo.glit.edu.mx';

    SELECT p.id INTO v_student3_id
    FROM auth.users u
    JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'estudiante3@demo.glit.edu.mx';

    -- Get first classroom for this teacher
    SELECT c.id INTO v_classroom_id
    FROM social_features.classrooms c
    WHERE c.teacher_id = v_teacher_id
    LIMIT 1;

    IF v_teacher_id IS NULL OR v_tenant_id IS NULL THEN
        RAISE NOTICE 'Teacher profile not found. Skipping student_intervention_alerts seed.';
        RETURN;
    END IF;

    IF v_student1_id IS NULL THEN
        RAISE NOTICE 'Demo students not found. Skipping student_intervention_alerts seed.';
        RETURN;
    END IF;

    RAISE NOTICE 'Creating student intervention alerts...';

    -- Clean existing demo alerts for these students
    DELETE FROM progress_tracking.student_intervention_alerts
    WHERE student_id IN (v_student1_id, v_student2_id, v_student3_id)
      AND tenant_id = v_tenant_id;

    INSERT INTO progress_tracking.student_intervention_alerts (
        student_id, classroom_id, alert_type, severity, title, description,
        metrics, status, generated_at, tenant_id,
        acknowledged_at, acknowledged_by,
        resolved_at, resolved_by, resolution_notes
    ) VALUES
    -- ================================================================================
    -- STUDENT 3: High-risk student — multiple active alerts
    -- ================================================================================
    (
        v_student3_id, v_classroom_id,
        'no_activity', 'high',
        'Sin actividad por 5 dias',
        'El estudiante no ha realizado ninguna actividad en la plataforma durante los ultimos 5 dias. Ultimo acceso registrado hace 5 dias.',
        '{"days_inactive": 5, "last_activity": "exercise_attempt", "last_module": "Modulo 1"}'::jsonb,
        'active',
        NOW() - INTERVAL '1 day',
        v_tenant_id,
        NULL, NULL, NULL, NULL, NULL
    ),
    (
        v_student3_id, v_classroom_id,
        'low_score', 'critical',
        'Rendimiento critico en Modulo 1',
        'El estudiante ha obtenido menos del 40% en los ultimos 5 ejercicios del Modulo 1. Puntaje promedio: 35%.',
        '{"average_score": 35, "threshold": 60, "attempts": 5, "module": "Modulo 1", "lowest_score": 20}'::jsonb,
        'active',
        NOW() - INTERVAL '2 days',
        v_tenant_id,
        NULL, NULL, NULL, NULL, NULL
    ),
    (
        v_student3_id, v_classroom_id,
        'repeated_failures', 'high',
        'Fallos repetidos en Crucigrama',
        'El estudiante ha fallado el ejercicio de Crucigrama Cientifico 4 veces consecutivas sin mejorar su puntaje.',
        '{"exercise_type": "crucigrama", "consecutive_failures": 4, "best_score": 30, "required_score": 60}'::jsonb,
        'acknowledged',
        NOW() - INTERVAL '3 days',
        v_tenant_id,
        NOW() - INTERVAL '2 days', v_teacher_id,
        NULL, NULL, NULL
    ),

    -- ================================================================================
    -- STUDENT 2: Medium-risk — declining trend
    -- ================================================================================
    (
        v_student2_id, v_classroom_id,
        'declining_trend', 'medium',
        'Tendencia decreciente en rendimiento',
        'El puntaje promedio del estudiante ha disminuido un 15% en las ultimas 2 semanas. Puntaje anterior: 78%, actual: 63%.',
        '{"previous_average": 78, "current_average": 63, "decline_percentage": 15, "period_days": 14}'::jsonb,
        'active',
        NOW() - INTERVAL '1 day',
        v_tenant_id,
        NULL, NULL, NULL, NULL, NULL
    ),
    (
        v_student2_id, v_classroom_id,
        'excessive_time', 'low',
        'Tiempo excesivo en ejercicios',
        'El estudiante esta tomando el doble del tiempo esperado para completar ejercicios del Modulo 2. Tiempo promedio: 45 min vs esperado: 20 min.',
        '{"average_time_minutes": 45, "expected_time_minutes": 20, "module": "Modulo 2", "exercise_count": 3}'::jsonb,
        'active',
        NOW() - INTERVAL '4 days',
        v_tenant_id,
        NULL, NULL, NULL, NULL, NULL
    ),

    -- ================================================================================
    -- STUDENT 1: Low-risk — resolved alert (historical)
    -- ================================================================================
    (
        v_student1_id, v_classroom_id,
        'low_engagement', 'low',
        'Bajo engagement en actividades sociales',
        'El estudiante no ha participado en actividades de equipo ni ha interactuado con companeros en los ultimos 7 dias.',
        '{"days_no_social": 7, "peer_interactions": 0, "team_activities": 0}'::jsonb,
        'resolved',
        NOW() - INTERVAL '10 days',
        v_tenant_id,
        NOW() - INTERVAL '9 days', v_teacher_id,
        NOW() - INTERVAL '5 days', v_teacher_id,
        'Se hablo con el estudiante. Se integro a un nuevo equipo y ha comenzado a participar activamente.'
    ),
    (
        v_student1_id, v_classroom_id,
        'declining_trend', 'medium',
        'Baja temporal en rendimiento',
        'Breve baja en rendimiento debido a ausencia por enfermedad. Ya se recupero.',
        '{"previous_average": 92, "current_average": 85, "decline_percentage": 7, "period_days": 7}'::jsonb,
        'dismissed',
        NOW() - INTERVAL '15 days',
        v_tenant_id,
        NOW() - INTERVAL '14 days', v_teacher_id,
        NULL, NULL, NULL
    );

    RAISE NOTICE 'Student intervention alerts created successfully';
    RAISE NOTICE '  - Total alerts: 7';
    RAISE NOTICE '  - Active: 4 (student2: 2, student3: 2)';
    RAISE NOTICE '  - Acknowledged: 1 (student3)';
    RAISE NOTICE '  - Resolved: 1 (student1)';
    RAISE NOTICE '  - Dismissed: 1 (student1)';
    RAISE NOTICE '  - Alert types: no_activity, low_score, repeated_failures, declining_trend, excessive_time, low_engagement';

END $$;
