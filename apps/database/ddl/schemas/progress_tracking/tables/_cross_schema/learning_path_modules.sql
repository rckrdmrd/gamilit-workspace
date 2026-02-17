-- Tabla: learning_path_modules
-- Schema: progress_tracking
-- Descripción: Junction table que define qué módulos pertenecen a cada learning path y en qué orden
-- FIX H-036: Missing junction table for learning paths ↔ modules
-- CREADO: 2026-02-05

DROP TABLE IF EXISTS progress_tracking.learning_path_modules CASCADE;

CREATE TABLE progress_tracking.learning_path_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learning_path_id UUID NOT NULL REFERENCES progress_tracking.learning_paths(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES educational_content.modules(id) ON DELETE CASCADE,
    sequence_order INTEGER NOT NULL CHECK (sequence_order > 0),
    is_optional BOOLEAN NOT NULL DEFAULT false,
    minimum_completion_percentage INTEGER DEFAULT 100 CHECK (minimum_completion_percentage >= 0 AND minimum_completion_percentage <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(learning_path_id, module_id),
    UNIQUE(learning_path_id, sequence_order)
);

-- Índices
CREATE INDEX idx_learning_path_modules_path_id ON progress_tracking.learning_path_modules(learning_path_id);
CREATE INDEX idx_learning_path_modules_module_id ON progress_tracking.learning_path_modules(module_id);
CREATE INDEX idx_learning_path_modules_sequence ON progress_tracking.learning_path_modules(learning_path_id, sequence_order);

-- Comentarios
COMMENT ON TABLE progress_tracking.learning_path_modules IS 'Junction table mapping modules to learning paths with ordering';
COMMENT ON COLUMN progress_tracking.learning_path_modules.learning_path_id IS 'FK to the learning path';
COMMENT ON COLUMN progress_tracking.learning_path_modules.module_id IS 'FK to the educational module';
COMMENT ON COLUMN progress_tracking.learning_path_modules.sequence_order IS 'Position in the learning path (1-based)';
COMMENT ON COLUMN progress_tracking.learning_path_modules.is_optional IS 'Whether this module is optional in the path';
COMMENT ON COLUMN progress_tracking.learning_path_modules.minimum_completion_percentage IS 'Minimum completion % required to advance (default 100)';
