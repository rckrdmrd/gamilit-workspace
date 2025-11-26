-- =====================================================
-- RLS Policies for gamification_system schema
-- Description: Políticas de seguridad para sistema de gamificación
-- Created: 2025-10-27
-- =====================================================

-- =====================================================
-- TABLE: gamification_system.achievements
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS achievements_all_admin ON gamification_system.achievements;
DROP POLICY IF EXISTS achievements_select_active ON gamification_system.achievements;
DROP POLICY IF EXISTS achievements_select_admin ON gamification_system.achievements;

-- Policy: achievements_all_admin
-- Description: Los administradores tienen acceso completo a logros
CREATE POLICY achievements_all_admin
    ON gamification_system.achievements
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (gamilit.is_admin());

COMMENT ON POLICY achievements_all_admin ON gamification_system.achievements IS
    'Permite a los administradores gestión completa de logros';

-- Policy: achievements_select_active
-- Description: Los usuarios pueden ver logros activos no secretos
CREATE POLICY achievements_select_active
    ON gamification_system.achievements
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING ((is_active = true) AND (is_secret = false));

COMMENT ON POLICY achievements_select_active ON gamification_system.achievements IS
    'Permite a los usuarios ver logros activos y no secretos';

-- Policy: achievements_select_admin
-- Description: Los administradores pueden ver todos los logros
CREATE POLICY achievements_select_admin
    ON gamification_system.achievements
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (gamilit.is_admin());

COMMENT ON POLICY achievements_select_admin ON gamification_system.achievements IS
    'Permite a los administradores ver todos los logros, incluyendo secretos e inactivos';

-- =====================================================
-- TABLE: gamification_system.ml_coins_transactions
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS ml_transactions_select_admin ON gamification_system.ml_coins_transactions;
DROP POLICY IF EXISTS ml_transactions_select_own ON gamification_system.ml_coins_transactions;

-- Policy: ml_transactions_select_admin
-- Description: Los administradores pueden ver todas las transacciones
CREATE POLICY ml_transactions_select_admin
    ON gamification_system.ml_coins_transactions
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (gamilit.is_admin());

COMMENT ON POLICY ml_transactions_select_admin ON gamification_system.ml_coins_transactions IS
    'Permite a los administradores ver todas las transacciones de ML coins';

-- Policy: ml_transactions_select_own
-- Description: Los usuarios pueden ver sus propias transacciones
CREATE POLICY ml_transactions_select_own
    ON gamification_system.ml_coins_transactions
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (user_id = gamilit.get_current_user_id());

COMMENT ON POLICY ml_transactions_select_own ON gamification_system.ml_coins_transactions IS
    'Permite a los usuarios ver únicamente sus propias transacciones de ML coins';

-- =====================================================
-- TABLE: gamification_system.user_achievements
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS user_achievements_select_admin ON gamification_system.user_achievements;
DROP POLICY IF EXISTS user_achievements_select_own ON gamification_system.user_achievements;

-- Policy: user_achievements_select_admin
-- Description: Los administradores pueden ver todos los logros de usuarios
CREATE POLICY user_achievements_select_admin
    ON gamification_system.user_achievements
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (gamilit.is_admin());

COMMENT ON POLICY user_achievements_select_admin ON gamification_system.user_achievements IS
    'Permite a los administradores ver todos los logros obtenidos por usuarios';

-- Policy: user_achievements_select_own
-- Description: Los usuarios pueden ver sus propios logros
CREATE POLICY user_achievements_select_own
    ON gamification_system.user_achievements
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (user_id = gamilit.get_current_user_id());

COMMENT ON POLICY user_achievements_select_own ON gamification_system.user_achievements IS
    'Permite a los usuarios ver únicamente sus propios logros obtenidos';

-- =====================================================
-- TABLE: gamification_system.user_stats
-- NOTA: Policies movidas a 04-user-stats-policies.sql (2025-11-26)
-- Versión moderna con seguridad mejorada (solo super_admin puede UPDATE)
-- =====================================================
