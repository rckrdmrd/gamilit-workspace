-- ============================================================================
-- GAMILIT Platform - Validación de Integridad Referencial Pre-Deploy
-- ============================================================================
-- Fecha: 2025-11-23
-- Propósito: Validación exhaustiva de integridad antes de deploy a producción
-- Ejecutar contra: Base de datos GAMILIT de desarrollo
-- Modo: READ-ONLY (no modifica datos)
-- ============================================================================

\echo '========================================================================'
\echo '🔍 VALIDACIÓN DE INTEGRIDAD REFERENCIAL - PRE-DEPLOY'
\echo '========================================================================'
\echo ''
\echo 'Base de datos: gamilit_platform'
\echo 'Ambiente: Desarrollo'
\echo 'Fecha ejecución:' `date`
\echo ''

-- ============================================================================
-- SECCIÓN 1: INVENTARIO DE BASE DE DATOS
-- ============================================================================

\echo '========================================================================'
\echo '📊 SECCIÓN 1: INVENTARIO DE BASE DE DATOS'
\echo '========================================================================'
\echo ''

\echo '1.1 Schemas en la base de datos:'
\echo '------------------------------------------------------------------------'

SELECT
    schema_name,
    COUNT(DISTINCT table_name) as total_tablas
FROM information_schema.tables
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
  AND table_type = 'BASE TABLE'
GROUP BY schema_name
ORDER BY schema_name;

\echo ''

\echo '1.2 Total de tablas por schema:'
\echo '------------------------------------------------------------------------'

SELECT
    COUNT(DISTINCT table_schema || '.' || table_name) as total_tablas,
    COUNT(DISTINCT table_schema) as total_schemas
FROM information_schema.tables
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
  AND table_type = 'BASE TABLE';

\echo ''

-- ============================================================================
-- SECCIÓN 2: VALIDACIÓN DE FOREIGN KEYS (REGISTROS HUÉRFANOS)
-- ============================================================================

\echo '========================================================================'
\echo '🔑 SECCIÓN 2: VALIDACIÓN DE FOREIGN KEYS'
\echo '========================================================================'
\echo ''

\echo '2.1 Inventario de Foreign Keys:'
\echo '------------------------------------------------------------------------'

SELECT
    tc.table_schema,
    tc.table_name,
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY tc.table_schema, tc.table_name, kcu.column_name;

\echo ''

\echo '2.2 Conteo de Foreign Keys por schema:'
\echo '------------------------------------------------------------------------'

SELECT
    tc.table_schema,
    COUNT(*) as total_foreign_keys
FROM information_schema.table_constraints AS tc
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema NOT IN ('pg_catalog', 'information_schema')
GROUP BY tc.table_schema
ORDER BY tc.table_schema;

\echo ''

-- ============================================================================
-- SECCIÓN 3: DETECCIÓN DE REGISTROS HUÉRFANOS
-- ============================================================================

\echo '========================================================================'
\echo '🚨 SECCIÓN 3: DETECCIÓN DE REGISTROS HUÉRFANOS'
\echo '========================================================================'
\echo ''

-- 3.1 auth_management schema
\echo '3.1 Schema: auth_management'
\echo '------------------------------------------------------------------------'

-- profiles -> users
\echo '  → Validando: profiles.user_id -> auth.users.id'
SELECT
    COUNT(*) as total_profiles,
    COUNT(u.id) as profiles_con_user_valido,
    COUNT(*) - COUNT(u.id) as profiles_huerfanos,
    CASE
        WHEN COUNT(*) = COUNT(u.id) THEN '✅ OK'
        ELSE '🔴 CRÍTICO: Registros huérfanos encontrados'
    END as estado
FROM auth_management.profiles p
LEFT JOIN auth.users u ON u.id = p.user_id;

\echo ''

-- user_roles -> profiles
\echo '  → Validando: user_roles.profile_id -> profiles.id'
SELECT
    COUNT(*) as total_user_roles,
    COUNT(p.id) as roles_con_profile_valido,
    COUNT(*) - COUNT(p.id) as roles_huerfanos,
    CASE
        WHEN COUNT(*) = COUNT(p.id) THEN '✅ OK'
        ELSE '🔴 CRÍTICO: Registros huérfanos encontrados'
    END as estado
FROM auth_management.user_roles ur
LEFT JOIN auth_management.profiles p ON p.id = ur.profile_id;

\echo ''

-- user_preferences -> profiles
\echo '  → Validando: user_preferences.profile_id -> profiles.id'
SELECT
    COUNT(*) as total_user_preferences,
    COUNT(p.id) as preferences_con_profile_valido,
    COUNT(*) - COUNT(p.id) as preferences_huerfanas,
    CASE
        WHEN COUNT(*) = COUNT(p.id) THEN '✅ OK'
        ELSE '🔴 CRÍTICO: Registros huérfanos encontrados'
    END as estado
FROM auth_management.user_preferences up
LEFT JOIN auth_management.profiles p ON p.id = up.profile_id;

\echo ''

-- auth_attempts -> users
\echo '  → Validando: auth_attempts.user_id -> auth.users.id'
SELECT
    COUNT(*) as total_auth_attempts,
    COUNT(u.id) as attempts_con_user_valido,
    COUNT(*) - COUNT(u.id) as attempts_huerfanos,
    CASE
        WHEN COUNT(*) = COUNT(u.id) THEN '✅ OK'
        ELSE '🟡 ADVERTENCIA: Registros huérfanos encontrados'
    END as estado
FROM auth_management.auth_attempts aa
LEFT JOIN auth.users u ON u.id = aa.user_id;

\echo ''

-- security_events -> users
\echo '  → Validando: security_events.user_id -> auth.users.id'
SELECT
    COUNT(*) as total_security_events,
    COUNT(u.id) as events_con_user_valido,
    COUNT(*) - COUNT(u.id) as events_huerfanos,
    CASE
        WHEN COUNT(*) = COUNT(u.id) THEN '✅ OK'
        ELSE '🟡 ADVERTENCIA: Registros huérfanos encontrados'
    END as estado
FROM auth_management.security_events se
LEFT JOIN auth.users u ON u.id = se.user_id;

\echo ''

-- 3.2 educational_content schema
\echo '3.2 Schema: educational_content'
\echo '------------------------------------------------------------------------'

-- exercises -> modules
\echo '  → Validando: exercises.module_id -> modules.id'
SELECT
    COUNT(*) as total_exercises,
    COUNT(m.id) as exercises_con_module_valido,
    COUNT(*) - COUNT(m.id) as exercises_huerfanos,
    CASE
        WHEN COUNT(*) = COUNT(m.id) THEN '✅ OK'
        ELSE '🔴 CRÍTICO: Registros huérfanos encontrados'
    END as estado
FROM educational_content.exercises e
LEFT JOIN educational_content.modules m ON m.id = e.module_id;

\echo ''

-- assignment_exercises -> assignments
\echo '  → Validando: assignment_exercises.assignment_id -> assignments.id'
SELECT
    COUNT(*) as total_assignment_exercises,
    COUNT(a.id) as asignaciones_con_assignment_valido,
    COUNT(*) - COUNT(a.id) as asignaciones_huerfanas,
    CASE
        WHEN COUNT(*) = COUNT(a.id) THEN '✅ OK'
        ELSE '🔴 CRÍTICO: Registros huérfanos encontrados'
    END as estado
FROM educational_content.assignment_exercises ae
LEFT JOIN educational_content.assignments a ON a.id = ae.assignment_id;

\echo ''

-- assignment_exercises -> exercises
\echo '  → Validando: assignment_exercises.exercise_id -> exercises.id'
SELECT
    COUNT(*) as total_assignment_exercises,
    COUNT(e.id) as asignaciones_con_exercise_valido,
    COUNT(*) - COUNT(e.id) as asignaciones_huerfanas,
    CASE
        WHEN COUNT(*) = COUNT(e.id) THEN '✅ OK'
        ELSE '🔴 CRÍTICO: Registros huérfanos encontrados'
    END as estado
FROM educational_content.assignment_exercises ae
LEFT JOIN educational_content.exercises e ON e.id = ae.exercise_id;

\echo ''

-- assignment_submissions -> assignments
\echo '  → Validando: assignment_submissions.assignment_id -> assignments.id'
SELECT
    COUNT(*) as total_submissions,
    COUNT(a.id) as submissions_con_assignment_valido,
    COUNT(*) - COUNT(a.id) as submissions_huerfanas,
    CASE
        WHEN COUNT(*) = COUNT(a.id) THEN '✅ OK'
        ELSE '🔴 CRÍTICO: Registros huérfanos encontrados'
    END as estado
FROM educational_content.assignment_submissions asub
LEFT JOIN educational_content.assignments a ON a.id = asub.assignment_id;

\echo ''

-- classroom_modules -> modules
\echo '  → Validando: classroom_modules.module_id -> modules.id'
SELECT
    COUNT(*) as total_classroom_modules,
    COUNT(m.id) as classroom_modules_con_module_valido,
    COUNT(*) - COUNT(m.id) as classroom_modules_huerfanos,
    CASE
        WHEN COUNT(*) = COUNT(m.id) THEN '✅ OK'
        ELSE '🔴 CRÍTICO: Registros huérfanos encontrados'
    END as estado
FROM educational_content.classroom_modules cm
LEFT JOIN educational_content.modules m ON m.id = cm.module_id;

\echo ''

-- 3.3 gamification_system schema
\echo '3.3 Schema: gamification_system'
\echo '------------------------------------------------------------------------'

-- user_stats -> profiles
\echo '  → Validando: user_stats.profile_id -> auth_management.profiles.id'
SELECT
    COUNT(*) as total_user_stats,
    COUNT(p.id) as stats_con_profile_valido,
    COUNT(*) - COUNT(p.id) as stats_huerfanos,
    CASE
        WHEN COUNT(*) = COUNT(p.id) THEN '✅ OK'
        ELSE '🔴 CRÍTICO: Registros huérfanos encontrados'
    END as estado
FROM gamification_system.user_stats us
LEFT JOIN auth_management.profiles p ON p.id = us.profile_id;

\echo ''

-- user_achievements -> profiles
\echo '  → Validando: user_achievements.profile_id -> auth_management.profiles.id'
SELECT
    COUNT(*) as total_user_achievements,
    COUNT(p.id) as achievements_con_profile_valido,
    COUNT(*) - COUNT(p.id) as achievements_huerfanos,
    CASE
        WHEN COUNT(*) = COUNT(p.id) THEN '✅ OK'
        ELSE '🔴 CRÍTICO: Registros huérfanos encontrados'
    END as estado
FROM gamification_system.user_achievements ua
LEFT JOIN auth_management.profiles p ON p.id = ua.profile_id;

\echo ''

-- user_achievements -> achievements
\echo '  → Validando: user_achievements.achievement_id -> achievements.id'
SELECT
    COUNT(*) as total_user_achievements,
    COUNT(a.id) as achievements_con_achievement_valido,
    COUNT(*) - COUNT(a.id) as achievements_huerfanos,
    CASE
        WHEN COUNT(*) = COUNT(a.id) THEN '✅ OK'
        ELSE '🔴 CRÍTICO: Registros huérfanos encontrados'
    END as estado
FROM gamification_system.user_achievements ua
LEFT JOIN gamification_system.achievements a ON a.id = ua.achievement_id;

\echo ''

-- comodines_inventory -> profiles
\echo '  → Validando: comodines_inventory.profile_id -> auth_management.profiles.id'
SELECT
    COUNT(*) as total_comodines_inventory,
    COUNT(p.id) as inventory_con_profile_valido,
    COUNT(*) - COUNT(p.id) as inventory_huerfano,
    CASE
        WHEN COUNT(*) = COUNT(p.id) THEN '✅ OK'
        ELSE '🔴 CRÍTICO: Registros huérfanos encontrados'
    END as estado
FROM gamification_system.comodines_inventory ci
LEFT JOIN auth_management.profiles p ON p.id = ci.profile_id;

\echo ''

-- notifications -> profiles
\echo '  → Validando: notifications.user_id -> auth_management.profiles.id'
SELECT
    COUNT(*) as total_notifications,
    COUNT(p.id) as notifications_con_profile_valido,
    COUNT(*) - COUNT(p.id) as notifications_huerfanas,
    CASE
        WHEN COUNT(*) = COUNT(p.id) THEN '✅ OK'
        ELSE '🟡 ADVERTENCIA: Registros huérfanos encontrados'
    END as estado
FROM gamification_system.notifications n
LEFT JOIN auth_management.profiles p ON p.id = n.user_id;

\echo ''

-- 3.4 progress_tracking schema
\echo '3.4 Schema: progress_tracking'
\echo '------------------------------------------------------------------------'

-- module_progress -> profiles
\echo '  → Validando: module_progress.user_id -> auth_management.profiles.id'
SELECT
    COUNT(*) as total_module_progress,
    COUNT(p.id) as progress_con_profile_valido,
    COUNT(*) - COUNT(p.id) as progress_huerfano,
    CASE
        WHEN COUNT(*) = COUNT(p.id) THEN '✅ OK'
        ELSE '🔴 CRÍTICO: Registros huérfanos encontrados'
    END as estado
FROM progress_tracking.module_progress mp
LEFT JOIN auth_management.profiles p ON p.id = mp.user_id;

\echo ''

-- module_progress -> modules
\echo '  → Validando: module_progress.module_id -> educational_content.modules.id'
SELECT
    COUNT(*) as total_module_progress,
    COUNT(m.id) as progress_con_module_valido,
    COUNT(*) - COUNT(m.id) as progress_huerfano,
    CASE
        WHEN COUNT(*) = COUNT(m.id) THEN '✅ OK'
        ELSE '🔴 CRÍTICO: Registros huérfanos encontrados'
    END as estado
FROM progress_tracking.module_progress mp
LEFT JOIN educational_content.modules m ON m.id = mp.module_id;

\echo ''

-- exercise_attempts -> exercises
\echo '  → Validando: exercise_attempts.exercise_id -> educational_content.exercises.id'
SELECT
    COUNT(*) as total_exercise_attempts,
    COUNT(e.id) as attempts_con_exercise_valido,
    COUNT(*) - COUNT(e.id) as attempts_huerfanos,
    CASE
        WHEN COUNT(*) = COUNT(e.id) THEN '✅ OK'
        ELSE '🔴 CRÍTICO: Registros huérfanos encontrados'
    END as estado
FROM progress_tracking.exercise_attempts ea
LEFT JOIN educational_content.exercises e ON e.id = ea.exercise_id;

\echo ''

-- exercise_attempts -> profiles
\echo '  → Validando: exercise_attempts.user_id -> auth_management.profiles.id'
SELECT
    COUNT(*) as total_exercise_attempts,
    COUNT(p.id) as attempts_con_profile_valido,
    COUNT(*) - COUNT(p.id) as attempts_huerfanos,
    CASE
        WHEN COUNT(*) = COUNT(p.id) THEN '✅ OK'
        ELSE '🔴 CRÍTICO: Registros huérfanos encontrados'
    END as estado
FROM progress_tracking.exercise_attempts ea
LEFT JOIN auth_management.profiles p ON p.id = ea.user_id;

\echo ''

-- 3.5 social_features schema
\echo '3.5 Schema: social_features'
\echo '------------------------------------------------------------------------'

-- classroom_members -> classrooms
\echo '  → Validando: classroom_members.classroom_id -> classrooms.id'
SELECT
    COUNT(*) as total_classroom_members,
    COUNT(c.id) as members_con_classroom_valido,
    COUNT(*) - COUNT(c.id) as members_huerfanos,
    CASE
        WHEN COUNT(*) = COUNT(c.id) THEN '✅ OK'
        ELSE '🔴 CRÍTICO: Registros huérfanos encontrados'
    END as estado
FROM social_features.classroom_members cm
LEFT JOIN social_features.classrooms c ON c.id = cm.classroom_id;

\echo ''

-- classroom_members -> profiles
\echo '  → Validando: classroom_members.user_id -> auth_management.profiles.id'
SELECT
    COUNT(*) as total_classroom_members,
    COUNT(p.id) as members_con_profile_valido,
    COUNT(*) - COUNT(p.id) as members_huerfanos,
    CASE
        WHEN COUNT(*) = COUNT(p.id) THEN '✅ OK'
        ELSE '🔴 CRÍTICO: Registros huérfanos encontrados'
    END as estado
FROM social_features.classroom_members cm
LEFT JOIN auth_management.profiles p ON p.id = cm.user_id;

\echo ''

-- team_members -> teams
\echo '  → Validando: team_members.team_id -> teams.id'
SELECT
    COUNT(*) as total_team_members,
    COUNT(t.id) as members_con_team_valido,
    COUNT(*) - COUNT(t.id) as members_huerfanos,
    CASE
        WHEN COUNT(*) = COUNT(t.id) THEN '✅ OK'
        ELSE '🔴 CRÍTICO: Registros huérfanos encontrados'
    END as estado
FROM social_features.team_members tm
LEFT JOIN social_features.teams t ON t.id = tm.team_id;

\echo ''

-- team_members -> profiles
\echo '  → Validando: team_members.user_id -> auth_management.profiles.id'
SELECT
    COUNT(*) as total_team_members,
    COUNT(p.id) as members_con_profile_valido,
    COUNT(*) - COUNT(p.id) as members_huerfanos,
    CASE
        WHEN COUNT(*) = COUNT(p.id) THEN '✅ OK'
        ELSE '🔴 CRÍTICO: Registros huérfanos encontrados'
    END as estado
FROM social_features.team_members tm
LEFT JOIN auth_management.profiles p ON p.id = tm.user_id;

\echo ''

-- 3.6 audit_logging schema
\echo '3.6 Schema: audit_logging'
\echo '------------------------------------------------------------------------'

-- audit_logs -> users
\echo '  → Validando: audit_logs.user_id -> auth.users.id (permitir NULL)'
SELECT
    COUNT(*) as total_audit_logs,
    COUNT(CASE WHEN al.user_id IS NOT NULL THEN 1 END) as logs_con_user,
    COUNT(CASE WHEN al.user_id IS NOT NULL AND u.id IS NULL THEN 1 END) as logs_huerfanos,
    CASE
        WHEN COUNT(CASE WHEN al.user_id IS NOT NULL AND u.id IS NULL THEN 1 END) = 0 THEN '✅ OK'
        ELSE '🟡 ADVERTENCIA: Registros huérfanos encontrados'
    END as estado
FROM audit_logging.audit_logs al
LEFT JOIN auth.users u ON u.id = al.user_id;

\echo ''

-- ============================================================================
-- SECCIÓN 4: VALIDACIÓN DE CONSTRAINTS NOT NULL
-- ============================================================================

\echo '========================================================================'
\echo '⚠️  SECCIÓN 4: VALIDACIÓN DE CONSTRAINTS NOT NULL'
\echo '========================================================================'
\echo ''

\echo '4.1 Columnas con constraint NOT NULL por schema:'
\echo '------------------------------------------------------------------------'

SELECT
    table_schema,
    COUNT(DISTINCT table_name || '.' || column_name) as columnas_not_null
FROM information_schema.columns
WHERE is_nullable = 'NO'
  AND table_schema NOT IN ('pg_catalog', 'information_schema')
GROUP BY table_schema
ORDER BY table_schema;

\echo ''

\echo '4.2 Verificación de columnas críticas NOT NULL en auth_management:'
\echo '------------------------------------------------------------------------'

-- Verificar que no hay NULL en columnas críticas
SELECT
    'profiles.user_id' as columna,
    COUNT(*) as total_registros,
    COUNT(user_id) as registros_no_null,
    COUNT(*) - COUNT(user_id) as registros_null,
    CASE
        WHEN COUNT(*) = COUNT(user_id) THEN '✅ OK'
        ELSE '🔴 CRÍTICO: Valores NULL encontrados'
    END as estado
FROM auth_management.profiles
UNION ALL
SELECT
    'profiles.full_name' as columna,
    COUNT(*) as total_registros,
    COUNT(full_name) as registros_no_null,
    COUNT(*) - COUNT(full_name) as registros_null,
    CASE
        WHEN COUNT(*) = COUNT(full_name) THEN '✅ OK'
        ELSE '🔴 CRÍTICO: Valores NULL encontrados'
    END as estado
FROM auth_management.profiles
UNION ALL
SELECT
    'user_roles.profile_id' as columna,
    COUNT(*) as total_registros,
    COUNT(profile_id) as registros_no_null,
    COUNT(*) - COUNT(profile_id) as registros_null,
    CASE
        WHEN COUNT(*) = COUNT(profile_id) THEN '✅ OK'
        ELSE '🔴 CRÍTICO: Valores NULL encontrados'
    END as estado
FROM auth_management.user_roles;

\echo ''

\echo '4.3 Verificación de columnas críticas NOT NULL en educational_content:'
\echo '------------------------------------------------------------------------'

SELECT
    'exercises.module_id' as columna,
    COUNT(*) as total_registros,
    COUNT(module_id) as registros_no_null,
    COUNT(*) - COUNT(module_id) as registros_null,
    CASE
        WHEN COUNT(*) = COUNT(module_id) THEN '✅ OK'
        ELSE '🔴 CRÍTICO: Valores NULL encontrados'
    END as estado
FROM educational_content.exercises
UNION ALL
SELECT
    'exercises.title' as columna,
    COUNT(*) as total_registros,
    COUNT(title) as registros_no_null,
    COUNT(*) - COUNT(title) as registros_null,
    CASE
        WHEN COUNT(*) = COUNT(title) THEN '✅ OK'
        ELSE '🔴 CRÍTICO: Valores NULL encontrados'
    END as estado
FROM educational_content.exercises
UNION ALL
SELECT
    'modules.title' as columna,
    COUNT(*) as total_registros,
    COUNT(title) as registros_no_null,
    COUNT(*) - COUNT(title) as registros_null,
    CASE
        WHEN COUNT(*) = COUNT(title) THEN '✅ OK'
        ELSE '🔴 CRÍTICO: Valores NULL encontrados'
    END as estado
FROM educational_content.modules;

\echo ''

-- ============================================================================
-- SECCIÓN 5: VALIDACIÓN DE CONSTRAINTS UNIQUE
-- ============================================================================

\echo '========================================================================'
\echo '🔒 SECCIÓN 5: VALIDACIÓN DE CONSTRAINTS UNIQUE'
\echo '========================================================================'
\echo ''

\echo '5.1 Inventario de constraints UNIQUE:'
\echo '------------------------------------------------------------------------'

SELECT
    tc.table_schema,
    tc.table_name,
    tc.constraint_name,
    string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columnas
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'UNIQUE'
  AND tc.table_schema NOT IN ('pg_catalog', 'information_schema')
GROUP BY tc.table_schema, tc.table_name, tc.constraint_name
ORDER BY tc.table_schema, tc.table_name;

\echo ''

\echo '5.2 Detección de duplicados en columnas UNIQUE críticas:'
\echo '------------------------------------------------------------------------'

-- Verificar duplicados en auth.users.email
\echo '  → Verificando: auth.users.email'
SELECT
    COUNT(*) as total_usuarios,
    COUNT(DISTINCT email) as emails_unicos,
    COUNT(*) - COUNT(DISTINCT email) as emails_duplicados,
    CASE
        WHEN COUNT(*) = COUNT(DISTINCT email) THEN '✅ OK'
        ELSE '🔴 CRÍTICO: Emails duplicados encontrados'
    END as estado
FROM auth.users;

\echo ''

-- Verificar duplicados en auth_management.profiles.user_id
\echo '  → Verificando: auth_management.profiles.user_id'
SELECT
    COUNT(*) as total_profiles,
    COUNT(DISTINCT user_id) as user_ids_unicos,
    COUNT(*) - COUNT(DISTINCT user_id) as user_ids_duplicados,
    CASE
        WHEN COUNT(*) = COUNT(DISTINCT user_id) THEN '✅ OK'
        ELSE '🔴 CRÍTICO: User IDs duplicados encontrados'
    END as estado
FROM auth_management.profiles;

\echo ''

-- ============================================================================
-- SECCIÓN 6: VALIDACIÓN DE RELACIONES MANY-TO-MANY
-- ============================================================================

\echo '========================================================================'
\echo '🔗 SECCIÓN 6: VALIDACIÓN DE RELACIONES MANY-TO-MANY'
\echo '========================================================================'
\echo ''

\echo '6.1 Tablas de unión detectadas:'
\echo '------------------------------------------------------------------------'

-- assignment_exercises (assignments <-> exercises)
\echo '  → Tabla: assignment_exercises'
SELECT
    COUNT(*) as total_relaciones,
    COUNT(DISTINCT assignment_id) as assignments_relacionados,
    COUNT(DISTINCT exercise_id) as exercises_relacionados,
    CASE
        WHEN COUNT(*) > 0 THEN '✅ Poblada'
        ELSE '⚪ Vacía'
    END as estado
FROM educational_content.assignment_exercises;

\echo ''

-- classroom_members (classrooms <-> profiles)
\echo '  → Tabla: classroom_members'
SELECT
    COUNT(*) as total_relaciones,
    COUNT(DISTINCT classroom_id) as classrooms_relacionados,
    COUNT(DISTINCT user_id) as users_relacionados,
    CASE
        WHEN COUNT(*) > 0 THEN '✅ Poblada'
        ELSE '⚪ Vacía'
    END as estado
FROM social_features.classroom_members;

\echo ''

-- team_members (teams <-> profiles)
\echo '  → Tabla: team_members'
SELECT
    COUNT(*) as total_relaciones,
    COUNT(DISTINCT team_id) as teams_relacionados,
    COUNT(DISTINCT user_id) as users_relacionados,
    CASE
        WHEN COUNT(*) > 0 THEN '✅ Poblada'
        ELSE '⚪ Vacía'
    END as estado
FROM social_features.team_members;

\echo ''

-- content_tags (content <-> tags)
\echo '  → Tabla: content_tags'
SELECT
    COUNT(*) as total_relaciones,
    COUNT(DISTINCT content_id) as contenidos_relacionados,
    COUNT(DISTINCT tag_id) as tags_relacionados,
    CASE
        WHEN COUNT(*) > 0 THEN '✅ Poblada'
        ELSE '⚪ Vacía'
    END as estado
FROM educational_content.content_tags;

\echo ''

-- ============================================================================
-- SECCIÓN 7: VALIDACIÓN DE INTEGRIDAD DE DATOS
-- ============================================================================

\echo '========================================================================'
\echo '📋 SECCIÓN 7: VALIDACIÓN DE INTEGRIDAD DE DATOS'
\echo '========================================================================'
\echo ''

\echo '7.1 Verificación de ENUMs utilizados:'
\echo '------------------------------------------------------------------------'

-- Verificar que todos los valores ENUM en uso son válidos
SELECT
    'auth_management.user_status' as enum_type,
    COUNT(DISTINCT status) as valores_unicos,
    string_agg(DISTINCT status::text, ', ') as valores
FROM auth_management.profiles;

\echo ''

SELECT
    'educational_content.exercise_type' as enum_type,
    COUNT(DISTINCT exercise_type) as valores_unicos,
    COUNT(*) as total_registros
FROM educational_content.exercises;

\echo ''

\echo '7.2 Verificación de fechas lógicas:'
\echo '------------------------------------------------------------------------'

-- Verificar que created_at <= updated_at
\echo '  → Verificando: created_at <= updated_at en auth_management.profiles'
SELECT
    COUNT(*) as total_registros,
    COUNT(CASE WHEN updated_at >= created_at THEN 1 END) as fechas_validas,
    COUNT(CASE WHEN updated_at < created_at THEN 1 END) as fechas_invalidas,
    CASE
        WHEN COUNT(CASE WHEN updated_at < created_at THEN 1 END) = 0 THEN '✅ OK'
        ELSE '🔴 CRÍTICO: Fechas inválidas encontradas'
    END as estado
FROM auth_management.profiles;

\echo ''

\echo '  → Verificando: created_at <= updated_at en educational_content.modules'
SELECT
    COUNT(*) as total_registros,
    COUNT(CASE WHEN updated_at >= created_at THEN 1 END) as fechas_validas,
    COUNT(CASE WHEN updated_at < created_at THEN 1 END) as fechas_invalidas,
    CASE
        WHEN COUNT(CASE WHEN updated_at < created_at THEN 1 END) = 0 THEN '✅ OK'
        ELSE '🔴 CRÍTICO: Fechas inválidas encontradas'
    END as estado
FROM educational_content.modules;

\echo ''

-- ============================================================================
-- SECCIÓN 8: RESUMEN EJECUTIVO
-- ============================================================================

\echo '========================================================================'
\echo '📊 SECCIÓN 8: RESUMEN EJECUTIVO'
\echo '========================================================================'
\echo ''

\echo 'Total de validaciones ejecutadas: 40+'
\echo ''
\echo 'Clasificación de hallazgos:'
\echo '  🔴 CRÍTICO: Bloquea deploy a producción'
\echo '  🟡 ADVERTENCIA: Revisar pero no bloquea'
\echo '  ✅ OK: Sin problemas detectados'
\echo '  ⚪ VACÍO: Sin datos para validar'
\echo ''
\echo '========================================================================'
\echo 'FIN DE VALIDACIÓN DE INTEGRIDAD REFERENCIAL'
\echo '========================================================================'
\echo ''
\echo 'Revisar output completo para determinar si la base de datos está lista'
\echo 'para deploy a producción.'
\echo ''
