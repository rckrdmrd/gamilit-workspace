-- ============================================================================
-- VALIDACIONES RAPIDAS POST-RECREACION DE BASE DE DATOS
-- Fecha: 2025-11-24
-- Database: gamilit_platform
-- ============================================================================
--
-- Este archivo contiene queries SQL para validar rapidamente la integridad
-- de la base de datos despues de una recreacion.
--
-- Uso:
--   psql -h localhost -U gamilit_user -d gamilit_platform -f VALIDACIONES-RAPIDAS-POST-RECREACION.sql
-- ============================================================================

\echo ''
\echo '============================================================================'
\echo 'VALIDACION 1: CONTEO DE SCHEMAS'
\echo '============================================================================'
SELECT count(*) as total_schemas
FROM information_schema.schemata
WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast');

\echo ''
\echo '============================================================================'
\echo 'VALIDACION 2: CONTEO DE TABLAS POR SCHEMA'
\echo '============================================================================'
SELECT table_schema, count(*) as tables
FROM information_schema.tables
WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
  AND table_type = 'BASE TABLE'
GROUP BY table_schema
ORDER BY table_schema;

\echo ''
\echo '============================================================================'
\echo 'VALIDACION 3: CONTEO DE FUNCIONES'
\echo '============================================================================'
SELECT count(*) as total_functions
FROM information_schema.routines
WHERE routine_schema NOT IN ('pg_catalog', 'information_schema');

\echo ''
\echo '============================================================================'
\echo 'VALIDACION 4: CONTEO DE TRIGGERS'
\echo '============================================================================'
SELECT count(DISTINCT trigger_name) as total_triggers
FROM information_schema.triggers;

\echo ''
\echo '============================================================================'
\echo 'VALIDACION 5: RLS POLICIES EN GAMIFICATION_SYSTEM.NOTIFICATIONS'
\echo '============================================================================'
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'notifications'
  AND schemaname = 'gamification_system'
ORDER BY policyname;

\echo ''
\echo '============================================================================'
\echo 'VALIDACION 6: RLS POLICIES EN STUDENT_INTERVENTION_ALERTS'
\echo '============================================================================'
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'student_intervention_alerts'
  AND schemaname = 'progress_tracking'
ORDER BY policyname;

\echo ''
\echo '============================================================================'
\echo 'VALIDACION 7: CONTEO DE USUARIOS POR ROL'
\echo '============================================================================'
SELECT
  role,
  count(*) as total
FROM auth_management.profiles
GROUP BY role
ORDER BY role;

\echo ''
\echo '============================================================================'
\echo 'VALIDACION 8: MODULOS EDUCATIVOS'
\echo '============================================================================'
SELECT
  id,
  title,
  status,
  (SELECT count(*) FROM educational_content.exercises e WHERE e.module_id = m.id) as ejercicios
FROM educational_content.modules m
ORDER BY title;

\echo ''
\echo '============================================================================'
\echo 'VALIDACION 9: RANGOS MAYA'
\echo '============================================================================'
SELECT
  rank_name,
  display_name,
  min_xp_required,
  max_xp_threshold,
  ml_coins_bonus,
  is_active
FROM gamification_system.maya_ranks
ORDER BY min_xp_required;

\echo ''
\echo '============================================================================'
\echo 'VALIDACION 10: USER STATS INICIALIZADOS'
\echo '============================================================================'
SELECT
  count(*) as total_users,
  count(*) FILTER (WHERE total_xp > 0) as con_xp,
  count(*) FILTER (WHERE ml_coins > 0) as con_coins,
  sum(total_xp)::bigint as total_xp_sistema,
  sum(ml_coins)::bigint as total_coins_sistema
FROM gamification_system.user_stats;

\echo ''
\echo '============================================================================'
\echo 'VALIDACION 11: MODULE PROGRESS INICIALIZADO'
\echo '============================================================================'
SELECT
  count(*) as total_records,
  count(DISTINCT user_id) as usuarios,
  count(DISTINCT module_id) as modulos,
  count(*) FILTER (WHERE status = 'completed') as completados,
  count(*) FILTER (WHERE status = 'in_progress') as en_progreso,
  count(*) FILTER (WHERE status = 'not_started') as no_iniciados
FROM progress_tracking.module_progress;

\echo ''
\echo '============================================================================'
\echo 'VALIDACION 12: SOCIAL FEATURES'
\echo '============================================================================'
SELECT 'Schools' as tipo, count(*)::text as total FROM social_features.schools
UNION ALL
SELECT 'Classrooms', count(*)::text FROM social_features.classrooms
UNION ALL
SELECT 'Teacher-Classroom Links', count(*)::text FROM social_features.teacher_classrooms;

\echo ''
\echo '============================================================================'
\echo 'VALIDACION 13: RESUMEN DE OBJETOS POR SCHEMA'
\echo '============================================================================'
SELECT
  s.schema_name,
  COALESCE(t.tables, 0) as tables,
  COALESCE(v.views, 0) as views,
  COALESCE(f.functions, 0) as functions,
  COALESCE(tr.triggers, 0) as triggers,
  COALESCE(p.policies, 0) as rls_policies
FROM (
  SELECT schema_name
  FROM information_schema.schemata
  WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast', 'pg_temp_3', 'pg_toast_temp_3')
) s
LEFT JOIN (
  SELECT table_schema, count(*) as tables
  FROM information_schema.tables
  WHERE table_type = 'BASE TABLE'
  GROUP BY table_schema
) t ON s.schema_name = t.table_schema
LEFT JOIN (
  SELECT table_schema, count(*) as views
  FROM information_schema.views
  GROUP BY table_schema
) v ON s.schema_name = v.table_schema
LEFT JOIN (
  SELECT routine_schema, count(*) as functions
  FROM information_schema.routines
  GROUP BY routine_schema
) f ON s.schema_name = f.routine_schema
LEFT JOIN (
  SELECT trigger_schema, count(DISTINCT trigger_name) as triggers
  FROM information_schema.triggers
  GROUP BY trigger_schema
) tr ON s.schema_name = tr.trigger_schema
LEFT JOIN (
  SELECT schemaname, count(*) as policies
  FROM pg_policies
  GROUP BY schemaname
) p ON s.schema_name = p.schemaname
WHERE s.schema_name IN (
  'admin_dashboard',
  'audit_logging',
  'auth',
  'auth_management',
  'communication',
  'content_management',
  'educational_content',
  'gamification_system',
  'gamilit',
  'lti_integration',
  'notifications',
  'progress_tracking',
  'social_features',
  'system_configuration'
)
ORDER BY s.schema_name;

\echo ''
\echo '============================================================================'
\echo 'VALIDACION 14: TABLAS CON RLS HABILITADO'
\echo '============================================================================'
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
  AND rowsecurity = true
ORDER BY schemaname, tablename;

\echo ''
\echo '============================================================================'
\echo 'VALIDACION COMPLETA'
\echo '============================================================================'
\echo 'Si todas las validaciones anteriores se ejecutaron sin errores,'
\echo 'la base de datos esta correctamente recreada y operacional.'
\echo ''
