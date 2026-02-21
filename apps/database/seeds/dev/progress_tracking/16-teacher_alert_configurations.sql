-- ============================================================================
-- Seed: Teacher Alert Configurations
-- Schema: progress_tracking
-- Description: Personalized alert configs for demo teacher
-- Dependencies: auth.users + profiles (teacher@gamilit.com), classrooms
-- Created: 2026-02-20 (AUDIT D2-MEDIUM)
-- ============================================================================

DO $$
DECLARE
    v_teacher_id UUID;
    v_tenant_id UUID;
    v_classroom_id UUID;
BEGIN
    -- Dynamic profile lookup
    SELECT p.id, p.tenant_id INTO v_teacher_id, v_tenant_id
    FROM auth.users u
    JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'teacher@gamilit.com';

    IF v_teacher_id IS NULL THEN
        RAISE NOTICE 'SKIP: teacher@gamilit.com not found. Run user seeds first.';
        RETURN;
    END IF;

    -- Get first classroom for scoped configs
    SELECT id INTO v_classroom_id
    FROM social_features.classrooms
    WHERE teacher_id = v_teacher_id
    ORDER BY created_at
    LIMIT 1;

    -- Clean previous seed data
    DELETE FROM progress_tracking.teacher_alert_configurations
    WHERE teacher_id = v_teacher_id;

    -- Global configs (no specific classroom)
    INSERT INTO progress_tracking.teacher_alert_configurations (
        id, teacher_id, classroom_id, alert_type, is_enabled,
        threshold_value, threshold_unit, notify_email, notify_in_app,
        cooldown_hours, custom_settings, tenant_id
    ) VALUES
    (gen_random_uuid(), v_teacher_id, NULL, 'no_activity', true,
     3.00, 'days', true, true, 48, '{"include_weekends": false}'::jsonb, v_tenant_id),
    (gen_random_uuid(), v_teacher_id, NULL, 'low_score', true,
     50.00, 'percentage', false, true, 24, '{}'::jsonb, v_tenant_id),
    (gen_random_uuid(), v_teacher_id, NULL, 'declining_trend', true,
     15.00, 'percentage', true, true, 72, '{"min_data_points": 5}'::jsonb, v_tenant_id),
    (gen_random_uuid(), v_teacher_id, NULL, 'repeated_failures', false,
     3.00, 'count', false, true, 24, '{}'::jsonb, v_tenant_id);

    -- Classroom-scoped configs (if classroom exists)
    IF v_classroom_id IS NOT NULL THEN
        INSERT INTO progress_tracking.teacher_alert_configurations (
            id, teacher_id, classroom_id, alert_type, is_enabled,
            threshold_value, threshold_unit, notify_email, notify_in_app,
            cooldown_hours, custom_settings, tenant_id
        ) VALUES
        (gen_random_uuid(), v_teacher_id, v_classroom_id, 'excessive_time', true,
         60.00, 'minutes', false, true, 24, '{"per_exercise": true}'::jsonb, v_tenant_id),
        (gen_random_uuid(), v_teacher_id, v_classroom_id, 'low_engagement', true,
         30.00, 'percentage', true, true, 48, '{}'::jsonb, v_tenant_id),
        (gen_random_uuid(), v_teacher_id, v_classroom_id, 'no_activity', true,
         2.00, 'days', true, true, 24, '{"include_weekends": true}'::jsonb, v_tenant_id),
        (gen_random_uuid(), v_teacher_id, v_classroom_id, 'low_score', true,
         40.00, 'percentage', true, true, 24, '{"notify_parents": true}'::jsonb, v_tenant_id)
        ON CONFLICT (teacher_id, classroom_id, alert_type) DO NOTHING;
    END IF;

    RAISE NOTICE 'Teacher Alert Configurations: created for teacher %', v_teacher_id;
END $$;
