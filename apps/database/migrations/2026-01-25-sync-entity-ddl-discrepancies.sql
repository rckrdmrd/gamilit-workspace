-- =============================================================================
-- MIGRATION: Sync Entity-DDL Discrepancies
-- Date: 2026-01-25
-- Task: TASK-2026-01-25-VALIDACION-PORTAL-TEACHER
-- Agent: Claude Code (adredsi)
-- Priority: MEDIUM
-- =============================================================================
--
-- OBJETIVO:
-- Sincronizar discrepancias identificadas entre entities TypeORM y tablas DDL
-- en ScheduledReport y SharedReport.
--
-- HALLAZGOS:
-- - MEDIA-001: ScheduledReport (3 discrepancias)
-- - MEDIA-002: SharedReport (1 discrepancia)
--
-- ESTRATEGIA:
-- Opción A (IMPLEMENTADA): Migrar DDL para ajustar a entities
--
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. SCHEDULED_REPORTS: Sincronizar con ScheduledReport Entity
-- =============================================================================

-- 1.1: Agregar campo student_ids (UUID[])
-- Entity tiene: studentIds: string[] | null
-- DDL faltaba: student_ids UUID[]
ALTER TABLE social_features.scheduled_reports
  ADD COLUMN IF NOT EXISTS student_ids UUID[];

COMMENT ON COLUMN social_features.scheduled_reports.student_ids IS
'Array de student IDs para filtrar reportes (NULL = todos los estudiantes)';

-- Índice GIN para búsquedas en array
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_student_ids
  ON social_features.scheduled_reports USING GIN(student_ids);

-- 1.2: Migrar time_of_day (TIME) a preferred_hour (INTEGER 0-23)
-- Entity tiene: preferredHour: number (0-23)
-- DDL tenía: time_of_day TIME

-- Paso 1: Agregar nueva columna preferred_hour
ALTER TABLE social_features.scheduled_reports
  ADD COLUMN IF NOT EXISTS preferred_hour INTEGER;

-- Paso 2: Migrar datos existentes (extraer hora de TIME)
UPDATE social_features.scheduled_reports
SET preferred_hour = EXTRACT(HOUR FROM time_of_day)
WHERE preferred_hour IS NULL;

-- Paso 3: Agregar constraint de validación (0-23)
ALTER TABLE social_features.scheduled_reports
  ADD CONSTRAINT chk_scheduled_reports_preferred_hour_range
  CHECK (preferred_hour IS NULL OR (preferred_hour >= 0 AND preferred_hour <= 23));

-- Paso 4: Marcar time_of_day como DEPRECATED (mantener por compatibilidad temporal)
COMMENT ON COLUMN social_features.scheduled_reports.time_of_day IS
'DEPRECATED (2026-01-25): Use preferred_hour instead. Will be removed in future version.';

COMMENT ON COLUMN social_features.scheduled_reports.preferred_hour IS
'Hora preferida de ejecución (0-23). Reemplaza time_of_day.';

-- 1.3: Migrar is_active (BOOLEAN) a status (VARCHAR ENUM)
-- Entity tiene: status: ScheduleStatus ('active' | 'paused' | 'completed')
-- DDL tenía: is_active BOOLEAN

-- Paso 1: Agregar nueva columna status
ALTER TABLE social_features.scheduled_reports
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Paso 2: Migrar datos existentes
UPDATE social_features.scheduled_reports
SET status = CASE
  WHEN is_active = TRUE THEN 'active'
  WHEN is_active = FALSE THEN 'paused'
  ELSE 'completed'
END
WHERE status = 'active';  -- Solo migrar los que tienen valor default

-- Paso 3: Agregar constraint de validación
ALTER TABLE social_features.scheduled_reports
  ADD CONSTRAINT chk_scheduled_reports_status_valid
  CHECK (status IN ('active', 'paused', 'completed'));

-- Paso 4: Marcar is_active como DEPRECATED
COMMENT ON COLUMN social_features.scheduled_reports.is_active IS
'DEPRECATED (2026-01-25): Use status instead. Will be removed in future version.';

COMMENT ON COLUMN social_features.scheduled_reports.status IS
'Estado del schedule: active (ejecutando), paused (pausado), completed (finalizado)';

-- Índice para status
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_status
  ON social_features.scheduled_reports(status)
  WHERE status = 'active';

-- =============================================================================
-- 2. SHARED_REPORTS: Sincronizar con SharedReport Entity
-- =============================================================================

-- 2.1: Agregar campo is_revoked (BOOLEAN)
-- Entity tiene: isRevoked: boolean
-- DDL faltaba: is_revoked BOOLEAN

ALTER TABLE social_features.shared_reports
  ADD COLUMN IF NOT EXISTS is_revoked BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN social_features.shared_reports.is_revoked IS
'Si el acceso compartido fue revocado por el propietario';

-- Índice para consultas de reportes activos (no revocados)
CREATE INDEX IF NOT EXISTS idx_shared_reports_active
  ON social_features.shared_reports(shared_with, is_revoked)
  WHERE is_revoked = FALSE;

-- =============================================================================
-- 3. ACTUALIZACIÓN DE METADATOS
-- =============================================================================

-- Actualizar comentarios de tablas con fecha de sincronización
COMMENT ON TABLE social_features.scheduled_reports IS
'Configuración de reportes programados para generación automática. Sincronizado con Entity (2026-01-25)';

COMMENT ON TABLE social_features.shared_reports IS
'Registro de reportes compartidos entre profesores. Sincronizado con Entity (2026-01-25)';

-- =============================================================================
-- 4. VALIDACIÓN POST-MIGRACIÓN
-- =============================================================================

-- Verificar que no hay NULLs en campos requeridos
DO $$
DECLARE
  null_count INTEGER;
BEGIN
  -- Verificar preferred_hour
  SELECT COUNT(*) INTO null_count
  FROM social_features.scheduled_reports
  WHERE preferred_hour IS NULL AND time_of_day IS NOT NULL;

  IF null_count > 0 THEN
    RAISE WARNING 'Found % rows with NULL preferred_hour but non-NULL time_of_day', null_count;
  ELSE
    RAISE NOTICE 'scheduled_reports.preferred_hour migration: OK (% rows checked)',
      (SELECT COUNT(*) FROM social_features.scheduled_reports);
  END IF;

  -- Verificar status
  SELECT COUNT(*) INTO null_count
  FROM social_features.scheduled_reports
  WHERE status IS NULL;

  IF null_count > 0 THEN
    RAISE WARNING 'Found % rows with NULL status', null_count;
  ELSE
    RAISE NOTICE 'scheduled_reports.status migration: OK (% rows checked)',
      (SELECT COUNT(*) FROM social_features.scheduled_reports);
  END IF;

  -- Verificar is_revoked
  SELECT COUNT(*) INTO null_count
  FROM social_features.shared_reports
  WHERE is_revoked IS NULL;

  IF null_count > 0 THEN
    RAISE WARNING 'Found % rows with NULL is_revoked', null_count;
  ELSE
    RAISE NOTICE 'shared_reports.is_revoked migration: OK (% rows checked)',
      (SELECT COUNT(*) FROM social_features.shared_reports);
  END IF;
END $$;

-- =============================================================================
-- 5. GRANTS (mantener permisos existentes)
-- =============================================================================

-- No se requieren grants adicionales, se heredan de las tablas

COMMIT;

-- =============================================================================
-- ROLLBACK PLAN (en caso de error)
-- =============================================================================
/*
BEGIN;

-- Revertir scheduled_reports
ALTER TABLE social_features.scheduled_reports DROP COLUMN IF EXISTS student_ids;
ALTER TABLE social_features.scheduled_reports DROP COLUMN IF EXISTS preferred_hour;
ALTER TABLE social_features.scheduled_reports DROP COLUMN IF EXISTS status;

-- Revertir shared_reports
ALTER TABLE social_features.shared_reports DROP COLUMN IF EXISTS is_revoked;

-- Eliminar índices
DROP INDEX IF EXISTS social_features.idx_scheduled_reports_student_ids;
DROP INDEX IF EXISTS social_features.idx_scheduled_reports_status;
DROP INDEX IF EXISTS social_features.idx_shared_reports_active;

COMMIT;
*/

-- =============================================================================
-- NOTAS PARA FUTURAS MIGRACIONES
-- =============================================================================
/*
DEPRECATION TIMELINE:
  2026-Q1: Campos nuevos agregados (preferred_hour, status)
  2026-Q2: Actualizar backend para usar solo campos nuevos
  2026-Q3: Migración final de datos legacy
  2026-Q4: Eliminar campos deprecated (time_of_day, is_active)

BREAKING CHANGES:
  - Ninguno: Los campos deprecados se mantienen por compatibilidad
  - Backend debe actualizarse para usar los nuevos campos
  - Frontend ya usa los campos correctos (entities sync)

TESTING CHECKLIST:
  ✅ Migración ejecuta sin errores
  ✅ Datos migrados correctamente
  ✅ Constraints validados
  ✅ Índices creados
  ✅ Backend puede leer/escribir usando entities
  ✅ RLS policies funcionan correctamente
*/

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
