-- =====================================================
-- Seed Data: Activity Log Sample Data (DEV ONLY)
-- =====================================================
-- Description: Sample activity log data for testing admin dashboard
-- Environment: DEVELOPMENT ONLY (NO production/staging)
-- Date: 2025-11-24
-- Gap: GAP-DB-001 (supporting data)
-- =====================================================
--
-- 📚 Documentación:
-- Requerimiento: orchestration/reportes/REPORTE-COHERENCIA-DATABASE-BACKEND-2025-11-24.md
-- Backend: apps/backend/src/modules/admin/services/admin-dashboard.service.ts
-- =====================================================

SET search_path TO audit_logging, auth, public;

BEGIN;

-- =====================================================
-- INSERTAR DATOS DE ACTIVIDAD DE PRUEBA
-- =====================================================

-- Get sample user IDs (will fail gracefully if no users exist)
DO $$
DECLARE
    sample_user_id UUID;
    student_user_id UUID;
    teacher_user_id UUID;
BEGIN
    -- Get first student user
    SELECT id INTO student_user_id
    FROM auth.users
    WHERE gamilit_role = 'student' AND deleted_at IS NULL
    LIMIT 1;

    -- Get first teacher user
    SELECT id INTO teacher_user_id
    FROM auth.users
    WHERE gamilit_role = 'admin_teacher' AND deleted_at IS NULL
    LIMIT 1;

    -- If no specific users found, get any user
    IF student_user_id IS NULL THEN
        SELECT id INTO student_user_id
        FROM auth.users
        WHERE deleted_at IS NULL
        LIMIT 1;
    END IF;

    IF teacher_user_id IS NULL THEN
        SELECT id INTO teacher_user_id
        FROM auth.users
        WHERE deleted_at IS NULL
        OFFSET 1 LIMIT 1;
    END IF;

    -- Exit if no users found
    IF student_user_id IS NULL OR teacher_user_id IS NULL THEN
        RAISE NOTICE 'No users found. Skipping activity_log seed data.';
        RETURN;
    END IF;

    -- =====================================================
    -- LOGIN ACTIVITIES (Recent 7 days)
    -- =====================================================

    INSERT INTO audit_logging.activity_log (user_id, action_type, description, metadata, created_at)
    VALUES
        -- Today's logins
        (student_user_id, 'user_login', 'Usuario inició sesión', '{"ip": "192.168.1.10", "device": "Chrome/Windows"}'::jsonb, NOW()),
        (teacher_user_id, 'user_login', 'Maestro inició sesión', '{"ip": "192.168.1.20", "device": "Safari/MacOS"}'::jsonb, NOW() - INTERVAL '2 hours'),

        -- Yesterday's activity
        (student_user_id, 'user_login', 'Usuario inició sesión', '{"ip": "192.168.1.10"}'::jsonb, NOW() - INTERVAL '1 day'),
        (student_user_id, 'exercise_start', 'Ejercicio 1-3 iniciado', '{"exercise_id": "ex-1-3", "module_id": "mod-1"}'::jsonb, NOW() - INTERVAL '1 day' + INTERVAL '5 minutes'),
        (student_user_id, 'exercise_complete', 'Ejercicio 1-3 completado', '{"exercise_id": "ex-1-3", "score": 85, "time_spent": "00:12:30"}'::jsonb, NOW() - INTERVAL '1 day' + INTERVAL '17 minutes'),

        -- 2 days ago
        (teacher_user_id, 'assignment_create', 'Tarea "Ejercicios Módulo 1" creada', '{"assignment_id": "asg-001", "title": "Ejercicios Módulo 1"}'::jsonb, NOW() - INTERVAL '2 days'),
        (student_user_id, 'module_start', 'Módulo 1 iniciado', '{"module_id": "mod-1"}'::jsonb, NOW() - INTERVAL '2 days' + INTERVAL '3 hours'),

        -- 3 days ago
        (student_user_id, 'user_login', 'Usuario inició sesión', '{"ip": "192.168.1.10"}'::jsonb, NOW() - INTERVAL '3 days'),
        (student_user_id, 'exercise_complete', 'Ejercicio 1-1 completado', '{"exercise_id": "ex-1-1", "score": 100}'::jsonb, NOW() - INTERVAL '3 days' + INTERVAL '10 minutes'),
        (student_user_id, 'achievement_earned', 'Logro "Primera Victoria" desbloqueado', '{"achievement_id": "first-win"}'::jsonb, NOW() - INTERVAL '3 days' + INTERVAL '11 minutes'),

        -- 4 days ago
        (teacher_user_id, 'classroom_create', 'Aula "5to Grado A" creada', '{"classroom_id": "cls-001", "name": "5to Grado A"}'::jsonb, NOW() - INTERVAL '4 days'),
        (student_user_id, 'user_login', 'Usuario inició sesión', '{}'::jsonb, NOW() - INTERVAL '4 days'),

        -- 5 days ago
        (student_user_id, 'exercise_complete', 'Ejercicio 1-2 completado', '{"exercise_id": "ex-1-2", "score": 75}'::jsonb, NOW() - INTERVAL '5 days'),
        (teacher_user_id, 'content_review', 'Contenido revisado y aprobado', '{"content_type": "exercise", "content_id": "ex-2-5"}'::jsonb, NOW() - INTERVAL '5 days'),

        -- 6 days ago
        (student_user_id, 'user_login', 'Usuario inició sesión', '{}'::jsonb, NOW() - INTERVAL '6 days'),
        (student_user_id, 'video_play', 'Video tutorial reproducido', '{"video_id": "vid-intro-mod1", "duration": "00:05:30"}'::jsonb, NOW() - INTERVAL '6 days' + INTERVAL '15 minutes'),

        -- 7 days ago
        (teacher_user_id, 'user_login', 'Maestro inició sesión', '{}'::jsonb, NOW() - INTERVAL '7 days'),
        (student_user_id, 'module_complete', 'Módulo 1 completado', '{"module_id": "mod-1", "final_score": 85}'::jsonb, NOW() - INTERVAL '7 days');

    -- =====================================================
    -- ADDITIONAL ACTIVITY TYPES (for diversity)
    -- =====================================================

    INSERT INTO audit_logging.activity_log (user_id, action_type, description, metadata, created_at)
    VALUES
        -- Resource downloads
        (student_user_id, 'resource_download', 'Guía PDF descargada', '{"resource_id": "guide-mod1.pdf"}'::jsonb, NOW() - INTERVAL '2 days' + INTERVAL '6 hours'),

        -- Search queries
        (student_user_id, 'search_query', 'Búsqueda realizada', '{"query": "inferencias", "results": 12}'::jsonb, NOW() - INTERVAL '1 day' + INTERVAL '8 hours'),

        -- Form submissions
        (teacher_user_id, 'form_submit', 'Formulario de evaluación enviado', '{"form_type": "student_assessment", "student_count": 25}'::jsonb, NOW() - INTERVAL '3 days' + INTERVAL '2 hours'),

        -- Button clicks (UI interaction tracking)
        (student_user_id, 'button_click', 'Botón "Ver Estadísticas" clickeado', '{"button_id": "view-stats", "page": "dashboard"}'::jsonb, NOW() - INTERVAL '12 hours'),

        -- Page views
        (student_user_id, 'page_view', 'Dashboard visitado', '{"page": "/student/dashboard"}'::jsonb, NOW() - INTERVAL '6 hours'),
        (teacher_user_id, 'page_view', 'Panel de administración visitado', '{"page": "/admin/dashboard"}'::jsonb, NOW() - INTERVAL '4 hours');

    RAISE NOTICE '✅ Sample activity log data inserted successfully';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Error inserting activity_log sample data: %', SQLERRM;
        RAISE NOTICE 'This is expected if no users exist yet. Run user seeds first.';
END $$;

COMMIT;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

DO $$
DECLARE
    activity_count INT;
    unique_users INT;
    recent_7days INT;
BEGIN
    SELECT COUNT(*) INTO activity_count FROM audit_logging.activity_log;
    SELECT COUNT(DISTINCT user_id) INTO unique_users FROM audit_logging.activity_log;
    SELECT COUNT(*) INTO recent_7days FROM audit_logging.activity_log
    WHERE created_at >= NOW() - INTERVAL '7 days';

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '  Activity Log Sample Data Summary';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total activity records:    %', activity_count;
    RAISE NOTICE 'Unique users with activity: %', unique_users;
    RAISE NOTICE 'Activities (last 7 days):  %', recent_7days;
    RAISE NOTICE '';

    IF activity_count > 0 THEN
        RAISE NOTICE '✅ Activity log populated with sample data';
    ELSE
        RAISE NOTICE '⚠️ No activity log data inserted (users may not exist)';
    END IF;
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
END $$;

-- =====================================================
-- SAMPLE QUERIES (for testing)
-- =====================================================

-- Show recent activity (like admin dashboard would)
-- SELECT
--     action_type,
--     description,
--     created_at
-- FROM audit_logging.activity_log
-- ORDER BY created_at DESC
-- LIMIT 10;

-- Count active users in last 24h
-- SELECT COUNT(DISTINCT user_id) as active_users_24h
-- FROM audit_logging.activity_log
-- WHERE created_at >= NOW() - INTERVAL '24 hours';

-- Exercises completed in last 24h
-- SELECT COUNT(*) as exercises_completed_24h
-- FROM audit_logging.activity_log
-- WHERE action_type LIKE '%exercise%'
--   AND created_at >= NOW() - INTERVAL '24 hours';

-- =====================================================
-- MIGRATION NOTES
-- =====================================================

-- Environment: DEV ONLY
-- Purpose: Provide sample data for testing admin dashboard endpoints
--
-- Dependencies:
-- - audit_logging.activity_log table must exist (created by DDL)
-- - auth.users must have at least 2 users (student + teacher)
--
-- Related Files:
-- - apps/database/ddl/schemas/audit_logging/tables/06-activity_log.sql
-- - apps/backend/src/modules/admin/services/admin-dashboard.service.ts
--
-- =====================================================
