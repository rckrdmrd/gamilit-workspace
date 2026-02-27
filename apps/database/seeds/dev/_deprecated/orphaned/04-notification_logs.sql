-- =====================================================================================
-- SEED: Notification Logs for notifications Schema
-- =====================================================================================
-- Description: Sample notification delivery logs for tracking send status per channel
-- Dependencies: notifications.notifications
-- Idempotency: Uses ON CONFLICT to handle re-runs safely
-- Created: 2026-01-20
-- Task: P2-3 (Aumentar cobertura de seeds al 80%)
-- =====================================================================================

SET search_path TO notifications, public;

-- =====================================================
-- NOTIFICATION LOGS
-- =====================================================

DO $$
DECLARE
    v_notif1_id UUID;
    v_notif2_id UUID;
    v_notif4_id UUID;
    v_notif5_id UUID;
    v_notif6_id UUID;
    v_notif8_id UUID;
BEGIN
    RAISE NOTICE 'Creating notification log records...';

    -- Resolve notification IDs by title (dynamically generated in 03-notifications.sql)
    SELECT id INTO v_notif1_id FROM notifications.notifications WHERE title = 'Logro Desbloqueado: Primeros Pasos' LIMIT 1;
    SELECT id INTO v_notif2_id FROM notifications.notifications WHERE title = 'Nueva Tarea: Ejercicios Modulo 2' LIMIT 1;
    SELECT id INTO v_notif4_id FROM notifications.notifications WHERE title = 'Nueva Solicitud de Amistad' LIMIT 1;
    SELECT id INTO v_notif5_id FROM notifications.notifications WHERE title = 'Mantenimiento Programado' LIMIT 1;
    SELECT id INTO v_notif6_id FROM notifications.notifications WHERE title = 'Racha de 7 Dias!' LIMIT 1;
    SELECT id INTO v_notif8_id FROM notifications.notifications WHERE title = 'Actualizacion de Perfil' LIMIT 1;

    IF v_notif1_id IS NULL THEN
        RAISE NOTICE 'Notifications not found. Run 03-notifications.sql first. Skipping.';
        RETURN;
    END IF;

    INSERT INTO notifications.notification_logs (
        id,
        notification_id,
        channel,
        status,
        sent_at,
        delivered_at,
        error_message,
        provider_response,
        metadata
    ) VALUES

    -- Logs for notification 1 (achievement - in_app and push)
    (
        gen_random_uuid(),
        v_notif1_id,
        'in_app',
        'delivered',
        NOW() - INTERVAL '3 hours',
        NOW() - INTERVAL '3 hours',
        NULL,
        jsonb_build_object(
            'status', 'success',
            'delivery_time_ms', 45
        ),
        jsonb_build_object('device', 'web')
    ),
    (
        gen_random_uuid(),
        v_notif1_id,
        'push',
        'delivered',
        NOW() - INTERVAL '3 hours',
        NOW() - INTERVAL '3 hours' + INTERVAL '2 seconds',
        NULL,
        jsonb_build_object(
            'provider', 'fcm',
            'message_id', 'fcm-msg-12345',
            'delivery_time_ms', 1200
        ),
        jsonb_build_object('device_token', 'fcm-token-xxx')
    ),

    -- Logs for notification 2 (assignment - all channels)
    (
        gen_random_uuid(),
        v_notif2_id,
        'in_app',
        'delivered',
        NOW() - INTERVAL '1 hour',
        NOW() - INTERVAL '1 hour',
        NULL,
        jsonb_build_object('status', 'success'),
        jsonb_build_object()
    ),
    (
        gen_random_uuid(),
        v_notif2_id,
        'email',
        'sent',
        NOW() - INTERVAL '1 hour',
        NULL,
        NULL,
        jsonb_build_object(
            'provider', 'sendgrid',
            'message_id', 'sg-msg-67890',
            'accepted', true
        ),
        jsonb_build_object('email_type', 'transactional')
    ),
    (
        gen_random_uuid(),
        v_notif2_id,
        'push',
        'delivered',
        NOW() - INTERVAL '1 hour',
        NOW() - INTERVAL '1 hour' + INTERVAL '1 second',
        NULL,
        jsonb_build_object(
            'provider', 'fcm',
            'message_id', 'fcm-msg-67891'
        ),
        jsonb_build_object()
    ),

    -- Logs for notification 4 (social - friend request)
    (
        gen_random_uuid(),
        v_notif4_id,
        'in_app',
        'delivered',
        NOW() - INTERVAL '45 minutes',
        NOW() - INTERVAL '45 minutes',
        NULL,
        jsonb_build_object('status', 'success'),
        jsonb_build_object()
    ),
    (
        gen_random_uuid(),
        v_notif4_id,
        'push',
        'delivered',
        NOW() - INTERVAL '45 minutes',
        NOW() - INTERVAL '45 minutes' + INTERVAL '3 seconds',
        NULL,
        jsonb_build_object(
            'provider', 'fcm',
            'message_id', 'fcm-msg-33333'
        ),
        jsonb_build_object()
    ),

    -- Logs for notification 5 (system - maintenance)
    (
        gen_random_uuid(),
        v_notif5_id,
        'in_app',
        'delivered',
        NOW() - INTERVAL '2 hours',
        NOW() - INTERVAL '2 hours',
        NULL,
        jsonb_build_object('status', 'success'),
        jsonb_build_object('priority', 'urgent')
    ),
    (
        gen_random_uuid(),
        v_notif5_id,
        'email',
        'delivered',
        NOW() - INTERVAL '2 hours',
        NOW() - INTERVAL '2 hours' + INTERVAL '15 seconds',
        NULL,
        jsonb_build_object(
            'provider', 'sendgrid',
            'message_id', 'sg-msg-maintenance-001',
            'open_tracking', true
        ),
        jsonb_build_object('template_version', 'v2')
    ),

    -- Logs for notification 6 (gamification - streak)
    (
        gen_random_uuid(),
        v_notif6_id,
        'in_app',
        'delivered',
        NOW() - INTERVAL '5 hours',
        NOW() - INTERVAL '5 hours',
        NULL,
        jsonb_build_object('status', 'success'),
        jsonb_build_object()
    ),
    (
        gen_random_uuid(),
        v_notif6_id,
        'push',
        'failed',
        NOW() - INTERVAL '5 hours',
        NULL,
        'Device token expired',
        jsonb_build_object(
            'provider', 'fcm',
            'error_code', 'InvalidRegistration',
            'should_remove_token', true
        ),
        jsonb_build_object('retry_possible', false)
    ),

    -- Logs for notification 8 (failed email)
    (
        gen_random_uuid(),
        v_notif8_id,
        'email',
        'bounced',
        NOW() - INTERVAL '6 hours',
        NULL,
        'Email address bounced: mailbox full',
        jsonb_build_object(
            'provider', 'sendgrid',
            'bounce_type', 'soft',
            'bounce_reason', 'Mailbox full',
            'retry_after_hours', 24
        ),
        jsonb_build_object('attempt', 1)
    ),
    (
        gen_random_uuid(),
        v_notif8_id,
        'email',
        'failed',
        NOW() - INTERVAL '5 hours',
        NULL,
        'Email delivery failed after 3 attempts',
        jsonb_build_object(
            'provider', 'sendgrid',
            'final_error', 'Permanent failure',
            'total_attempts', 3
        ),
        jsonb_build_object('attempt', 3, 'final_attempt', true)
    )

    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Notification logs created successfully';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Warning: Could not create all notification logs: %', SQLERRM;
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
    v_total_count INTEGER;
    v_delivered_count INTEGER;
    v_failed_count INTEGER;
    v_by_channel RECORD;
BEGIN
    SELECT COUNT(*) INTO v_total_count FROM notifications.notification_logs;
    SELECT COUNT(*) INTO v_delivered_count FROM notifications.notification_logs WHERE status = 'delivered';
    SELECT COUNT(*) INTO v_failed_count FROM notifications.notification_logs WHERE status IN ('failed', 'bounced');

    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '  SEED COMPLETADO: notification_logs';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '  Total logs: %', v_total_count;
    RAISE NOTICE '  - Delivered: %', v_delivered_count;
    RAISE NOTICE '  - Failed/Bounced: %', v_failed_count;
    RAISE NOTICE '════════════════════════════════════════════════════════';
END $$;
