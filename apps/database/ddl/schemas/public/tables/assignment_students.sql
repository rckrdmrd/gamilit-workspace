-- Tabla: assignment_students
-- Schema: public
-- Descripción: Relación M2M - Asignaciones asignadas a estudiantes individuales

CREATE TABLE public.assignment_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(assignment_id, student_id)
);

-- Índices
CREATE INDEX idx_assignment_students_assignment_id ON public.assignment_students(assignment_id);
CREATE INDEX idx_assignment_students_student_id ON public.assignment_students(student_id);

-- Comentarios
COMMENT ON TABLE public.assignment_students IS 'Assignments assigned to individual students';
