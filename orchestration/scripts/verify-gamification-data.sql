-- =====================================================
-- Script de Verificacion de Datos de Gamificacion
-- Gamilit - Portal Students
-- Fecha: 2025-12-14
-- =====================================================
--
-- Este script verifica que las tablas de gamificacion
-- tienen los datos necesarios para el funcionamiento
-- del portal de estudiantes.
--
-- EJECUTAR EN: Base de datos de Gamilit
-- =====================================================

-- =====================================================
-- 1. VERIFICAR ACHIEVEMENTS
-- =====================================================
\echo '=================================================='
\echo '1. VERIFICACION DE ACHIEVEMENTS'
\echo '=================================================='

\echo 'Total de achievements en tabla:'
SELECT COUNT(*) as total_achievements FROM gamification_system.achievements;

\echo ''
\echo 'Achievements por categoria:'
SELECT
    category,
    COUNT(*) as cantidad,
    COUNT(*) FILTER (WHERE is_active = true) as activos
FROM gamification_system.achievements
GROUP BY category
ORDER BY category;

\echo ''
\echo 'Primeros 5 achievements:'
SELECT
    id,
    name,
    category,
    is_active,
    ml_coins_reward
FROM gamification_system.achievements
ORDER BY order_index
LIMIT 5;

-- =====================================================
-- 2. VERIFICAR SHOP CATEGORIES
-- =====================================================
\echo ''
\echo '=================================================='
\echo '2. VERIFICACION DE SHOP CATEGORIES'
\echo '=================================================='

\echo 'Total de categorias de tienda:'
SELECT COUNT(*) as total_categories FROM gamification_system.shop_categories;

\echo ''
\echo 'Categorias de tienda:'
SELECT
    name,
    display_name,
    display_order,
    is_active
FROM gamification_system.shop_categories
ORDER BY display_order;

-- =====================================================
-- 3. VERIFICAR SHOP ITEMS
-- =====================================================
\echo ''
\echo '=================================================='
\echo '3. VERIFICACION DE SHOP ITEMS'
\echo '=================================================='

\echo 'Total de items de tienda:'
SELECT COUNT(*) as total_items FROM gamification_system.shop_items;

\echo ''
\echo 'Items por categoria:'
SELECT
    category,
    COUNT(*) as cantidad,
    COUNT(*) FILTER (WHERE is_available = true) as disponibles
FROM gamification_system.shop_items
GROUP BY category
ORDER BY category;

\echo ''
\echo 'Primeros 5 items de tienda:'
SELECT
    id,
    name,
    category,
    price,
    is_available
FROM gamification_system.shop_items
ORDER BY created_at
LIMIT 5;

-- =====================================================
-- 4. VERIFICAR MAYA RANKS
-- =====================================================
\echo ''
\echo '=================================================='
\echo '4. VERIFICACION DE MAYA RANKS'
\echo '=================================================='

\echo 'Rangos Maya configurados:'
SELECT
    rank,
    name,
    xp_min,
    xp_max,
    ml_coins_bonus,
    display_order
FROM gamification_system.maya_ranks
ORDER BY display_order;

-- =====================================================
-- 5. VERIFICAR USER_STATS (Estadisticas de Usuario)
-- =====================================================
\echo ''
\echo '=================================================='
\echo '5. VERIFICACION DE USER_STATS'
\echo '=================================================='

\echo 'Total de usuarios con estadisticas:'
SELECT COUNT(*) as total_user_stats FROM gamification_system.user_stats;

\echo ''
\echo 'Ejemplo de estadisticas de usuario:'
SELECT
    user_id,
    total_xp,
    current_xp,
    current_maya_rank,
    total_ml_coins,
    current_streak
FROM gamification_system.user_stats
LIMIT 3;

-- =====================================================
-- 6. VERIFICAR PROGRESO DE MODULOS
-- =====================================================
\echo ''
\echo '=================================================='
\echo '6. VERIFICACION DE PROGRESO'
\echo '=================================================='

\echo 'Total de registros de progreso de modulos:'
SELECT COUNT(*) as total_module_progress FROM progress_tracking.user_module_progress;

\echo ''
\echo 'Ejemplo de progreso de modulos:'
SELECT
    user_id,
    module_id,
    status,
    progress_percentage,
    completed_exercises,
    total_exercises
FROM progress_tracking.user_module_progress
LIMIT 5;

-- =====================================================
-- 7. RESUMEN FINAL
-- =====================================================
\echo ''
\echo '=================================================='
\echo '7. RESUMEN FINAL'
\echo '=================================================='

SELECT
    'achievements' as tabla,
    COUNT(*) as total,
    CASE WHEN COUNT(*) > 0 THEN 'OK' ELSE 'VACIA - EJECUTAR SEEDS' END as estado
FROM gamification_system.achievements
UNION ALL
SELECT
    'shop_categories' as tabla,
    COUNT(*) as total,
    CASE WHEN COUNT(*) > 0 THEN 'OK' ELSE 'VACIA - EJECUTAR SEEDS' END as estado
FROM gamification_system.shop_categories
UNION ALL
SELECT
    'shop_items' as tabla,
    COUNT(*) as total,
    CASE WHEN COUNT(*) > 0 THEN 'OK' ELSE 'VACIA - EJECUTAR SEEDS' END as estado
FROM gamification_system.shop_items
UNION ALL
SELECT
    'maya_ranks' as tabla,
    COUNT(*) as total,
    CASE WHEN COUNT(*) > 0 THEN 'OK' ELSE 'VACIA - EJECUTAR SEEDS' END as estado
FROM gamification_system.maya_ranks
UNION ALL
SELECT
    'user_stats' as tabla,
    COUNT(*) as total,
    CASE WHEN COUNT(*) > 0 THEN 'OK' ELSE 'VACIA - EJECUTAR SEEDS' END as estado
FROM gamification_system.user_stats;

\echo ''
\echo '=================================================='
\echo 'FIN DE VERIFICACION'
\echo '=================================================='
