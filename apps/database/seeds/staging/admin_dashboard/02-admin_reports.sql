-- =====================================================
-- Seed: admin_reports (PROD)
-- Schema: admin_dashboard
-- Descripcion: Datos iniciales para reportes administrativos
-- Relacionado: EXT-002 (Admin Extendido), AUDIT-003
-- Fecha: 2026-01-04
-- Updated: 2026-02-20 (Fix C2: dynamic tenant_id + profile lookup)
-- =====================================================

-- NOTA: Este seed crea registros de ejemplo para el portal admin.
-- En produccion, nuevos reportes se crean dinamicamente via API.

DO $$
DECLARE
    v_tenant_id UUID;
    v_admin_profile_id UUID;
BEGIN
    -- Dynamic tenant lookup
    SELECT id INTO v_tenant_id
    FROM auth_management.tenants
    WHERE slug = 'gamilit' OR name ILIKE '%gamilit%'
    ORDER BY created_at
    LIMIT 1;

    -- Dynamic admin profile lookup
    SELECT p.id INTO v_admin_profile_id
    FROM auth.users u
    JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'admin@gamilit.com'
    LIMIT 1;

    -- Fallback: any admin profile
    IF v_admin_profile_id IS NULL THEN
        SELECT p.id INTO v_admin_profile_id
        FROM auth.users u
        JOIN auth_management.profiles p ON p.user_id = u.id
        WHERE u.email LIKE '%admin%'
        LIMIT 1;
    END IF;

    IF v_tenant_id IS NULL OR v_admin_profile_id IS NULL THEN
        RAISE NOTICE 'Skipping admin_reports seed: tenant=%, admin=%',
            COALESCE(v_tenant_id::text, 'NULL'),
            COALESCE(v_admin_profile_id::text, 'NULL');
        RETURN;
    END IF;

    -- Reporte completado (usuarios)
    INSERT INTO admin_dashboard.admin_reports (
        id, tenant_id, report_type, report_format, status,
        file_url, file_size, metadata, error_message,
        requested_by, created_at, completed_at, expires_at
    ) VALUES (
        'e0000000-0000-0000-0000-000000000001',
        v_tenant_id,
        'users', 'excel', 'completed',
        '/reports/users_report_2026-01-01.xlsx', 256000,
        '{"filters": {"role": "student", "status": "active"}, "columns": ["name", "email", "role", "created_at"], "total_records": 150}'::jsonb,
        NULL,
        v_admin_profile_id,
        gamilit.now_mexico() - INTERVAL '5 days',
        gamilit.now_mexico() - INTERVAL '5 days' + INTERVAL '30 seconds',
        gamilit.now_mexico() + INTERVAL '25 days'
    ) ON CONFLICT (id) DO NOTHING;

    -- Reporte completado (progreso)
    INSERT INTO admin_dashboard.admin_reports (
        id, tenant_id, report_type, report_format, status,
        file_url, file_size, metadata, error_message,
        requested_by, created_at, completed_at, expires_at
    ) VALUES (
        'e0000000-0000-0000-0000-000000000002',
        v_tenant_id,
        'progress', 'pdf', 'completed',
        '/reports/progress_report_2026-01-02.pdf', 512000,
        '{"filters": {"classroom_id": "abc123", "date_range": {"from": "2025-12-01", "to": "2025-12-31"}}, "include_charts": true, "total_students": 45}'::jsonb,
        NULL,
        v_admin_profile_id,
        gamilit.now_mexico() - INTERVAL '3 days',
        gamilit.now_mexico() - INTERVAL '3 days' + INTERVAL '45 seconds',
        gamilit.now_mexico() + INTERVAL '27 days'
    ) ON CONFLICT (id) DO NOTHING;

    -- Reporte en generacion
    INSERT INTO admin_dashboard.admin_reports (
        id, tenant_id, report_type, report_format, status,
        file_url, file_size, metadata, error_message,
        requested_by, created_at, completed_at, expires_at
    ) VALUES (
        'e0000000-0000-0000-0000-000000000003',
        v_tenant_id,
        'engagement', 'csv', 'generating',
        NULL, NULL,
        '{"filters": {"date_range": {"from": "2025-01-01", "to": "2025-12-31"}}, "metrics": ["daily_active_users", "session_duration", "exercises_completed"]}'::jsonb,
        NULL,
        v_admin_profile_id,
        gamilit.now_mexico() - INTERVAL '5 minutes',
        NULL, NULL
    ) ON CONFLICT (id) DO NOTHING;

    -- Reporte fallido
    INSERT INTO admin_dashboard.admin_reports (
        id, tenant_id, report_type, report_format, status,
        file_url, file_size, metadata, error_message,
        requested_by, created_at, completed_at, expires_at
    ) VALUES (
        'e0000000-0000-0000-0000-000000000004',
        v_tenant_id,
        'gamification', 'excel', 'failed',
        NULL, NULL,
        '{"filters": {"rank": "all"}, "include_leaderboard": true}'::jsonb,
        'Error al generar reporte: Timeout de conexion a base de datos',
        v_admin_profile_id,
        gamilit.now_mexico() - INTERVAL '2 days',
        gamilit.now_mexico() - INTERVAL '2 days' + INTERVAL '120 seconds',
        NULL
    ) ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'Seed admin_reports: 4 registros insertados (tenant=%, admin=%)', v_tenant_id, v_admin_profile_id;
END $$;
