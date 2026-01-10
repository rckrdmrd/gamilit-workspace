-- =====================================================
-- Archivo: 00-batch_updated_at_triggers.sql
-- Schema: progress_tracking
-- Descripcion: Triggers de actualizacion automatica de updated_at
-- Funcion: gamilit.update_updated_at_column()
-- Fecha de consolidacion: 2026-01-07
-- Ver: PLAN-CONSOLIDACION-BD-2026-01-07.md (FASE 1)
-- =====================================================
--
-- NOTA: El trigger de exercise_submissions AHORA usa la funcion centralizada
-- (actualizado 2026-01-07 - consolidacion duplicados)
-- La funcion progress_tracking.update_exercise_submissions_updated_at() fue deprecada
--
-- =====================================================

-- =====================================================
-- TRIGGERS DE ACTUALIZACION DE TIMESTAMP
-- =====================================================

-- Tabla: progress_tracking.module_progress
DROP TRIGGER IF EXISTS trg_module_progress_updated_at ON progress_tracking.module_progress CASCADE;
CREATE TRIGGER trg_module_progress_updated_at
    BEFORE UPDATE ON progress_tracking.module_progress
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();

COMMENT ON TRIGGER trg_module_progress_updated_at ON progress_tracking.module_progress
    IS 'Actualiza updated_at automaticamente en cada UPDATE';

-- Tabla: progress_tracking.certificates
DROP TRIGGER IF EXISTS trg_certificates_updated_at ON progress_tracking.certificates CASCADE;
CREATE TRIGGER trg_certificates_updated_at
    BEFORE UPDATE ON progress_tracking.certificates
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();

COMMENT ON TRIGGER trg_certificates_updated_at ON progress_tracking.certificates
    IS 'Actualiza updated_at automaticamente en cada UPDATE';

-- Tabla: progress_tracking.exercise_submissions (agregado 2026-01-07 - consolidacion duplicados)
-- NOTA: Migrado de funcion especifica a funcion centralizada
DROP TRIGGER IF EXISTS exercise_submissions_updated_at ON progress_tracking.exercise_submissions CASCADE;
CREATE TRIGGER exercise_submissions_updated_at
    BEFORE UPDATE ON progress_tracking.exercise_submissions
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();

COMMENT ON TRIGGER exercise_submissions_updated_at ON progress_tracking.exercise_submissions
    IS 'Actualiza updated_at automaticamente en cada UPDATE';

-- =====================================================
-- FIN DE TRIGGERS CONSOLIDADOS
-- Total: 3 triggers
-- =====================================================
