-- ============================================================================
-- MIGRATION: DB-131
-- Descripción: Corregir vista admin_dashboard.recent_activity
-- Fecha: 2025-11-24
-- Autor: Database-Agent
-- Contexto: CORR-005 - Vista referenciaba tabla inexistente
--
-- Problema: Vista referenciaba audit_logging.activity_log (NO EXISTE)
-- Solución: Referenciar audit_logging.user_activity_logs (tabla correcta)
--
-- Referencia: orchestration/agentes/architecture-analyst/plan-correcciones-persistencia-2025-11-24/PLAN-IMPLEMENTACION-CORRECCIONES-P0.md
-- ============================================================================

BEGIN;

-- ================================================================
-- 1. DROP VISTA EXISTENTE
-- ================================================================

DROP VIEW IF EXISTS admin_dashboard.recent_activity CASCADE;

-- ================================================================
-- 2. RECREAR VISTA CON TABLA CORRECTA
-- ================================================================

CREATE VIEW admin_dashboard.recent_activity AS
SELECT
  ual.id,
  ual.user_id,
  p.full_name AS user_name,
  p.avatar_url AS user_avatar,
  u.email,
  ual.activity_type AS action_type,
  ual.action_detail AS action_description,
  ual.created_at AS timestamp,
  ual.ip_address,
  ual.user_agent,
  ual.metadata AS details
FROM audit_logging.user_activity_logs ual
  LEFT JOIN auth_management.profiles p ON ual.user_id = p.id
  LEFT JOIN auth.users u ON p.user_id = u.id
WHERE ual.created_at > NOW() - INTERVAL '30 days'
ORDER BY ual.created_at DESC
LIMIT 100;

-- ================================================================
-- 3. DOCUMENTACIÓN
-- ================================================================

COMMENT ON VIEW admin_dashboard.recent_activity IS
'Vista de actividad reciente del sistema (últimos 30 días, máximo 100 registros).
FIXED 2025-11-24 (DB-131): Ahora referencia correctamente audit_logging.user_activity_logs.
Usado por endpoint GET /api/admin/actions/recent en Portal Admin.

Cambios aplicados:
- Tabla origen: audit_logging.activity_log → audit_logging.user_activity_logs
- Agregado filtro de 30 días
- Agregado user_avatar para mostrar en UI
- Renombrados campos para consistencia con backend DTOs
';

-- ================================================================
-- 4. PERMISOS
-- ================================================================

GRANT SELECT ON admin_dashboard.recent_activity TO gamilit_app_role;

-- ================================================================
-- 5. VALIDACIÓN
-- ================================================================

-- Verificar que la vista se creó correctamente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.views
    WHERE table_schema = 'admin_dashboard'
      AND table_name = 'recent_activity'
  ) THEN
    RAISE EXCEPTION 'Vista admin_dashboard.recent_activity NO fue creada';
  END IF;

  RAISE NOTICE '✅ Vista admin_dashboard.recent_activity creada exitosamente';
END $$;

COMMIT;

-- ================================================================
-- NOTAS DE IMPLEMENTACIÓN
-- ================================================================

-- Este migration corrige el bug reportado en:
-- - BUG-ADMIN-004: Vista admin_dashboard.recent_activity referencia tabla inexistente
--
-- Impacto:
-- - Portal Admin sección "Acciones Recientes" funcionará correctamente
-- - Endpoint GET /api/admin/actions/recent retornará datos reales
--
-- Testing:
-- SELECT * FROM admin_dashboard.recent_activity LIMIT 5;
--
-- Rollback (si necesario):
-- DROP VIEW IF EXISTS admin_dashboard.recent_activity CASCADE;
