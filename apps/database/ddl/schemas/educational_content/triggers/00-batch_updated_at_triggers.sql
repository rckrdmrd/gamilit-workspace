-- =====================================================
-- Archivo: 00-batch_updated_at_triggers.sql
-- Schema: educational_content
-- Descripcion: Triggers de actualizacion automatica de updated_at
-- Funcion: gamilit.update_updated_at_column()
-- Fecha de consolidacion: 2026-01-07
-- Ver: PLAN-CONSOLIDACION-BD-2026-01-07.md (FASE 1)
-- =====================================================

-- =====================================================
-- TRIGGERS DE ACTUALIZACION DE TIMESTAMP
-- =====================================================

-- Tabla: educational_content.assessment_rubrics
DROP TRIGGER IF EXISTS trg_assessment_rubrics_updated_at ON educational_content.assessment_rubrics CASCADE;
CREATE TRIGGER trg_assessment_rubrics_updated_at
    BEFORE UPDATE ON educational_content.assessment_rubrics
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();

COMMENT ON TRIGGER trg_assessment_rubrics_updated_at ON educational_content.assessment_rubrics
    IS 'Actualiza updated_at automaticamente en cada UPDATE';

-- Tabla: educational_content.exercises
DROP TRIGGER IF EXISTS trg_exercises_updated_at ON educational_content.exercises CASCADE;
CREATE TRIGGER trg_exercises_updated_at
    BEFORE UPDATE ON educational_content.exercises
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();

COMMENT ON TRIGGER trg_exercises_updated_at ON educational_content.exercises
    IS 'Actualiza updated_at automaticamente en cada UPDATE';

-- Tabla: educational_content.media_resources
DROP TRIGGER IF EXISTS trg_media_resources_updated_at ON educational_content.media_resources CASCADE;
CREATE TRIGGER trg_media_resources_updated_at
    BEFORE UPDATE ON educational_content.media_resources
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();

COMMENT ON TRIGGER trg_media_resources_updated_at ON educational_content.media_resources
    IS 'Actualiza updated_at automaticamente en cada UPDATE';

-- Tabla: educational_content.modules
DROP TRIGGER IF EXISTS trg_modules_updated_at ON educational_content.modules CASCADE;
CREATE TRIGGER trg_modules_updated_at
    BEFORE UPDATE ON educational_content.modules
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();

COMMENT ON TRIGGER trg_modules_updated_at ON educational_content.modules
    IS 'Actualiza updated_at automaticamente en cada UPDATE';

-- Tabla: educational_content.exercise_type_rubrics (agregado 2026-01-07 - consolidacion duplicados)
DROP TRIGGER IF EXISTS trg_exercise_type_rubrics_updated_at ON educational_content.exercise_type_rubrics CASCADE;
CREATE TRIGGER trg_exercise_type_rubrics_updated_at
    BEFORE UPDATE ON educational_content.exercise_type_rubrics
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();

COMMENT ON TRIGGER trg_exercise_type_rubrics_updated_at ON educational_content.exercise_type_rubrics
    IS 'Actualiza updated_at automaticamente en cada UPDATE';

-- =====================================================
-- FIN DE TRIGGERS CONSOLIDADOS
-- Total: 5 triggers
-- =====================================================
