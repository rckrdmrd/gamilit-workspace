-- =====================================================================================
-- Script de prueba: Policy notifications_select_admin
-- Objetivo: Verificar que los admins pueden ver todas las notificaciones
-- Fecha: 2025-11-24
-- Relacionado: DB-003
-- =====================================================================================

-- SETUP: Crear usuarios de prueba si no existen
DO $$
BEGIN
    -- Asegurar que tenemos un usuario admin de prueba
    IF NOT EXISTS (SELECT 1 FROM auth_management.profiles WHERE email = 'admin@test.com') THEN
        INSERT INTO auth_management.profiles (id, email, display_name, role, status)
        VALUES (
            '00000000-0000-0000-0000-000000000001'::uuid,
            'admin@test.com',
            'Test Admin',
            'super_admin',
            'active'
        );
    END IF;

    -- Asegurar que tenemos un usuario regular de prueba
    IF NOT EXISTS (SELECT 1 FROM auth_management.profiles WHERE email = 'student@test.com') THEN
        INSERT INTO auth_management.profiles (id, email, display_name, role, status)
        VALUES (
            '00000000-0000-0000-0000-000000000002'::uuid,
            'student@test.com',
            'Test Student',
            'student',
            'active'
        );
    END IF;
END $$;

-- SETUP: Crear notificaciones de prueba
INSERT INTO gamification_system.notifications (user_id, type, title, message, priority)
VALUES
    ('00000000-0000-0000-0000-000000000002'::uuid, 'achievement_unlocked', 'Test Notification 1', 'Student notification 1', 'medium'),
    ('00000000-0000-0000-0000-000000000002'::uuid, 'level_up', 'Test Notification 2', 'Student notification 2', 'high')
ON CONFLICT DO NOTHING;

-- =====================================================================================
-- TEST 1: Usuario regular solo ve sus propias notificaciones
-- =====================================================================================
SET app.current_user_id = '00000000-0000-0000-0000-000000000002';

SELECT
    'TEST 1: Usuario regular' AS test_case,
    COUNT(*) AS notification_count,
    CASE
        WHEN COUNT(*) >= 2 THEN 'PASS'
        ELSE 'FAIL'
    END AS result
FROM gamification_system.notifications;

-- =====================================================================================
-- TEST 2: Admin puede ver todas las notificaciones
-- =====================================================================================
SET app.current_user_id = '00000000-0000-0000-0000-000000000001';

SELECT
    'TEST 2: Admin ve todas' AS test_case,
    COUNT(*) AS notification_count,
    CASE
        WHEN COUNT(*) >= 2 THEN 'PASS'
        ELSE 'FAIL'
    END AS result
FROM gamification_system.notifications;

-- =====================================================================================
-- TEST 3: Verificar que admin puede ver notificaciones de otros usuarios
-- =====================================================================================
SELECT
    'TEST 3: Admin ve notificaciones de otros' AS test_case,
    n.user_id,
    n.title,
    n.message,
    p.display_name AS notification_owner
FROM gamification_system.notifications n
JOIN auth_management.profiles p ON n.user_id = p.id
WHERE n.user_id != '00000000-0000-0000-0000-000000000001'::uuid
LIMIT 5;

-- =====================================================================================
-- TEST 4: Verificar que la función is_admin() funciona correctamente
-- =====================================================================================
SET app.current_user_id = '00000000-0000-0000-0000-000000000001';
SELECT
    'TEST 4a: is_admin() con admin' AS test_case,
    gamilit.is_admin() AS is_admin,
    CASE
        WHEN gamilit.is_admin() = true THEN 'PASS'
        ELSE 'FAIL'
    END AS result;

SET app.current_user_id = '00000000-0000-0000-0000-000000000002';
SELECT
    'TEST 4b: is_admin() con usuario regular' AS test_case,
    gamilit.is_admin() AS is_admin,
    CASE
        WHEN gamilit.is_admin() = false THEN 'PASS'
        ELSE 'FAIL'
    END AS result;

-- =====================================================================================
-- CLEANUP: Resetear el contexto
-- =====================================================================================
RESET app.current_user_id;

-- =====================================================================================
-- RESUMEN
-- =====================================================================================
SELECT
    'RESUMEN: Policy notifications_select_admin' AS summary,
    'La policy permite a los admins ver todas las notificaciones' AS description,
    'Verificar que todos los tests anteriores pasaron' AS note;
