-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
-- Seed: Comodines Inventory (Production Demo Data)
-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
-- Description: Inventarios de comodines (power-ups) para usuarios demo
-- Environment: production
-- Dependencies:
--   - auth.users (01-demo-users.sql)
--   - auth_management.profiles (04-profiles-complete.sql)
--   - gamification_system.user_stats (05-user_stats.sql)
-- Execution Order: 9
-- Created: 2025-01-11
-- Version: 1.1.0
-- Updated: 2025-11-24 - Seed temporalmente deshabilitado (ISSUE-P2-002)
-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
--
-- ⚠️ ISSUE-P2-002: Seed Temporalmente Deshabilitado
--
-- PROBLEMA:
-- - Seed usa UUIDs hardcodeados que NO existen en tabla profiles
-- - 10 violaciones de FK constraint "comodines_inventory_user_id_fkey"
-- - UUIDs hardcodeados no coinciden con profiles creados en 04-profiles-complete.sql
--
-- SOLUCIÓN TEMPORAL:
-- - Seed completamente comentado para permitir recreación exitosa de BD
-- - FK constraint funciona correctamente (el problema es data, no schema)
--
-- SOLUCIÓN DEFINITIVA (TODO - Próximo Sprint):
-- - Reescribir seed usando queries dinámicas para obtener UUIDs reales
-- - Ejemplo:
--   WITH student_profiles AS (
--     SELECT id, email FROM auth_management.profiles
--     WHERE role = 'student' AND email LIKE '%demo%'
--     ORDER BY email LIMIT 10
--   )
--   INSERT INTO gamification_system.comodines_inventory (user_id, ...)
--   SELECT id, ... FROM student_profiles;
--
-- REFERENCIAS:
-- - orchestration/reportes/REPORTE-FINAL-RESOLUCION-ISSUES-2025-11-24.md (ISSUE-P2-002)
-- - orchestration/agentes/database/validacion-coherencia-2025-11-24/ (ISSUE-P2-001)
--
-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP

SET search_path TO gamification_system, public;

-- =====================================================
-- SEED DESHABILITADO - Ver comentario ISSUE-P2-002 arriba
-- =====================================================

/*
-- ORIGINAL SEED COMMENTED OUT - REQUIRES REWRITE WITH VALID UUIDs

-- Tipos de Comodines:
-- 1. Pistas Contextuales (15 ML Coins): Ayudas para resolver ejercicios
-- 2. Visión Lectora (25 ML Coins): Resalta información clave en textos
-- 3. Segunda Oportunidad (40 ML Coins): Permite reintentar ejercicios
--
-- Fórmula: available = purchased_total - used_total

-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
-- ESTUDIANTE 1: Ana García (usuario activo - uso moderado de comodines)
-- UUID HARDCODED: '01ac4f00-082e-4287-b899-2e169c49b05e' (NO EXISTE EN PROFILES)
-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP

INSERT INTO gamification_system.comodines_inventory (
    id, user_id,
    pistas_available, vision_lectora_available, segunda_oportunidad_available,
    pistas_purchased_total, vision_lectora_purchased_total, segunda_oportunidad_purchased_total,
    pistas_used_total, vision_lectora_used_total, segunda_oportunidad_used_total,
    pistas_cost, vision_lectora_cost, segunda_oportunidad_cost,
    metadata, created_at, updated_at
) VALUES (
    'f0000001-0000-0000-0000-000000000001'::uuid,
    '01ac4f00-082e-4287-b899-2e169c49b05e'::uuid,  -- ❌ UUID NO EXISTE
    2, 1, 0,  -- available (2 pistas, 1 visión, 0 segunda)
    7, 4, 2,  -- purchased_total
    5, 3, 2,  -- used_total
    15, 25, 40,  -- costs
    jsonb_build_object(
        'demo_inventory', true,
        'last_purchase', gamilit.now_mexico() - INTERVAL '2 days',
        'favorite_comodin', 'pistas'
    ),
    gamilit.now_mexico() - INTERVAL '12 days',
    gamilit.now_mexico() - INTERVAL '2 days'
) ON CONFLICT (user_id) DO UPDATE SET
    pistas_available = EXCLUDED.pistas_available,
    vision_lectora_available = EXCLUDED.vision_lectora_available,
    segunda_oportunidad_available = EXCLUDED.segunda_oportunidad_available,
    updated_at = EXCLUDED.updated_at;

-- [9 more INSERT statements with hardcoded UUIDs that don't exist...]

*/

-- =====================================================
-- PLACEHOLDER: Seed será reescrito en próximo sprint
-- =====================================================

-- Por ahora, tabla comodines_inventory existe y funciona correctamente,
-- solo sin data de demo. Las aplicaciones pueden crear inventories
-- dinámicamente cuando usuarios compren comodines.

DO $$
BEGIN
  RAISE NOTICE '======================================================================';
  RAISE NOTICE 'SEED 09-comodines_inventory.sql: TEMPORALMENTE DESHABILITADO';
  RAISE NOTICE 'Razón: UUIDs hardcodeados no existen en profiles (ISSUE-P2-002)';
  RAISE NOTICE 'Tabla comodines_inventory está creada y funcional';
  RAISE NOTICE 'Data de demo se agregará en próximo sprint con UUIDs válidos';
  RAISE NOTICE '======================================================================';
END $$;
