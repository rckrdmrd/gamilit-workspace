-- =====================================================
-- Seed: admin_reports (PROD)
-- Schema: admin_dashboard
-- Descripcion: Datos iniciales para reportes administrativos
-- Relacionado: EXT-002 (Admin Extendido), AUDIT-003
-- Fecha: 2026-01-04
-- =====================================================

-- NOTA: Este seed crea registros de ejemplo para el portal admin.
-- En produccion, nuevos reportes se crean dinamicamente via API.

-- Reporte completado (usuarios)
INSERT INTO admin_dashboard.admin_reports (
    id,
    tenant_id,
    report_type,
    report_format,
    status,
    file_url,
    file_size,
    metadata,
    error_message,
    requested_by,
    created_at,
    completed_at,
    expires_at
) VALUES (
    'e0000000-0000-0000-0000-000000000001',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'users',
    'excel',
    'completed',
    '/reports/users_report_2026-01-01.xlsx',
    256000,
    '{"filters": {"role": "student", "status": "active"}, "columns": ["name", "email", "role", "created_at"], "total_records": 150}'::jsonb,
    NULL,
    (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email LIKE '%admin%' LIMIT 1),
    gamilit.now_mexico() - INTERVAL '5 days',
    gamilit.now_mexico() - INTERVAL '5 days' + INTERVAL '30 seconds',
    gamilit.now_mexico() + INTERVAL '25 days'
)
ON CONFLICT (id) DO NOTHING;

-- Reporte completado (progreso)
INSERT INTO admin_dashboard.admin_reports (
    id,
    tenant_id,
    report_type,
    report_format,
    status,
    file_url,
    file_size,
    metadata,
    error_message,
    requested_by,
    created_at,
    completed_at,
    expires_at
) VALUES (
    'e0000000-0000-0000-0000-000000000002',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'progress',
    'pdf',
    'completed',
    '/reports/progress_report_2026-01-02.pdf',
    512000,
    '{"filters": {"classroom_id": "abc123", "date_range": {"from": "2025-12-01", "to": "2025-12-31"}}, "include_charts": true, "total_students": 45}'::jsonb,
    NULL,
    (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email LIKE '%admin%' LIMIT 1),
    gamilit.now_mexico() - INTERVAL '3 days',
    gamilit.now_mexico() - INTERVAL '3 days' + INTERVAL '45 seconds',
    gamilit.now_mexico() + INTERVAL '27 days'
)
ON CONFLICT (id) DO NOTHING;

-- Reporte en generacion
INSERT INTO admin_dashboard.admin_reports (
    id,
    tenant_id,
    report_type,
    report_format,
    status,
    file_url,
    file_size,
    metadata,
    error_message,
    requested_by,
    created_at,
    completed_at,
    expires_at
) VALUES (
    'e0000000-0000-0000-0000-000000000003',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'engagement',
    'csv',
    'generating',
    NULL,
    NULL,
    '{"filters": {"date_range": {"from": "2025-01-01", "to": "2025-12-31"}}, "metrics": ["daily_active_users", "session_duration", "exercises_completed"]}'::jsonb,
    NULL,
    (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email LIKE '%admin%' LIMIT 1),
    gamilit.now_mexico() - INTERVAL '5 minutes',
    NULL,
    NULL
)
ON CONFLICT (id) DO NOTHING;

-- Reporte fallido
INSERT INTO admin_dashboard.admin_reports (
    id,
    tenant_id,
    report_type,
    report_format,
    status,
    file_url,
    file_size,
    metadata,
    error_message,
    requested_by,
    created_at,
    completed_at,
    expires_at
) VALUES (
    'e0000000-0000-0000-0000-000000000004',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'gamification',
    'excel',
    'failed',
    NULL,
    NULL,
    '{"filters": {"rank": "all"}, "include_leaderboard": true}'::jsonb,
    'Error al generar reporte: Timeout de conexion a base de datos',
    (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email LIKE '%admin%' LIMIT 1),
    gamilit.now_mexico() - INTERVAL '2 days',
    gamilit.now_mexico() - INTERVAL '2 days' + INTERVAL '120 seconds',
    NULL
)
ON CONFLICT (id) DO NOTHING;

-- Mensaje de confirmacion
DO $$
BEGIN
    RAISE NOTICE 'Seed admin_reports: 4 registros de ejemplo insertados';
END $$;
