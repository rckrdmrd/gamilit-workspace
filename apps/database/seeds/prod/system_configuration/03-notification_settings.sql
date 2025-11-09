-- ============================================================================
-- GAMILIT Platform - Production Seeds
-- Archivo: seeds/prod/system_configuration/03-notification_settings.sql
-- Propósito: Configuración de notificaciones del sistema
-- Creado: 2025-11-08
-- ============================================================================

-- Configuración de tipos de notificaciones
INSERT INTO system_configuration.notification_settings (
    notification_type,
    channel,
    is_enabled,
    priority,
    template_id,
    throttle_minutes,
    batch_enabled,
    settings
)
VALUES
    -- Notificaciones de Achievements
    (
        'achievement_unlocked',
        'in_app',
        true,
        'high',
        NULL,
        0,
        false,
        jsonb_build_object(
            'sound_enabled', true,
            'show_badge', true,
            'auto_dismiss_seconds', 10
        )
    ),
    (
        'achievement_unlocked',
        'email',
        false,
        'low',
        'achievement_email',
        60,
        true,
        jsonb_build_object(
            'batch_size', 5,
            'batch_window_hours', 24
        )
    ),

    -- Notificaciones de Rank Promotion
    (
        'rank_promotion',
        'in_app',
        true,
        'high',
        NULL,
        0,
        false,
        jsonb_build_object(
            'sound_enabled', true,
            'show_animation', true,
            'celebration_effects', true
        )
    ),
    (
        'rank_promotion',
        'email',
        true,
        'high',
        'rank_promotion_email',
        0,
        false,
        '{}'::jsonb
    ),

    -- Notificaciones de Module Progress
    (
        'module_completed',
        'in_app',
        true,
        'normal',
        NULL,
        0,
        false,
        jsonb_build_object(
            'show_progress_bar', true,
            'show_next_module', true
        )
    ),

    -- Notificaciones de Assignment
    (
        'assignment_due',
        'in_app',
        true,
        'high',
        NULL,
        0,
        false,
        jsonb_build_object(
            'advance_notice_hours', 24,
            'reminder_hours', jsonb_build_array(24, 6, 1)
        )
    ),
    (
        'assignment_due',
        'email',
        true,
        'high',
        'assignment_due_email',
        0,
        false,
        '{}'::jsonb
    ),
    (
        'assignment_submitted',
        'in_app',
        true,
        'normal',
        NULL,
        0,
        false,
        '{}'::jsonb
    ),

    -- Notificaciones de Classroom
    (
        'classroom_invitation',
        'in_app',
        true,
        'high',
        NULL,
        0,
        false,
        '{}'::jsonb
    ),
    (
        'classroom_invitation',
        'email',
        true,
        'high',
        'classroom_invite_email',
        0,
        false,
        '{}'::jsonb
    ),

    -- Notificaciones de Peer Challenges
    (
        'challenge_received',
        'in_app',
        true,
        'normal',
        NULL,
        0,
        false,
        jsonb_build_object(
            'auto_accept_timeout_hours', 24
        )
    ),
    (
        'challenge_completed',
        'in_app',
        true,
        'normal',
        NULL,
        0,
        false,
        jsonb_build_object(
            'show_leaderboard', true,
            'show_rewards', true
        )
    ),

    -- Notificaciones para Padres (Parent Portal)
    (
        'daily_summary',
        'email',
        false,
        'low',
        'parent_daily_summary',
        1440,
        true,
        jsonb_build_object(
            'send_time', '18:00',
            'timezone', 'America/Mexico_City',
            'include_screenshots', false
        )
    ),
    (
        'weekly_report',
        'email',
        false,
        'low',
        'parent_weekly_report',
        10080,
        false,
        jsonb_build_object(
            'send_day', 'sunday',
            'send_time', '18:00',
            'include_charts', true
        )
    ),
    (
        'monthly_report',
        'email',
        false,
        'low',
        'parent_monthly_report',
        43200,
        false,
        jsonb_build_object(
            'send_day_of_month', 1,
            'include_detailed_analytics', true
        )
    ),
    (
        'low_performance',
        'email',
        false,
        'high',
        'parent_alert_performance',
        1440,
        false,
        jsonb_build_object(
            'threshold_percentage', 60,
            'consecutive_failures', 3
        )
    ),
    (
        'inactivity_alert',
        'email',
        false,
        'normal',
        'parent_alert_inactivity',
        2880,
        false,
        jsonb_build_object(
            'inactivity_days', 7
        )
    ),

    -- Notificaciones de Sistema
    (
        'system_announcement',
        'in_app',
        true,
        'high',
        NULL,
        0,
        false,
        jsonb_build_object(
            'persistent', true,
            'dismissable', true
        )
    ),
    (
        'maintenance_scheduled',
        'email',
        true,
        'urgent',
        'maintenance_notification',
        0,
        false,
        jsonb_build_object(
            'advance_notice_hours', 48
        )
    )

ON CONFLICT (notification_type, channel) DO UPDATE SET
    is_enabled = EXCLUDED.is_enabled,
    priority = EXCLUDED.priority,
    template_id = EXCLUDED.template_id,
    throttle_minutes = EXCLUDED.throttle_minutes,
    batch_enabled = EXCLUDED.batch_enabled,
    settings = EXCLUDED.settings,
    updated_at = NOW();

-- Verificación
SELECT
    notification_type,
    channel,
    is_enabled,
    priority,
    CASE
        WHEN is_enabled THEN '✅'
        ELSE '❌'
    END as status,
    throttle_minutes,
    batch_enabled
FROM system_configuration.notification_settings
ORDER BY
    CASE priority
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'normal' THEN 3
        WHEN 'low' THEN 4
    END,
    notification_type,
    channel;
