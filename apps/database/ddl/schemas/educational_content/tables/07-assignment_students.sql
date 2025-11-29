-- Tabla: assignment_students
-- Schema: educational_content
-- Descripción: Relación M2M - Asignaciones asignadas a estudiantes individuales
-- MOVIDO desde public.assignment_students (2025-11-08)
-- CORREGIDO (2025-11-29): FK student_id → auth_management.profiles (ARCH-015-FIX)

CREATE TABLE educational_content.assignment_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES educational_content.assignments(id) ON DELETE CASCADE,
    -- IMPORTANT: student_id referencia profiles, NO auth.users
    -- profiles es la tabla de perfil de usuario gestionada por la aplicación
    student_id UUID NOT NULL REFERENCES auth_management.profiles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(assignment_id, student_id)
);

-- Índices
CREATE INDEX idx_assignment_students_assignment_id ON educational_content.assignment_students(assignment_id);
CREATE INDEX idx_assignment_students_student_id ON educational_content.assignment_students(student_id);

-- Comentarios
COMMENT ON TABLE educational_content.assignment_students IS 'Assignments assigned to individual students';
COMMENT ON COLUMN educational_content.assignment_students.student_id IS 'References profiles.id (application-managed user profile)';
