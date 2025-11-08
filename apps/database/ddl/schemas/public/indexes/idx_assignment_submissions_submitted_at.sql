-- Índice: idx_assignment_submissions_submitted_at
-- Tabla: assignment_submissions
-- Schema: public

CREATE INDEX IF NOT EXISTS idx_assignment_submissions_submitted_at ON assignment_submissions(submitted_at) WHERE submitted_at IS NOT NULL;