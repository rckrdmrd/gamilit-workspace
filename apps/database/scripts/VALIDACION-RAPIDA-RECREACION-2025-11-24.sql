-- ============================================================================
-- VALIDACIÓN RÁPIDA - Recreación de Base de Datos GAMILIT
-- Fecha: 2025-11-24
-- Uso: psql "DATABASE_URL" -f VALIDACION-RAPIDA-RECREACION-2025-11-24.sql
-- ============================================================================

\echo '=========================================================================='
\echo 'VALIDACIÓN RÁPIDA - RECREACIÓN DE BASE DE DATOS'
\echo '=========================================================================='
\echo ''

-- 1. Total de usuarios (debe ser 16)
\echo '✅ CRITERIO 1: Total de usuarios (esperado: 16)'
SELECT COUNT(*) as total_usuarios FROM auth_management.profiles;

-- 2. Misiones por usuario (debe ser 8 para todos)
\echo ''
\echo '✅ CRITERIO 2: Misiones por usuario (esperado: 8 para cada uno)'
SELECT 
    p.email,
    COUNT(m.id) as misiones
FROM auth_management.profiles p
LEFT JOIN gamification_system.missions m ON m.user_id = p.id
GROUP BY p.email
ORDER BY misiones DESC, p.email;

-- 3. Distribución de misiones (debe ser 48 daily + 80 weekly)
\echo ''
\echo '✅ CRITERIO 3: Distribución de misiones (esperado: 48 daily, 80 weekly)'
SELECT 
    mission_type, 
    COUNT(*) as total,
    COUNT(DISTINCT user_id) as usuarios
FROM gamification_system.missions
GROUP BY mission_type;

-- 4. Inicialización completa (debe ser 16 en todas)
\echo ''
\echo '✅ CRITERIO 4: Inicialización de gamificación (esperado: 16 en todas)'
SELECT
    (SELECT COUNT(*) FROM auth_management.profiles) as profiles,
    (SELECT COUNT(*) FROM gamification_system.user_stats) as user_stats,
    (SELECT COUNT(*) FROM gamification_system.user_ranks) as user_ranks,
    (SELECT COUNT(*) FROM gamification_system.comodines_inventory) as comodines;

-- 5. Sin duplicados (debe ser 0)
\echo ''
\echo '✅ CRITERIO 5: Sin duplicados (esperado: 0)'
SELECT user_id, template_id, COUNT(*) as duplicados
FROM gamification_system.missions
GROUP BY user_id, template_id
HAVING COUNT(*) > 1;

-- 6. Valores iniciales correctos
\echo ''
\echo '✅ CRITERIO 6: Valores iniciales de user_stats'
SELECT 
    COUNT(*) FILTER (WHERE level = 1) as users_level_1,
    COUNT(*) FILTER (WHERE total_xp = 0) as users_xp_0,
    COUNT(*) FILTER (WHERE ml_coins = 100) as users_coins_100,
    COUNT(*) FILTER (WHERE current_rank = 'Ajaw') as users_rank_ajaw
FROM gamification_system.user_stats;

\echo ''
\echo '=========================================================================='
\echo 'VALIDACIÓN COMPLETADA'
\echo '=========================================================================='
\echo ''
\echo 'Si todos los valores coinciden con los esperados:'
\echo '  ✅ Base de datos recreada correctamente'
\echo '  ✅ Inicialización automática funcionando'
\echo '  ✅ Sistema operativo'
\echo ''
