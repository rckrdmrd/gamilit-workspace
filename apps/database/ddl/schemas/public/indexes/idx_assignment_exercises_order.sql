-- Índice: idx_assignment_exercises_order
-- Tabla: assignment_exercises
-- Schema: public

CREATE INDEX IF NOT EXISTS idx_assignment_exercises_order ON assignment_exercises(assignment_id, order_index);