-- =====================================================================================
-- SEED: Notifications for notifications Schema
-- =====================================================================================
-- Description: Sample notification records for testing multi-channel notification system
-- Dependencies: auth_management.profiles, notifications.notification_templates
-- Idempotency: Uses ON CONFLICT to handle re-runs safely
-- Created: 2026-01-20
-- Task: P2-3 (Aumentar cobertura de seeds al 80%)
-- =====================================================================================

SET search_path TO notifications, auth_management, public;

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

DO $$
DECLARE
    v_student1_id UUID;
    v_student2_id UUID;
    v_student3_id UUID;
    v_teacher_id UUID;
BEGIN
    RAISE NOTICE 'Creating notification records...';

    -- Get user IDs
    SELECT id INTO v_student1_id FROM auth_management.profiles
    WHERE role = 'student' AND is_active = true
    ORDER BY created_at LIMIT 1;

    SELECT id INTO v_student2_id FROM auth_management.profiles
    WHERE role = 'student' AND is_active = true
    ORDER BY created_at OFFSET 1 LIMIT 1;

    SELECT id INTO v_student3_id FROM auth_management.profiles
    WHERE role = 'student' AND is_active = true
    ORDER BY created_at OFFSET 2 LIMIT 1;

    SELECT id INTO v_teacher_id FROM auth_management.profiles
    WHERE role IN ('teacher', 'admin_teacher') AND is_active = true LIMIT 1;

    -- Fallbacks
    IF v_student1_id IS NULL THEN
        SELECT id INTO v_student1_id FROM auth_management.profiles WHERE is_active = true LIMIT 1;
    END IF;
    IF v_student2_id IS NULL THEN
        v_student2_id := v_student1_id;
    END IF;
    IF v_student3_id IS NULL THEN
        v_student3_id := v_student1_id;
    END IF;
    IF v_teacher_id IS NULL THEN
        v_teacher_id := v_student1_id;
    END IF;

    -- Skip if no users found
    IF v_student1_id IS NULL THEN
        RAISE NOTICE 'No users found. Skipping notifications seed.';
        RETURN;
    END IF;

    -- Idempotency guard: skip if seed data already exists
    IF EXISTS (SELECT 1 FROM notifications.notifications WHERE title = 'Logro Desbloqueado: Primeros Pasos' LIMIT 1) THEN
        RAISE NOTICE 'Notifications seed data already exists, skipping insert';
        RETURN;
    END IF;

    INSERT INTO notifications.notifications (
        id,
        user_id,
        type,
        title,
        message,
        data,
        priority,
        channels,
        status,
        read_at,
        sent_at,
        created_at,
        expires_at,
        metadata
    ) VALUES

    -- Achievement notification (read)
    (
        gen_random_uuid(),
        v_student1_id,
        'achievement',
        'Logro Desbloqueado: Primeros Pasos',
        'Felicidades! Has completado tu primer ejercicio y desbloqueado el logro "Primeros Pasos". Has ganado 50 ML Coins!',
        jsonb_build_object(
            'achievement_id', 'first_steps',
            'achievement_name', 'Primeros Pasos',
            'ml_coins_earned', 50,
            'xp_earned', 25,
            'icon', 'trophy-bronze'
        ),
        'normal',
        ARRAY['in_app', 'push'],
        'read',
        NOW() - INTERVAL '2 hours',
        NOW() - INTERVAL '3 hours',
        NOW() - INTERVAL '3 hours',
        NULL,
        jsonb_build_object('template_key', 'achievement_unlocked')
    ),

    -- Assignment notification (sent, unread)
    (
        gen_random_uuid(),
        v_student1_id,
        'assignment',
        'Nueva Tarea: Ejercicios Modulo 2',
        'Tu profesor Carlos Ramirez te ha asignado una nueva tarea. Fecha limite: en 3 dias.',
        jsonb_build_object(
            'assignment_id', 'asg-mod2-001',
            'assignment_title', 'Ejercicios Modulo 2',
            'teacher_name', 'Carlos Ramirez',
            'due_date', (NOW() + INTERVAL '3 days')::text,
            'module_name', 'Lectura Inferencial'
        ),
        'high',
        ARRAY['in_app', 'email', 'push'],
        'sent',
        NULL,
        NOW() - INTERVAL '1 hour',
        NOW() - INTERVAL '1 hour',
        NOW() + INTERVAL '5 days',
        jsonb_build_object('template_key', 'new_assignment')
    ),

    -- Mission notification (pending)
    (
        gen_random_uuid(),
        v_student2_id,
        'mission',
        'Nueva Mision Disponible!',
        'Tienes una nueva mision diaria: Completa 5 ejercicios del Modulo 1 para ganar 100 ML Coins extra!',
        jsonb_build_object(
            'mission_id', 'daily-m1-5ex',
            'mission_type', 'daily',
            'target', 5,
            'reward_ml_coins', 100,
            'expires_in_hours', 24
        ),
        'normal',
        ARRAY['in_app'],
        'pending',
        NULL,
        NULL,
        NOW() - INTERVAL '30 minutes',
        NOW() + INTERVAL '24 hours',
        jsonb_build_object('auto_generated', true)
    ),

    -- Social notification (friend request)
    (
        gen_random_uuid(),
        v_student2_id,
        'social',
        'Nueva Solicitud de Amistad',
        'Maria Garcia te ha enviado una solicitud de amistad. Acepta para poder competir juntos en desafios!',
        jsonb_build_object(
            'request_type', 'friend_request',
            'requester_id', v_student1_id,
            'requester_name', 'Maria Garcia',
            'action_url', '/social/friend-requests'
        ),
        'normal',
        ARRAY['in_app', 'push'],
        'sent',
        NULL,
        NOW() - INTERVAL '45 minutes',
        NOW() - INTERVAL '45 minutes',
        NOW() + INTERVAL '7 days',
        jsonb_build_object()
    ),

    -- System notification (urgent)
    (
        gen_random_uuid(),
        v_teacher_id,
        'system',
        'Mantenimiento Programado',
        'La plataforma estara en mantenimiento manana de 2:00 AM a 4:00 AM. Durante este tiempo no estara disponible.',
        jsonb_build_object(
            'maintenance_type', 'scheduled',
            'start_time', (NOW() + INTERVAL '1 day')::text,
            'duration_hours', 2,
            'affected_services', ARRAY['all']
        ),
        'urgent',
        ARRAY['in_app', 'email'],
        'sent',
        NOW() - INTERVAL '1 hour',
        NOW() - INTERVAL '2 hours',
        NOW() - INTERVAL '2 hours',
        NOW() + INTERVAL '2 days',
        jsonb_build_object('system_wide', true)
    ),

    -- Gamification notification (streak)
    (
        gen_random_uuid(),
        v_student3_id,
        'gamification',
        'Racha de 7 Dias!',
        'Increible! Has mantenido tu racha de aprendizaje por 7 dias consecutivos. Bonus: +50 ML Coins!',
        jsonb_build_object(
            'streak_days', 7,
            'bonus_coins', 50,
            'next_milestone', 14
        ),
        'normal',
        ARRAY['in_app', 'push'],
        'read',
        NOW() - INTERVAL '4 hours',
        NOW() - INTERVAL '5 hours',
        NOW() - INTERVAL '5 hours',
        NULL,
        jsonb_build_object('template_key', 'streak_milestone')
    ),

    -- Assignment reminder (low priority)
    (
        gen_random_uuid(),
        v_student1_id,
        'assignment',
        'Recordatorio: Tarea Proxima a Vencer',
        'Tu tarea "Ejercicios Modulo 1" vence en 24 horas. Ya llevas 60% completado.',
        jsonb_build_object(
            'assignment_id', 'asg-mod1-001',
            'hours_remaining', 24,
            'completion_percentage', 60
        ),
        'low',
        ARRAY['in_app'],
        'sent',
        NULL,
        NOW() - INTERVAL '30 minutes',
        NOW() - INTERVAL '30 minutes',
        NOW() + INTERVAL '2 days',
        jsonb_build_object('template_key', 'assignment_reminder')
    ),

    -- Failed notification
    (
        gen_random_uuid(),
        v_student2_id,
        'system',
        'Actualizacion de Perfil',
        'Tu perfil ha sido actualizado correctamente.',
        jsonb_build_object(
            'profile_field', 'avatar',
            'update_type', 'image_upload'
        ),
        'low',
        ARRAY['email'],
        'failed',
        NULL,
        NULL,
        NOW() - INTERVAL '6 hours',
        NULL,
        jsonb_build_object('error', 'Email delivery failed', 'retry_count', 3)
    )

    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Notifications created successfully';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Warning: Could not create all notifications: %', SQLERRM;
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
    v_total_count INTEGER;
    v_read_count INTEGER;
    v_unread_count INTEGER;
    v_pending_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total_count FROM notifications.notifications;
    SELECT COUNT(*) INTO v_read_count FROM notifications.notifications WHERE status = 'read';
    SELECT COUNT(*) INTO v_unread_count FROM notifications.notifications WHERE status = 'sent' AND read_at IS NULL;
    SELECT COUNT(*) INTO v_pending_count FROM notifications.notifications WHERE status = 'pending';

    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '  SEED COMPLETADO: notifications';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '  Total notificaciones: %', v_total_count;
    RAISE NOTICE '  - Read: %', v_read_count;
    RAISE NOTICE '  - Unread: %', v_unread_count;
    RAISE NOTICE '  - Pending: %', v_pending_count;
    RAISE NOTICE '════════════════════════════════════════════════════════';
END $$;
