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
    v_notif1_id UUID := '81111111-1111-1111-1111-111111111001';
    v_notif2_id UUID := '81111111-1111-1111-1111-111111111002';
    v_notif4_id UUID := '81111111-1111-1111-1111-111111111004';
    v_notif5_id UUID := '81111111-1111-1111-1111-111111111005';
    v_notif6_id UUID := '81111111-1111-1111-1111-111111111006';
    v_notif8_id UUID := '81111111-1111-1111-1111-111111111008';
BEGIN
    RAISE NOTICE 'Creating notification log records...';

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
        '91111111-1111-1111-1111-111111111001'::uuid,
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
        '91111111-1111-1111-1111-111111111002'::uuid,
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
        '91111111-1111-1111-1111-111111111003'::uuid,
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
        '91111111-1111-1111-1111-111111111004'::uuid,
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
        '91111111-1111-1111-1111-111111111005'::uuid,
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
        '91111111-1111-1111-1111-111111111006'::uuid,
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
        '91111111-1111-1111-1111-111111111007'::uuid,
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
        '91111111-1111-1111-1111-111111111008'::uuid,
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
        '91111111-1111-1111-1111-111111111009'::uuid,
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
        '91111111-1111-1111-1111-111111111010'::uuid,
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
        '91111111-1111-1111-1111-111111111011'::uuid,
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
        '91111111-1111-1111-1111-111111111012'::uuid,
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
        '91111111-1111-1111-1111-111111111013'::uuid,
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

    ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        delivered_at = EXCLUDED.delivered_at,
        error_message = EXCLUDED.error_message,
        provider_response = EXCLUDED.provider_response;

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
