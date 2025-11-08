-- Índice: idx_assignment_submissions_graded_by
-- Tabla: assignment_submissions
-- Schema: public

CREATE INDEX idx_assignment_submissions_graded_by ON assignment_submissions(graded_by);