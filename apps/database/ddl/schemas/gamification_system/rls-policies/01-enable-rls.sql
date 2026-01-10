-- =====================================================
-- Enable RLS for gamification_system tables
-- Created: 2025-10-27
-- Updated: 2026-01-07 (notifications removido - tabla deprecated)
-- Description: Habilita Row Level Security en todas las tablas
--              del sistema de gamificacion
-- =====================================================

-- Enable Row Level Security on all gamification_system tables
-- Schema: gamification_system
-- Tables: 8 tables with RLS protection (antes 9, -1 notifications deprecated)

ALTER TABLE gamification_system.ml_coins_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_system.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_system.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_system.comodines_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_system.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_system.user_ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_system.missions ENABLE ROW LEVEL SECURITY;
-- REMOVIDO (2026-01-07): notifications - tabla deprecated
-- ALTER TABLE gamification_system.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_system.leaderboard_metadata ENABLE ROW LEVEL SECURITY;

-- Comentarios
COMMENT ON TABLE gamification_system.ml_coins_transactions IS 'RLS enabled: Transacciones de ML coins - lectura propia + teacher + admin';
COMMENT ON TABLE gamification_system.achievements IS 'RLS enabled: Logros del sistema - lectura publica de activos';
COMMENT ON TABLE gamification_system.user_achievements IS 'RLS enabled: Logros de usuarios - lectura propia + amigos + teacher';
COMMENT ON TABLE gamification_system.comodines_inventory IS 'RLS enabled: Inventario de comodines - gestion propia';
COMMENT ON TABLE gamification_system.user_stats IS 'RLS enabled: Estadisticas de usuario - lectura propia + amigos + teacher';
COMMENT ON TABLE gamification_system.user_ranks IS 'RLS enabled: Rankings de usuarios - lectura publica';
COMMENT ON TABLE gamification_system.missions IS 'RLS enabled: Misiones activas - lectura propia + admin';
-- REMOVIDO: COMMENT ON TABLE gamification_system.notifications
COMMENT ON TABLE gamification_system.leaderboard_metadata IS 'RLS enabled: Metadata de leaderboards - lectura publica';
