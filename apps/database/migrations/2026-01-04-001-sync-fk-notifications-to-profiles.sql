-- =====================================================
-- Migracion: Sincronizar FKs de notificaciones a auth_management.profiles
-- Fecha: 2026-01-04
-- Relacionado: EXT-003 (Notificaciones Multi-Canal)
-- Tarea: DDL-001, DDL-002, DDL-003
-- =====================================================
--
-- IMPORTANTE:
-- - Esta migracion cambia las FKs de auth.users a auth_management.profiles
-- - Ejecutar en ambiente de desarrollo primero
-- - Hacer backup antes de ejecutar en produccion
-- - Verificar que todos los user_id existen en auth_management.profiles
--
-- PRE-REQUISITOS:
-- 1. Verificar integridad de datos antes de ejecutar
-- 2. Verificar que profiles.id y users.id son identicos para todos los usuarios
--
-- =====================================================

-- Verificar integridad de datos antes de migrar
DO $$
DECLARE
    orphan_prefs INTEGER;
    orphan_devices INTEGER;
BEGIN
    -- Contar preferencias con user_id que no existe en profiles
    SELECT COUNT(*) INTO orphan_prefs
    FROM notifications.notification_preferences np
    WHERE NOT EXISTS (
        SELECT 1 FROM auth_management.profiles p WHERE p.id = np.user_id
    );

    -- Contar dispositivos con user_id que no existe en profiles
    SELECT COUNT(*) INTO orphan_devices
    FROM notifications.user_devices ud
    WHERE NOT EXISTS (
        SELECT 1 FROM auth_management.profiles p WHERE p.id = ud.user_id
    );

    IF orphan_prefs > 0 OR orphan_devices > 0 THEN
        RAISE EXCEPTION 'MIGRACION ABORTADA: Hay registros huerfanos. Preferencias: %, Dispositivos: %',
            orphan_prefs, orphan_devices;
    END IF;

    RAISE NOTICE 'Verificacion de integridad OK: 0 registros huerfanos';
END $$;

BEGIN;

-- =====================================================
-- DDL-002: notification_preferences.user_id -> auth_management.profiles
-- =====================================================

-- 1. Eliminar FK antigua (si existe)
ALTER TABLE notifications.notification_preferences
    DROP CONSTRAINT IF EXISTS notification_preferences_user_id_fkey;

-- 2. Agregar nueva FK apuntando a auth_management.profiles
ALTER TABLE notifications.notification_preferences
    ADD CONSTRAINT notification_preferences_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth_management.profiles(id) ON DELETE CASCADE;

RAISE NOTICE 'DDL-002: notification_preferences.user_id -> auth_management.profiles OK';

-- =====================================================
-- DDL-003: user_devices.user_id -> auth_management.profiles
-- =====================================================

-- 1. Eliminar FK antigua (si existe)
ALTER TABLE notifications.user_devices
    DROP CONSTRAINT IF EXISTS user_devices_user_id_fkey;

-- 2. Agregar nueva FK apuntando a auth_management.profiles
ALTER TABLE notifications.user_devices
    ADD CONSTRAINT user_devices_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth_management.profiles(id) ON DELETE CASCADE;

RAISE NOTICE 'DDL-003: user_devices.user_id -> auth_management.profiles OK';

COMMIT;

-- =====================================================
-- Verificar migracion
-- =====================================================

DO $$
DECLARE
    prefs_fk TEXT;
    devices_fk TEXT;
BEGIN
    -- Verificar FK de notification_preferences
    SELECT ccu.table_schema || '.' || ccu.table_name INTO prefs_fk
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_schema = 'notifications'
        AND tc.table_name = 'notification_preferences'
        AND tc.constraint_type = 'FOREIGN KEY'
        AND ccu.column_name = 'id';

    -- Verificar FK de user_devices
    SELECT ccu.table_schema || '.' || ccu.table_name INTO devices_fk
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_schema = 'notifications'
        AND tc.table_name = 'user_devices'
        AND tc.constraint_type = 'FOREIGN KEY'
        AND ccu.column_name = 'id';

    RAISE NOTICE '========================================';
    RAISE NOTICE 'MIGRACION FK COMPLETADA';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'notification_preferences.user_id -> %', prefs_fk;
    RAISE NOTICE 'user_devices.user_id -> %', devices_fk;
    RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- ROLLBACK (si es necesario)
-- =====================================================
-- En caso de necesitar revertir:
--
-- BEGIN;
-- ALTER TABLE notifications.notification_preferences
--     DROP CONSTRAINT notification_preferences_user_id_fkey;
-- ALTER TABLE notifications.notification_preferences
--     ADD CONSTRAINT notification_preferences_user_id_fkey
--     FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
--
-- ALTER TABLE notifications.user_devices
--     DROP CONSTRAINT user_devices_user_id_fkey;
-- ALTER TABLE notifications.user_devices
--     ADD CONSTRAINT user_devices_user_id_fkey
--     FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
-- COMMIT;
-- =====================================================
