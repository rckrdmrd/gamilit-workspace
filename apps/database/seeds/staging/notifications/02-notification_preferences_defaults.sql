-- =====================================================
-- Seeds: notification_preferences_defaults
-- Schema: notifications
-- Descripcion: Preferencias por defecto para tipos de notificacion
-- Relacionado: EXT-003 (Notificaciones Multi-Canal)
-- Fecha: 2026-01-04
-- =====================================================
--
-- IMPORTANTE:
-- - Este seed crea preferencias por defecto para usuarios existentes
-- - Se ejecuta despues de crear usuarios
-- - ON CONFLICT evita duplicados
--
-- =====================================================

-- Insertar preferencias por defecto para todos los usuarios existentes
-- Se crea una preferencia por cada combinacion (usuario, tipo_notificacion)

DO $$
DECLARE
    notification_types TEXT[] := ARRAY[
        'achievement_unlocked',
        'rank_promoted',
        'module_completed',
        'new_assignment',
        'assignment_reminder',
        'teacher_message',
        'team_invitation',
        'exercise_feedback',
        'streak_milestone',
        'challenge_received',
        'challenge_completed',
        'system_announcement'
    ];
    nt TEXT;
BEGIN
    -- Para cada tipo de notificacion
    FOREACH nt IN ARRAY notification_types
    LOOP
        -- Insertar preferencias para todos los usuarios que no las tengan
        INSERT INTO notifications.notification_preferences (
            id,
            user_id,
            notification_type,
            in_app_enabled,
            email_enabled,
            push_enabled,
            email_frequency,
            quiet_hours_start,
            quiet_hours_end,
            timezone
        )
        SELECT
            gen_random_uuid(),
            p.id,
            nt,
            true,  -- in_app siempre habilitado
            CASE
                -- Email solo para tipos importantes
                WHEN nt IN ('new_assignment', 'assignment_reminder', 'teacher_message', 'exercise_feedback', 'system_announcement')
                THEN true
                ELSE false
            END,
            false,  -- push requiere opt-in explicito
            'immediate',
            '22:00'::TIME,  -- quiet hours: 10pm
            '08:00'::TIME,  -- hasta 8am
            'America/Mexico_City'
        FROM auth_management.profiles p
        WHERE NOT EXISTS (
            SELECT 1 FROM notifications.notification_preferences np
            WHERE np.user_id = p.id AND np.notification_type = nt
        );
    END LOOP;

    RAISE NOTICE 'Preferencias de notificacion creadas para usuarios existentes';
END $$;

-- Comentario omitido: COMMENT ON TABLE requiere ownership (seeds corren como gamilit_user, no postgres)
-- El comentario ya esta definido en el DDL: apps/database/ddl/schemas/notifications/tables/02-notification_preferences.sql
