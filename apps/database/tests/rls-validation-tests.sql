-- =============================================================================
-- RLS POLICIES VALIDATION TESTS
-- TASK: TASK-2026-01-25-VALIDACION-PORTAL-TEACHER
-- Date: 2026-01-25
-- Agent: Claude Code (adredsi)
-- =============================================================================
--
-- OBJETIVO:
-- Validar que las RLS policies funcionen correctamente en escenarios multi-tenant
--
-- =============================================================================

-- =============================================================================
-- SETUP: Obtener datos existentes para pruebas
-- =============================================================================

\echo ''
\echo '============================================================'
\echo 'RLS POLICIES VALIDATION - GAMILIT PLATFORM'
\echo '============================================================'
\echo ''

-- Obtener tenants disponibles
\echo '1. TENANTS DISPONIBLES:'
SELECT id, name, slug
FROM auth_management.tenants
ORDER BY created_at
LIMIT 5;

\echo ''
\echo '2. USUARIOS DISPONIBLES (primeros 10):'
SELECT p.id, p.display_name, u.email, t.name as tenant
FROM auth_management.profiles p
JOIN auth_management.users u ON u.id = p.user_id
JOIN auth_management.tenants t ON t.id = p.tenant_id
ORDER BY p.created_at
LIMIT 10;

\echo ''
\echo '3. ROLES DE USUARIOS:'
SELECT p.display_name, ur.role, t.name as tenant
FROM auth_management.user_roles ur
JOIN auth_management.profiles p ON p.id = ur.user_id
JOIN auth_management.tenants t ON t.id = p.tenant_id
ORDER BY ur.role, p.display_name
LIMIT 15;

-- =============================================================================
-- TEST 1: SCHEDULED_REPORTS - Tenant Isolation
-- =============================================================================

\echo ''
\echo '============================================================'
\echo 'TEST 1: SCHEDULED_REPORTS - Tenant Isolation'
\echo '============================================================'

\echo ''
\echo 'Scheduled Reports por Tenant:'
SELECT
    sr.id,
    sr.teacher_id,
    p.display_name as teacher_name,
    t.name as tenant,
    sr.report_name,
    sr.status,
    sr.frequency
FROM social_features.scheduled_reports sr
JOIN auth_management.profiles p ON p.id = sr.teacher_id
JOIN auth_management.tenants t ON t.id = sr.tenant_id
ORDER BY t.name, sr.created_at
LIMIT 10;

\echo ''
\echo 'TEST: Simular acceso como teacher específico'
\echo 'NOTA: RLS policies requieren current_setting para funcionar'
\echo 'En producción, el backend configura app.current_user_id y app.current_tenant_id'

-- =============================================================================
-- TEST 2: SHARED_REPORTS - Access Control
-- =============================================================================

\echo ''
\echo '============================================================'
\echo 'TEST 2: SHARED_REPORTS - Access Control'
\echo '============================================================'

\echo ''
\echo 'Shared Reports Existentes:'
SELECT
    sr.id,
    p1.display_name as shared_by,
    p2.display_name as shared_with,
    tr.report_name,
    sr.permission_level,
    sr.is_revoked,
    sr.expires_at,
    CASE
        WHEN sr.is_revoked THEN 'REVOKED'
        WHEN sr.expires_at IS NOT NULL AND sr.expires_at < NOW() THEN 'EXPIRED'
        ELSE 'ACTIVE'
    END as status
FROM social_features.shared_reports sr
JOIN auth_management.profiles p1 ON p1.id = sr.shared_by
JOIN auth_management.profiles p2 ON p2.id = sr.shared_with
LEFT JOIN social_features.teacher_reports tr ON tr.id = sr.report_id
ORDER BY sr.created_at DESC
LIMIT 10;

-- =============================================================================
-- TEST 3: TEACHER_CONTENT - Visibility Levels
-- =============================================================================

\echo ''
\echo '============================================================'
\echo 'TEST 3: TEACHER_CONTENT - Visibility Levels'
\echo '============================================================'

\echo ''
\echo 'Teacher Content por Visibility:'
SELECT
    tc.id,
    p.display_name as teacher,
    t.name as tenant,
    tc.title,
    tc.visibility,
    tc.status,
    tc.is_active,
    tc.is_shared,
    CASE
        WHEN tc.shared_with_teachers IS NOT NULL
        THEN jsonb_array_length(tc.shared_with_teachers)
        ELSE 0
    END as shared_count
FROM educational_content.teacher_content tc
JOIN auth_management.profiles p ON p.id = tc.teacher_id
JOIN auth_management.tenants t ON t.id = p.tenant_id
ORDER BY tc.visibility, tc.created_at DESC
LIMIT 15;

\echo ''
\echo 'Content Distribution by Visibility:'
SELECT
    visibility,
    status,
    COUNT(*) as count,
    COUNT(CASE WHEN is_shared = TRUE THEN 1 END) as shared_count
FROM educational_content.teacher_content
GROUP BY visibility, status
ORDER BY visibility, status;

-- =============================================================================
-- TEST 4: RLS POLICIES - Policy Count Verification
-- =============================================================================

\echo ''
\echo '============================================================'
\echo 'TEST 4: RLS POLICIES - Verification'
\echo '============================================================'

\echo ''
\echo 'RLS Policies Count per Table:'
SELECT
    schemaname,
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname IN ('social_features', 'educational_content')
GROUP BY schemaname, tablename
ORDER BY schemaname, tablename;

\echo ''
\echo 'Teacher Content Policies (should be 10):'
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'educational_content'
  AND tablename = 'teacher_content'
ORDER BY policyname;

\echo ''
\echo 'Scheduled Reports Policies (should be 2):'
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'social_features'
  AND tablename = 'scheduled_reports'
ORDER BY policyname;

\echo ''
\echo 'Shared Reports Policies (should be 3):'
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'social_features'
  AND tablename = 'shared_reports'
ORDER BY policyname;

-- =============================================================================
-- TEST 5: DATA INTEGRITY - Foreign Keys and Constraints
-- =============================================================================

\echo ''
\echo '============================================================'
\echo 'TEST 5: DATA INTEGRITY - Constraints'
\echo '============================================================'

\echo ''
\echo 'Scheduled Reports Constraints:'
SELECT
    conname as constraint_name,
    contype as type,
    CASE contype
        WHEN 'c' THEN 'CHECK'
        WHEN 'f' THEN 'FOREIGN KEY'
        WHEN 'p' THEN 'PRIMARY KEY'
        WHEN 'u' THEN 'UNIQUE'
    END as constraint_type
FROM pg_constraint
WHERE conrelid = 'social_features.scheduled_reports'::regclass
ORDER BY contype, conname;

\echo ''
\echo 'Shared Reports Constraints:'
SELECT
    conname as constraint_name,
    contype as type,
    CASE contype
        WHEN 'c' THEN 'CHECK'
        WHEN 'f' THEN 'FOREIGN KEY'
        WHEN 'p' THEN 'PRIMARY KEY'
        WHEN 'u' THEN 'UNIQUE'
    END as constraint_type
FROM pg_constraint
WHERE conrelid = 'social_features.shared_reports'::regclass
ORDER BY contype, conname;

-- =============================================================================
-- TEST 6: MIGRATION VALIDATION - New Fields
-- =============================================================================

\echo ''
\echo '============================================================'
\echo 'TEST 6: MIGRATION VALIDATION - New Fields'
\echo '============================================================'

\echo ''
\echo 'Scheduled Reports - New Fields Verification:'
\echo 'Checking: student_ids (UUID[]), preferred_hour (INT), status (VARCHAR)'
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'social_features'
  AND table_name = 'scheduled_reports'
  AND column_name IN ('student_ids', 'preferred_hour', 'status', 'is_active', 'time_of_day')
ORDER BY column_name;

\echo ''
\echo 'Shared Reports - New Fields Verification:'
\echo 'Checking: is_revoked (BOOLEAN), accessed_at, access_count'
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'social_features'
  AND table_name = 'shared_reports'
  AND column_name IN ('is_revoked', 'accessed_at', 'access_count', 'tenant_id')
ORDER BY column_name;

-- =============================================================================
-- TEST SUMMARY
-- =============================================================================

\echo ''
\echo '============================================================'
\echo 'TEST SUMMARY'
\echo '============================================================'

\echo ''
\echo 'Total Tables with RLS Enabled:'
SELECT
    schemaname,
    COUNT(*) as tables_with_rls
FROM pg_tables
WHERE rowsecurity = true
  AND schemaname IN ('social_features', 'educational_content')
GROUP BY schemaname;

\echo ''
\echo 'Total RLS Policies:'
SELECT COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname IN ('social_features', 'educational_content');

\echo ''
\echo '============================================================'
\echo 'RLS VALIDATION TESTS - COMPLETED'
\echo '============================================================'
\echo ''
\echo 'NEXT STEPS:'
\echo '1. Review tenant isolation manually by setting app.current_user_id'
\echo '2. Test backend endpoints with different user contexts'
\echo '3. Verify scheduled_reports automation functions'
\echo ''
