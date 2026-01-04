-- ============================================================================
-- Tabla: manual_reviews
-- Schema: progress_tracking
-- Descripción: Evaluaciones manuales de ejercicios creativos por docentes
-- Autor: Database-Agent
-- Fecha: 2025-11-29
-- Dependencias: progress_tracking.exercise_submissions, auth_management.profiles
-- Módulos: MOD-04-DIGITAL, MOD-05-PRODUCCION
-- ============================================================================

-- Eliminar si existe (solo en desarrollo)
DROP TABLE IF EXISTS progress_tracking.manual_reviews CASCADE;

-- Crear tabla
CREATE TABLE IF NOT EXISTS progress_tracking.manual_reviews (
    -- Identificador
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relaciones
    submission_id UUID NOT NULL REFERENCES progress_tracking.exercise_submissions(id) ON DELETE CASCADE,
    -- ON DELETE RESTRICT: No permitir eliminar profesor si tiene reviews pendientes
    reviewer_id UUID NOT NULL REFERENCES auth_management.profiles(id) ON DELETE RESTRICT,

    -- Evaluación con rúbricas (estructura JSONB flexible)
    rubric_scores JSONB NOT NULL DEFAULT '{}',
    total_score INTEGER CHECK (total_score >= 0 AND total_score <= 100),

    -- Feedback
    general_feedback TEXT,
    detailed_feedback JSONB,

    -- Estado del review
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'returned')),

    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico(),

    -- Constraints
    CONSTRAINT unique_submission_review UNIQUE (submission_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_manual_reviews_submission ON progress_tracking.manual_reviews(submission_id);
CREATE INDEX IF NOT EXISTS idx_manual_reviews_reviewer ON progress_tracking.manual_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_manual_reviews_status ON progress_tracking.manual_reviews(status);

-- Trigger para updated_at
CREATE TRIGGER trg_manual_reviews_updated_at
    BEFORE UPDATE ON progress_tracking.manual_reviews
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at();

-- Comentarios
COMMENT ON TABLE progress_tracking.manual_reviews IS
    'Evaluaciones manuales de ejercicios creativos (Módulos 4 y 5) por docentes';
COMMENT ON COLUMN progress_tracking.manual_reviews.submission_id IS
    'Referencia al ejercicio enviado por el estudiante';
COMMENT ON COLUMN progress_tracking.manual_reviews.reviewer_id IS
    'Docente que realiza la evaluación manual';
COMMENT ON COLUMN progress_tracking.manual_reviews.rubric_scores IS
    'Puntuaciones por criterio de rúbrica en formato JSONB (ej: {"creativity": 25, "accuracy": 30})';
COMMENT ON COLUMN progress_tracking.manual_reviews.total_score IS
    'Puntuación total calculada (0-100)';
COMMENT ON COLUMN progress_tracking.manual_reviews.general_feedback IS
    'Comentarios generales del docente sobre el trabajo';
COMMENT ON COLUMN progress_tracking.manual_reviews.detailed_feedback IS
    'Feedback detallado por sección/criterio en formato JSONB';
COMMENT ON COLUMN progress_tracking.manual_reviews.status IS
    'Estado del review: pending (por revisar), in_progress (en revisión), completed (completado), returned (devuelto para corrección)';
COMMENT ON COLUMN progress_tracking.manual_reviews.started_at IS
    'Fecha y hora en que el docente inició la revisión';
COMMENT ON COLUMN progress_tracking.manual_reviews.completed_at IS
    'Fecha y hora en que se completó la evaluación';
