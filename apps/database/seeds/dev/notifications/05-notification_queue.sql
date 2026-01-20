-- =====================================================================================
-- SEED: Notification Queue for notifications Schema
-- =====================================================================================
-- Description: Sample notification queue entries for async processing testing
-- Dependencies: notifications.notifications
-- Idempotency: Uses ON CONFLICT to handle re-runs safely
-- Created: 2026-01-20
-- Task: P2-3 (Aumentar cobertura de seeds al 80%)
-- =====================================================================================

SET search_path TO notifications, public;

-- =====================================================
-- NOTIFICATION QUEUE
-- =====================================================

DO $$
DECLARE
    v_notif_pending UUID := '81111111-1111-1111-1111-111111111003';
    v_notif7_id UUID := '81111111-1111-1111-1111-111111111007';
BEGIN
    RAISE NOTICE 'Creating notification queue records...';

    INSERT INTO notifications.notification_queue (
        id,
        notification_id,
        channel,
        scheduled_for,
        priority,
        attempts,
        max_attempts,
        status,
        last_attempt_at,
        error_message,
        created_at
    ) VALUES

    -- Queued entry (immediate, high priority)
    (
        'a1111111-1111-1111-1111-111111111001'::uuid,
        v_notif_pending,
        'in_app',
        NOW(),
        5,
        0,
        3,
        'queued',
        NULL,
        NULL,
        NOW() - INTERVAL '5 minutes'
    ),

    -- Processing entry
    (
        'a1111111-1111-1111-1111-111111111002'::uuid,
        v_notif7_id,
        'in_app',
        NOW() - INTERVAL '1 minute',
        0,
        1,
        3,
        'processing',
        NOW() - INTERVAL '30 seconds',
        NULL,
        NOW() - INTERVAL '35 minutes'
    ),

    -- Scheduled for future (email digest)
    (
        'a1111111-1111-1111-1111-111111111003'::uuid,
        v_notif_pending,
        'email',
        NOW() + INTERVAL '2 hours',
        -5,
        0,
        3,
        'queued',
        NULL,
        NULL,
        NOW() - INTERVAL '30 minutes'
    ),

    -- Successfully sent
    (
        'a1111111-1111-1111-1111-111111111004'::uuid,
        v_notif7_id,
        'push',
        NOW() - INTERVAL '40 minutes',
        0,
        1,
        3,
        'sent',
        NOW() - INTERVAL '39 minutes',
        NULL,
        NOW() - INTERVAL '45 minutes'
    ),

    -- Failed after max attempts
    (
        'a1111111-1111-1111-1111-111111111005'::uuid,
        v_notif_pending,
        'push',
        NOW() - INTERVAL '1 hour',
        0,
        3,
        3,
        'failed',
        NOW() - INTERVAL '30 minutes',
        'Device token invalid after 3 attempts',
        NOW() - INTERVAL '2 hours'
    ),

    -- Urgent notification (high priority)
    (
        'a1111111-1111-1111-1111-111111111006'::uuid,
        v_notif7_id,
        'email',
        NOW(),
        10,
        0,
        3,
        'queued',
        NULL,
        NULL,
        NOW() - INTERVAL '2 minutes'
    ),

    -- Low priority scheduled
    (
        'a1111111-1111-1111-1111-111111111007'::uuid,
        v_notif_pending,
        'email',
        NOW() + INTERVAL '6 hours',
        -5,
        0,
        3,
        'queued',
        NULL,
        NULL,
        NOW() - INTERVAL '1 hour'
    ),

    -- Retry after first failure
    (
        'a1111111-1111-1111-1111-111111111008'::uuid,
        v_notif7_id,
        'push',
        NOW() + INTERVAL '15 minutes',
        0,
        1,
        3,
        'queued',
        NOW() - INTERVAL '5 minutes',
        'Temporary network error, will retry',
        NOW() - INTERVAL '20 minutes'
    )

    ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        attempts = EXCLUDED.attempts,
        last_attempt_at = EXCLUDED.last_attempt_at,
        error_message = EXCLUDED.error_message;

    RAISE NOTICE 'Notification queue records created successfully';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Warning: Could not create all queue records: %', SQLERRM;
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
    v_total_count INTEGER;
    v_queued_count INTEGER;
    v_processing_count INTEGER;
    v_sent_count INTEGER;
    v_failed_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total_count FROM notifications.notification_queue;
    SELECT COUNT(*) INTO v_queued_count FROM notifications.notification_queue WHERE status = 'queued';
    SELECT COUNT(*) INTO v_processing_count FROM notifications.notification_queue WHERE status = 'processing';
    SELECT COUNT(*) INTO v_sent_count FROM notifications.notification_queue WHERE status = 'sent';
    SELECT COUNT(*) INTO v_failed_count FROM notifications.notification_queue WHERE status = 'failed';

    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '  SEED COMPLETADO: notification_queue';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '  Total en cola: %', v_total_count;
    RAISE NOTICE '  - Queued: %', v_queued_count;
    RAISE NOTICE '  - Processing: %', v_processing_count;
    RAISE NOTICE '  - Sent: %', v_sent_count;
    RAISE NOTICE '  - Failed: %', v_failed_count;
    RAISE NOTICE '════════════════════════════════════════════════════════';
END $$;
