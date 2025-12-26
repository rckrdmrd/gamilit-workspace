-- =====================================================
-- Script de Validación: Gaps Database-Backend
-- Fecha: 2025-11-24
-- Tarea: DB-127 Corrección Gaps Coherencia
-- =====================================================
--
-- Este script valida que los 3 gaps identificados estén resueltos:
-- - GAP-DB-001: activity_log con entity_type, entity_id
-- - GAP-DB-002: auth.tenants vista alias
-- - GAP-DB-003: classrooms.is_deleted
--
-- =====================================================

\echo '==================================================='
\echo 'VALIDACIÓN DE GAPS DATABASE-BACKEND'
\echo '==================================================='
\echo ''

-- =====================================================
-- GAP-DB-001: Validar tabla activity_log
-- =====================================================

\echo '--- GAP-DB-001: Tabla audit_logging.activity_log ---'
\echo ''

-- Validar que tabla existe
SELECT
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'audit_logging'
            AND table_name = 'activity_log'
        )
        THEN '✅ Tabla audit_logging.activity_log existe'
        ELSE '❌ ERROR: Tabla audit_logging.activity_log NO existe'
    END as status;

-- Validar columnas requeridas
\echo ''
\echo 'Validar columnas en activity_log:'
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE
        WHEN column_name IN ('id', 'user_id', 'action_type', 'entity_type', 'entity_id', 'description', 'metadata', 'created_at')
        THEN '✅ Requerida'
        ELSE '  Opcional'
    END as importancia
FROM information_schema.columns
WHERE table_schema = 'audit_logging'
AND table_name = 'activity_log'
ORDER BY ordinal_position;

-- Validar indices
\echo ''
\echo 'Validar índices en activity_log:'
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'audit_logging'
AND tablename = 'activity_log'
ORDER BY indexname;

-- Validar query backend (query de admin-dashboard.service.ts:184)
\echo ''
\echo 'Validar query backend - Actividad por tipo (últimos 7 días):'
SELECT
    action_type,
    COUNT(*) as count
FROM audit_logging.activity_log
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY action_type
ORDER BY count DESC
LIMIT 5;

-- =====================================================
-- GAP-DB-002: Validar vista auth.tenants
-- =====================================================

\echo ''
\echo '--- GAP-DB-002: Vista auth.tenants (alias) ---'
\echo ''

-- Validar que vista existe
SELECT
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.views
            WHERE table_schema = 'auth'
            AND table_name = 'tenants'
        )
        THEN '✅ Vista auth.tenants existe'
        ELSE '❌ ERROR: Vista auth.tenants NO existe'
    END as status;

-- Validar query backend (query de admin-dashboard.service.ts:95)
\echo ''
\echo 'Validar query backend - Tenants actualizados (últimos 7 días):'
SELECT
    id,
    name,
    slug,
    updated_at
FROM auth.tenants
WHERE updated_at >= NOW() - INTERVAL '7 days'
ORDER BY updated_at DESC
LIMIT 3;

-- Validar que apunta a auth_management.tenants
\echo ''
\echo 'Validar definición de vista:'
SELECT
    schemaname,
    viewname,
    LEFT(definition, 100) || '...' as definition_preview
FROM pg_views
WHERE schemaname = 'auth'
AND viewname = 'tenants';

-- =====================================================
-- GAP-DB-003: Validar classrooms.is_deleted
-- =====================================================

\echo ''
\echo '--- GAP-DB-003: Columna classrooms.is_deleted ---'
\echo ''

-- Validar que columna existe
SELECT
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'social_features'
            AND table_name = 'classrooms'
            AND column_name = 'is_deleted'
        )
        THEN '✅ Columna social_features.classrooms.is_deleted existe'
        ELSE '❌ ERROR: Columna is_deleted NO existe en classrooms'
    END as status;

-- Validar tipo y default de columna
\echo ''
\echo 'Validar columna is_deleted:'
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'social_features'
AND table_name = 'classrooms'
AND column_name IN ('is_deleted', 'is_archived', 'is_active')
ORDER BY column_name;

-- Validar índice parcial para is_deleted
\echo ''
\echo 'Validar índice parcial para is_deleted:'
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'social_features'
AND tablename = 'classrooms'
AND indexdef LIKE '%is_deleted%'
ORDER BY indexname;

-- Validar query backend (query de classrooms.service.ts:67)
\echo ''
\echo 'Validar query backend - Classrooms no eliminados:'
SELECT
    id,
    name,
    code,
    is_active,
    is_archived,
    is_deleted
FROM social_features.classrooms
WHERE is_deleted = FALSE
ORDER BY created_at DESC
LIMIT 3;

-- =====================================================
-- RESUMEN FINAL
-- =====================================================

\echo ''
\echo '==================================================='
\echo 'RESUMEN DE VALIDACIÓN'
\echo '==================================================='
\echo ''

SELECT
    '✅ GAP-DB-001: activity_log' as gap,
    CASE
        WHEN COUNT(*) >= 8 THEN '✅ RESUELTO'
        ELSE '❌ PENDIENTE'
    END as estado
FROM information_schema.columns
WHERE table_schema = 'audit_logging'
AND table_name = 'activity_log'
AND column_name IN ('id', 'user_id', 'action_type', 'entity_type', 'entity_id', 'description', 'metadata', 'created_at')

UNION ALL

SELECT
    '✅ GAP-DB-002: auth.tenants' as gap,
    CASE
        WHEN COUNT(*) = 1 THEN '✅ RESUELTO'
        ELSE '❌ PENDIENTE'
    END as estado
FROM information_schema.views
WHERE table_schema = 'auth'
AND table_name = 'tenants'

UNION ALL

SELECT
    '✅ GAP-DB-003: classrooms.is_deleted' as gap,
    CASE
        WHEN COUNT(*) = 1 THEN '✅ RESUELTO'
        ELSE '❌ PENDIENTE'
    END as estado
FROM information_schema.columns
WHERE table_schema = 'social_features'
AND table_name = 'classrooms'
AND column_name = 'is_deleted';

\echo ''
\echo '==================================================='
\echo 'VALIDACIÓN COMPLETADA'
\echo '==================================================='
