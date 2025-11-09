-- =============================================================================
-- FUNCTION: public.send_notification
-- =============================================================================
-- Purpose: Sends notifications to users through multiple delivery channels
-- Priority: P2 - Notification delivery function
-- Responsibility: SA-DB-031
-- Created: 2025-11-02
-- =============================================================================

CREATE OR REPLACE FUNCTION gamification_system.send_notification(
    p_user_id UUID,
    p_title TEXT,
    p_message TEXT,
    p_notification_type TEXT,
    p_delivery_channels TEXT[] DEFAULT ARRAY['IN_APP'],
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
    v_channel TEXT;
    v_valid_type BOOLEAN;
BEGIN
    -- Validate notification type
    v_valid_type := p_notification_type IN ('ASSIGNMENT', 'ACHIEVEMENT', 'SYSTEM', 'ALERT', 'MESSAGE');

    IF NOT v_valid_type THEN
        RAISE EXCEPTION 'Invalid notification type: %', p_notification_type;
    END IF;

    -- Create notification record
    INSERT INTO gamification_system.notifications (
        user_id,
        title,
        message,
        notification_type,
        is_read,
        created_at,
        metadata
    ) VALUES (
        p_user_id,
        p_title,
        p_message,
        p_notification_type,
        FALSE,
        NOW(),
        p_metadata
    )
    RETURNING id INTO v_notification_id;

    -- Queue notification for delivery through specified channels
    FOREACH v_channel IN ARRAY p_delivery_channels LOOP
        INSERT INTO gamification_system.notification_delivery_queue (
            notification_id,
            delivery_channel,
            status,
            created_at
        ) VALUES (
            v_notification_id,
            v_channel,
            'PENDING',
            NOW()
        )
        ON CONFLICT DO NOTHING;
    END LOOP;

    -- Log the notification send action
    PERFORM public.log_system_event(
        'NOTIFICATION_SENT',
        'notification_service',
        jsonb_build_object(
            'notification_id', v_notification_id,
            'user_id', p_user_id,
            'type', p_notification_type,
            'channels', p_delivery_channels
        ),
        'INFO'
    );

    RETURN v_notification_id;

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error sending notification: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, gamification_system, audit_logging;

-- Documentation comment
COMMENT ON FUNCTION public.send_notification(UUID, TEXT, TEXT, TEXT, TEXT[], JSONB) IS
'Sends notifications to users through configured delivery channels.
Parameters:
  - p_user_id: ID of the recipient user
  - p_title: Notification title/subject
  - p_message: Notification message body
  - p_notification_type: Type of notification (ASSIGNMENT, ACHIEVEMENT, SYSTEM, ALERT, MESSAGE)
  - p_delivery_channels: Array of delivery channels (default: [''IN_APP'']) - can include EMAIL, SMS, PUSH
  - p_metadata: Optional JSONB metadata for notification context
Returns:
  - UUID of the created notification, or NULL on error
Example:
  SELECT send_notification(
    user_id,
    ''New Assignment Posted''::TEXT,
    ''A new assignment is available in Mathematics''::TEXT,
    ''ASSIGNMENT''::TEXT,
    ARRAY[''IN_APP'', ''EMAIL'']::TEXT[],
    jsonb_build_object(''assignment_id'', 456, ''subject'', ''Math'')
  );';
