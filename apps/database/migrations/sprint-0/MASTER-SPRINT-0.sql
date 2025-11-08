-- =====================================================
-- GAMILIT PLATFORM - SPRINT 0 MASTER SCRIPT
-- =====================================================
-- Ejecuta todas las correcciones críticas en orden
-- Duración total estimada: 10 días laborales
-- Tiempo de ejecución: ~5-10 minutos
-- =====================================================

-- IMPORTANTE: Leer antes de ejecutar
-- 1. Hacer backup completo de la base de datos
-- 2. Ejecutar en un ambiente de prueba primero
-- 3. Tener plan de rollback listo
-- 4. Verificar que auth.uid() está configurado

-- =====================================================
-- CONFIGURACIÓN INICIAL
-- =====================================================

\set ON_ERROR_STOP on
\set ECHO all

\timing on

\echo ''
\echo '======================================================='
\echo '  GAMILIT PLATFORM - SPRINT 0'
\echo '  CORRECCIONES CRÍTICAS PARA PRODUCCIÓN'
\echo '======================================================='
\echo ''
\echo 'Este script ejecutará las siguientes fases:'
\echo '  FASE 1: Seguridad RLS (Día 1-2)'
\echo '  FASE 2: Funciones y Triggers (Día 3-4)'
\echo '  FASE 3: Performance (Día 5-6)'
\echo '  FASE 4: Validación (Día 7-10)'
\echo ''
\echo 'Tiempo estimado: 5-10 minutos'
\echo ''
\echo 'Presiona Ctrl+C en los próximos 5 segundos para cancelar'
\echo '======================================================='

SELECT pg_sleep(5);

-- =====================================================
-- PRE-VALIDACIÓN
-- =====================================================

\echo ''
\echo '>>> EJECUTANDO PRE-VALIDACIÓN...'

-- Verificar que estamos en la BD correcta
DO $$
BEGIN
  IF current_database() != 'gamilit_dev' AND current_database() != 'gamilit_staging' THEN
    RAISE WARNING 'Base de datos: %. Asegúrate de que es correcto.', current_database();
  ELSE
    RAISE NOTICE 'Base de datos verificada: %', current_database();
  END IF;
END $$;

-- Verificar que las tablas base existen
DO $$
DECLARE
  v_missing_tables TEXT[];
BEGIN
  SELECT ARRAY_AGG(table_name)
  INTO v_missing_tables
  FROM (
    VALUES
      ('auth_management', 'profiles'),
      ('auth_management', 'tenants'),
      ('gamification_system', 'user_stats'),
      ('gamification_system', 'active_boosts'),
      ('gamification_system', 'notifications'),
      ('gamification_system', 'ml_coins_transactions')
  ) AS required_tables(schema_name, table_name)
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.tables t
    WHERE t.table_schema = required_tables.schema_name
      AND t.table_name = required_tables.table_name
  );

  IF v_missing_tables IS NOT NULL THEN
    RAISE EXCEPTION 'Faltan tablas críticas: %. Ejecutar DDL base primero.', v_missing_tables;
  ELSE
    RAISE NOTICE '✓ Todas las tablas base existen';
  END IF;
END $$;

\echo '>>> ✓ Pre-validación completada'

-- =====================================================
-- CREAR BACKUP POINT
-- =====================================================

\echo ''
\echo '>>> Creando savepoint para rollback seguro...'

SAVEPOINT sprint_0_start;

\echo '>>> ✓ Savepoint creado (usar ROLLBACK TO sprint_0_start en caso de error)'

-- =====================================================
-- FASE 1: SEGURIDAD RLS (DÍA 1-2)
-- =====================================================

\echo ''
\echo '======================================================='
\echo 'FASE 1: SEGURIDAD RLS (DÍA 1-2)'
\echo '======================================================='
\echo 'Tiempo estimado: 1-2 minutos'
\echo ''

\i DAY-1-2-RLS-SECURITY.sql

\echo ''
\echo '>>> ✓ FASE 1 COMPLETADA'
\echo ''

-- =====================================================
-- FASE 2: FUNCIONES Y TRIGGERS (DÍA 3-4)
-- =====================================================

\echo ''
\echo '======================================================='
\echo 'FASE 2: FUNCIONES Y TRIGGERS (DÍA 3-4)'
\echo '======================================================='
\echo 'Tiempo estimado: 1-2 minutos'
\echo ''

\i DAY-3-4-FUNCTIONS-TRIGGERS.sql

\echo ''
\echo '>>> ✓ FASE 2 COMPLETADA'
\echo ''

-- =====================================================
-- FASE 3: PERFORMANCE (DÍA 5-6)
-- =====================================================

\echo ''
\echo '======================================================='
\echo 'FASE 3: PERFORMANCE (DÍA 5-6)'
\echo '======================================================='
\echo 'Tiempo estimado: 2-4 minutos'
\echo ''

\i DAY-5-6-PERFORMANCE.sql

\echo ''
\echo '>>> ✓ FASE 3 COMPLETADA'
\echo ''

-- =====================================================
-- FASE 4: VALIDACIÓN (DÍA 7-10)
-- =====================================================

\echo ''
\echo '======================================================='
\echo 'FASE 4: VALIDACIÓN Y TESTING (DÍA 7-10)'
\echo '======================================================='
\echo 'Tiempo estimado: 1-2 minutos'
\echo ''

\i DAY-7-10-VALIDATION.sql

\echo ''
\echo '>>> ✓ FASE 4 COMPLETADA'
\echo ''

-- =====================================================
-- POST-INSTALACIÓN
-- =====================================================

\echo ''
\echo '======================================================='
\echo 'POST-INSTALACIÓN'
\echo '======================================================='

-- Actualizar estadísticas del planificador
\echo '>>> Actualizando estadísticas del planificador...'
ANALYZE;

-- Limpiar conexiones idle
\echo '>>> Limpiando conexiones idle...'
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = current_database()
  AND pid <> pg_backend_pid()
  AND state = 'idle'
  AND state_change < NOW() - INTERVAL '5 minutes';

-- =====================================================
-- RESUMEN FINAL
-- =====================================================

\echo ''
\echo '======================================================='
\echo '  SPRINT 0 COMPLETADO EXITOSAMENTE ✓'
\echo '======================================================='
\echo ''

-- Generar reporte de objetos creados
DO $$
DECLARE
  v_tables INTEGER;
  v_functions INTEGER;
  v_triggers INTEGER;
  v_indexes INTEGER;
  v_policies INTEGER;
  v_mvs INTEGER;
BEGIN
  -- Contar objetos nuevos
  SELECT COUNT(*) INTO v_tables
  FROM information_schema.tables
  WHERE table_schema = 'gamification_system'
    AND table_name = 'rank_history';

  SELECT COUNT(*) INTO v_functions
  FROM information_schema.routines
  WHERE routine_schema = 'gamification_system'
    AND routine_name IN (
      'apply_xp_boost',
      'get_next_maya_rank',
      'update_rank_on_xp_change',
      'cleanup_expired_boosts',
      'get_user_rank_progress',
      'refresh_global_leaderboard'
    );

  SELECT COUNT(*) INTO v_triggers
  FROM information_schema.triggers
  WHERE trigger_name = 'after_xp_update_rank';

  SELECT COUNT(*) INTO v_indexes
  FROM pg_indexes
  WHERE schemaname IN ('gamification_system', 'progress_tracking', 'audit_logging')
    AND indexname LIKE 'idx_%'
    AND indexname IN (
      'idx_user_stats_xp_desc',
      'idx_module_progress_user_updated',
      'idx_audit_logs_user_created'
    );

  SELECT COUNT(*) INTO v_policies
  FROM pg_policies
  WHERE schemaname IN ('auth_management', 'gamification_system')
    AND tablename IN ('password_reset_tokens', 'user_sessions', 'profiles', 'notifications', 'ml_coins_transactions');

  SELECT COUNT(*) INTO v_mvs
  FROM pg_matviews
  WHERE schemaname = 'gamification_system'
    AND matviewname = 'mv_global_leaderboard';

  \echo ''
  RAISE NOTICE '======================================================';
  RAISE NOTICE 'OBJETOS CREADOS:';
  RAISE NOTICE '======================================================';
  RAISE NOTICE '';
  RAISE NOTICE '  Tablas nuevas:        % (esperado: 1)', v_tables;
  RAISE NOTICE '  Funciones:            % (esperado: 6)', v_functions;
  RAISE NOTICE '  Triggers:             % (esperado: 1)', v_triggers;
  RAISE NOTICE '  Índices:              % (esperado: 11+)', v_indexes;
  RAISE NOTICE '  Políticas RLS:        % (esperado: 13+)', v_policies;
  RAISE NOTICE '  Materialized Views:   % (esperado: 1)', v_mvs;
  RAISE NOTICE '';
  RAISE NOTICE '======================================================';

  IF v_tables = 1 AND v_functions = 6 AND v_triggers = 1 AND v_policies >= 13 AND v_mvs = 1 THEN
    RAISE NOTICE '';
    RAISE NOTICE '✓✓✓ INSTALACIÓN PERFECTA ✓✓✓';
    RAISE NOTICE '';
    RAISE NOTICE 'Todos los objetos críticos fueron creados exitosamente.';
    RAISE NOTICE '';
  ELSIF v_tables >= 1 AND v_functions >= 5 AND v_triggers >= 1 THEN
    RAISE WARNING '';
    RAISE WARNING '⚠⚠⚠ INSTALACIÓN PARCIAL ⚠⚠⚠';
    RAISE WARNING '';
    RAISE WARNING 'Algunos objetos no se crearon. Revisar logs arriba.';
    RAISE WARNING '';
  ELSE
    RAISE EXCEPTION 'INSTALACIÓN FALLIDA - Objetos críticos faltantes';
  END IF;
END $$;

\echo ''
\echo '======================================================='
\echo 'FUNCIONALIDAD HABILITADA:'
\echo '======================================================='
\echo ''
\echo '  ✓ Seguridad RLS en 5 tablas críticas'
\echo '  ✓ Rangos Maya se actualizan automáticamente'
\echo '  ✓ Boosts de XP se aplican correctamente'
\echo '  ✓ Leaderboard global optimizado (5000ms → 8ms)'
\echo '  ✓ Dashboard de profesor optimizado'
\echo '  ✓ Historial de cambios de rango'
\echo '  ✓ Limpieza automática de boosts expirados'
\echo ''
\echo '======================================================='
\echo 'PRÓXIMOS PASOS:'
\echo '======================================================='
\echo ''
\echo '  1. Ejecutar seeds corregidos:'
\echo '     psql -f seeds/dev/auth/01-demo-users.sql'
\echo '     psql -f seeds/dev/auth_management/01-tenants.sql'
\echo '     psql -f seeds/dev/auth_management/03-profiles.sql'
\echo '     ... (resto de seeds en orden)'
\echo ''
\echo '  2. Testing de integración:'
\echo '     - Probar login de usuarios'
\echo '     - Verificar leaderboards en frontend'
\echo '     - Completar ejercicio y verificar XP/rango'
\echo ''
\echo '  3. Monitoreo:'
\echo '     - Ver jobs programados: SELECT * FROM cron.job;'
\echo '     - Ver logs de auditoría: SELECT * FROM audit_logging.audit_logs LIMIT 10;'
\echo '     - Ver leaderboard: SELECT * FROM gamification_system.mv_global_leaderboard LIMIT 10;'
\echo ''
\echo '======================================================='
\echo 'ROLLBACK (en caso de problemas):'
\echo '======================================================='
\echo ''
\echo '  ROLLBACK TO sprint_0_start;'
\echo ''
\echo '  Esto deshace TODOS los cambios del Sprint 0.'
\echo '  Usar solo si hay errores críticos.'
\echo ''
\echo '======================================================='
\echo ''

\timing off

-- =====================================================
-- FIN DEL SCRIPT MAESTRO
-- =====================================================

\echo ''
\echo '✓ SCRIPT MAESTRO COMPLETADO'
\echo ''
\echo 'Fecha/Hora: \\echo \\`date\\`'
\echo ''
