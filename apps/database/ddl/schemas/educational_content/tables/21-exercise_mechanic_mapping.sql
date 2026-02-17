-- ============================================================================
-- TABLA: exercise_mechanic_mappings
-- Schema: educational_content
-- Descripción: Mapeo N:M entre categorías pedagógicas universales y
--              implementaciones específicas GAMILIT
-- Relacionado: ADR-008 (Sistema Dual exercise_type + Categorías Pedagógicas)
-- RF: RF-EDU-001, ET-EDU-001
-- ============================================================================

-- ============================================================================
-- TABLA: exercise_mechanic_mappings
-- ============================================================================

DROP TABLE IF EXISTS educational_content.exercise_mechanic_mappings CASCADE;

CREATE TABLE educational_content.exercise_mechanic_mappings (
    -- Identificador único
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- ========================================================================
    -- CLASIFICACIÓN PEDAGÓGICA UNIVERSAL
    -- ========================================================================

    -- Categoría principal (7 categorías universales)
    -- Valores: 'vocabulario', 'gramatica', 'lectura', 'escritura', 'audio', 'pronunciacion', 'cultura'
    mechanic_category VARCHAR(50) NOT NULL,

    -- Subcategoría pedagógica específica (31 subcategorías genéricas)
    -- Ejemplos: 'multiple_choice', 'word_search', 'inference', 'free_writing', etc.
    mechanic_subcategory VARCHAR(50),

    -- ========================================================================
    -- IMPLEMENTACIÓN GAMILIT
    -- ========================================================================

    -- Tipo de ejercicio específico GAMILIT (35 implementaciones)
    -- Referencia: educational_content.exercise_type ENUM
    exercise_type educational_content.exercise_type NOT NULL,

    -- ========================================================================
    -- CONTEXTO EDUCATIVO
    -- ========================================================================

    -- Nivel en Taxonomia de Bloom (ENUM)
    -- Valores: 'recordar', 'comprender', 'aplicar', 'analizar', 'evaluar', 'crear'
    -- Migrado a ENUM en 2026-02-03 (GAP-001)
    bloom_level educational_content.bloom_level,

    -- Niveles CEFR aplicables (array para soportar múltiples niveles)
    -- Valores: 'basico', 'intermedio', 'avanzado', 'experto'
    cefr_level educational_content.difficulty_level[],

    -- Propósito pedagógico del mapeo
    pedagogical_purpose TEXT,

    -- Objetivos de aprendizaje que cumple
    learning_objectives TEXT[],

    -- ========================================================================
    -- CARACTERÍSTICAS DE INTERACCIÓN
    -- ========================================================================

    -- Tipo de interacción del usuario
    -- Ejemplos: 'drag_drop', 'text_input', 'selection', 'audio_recording', 'drawing'
    interaction_type VARCHAR(50),

    -- Carga cognitiva aproximada
    -- Valores: 'bajo', 'medio', 'alto'
    cognitive_load VARCHAR(20),

    -- ========================================================================
    -- METADATOS Y CONTROL
    -- ========================================================================

    -- Tags adicionales para búsqueda flexible
    tags TEXT[],

    -- Control de activación (permite deshabilitar mappings obsoletos)
    is_active BOOLEAN DEFAULT true NOT NULL,

    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- ========================================================================
    -- CONSTRAINTS
    -- ========================================================================

    -- Previene duplicados: misma subcategoría + mismo exercise_type
    CONSTRAINT uq_mechanic_mapping_subcategory_type
        UNIQUE(mechanic_subcategory, exercise_type),

    -- Validación: cognitive_load debe ser uno de los valores permitidos
    CONSTRAINT chk_cognitive_load
        CHECK (cognitive_load IN ('bajo', 'medio', 'alto'))
);

-- ============================================================================
-- ÍNDICES OPTIMIZADOS
-- ============================================================================

-- Índice para búsqueda por categoría pedagógica principal
CREATE INDEX idx_mechanic_mapping_category
    ON educational_content.exercise_mechanic_mappings(mechanic_category)
    WHERE is_active = true;

-- Índice para búsqueda por subcategoría pedagógica específica
CREATE INDEX idx_mechanic_mapping_subcategory
    ON educational_content.exercise_mechanic_mappings(mechanic_subcategory)
    WHERE is_active = true;

-- Índice para búsqueda por tipo de ejercicio GAMILIT
CREATE INDEX idx_mechanic_mapping_exercise_type
    ON educational_content.exercise_mechanic_mappings(exercise_type)
    WHERE is_active = true;

-- Índice para búsqueda por nivel de Bloom
CREATE INDEX idx_mechanic_mapping_bloom
    ON educational_content.exercise_mechanic_mappings(bloom_level)
    WHERE is_active = true;

-- Índice GIN para búsqueda por tags
CREATE INDEX idx_mechanic_mapping_tags_gin
    ON educational_content.exercise_mechanic_mappings USING gin(tags);

-- ============================================================================
-- TRIGGER: updated_at automático
-- ============================================================================

CREATE TRIGGER trg_exercise_mechanic_mappings_updated_at
    BEFORE UPDATE ON educational_content.exercise_mechanic_mappings
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();

-- ============================================================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- ============================================================================

COMMENT ON TABLE educational_content.exercise_mechanic_mappings IS
'Mapeo N:M entre categorías pedagógicas universales (31 subcategorías) e implementaciones específicas GAMILIT (35 exercise_types).
Sistema Dual que permite clasificación pedagógica sin romper implementación existente.
Ver ADR-008 para contexto y decisión arquitectónica.';

COMMENT ON COLUMN educational_content.exercise_mechanic_mappings.mechanic_category IS
'Categoría pedagógica principal (7 valores): vocabulario, gramatica, lectura, escritura, audio, pronunciacion, cultura';

COMMENT ON COLUMN educational_content.exercise_mechanic_mappings.mechanic_subcategory IS
'Subcategoría pedagógica genérica (31 valores posibles). Ejemplos: multiple_choice, word_search, inference, free_writing';

COMMENT ON COLUMN educational_content.exercise_mechanic_mappings.exercise_type IS
'Tipo de ejercicio específico GAMILIT (35 implementaciones). Referencia ENUM educational_content.exercise_type';

COMMENT ON COLUMN educational_content.exercise_mechanic_mappings.bloom_level IS
'Nivel en Taxonomia de Bloom (ENUM): recordar, comprender, aplicar, analizar, evaluar, crear.
Migrado de VARCHAR a ENUM en 2026-02-03 (GAP-001). Referencia: RF-EDU-003.';

COMMENT ON COLUMN educational_content.exercise_mechanic_mappings.cefr_level IS
'Niveles CEFR aplicables como array. Permite mapear un exercise_type a múltiples niveles de dificultad';

COMMENT ON COLUMN educational_content.exercise_mechanic_mappings.pedagogical_purpose IS
'Descripción del propósito pedagógico de este mapeo. Por qué este exercise_type sirve para esta categoría';

COMMENT ON COLUMN educational_content.exercise_mechanic_mappings.learning_objectives IS
'Array de objetivos de aprendizaje específicos que cumple este mapeo';

COMMENT ON COLUMN educational_content.exercise_mechanic_mappings.interaction_type IS
'Tipo de interacción del usuario: drag_drop, text_input, selection, audio_recording, drawing, etc.';

COMMENT ON COLUMN educational_content.exercise_mechanic_mappings.cognitive_load IS
'Carga cognitiva aproximada: bajo, medio, alto. Ayuda a equilibrar asignaciones';

COMMENT ON COLUMN educational_content.exercise_mechanic_mappings.tags IS
'Tags adicionales para búsqueda flexible. Ejemplos: [colaborativo, individual, visual, auditivo]';

COMMENT ON COLUMN educational_content.exercise_mechanic_mappings.is_active IS
'Permite deshabilitar mappings obsoletos sin eliminar histórico';

-- ============================================================================
-- NOTA: Vista exercises_with_mechanics fue extraída a views/02-exercises_with_mechanics.sql
-- para que se cree en la fase de vistas (PASO 4) del init-database.sh
-- ============================================================================

-- Los permisos se manejan mediante RLS policies en educational_content schema
