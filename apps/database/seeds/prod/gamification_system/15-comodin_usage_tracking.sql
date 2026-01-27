-- =====================================================================================
-- SEED: Comodin Usage Tracking for gamification_system Schema (PROD - Minimal)
-- =====================================================================================
-- Description: Minimal seed for production - records created at runtime
-- Dependencies: gamification_system.comodin_usage_tracking table
-- Created: 2026-01-27
-- Task: TASK-P2-SEEDS-COMODINES-2026-01-27
-- =====================================================================================
--
-- NOTE: In production, comodin_usage_tracking records are created dynamically
-- when users use comodines during exercise attempts. This seed is intentionally
-- minimal as there is no demo data to preload.
--
-- The table tracks per-attempt comodin usage with limits:
-- - pistas: max 3 per attempt
-- - vision_lectora: max 1 per attempt
-- - segunda_oportunidad: max 1 per attempt
--
-- =====================================================================================

SET search_path TO gamification_system, public;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '  SEED: comodin_usage_tracking (PROD)';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '  Table ready for production use.';
    RAISE NOTICE '  Records will be created when users use comodines.';
    RAISE NOTICE '════════════════════════════════════════════════════════';
END $$;
