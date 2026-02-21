-- ============================================================================
-- Seed: Scheduled Reports
-- Schema: social_features
-- Description: Automated report schedules for demo teacher
-- Dependencies: auth.users + profiles (teacher@gamilit.com), classrooms
-- Created: 2026-02-20 (AUDIT D2-MEDIUM)
-- ============================================================================

DO $$
DECLARE
    v_teacher_id UUID;
    v_tenant_id UUID;
    v_classroom_id UUID;
BEGIN
    SELECT p.id, p.tenant_id INTO v_teacher_id, v_tenant_id
    FROM auth.users u
    JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'teacher@gamilit.com';

    IF v_teacher_id IS NULL THEN
        RAISE NOTICE 'SKIP: teacher@gamilit.com not found. Run user seeds first.';
        RETURN;
    END IF;

    SELECT id INTO v_classroom_id
    FROM social_features.classrooms
    WHERE teacher_id = v_teacher_id
    ORDER BY created_at
    LIMIT 1;

    DELETE FROM social_features.scheduled_reports
    WHERE teacher_id = v_teacher_id
      AND report_name LIKE '%[SEED]%';

    INSERT INTO social_features.scheduled_reports (
        id, teacher_id, classroom_id, tenant_id,
        report_name, report_type, report_format,
        frequency, day_of_week, day_of_month,
        preferred_hour, timezone,
        status, next_run_at, run_count,
        notify_email, email_recipients
    ) VALUES
    (gen_random_uuid(), v_teacher_id, v_classroom_id, v_tenant_id,
     'Reporte Semanal de Progreso [SEED]', 'progress', 'pdf',
     'weekly', 1, NULL, 8, 'America/Mexico_City',
     'active', NOW() + interval '3 days', 4,
     true, ARRAY['teacher@gamilit.com']),
    (gen_random_uuid(), v_teacher_id, v_classroom_id, v_tenant_id,
     'Analiticas Mensual de Aula [SEED]', 'analytics', 'excel',
     'monthly', NULL, 1, 9, 'America/Mexico_City',
     'active', NOW() + interval '10 days', 2,
     true, ARRAY['teacher@gamilit.com']),
    (gen_random_uuid(), v_teacher_id, NULL, v_tenant_id,
     'Reportes Individuales Semanales [SEED]', 'individual', 'pdf',
     'weekly', 5, NULL, 15, 'America/Mexico_City',
     'active', NOW() + interval '5 days', 8,
     false, NULL),
    (gen_random_uuid(), v_teacher_id, v_classroom_id, v_tenant_id,
     'Resumen Mensual Pausado [SEED]', 'classroom', 'csv',
     'monthly', NULL, 15, 10, 'America/Mexico_City',
     'paused', NULL, 1,
     false, NULL),
    (gen_random_uuid(), v_teacher_id, v_classroom_id, v_tenant_id,
     'Resumen Diario de Progreso [SEED]', 'progress', 'pdf',
     'daily', NULL, NULL, 7, 'America/Mexico_City',
     'active', NOW() + interval '1 day', 15,
     true, ARRAY['teacher@gamilit.com'])
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Scheduled Reports: created for teacher %', v_teacher_id;
END $$;
