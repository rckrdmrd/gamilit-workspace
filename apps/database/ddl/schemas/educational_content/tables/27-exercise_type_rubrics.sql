-- =====================================================
-- Table: educational_content.exercise_type_rubrics
-- Description: Rubricas estandar por TIPO de ejercicio (plantillas)
-- Dependencies: None (standalone)
-- Created: 2026-01-07
-- Purpose: Definir rubricas por defecto para cada exercise_type
--          que se usaran como plantilla al calificar ejercicios manuales
-- Reference: CORR-009-RESUMEN-CONSOLIDADO.md
-- =====================================================

SET search_path TO educational_content, public;

DROP TABLE IF EXISTS educational_content.exercise_type_rubrics CASCADE;

CREATE TABLE educational_content.exercise_type_rubrics (
    id UUID DEFAULT gen_random_uuid() NOT NULL,

    -- Tipo de ejercicio (unico por tabla)
    exercise_type VARCHAR(100) NOT NULL,

    -- Nombre descriptivo de la rubrica
    rubric_name VARCHAR(255) NOT NULL,

    -- Criterios de evaluacion
    -- Estructura: [
    --   {
    --     "id": "criterion_1",
    --     "name": "Nombre del criterio",
    --     "description": "Descripcion del criterio",
    --     "weight": 25,  -- Porcentaje (suma de todos = 100)
    --     "levels": [
    --       {"score": 100, "label": "Excelente", "description": "..."},
    --       {"score": 75, "label": "Bueno", "description": "..."},
    --       {"score": 50, "label": "Suficiente", "description": "..."},
    --       {"score": 25, "label": "Insuficiente", "description": "..."}
    --     ]
    --   }
    -- ]
    criteria JSONB NOT NULL,

    -- Validacion: suma de weights debe ser 100
    total_weight INTEGER DEFAULT 100,

    -- Si es la rubrica por defecto para este tipo
    is_default BOOLEAN DEFAULT true,

    -- Modulo al que pertenece (informativo)
    module_code VARCHAR(50),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT gamilit.now_mexico(),
    updated_at TIMESTAMPTZ DEFAULT gamilit.now_mexico(),

    -- Constraints
    CONSTRAINT exercise_type_rubrics_pkey PRIMARY KEY (id),
    CONSTRAINT exercise_type_rubrics_type_unique UNIQUE (exercise_type),
    CONSTRAINT exercise_type_rubrics_total_weight_check CHECK (total_weight = 100)
);

ALTER TABLE educational_content.exercise_type_rubrics OWNER TO gamilit_user;

-- Indexes
CREATE INDEX idx_exercise_type_rubrics_type ON educational_content.exercise_type_rubrics USING btree (exercise_type);
CREATE INDEX idx_exercise_type_rubrics_module ON educational_content.exercise_type_rubrics USING btree (module_code);
CREATE INDEX idx_exercise_type_rubrics_default ON educational_content.exercise_type_rubrics USING btree (is_default) WHERE (is_default = true);

-- Trigger para updated_at (usa funcion centralizada - CONSOLIDACION 2026-01-07)
-- NOTA: La funcion educational_content.trg_exercise_type_rubrics_updated_at() fue eliminada
-- y migrada a la funcion centralizada gamilit.update_updated_at_column()
DROP TRIGGER IF EXISTS trg_exercise_type_rubrics_updated_at ON educational_content.exercise_type_rubrics;
CREATE TRIGGER trg_exercise_type_rubrics_updated_at
    BEFORE UPDATE ON educational_content.exercise_type_rubrics
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();

-- Permissions
GRANT ALL ON TABLE educational_content.exercise_type_rubrics TO gamilit_user;

-- Comments
COMMENT ON TABLE educational_content.exercise_type_rubrics IS 'Rubricas estandar por tipo de ejercicio. Define los criterios de evaluacion para cada exercise_type de los modulos M3, M4, M5 que requieren calificacion manual.';
COMMENT ON COLUMN educational_content.exercise_type_rubrics.exercise_type IS 'Tipo de ejercicio (ej: tribunal_opiniones, debate_digital, verificador_fake_news). Debe coincidir con exercises.exercise_type';
COMMENT ON COLUMN educational_content.exercise_type_rubrics.rubric_name IS 'Nombre descriptivo de la rubrica para mostrar en UI';
COMMENT ON COLUMN educational_content.exercise_type_rubrics.criteria IS 'JSONB array con criterios de evaluacion: [{id, name, description, weight, levels: [{score, label, description}]}]';
COMMENT ON COLUMN educational_content.exercise_type_rubrics.total_weight IS 'Suma total de weights de todos los criterios (debe ser 100)';
COMMENT ON COLUMN educational_content.exercise_type_rubrics.is_default IS 'Si es la rubrica por defecto para este tipo de ejercicio';
COMMENT ON COLUMN educational_content.exercise_type_rubrics.module_code IS 'Codigo del modulo al que pertenece (MOD-03-CRITICA, MOD-04-DIGITAL, MOD-05-PRODUCCION)';
